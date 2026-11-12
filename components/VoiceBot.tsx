'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MOCK_SELLERS,
  getAllSellers,
  getSellerById,
  computeSellerDeltas,
  SellerProfile,
  SellerProduct,
} from '@/lib/seller-data';
import { KAMName } from '@/lib/system-prompt';
import {
  Mic,
  Phone,
  PhoneOff,
  Volume2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Send,
  Key,
  ShieldCheck,
  Play,
  Package,
  Layers,
  Store,
  ChevronDown,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; timestamp?: string };
type BotState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const TRIGGER = '[CALL_STARTED]';

export default function VoiceBot() {
  const [mounted, setMounted] = useState(false);
  const [botState, setBotState] = useState<BotState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusText, setStatusText] = useState('Click "Start Call" to begin');
  const [isStarted, setIsStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const [showMetricsDrawer, setShowMetricsDrawer] = useState(true);
  const [metricsTab, setMetricsTab] = useState<'kpi' | 'catalog'>('kpi');

  // Active Seller Selection (SD001 - SD010)
  const [selectedSellerId, setSelectedSellerId] = useState<string>('SD001');

  // Persona: Priya (Female) or Rahul (Male)
  const [persona, setPersona] = useState<KAMName>('Priya');

  // Available browser speech voices and selected voice URI
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const messagesRef = useRef<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Derived active seller & computation deltas
  const currentSeller: SellerProfile = getSellerById(selectedSellerId) || MOCK_SELLERS.SD001;
  const currentDeltas = computeSellerDeltas(currentSeller);
  const allSellers = getAllSellers();

  // Sync ref with messages state so SpeechRecognition event handlers access latest messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botState]);

  // Helper to identify if a voice is typically female
  const isFemaleVoice = (v: SpeechSynthesisVoice): boolean => {
    const name = v.name.toLowerCase();
    const maleNames = ['ravi', 'david', 'mark', 'george', 'guy', 'prabhat', 'male', 'man', 'stefan', 'cosimo'];
    if (maleNames.some((m) => name.includes(m))) return false;

    const femaleKeywords = [
      'female', 'woman', 'zira', 'heera', 'neerja', 'jenny', 'aria',
      'samantha', 'victoria', 'karen', 'sonia', 'swara', 'sangeeta'
    ];
    return femaleKeywords.some((f) => name.includes(f));
  };

  // Helper to identify if a voice is typically male
  const isMaleVoice = (v: SpeechSynthesisVoice): boolean => {
    const name = v.name.toLowerCase();
    const maleKeywords = ['ravi', 'david', 'mark', 'george', 'guy', 'prabhat', 'male', 'man'];
    return maleKeywords.some((m) => name.includes(m));
  };

  // Initial client mount and voice discovery (runs once safely on reload)
  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    // Load saved preferences safely
    try {
      const savedKey = localStorage.getItem('snapdeal_gemini_key');
      if (savedKey) setCustomApiKey(savedKey);

      const savedPersona = localStorage.getItem('snapdeal_persona') as KAMName | null;
      if (savedPersona === 'Rahul' || savedPersona === 'Priya') {
        setPersona(savedPersona);
      }

      const savedSeller = localStorage.getItem('snapdeal_seller_id');
      if (savedSeller && MOCK_SELLERS[savedSeller]) {
        setSelectedSellerId(savedSeller);
      }
    } catch {
      // Ignore localStorage exceptions in private browsing
    }

    // Check SpeechRecognition browser support
    const SR =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      setHasVoiceSupport(false);
    }

    // Flush any leftover speech from before the page reload
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}

      const fetchVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            setAvailableVoices(voices);
          }
        } catch {}
      };

      fetchVoices();
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    // Clean up when unmounting or reloading
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.onvoiceschanged = null;
        } catch {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Dynamically resolve the best voice for current persona
  const getEffectiveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. If user explicitly picked a voice from dropdown
    if (selectedVoiceURI) {
      const userChosen = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (userChosen) return userChosen;
    }

    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

    // 2. Priya (Female Voice): Indian female first, then Windows Zira, then any female
    if (persona === 'Priya') {
      const indianFemale = englishVoices.find((v) => (v.lang === 'en-IN' || v.name.includes('India')) && isFemaleVoice(v));
      const anyFemale = englishVoices.find((v) => isFemaleVoice(v));
      const windowsZira = englishVoices.find((v) => v.name.toLowerCase().includes('zira'));
      const fallbackNonMale = englishVoices.find((v) => !isMaleVoice(v));

      return indianFemale || anyFemale || windowsZira || fallbackNonMale || englishVoices[0] || voices[0];
    } else {
      // 3. Rahul (Male Voice): Indian male first (Ravi, Prabhat), then David/Mark
      const indianMale = englishVoices.find((v) => (v.lang === 'en-IN' || v.name.includes('India')) && isMaleVoice(v));
      const anyMale = englishVoices.find((v) => isMaleVoice(v));

      return indianMale || anyMale || englishVoices[0] || voices[0];
    }
  }, [availableVoices, persona, selectedVoiceURI]);

  // Persona change handler
  const handlePersonaChange = (newPersona: KAMName) => {
    setPersona(newPersona);
    setSelectedVoiceURI('');
    try {
      localStorage.setItem('snapdeal_persona', newPersona);
    } catch {}
  };

  // Seller switch handler
  const handleSellerChange = (newSellerId: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    try {
      recognitionRef.current?.stop();
    } catch {}

    setSelectedSellerId(newSellerId);
    setSellerModalOpen(false);
    setIsStarted(false);
    setMessages([]);
    setBotState('idle');
    const newSeller = getSellerById(newSellerId) || MOCK_SELLERS.SD001;
    setStatusText(`Switched to ${newSeller.name} (${newSeller.store}). Click "Start Call" to begin.`);

    try {
      localStorage.setItem('snapdeal_seller_id', newSellerId);
    } catch {}
  };

  /** Convert text to speech using browser SpeechSynthesis API */
  const speakText = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve();
          return;
        }

        setBotState('speaking');
        setStatusText(`${persona} is speaking...`);

        try {
          window.speechSynthesis.cancel();
        } catch {}

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = persona === 'Priya' ? 1.15 : 0.95;
        utterance.volume = 1.0;

        const targetVoice = getEffectiveVoice();
        if (targetVoice) {
          utterance.voice = targetVoice;
        }

        utterance.onend = () => {
          setBotState('idle');
          setStatusText('Your turn — tap the mic to speak');
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          setBotState('idle');
          setStatusText('Your turn — tap the mic to speak');
          resolve();
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('SpeechSynthesis speak failed:', e);
          setBotState('idle');
          resolve();
        }
      });
    },
    [getEffectiveVoice, persona]
  );

  /** Test current voice setting */
  const testVoice = (voiceURI?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const voice = voiceURI ? voices.find((v) => v.voiceURI === voiceURI) : getEffectiveVoice();

      const firstName = currentSeller.name.split(' ')[0];
      const testPhrase =
        persona === 'Priya'
          ? `Hello ${firstName}! I am Priya, your Snapdeal Virtual KAM. How can I help improve your sales today?`
          : `Hello ${firstName}! I am Rahul, your Snapdeal Virtual KAM. How can I help improve your sales today?`;

      const utterance = new SpeechSynthesisUtterance(testPhrase);
      utterance.lang = 'en-IN';
      utterance.pitch = persona === 'Priya' ? 1.15 : 0.95;
      utterance.rate = 0.95;
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  /** Send conversation history to /api/chat */
  const askChat = useCallback(
    async (msgs: Message[]): Promise<string> => {
      setBotState('processing');
      setStatusText(`${persona} is analyzing ${currentSeller.store}...`);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          apiKey: customApiKey || undefined,
          assistantName: persona,
          sellerId: selectedSellerId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Chat API error');
      }

      const data = await res.json();
      return data.text as string;
    },
    [currentSeller.store, customApiKey, persona, selectedSellerId]
  );

  /** Start conversation */
  const startConversation = useCallback(async () => {
    setIsStarted(true);
    setErrorMsg(null);
    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const trigger: Message = { role: 'user', content: TRIGGER, timestamp: now };
      const botText = await askChat([trigger]);
      const greeting: Message = {
        role: 'assistant',
        content: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([trigger, greeting]);
      await speakText(botText);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Could not initialize call. Please check your network or Gemini API key.');
      setBotState('error');
      setIsStarted(false);
    }
  }, [askChat, speakText]);

  /** Start browser SpeechRecognition */
  const startListening = useCallback(() => {
    setErrorMsg(null);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg(
        'Voice recognition requires Google Chrome or Microsoft Edge. Please use text input below.'
      );
      setHasVoiceSupport(false);
      return;
    }

    try {
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setBotState('listening');
        setStatusText('Listening... speak now into your microphone');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = async (event: any) => {
        const transcript = (event.results[0][0].transcript as string).trim();
        if (!transcript) return;

        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const userMsg: Message = { role: 'user', content: transcript, timestamp: timeStr };
        const history = [...messagesRef.current, userMsg];
        setMessages(history);

        try {
          const botText = await askChat(history);
          const botMsg: Message = {
            role: 'assistant',
            content: botText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          setMessages([...history, botMsg]);
          await speakText(botText);
        } catch (err: unknown) {
          console.error(err);
          setErrorMsg('Something went wrong. Please tap the mic to try again.');
          setBotState('idle');
          setStatusText('Your turn — tap the mic to respond');
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('SpeechRecognition error:', event.error);
        if (event.error === 'no-speech') {
          setStatusText('No speech detected. Tap the mic and speak again.');
        } else if (event.error === 'not-allowed') {
          setErrorMsg(
            'Microphone access was denied. Please allow microphone permissions for this page in your browser.'
          );
        } else {
          setStatusText('Voice input stopped. Tap the mic to retry.');
        }
        setBotState('idle');
      };

      recognition.onend = () => {
        setBotState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setBotState('idle');
      setStatusText('Tap mic to start speaking');
    }
  }, [askChat, speakText]);

  /** Mic toggle handler */
  const handleMicClick = () => {
    if (botState === 'idle') {
      startListening();
    } else if (botState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setBotState('idle');
      setStatusText('Listening paused. Tap mic to resume.');
    } else if (botState === 'speaking') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      setBotState('idle');
      startListening();
    }
  };

  /** Send text message */
  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = textInput.trim();
    if (!text || botState === 'processing' || botState === 'speaking') return;

    setTextInput('');
    setErrorMsg(null);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: text, timestamp: timeStr };
    const history = [...messagesRef.current, userMsg];
    setMessages(history);

    try {
      const botText = await askChat(history);
      const botMsg: Message = {
        role: 'assistant',
        content: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...history, botMsg]);
      await speakText(botText);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to fetch response. Please try again.');
      setBotState('idle');
    }
  };

  /** End current call */
  const handleEndCall = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsStarted(false);
    setBotState('idle');
    setStatusText('Call ended. Click "Start Call" to begin a new session.');
  };

  /** Save custom API key */
  const saveApiKey = (key: string) => {
    setCustomApiKey(key);
    try {
      if (key) {
        localStorage.setItem('snapdeal_gemini_key', key);
      } else {
        localStorage.removeItem('snapdeal_gemini_key');
      }
    } catch {}
    setApiKeyModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#e40046] flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-rose-200 animate-pulse">
            S
          </div>
          <p className="text-sm font-semibold text-slate-700">Connecting to Snapdeal Virtual KAM...</p>
        </div>
      </div>
    );
  }

  const statusStyle: Record<BotState, { bg: string; text: string; border: string; dot: string }> = {
    idle: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    listening: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
    processing: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    speaking: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const currStyle = statusStyle[botState];
  const visibleMessages = messages.filter((m) => m.content !== TRIGGER);
  const activeAvatar = persona === 'Priya' ? '👩‍💼' : '👨‍💼';

  const getStockBadge = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <XCircle className="w-2.5 h-2.5" /> Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e40046] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-rose-200">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#e40046]">Snapdeal</span>
              <span className="text-xs bg-rose-100 text-[#c1003b] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Virtual Voice KAM
              </span>
            </div>
            <p className="text-xs text-slate-500">
              AI-Powered Account Manager • Dynamic Multi-Seller Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Seller Switcher Button */}
          <button
            onClick={() => setSellerModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/60 text-slate-800 text-xs font-semibold shadow-xs transition"
            title="Switch Seller Profile"
          >
            <Store className="w-3.5 h-3.5 text-rose-600" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-normal leading-none">
                Active Seller ({currentSeller.sellerId})
              </span>
              <span className="font-bold text-slate-800 leading-tight">
                {currentSeller.name} &bull; {currentSeller.store}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Persona Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs text-xs">
            <button
              type="button"
              onClick={() => handlePersonaChange('Priya')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                persona === 'Priya'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Female Voice KAM"
            >
              <span>👩‍💼</span>
              <span>Priya</span>
            </button>
            <button
              type="button"
              onClick={() => handlePersonaChange('Rahul')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                persona === 'Rahul'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Male Voice KAM"
            >
              <span>👨‍💼</span>
              <span>Rahul</span>
            </button>
          </div>

          <button
            onClick={() => setVoiceSettingsOpen(true)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-xs"
            title="Configure Speech Voices"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            onClick={() => setShowMetricsDrawer(!showMetricsDrawer)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">{showMetricsDrawer ? 'Hide Drawer' : 'Show Drawer'}</span>
          </button>

          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-xs"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">API Key</span>
          </button>
        </div>
      </header>

      {/* Seller Dashboard & Catalog Drawer */}
      {showMetricsDrawer && (
        <section className="w-full max-w-5xl bg-white border border-rose-100 rounded-2xl p-4 mb-4 shadow-sm">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-900 text-white font-mono font-bold px-2 py-0.5 rounded-md">
                {currentSeller.sellerId}
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {currentSeller.name} &bull;{' '}
                  <span className="text-slate-600 font-medium">{currentSeller.store}</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  {currentSeller.category} &bull; {currentSeller.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMetricsTab('kpi')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    metricsTab === 'kpi'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📊 Performance KPI
                </button>
                <button
                  type="button"
                  onClick={() => setMetricsTab('catalog')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    metricsTab === 'catalog'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📦 Products ({currentSeller.products.length})
                </button>
              </div>

              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                Scenario: {currentSeller.scenario}
              </span>
            </div>
          </div>

          {/* TAB 1: KPI Grid */}
          {metricsTab === 'kpi' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-center">
              {/* Monthly Sales */}
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-500 font-medium">Monthly Sales</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  ₹{currentSeller.thisMonth.sales.toLocaleString('en-IN')}
                </div>
                <div
                  className={`text-[10px] font-semibold flex items-center justify-center gap-0.5 mt-0.5 ${
                    currentDeltas.salesChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  <span>
                    {currentDeltas.salesChangePct >= 0 ? '↑' : '↓'} was ₹
                    {currentSeller.lastMonth.sales.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-white/80 px-1 rounded">
                    {currentDeltas.salesChangePct >= 0 ? '+' : ''}
                    {currentDeltas.salesChangePct}%
                  </span>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-500 font-medium">Monthly Orders</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {currentSeller.thisMonth.orders} orders
                </div>
                <div
                  className={`text-[10px] font-semibold flex items-center justify-center gap-0.5 mt-0.5 ${
                    currentDeltas.ordersChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  <span>was {currentSeller.lastMonth.orders}</span>
                  <span className="bg-white/80 px-1 rounded">
                    {currentDeltas.ordersChangePct >= 0 ? '+' : ''}
                    {currentDeltas.ordersChangePct}%
                  </span>
                </div>
              </div>

              {/* Cancellation Rate */}
              <div
                className={`border rounded-xl p-2.5 ${
                  currentSeller.thisMonth.cancellationRate > 10
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-emerald-50/60 border-emerald-100'
                }`}
              >
                <span className="text-[11px] text-slate-500 font-medium">Cancellation Rate</span>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    currentSeller.thisMonth.cancellationRate > 10 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {currentSeller.thisMonth.cancellationRate}%
                </div>
                <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                  <span>was {currentSeller.lastMonth.cancellationRate}%</span>
                  <span className="bg-white/80 px-1 rounded">
                    {currentDeltas.cancellationDelta >= 0 ? '+' : ''}
                    {currentDeltas.cancellationDelta}pp
                  </span>
                </div>
              </div>

              {/* Return Rate */}
              <div
                className={`border rounded-xl p-2.5 ${
                  currentSeller.thisMonth.returnRate > 15
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-500 font-medium">Return Rate</span>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    currentSeller.thisMonth.returnRate > 15 ? 'text-rose-700' : 'text-slate-800'
                  }`}
                >
                  {currentSeller.thisMonth.returnRate}%
                </div>
                <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                  <span>was {currentSeller.lastMonth.returnRate}%</span>
                  <span className="bg-white/80 px-1 rounded">
                    {currentDeltas.returnRateDelta >= 0 ? '+' : ''}
                    {currentDeltas.returnRateDelta}pp
                  </span>
                </div>
              </div>

              {/* Stockouts / Inventory */}
              <div
                className={`border rounded-xl p-2.5 col-span-2 sm:col-span-1 ${
                  currentSeller.thisMonth.outOfStockProducts > 5
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-500 font-medium">Out-of-Stock SKUs</span>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    currentSeller.thisMonth.outOfStockProducts > 5
                      ? 'text-amber-800'
                      : 'text-slate-800'
                  }`}
                >
                  {currentSeller.thisMonth.outOfStockProducts} items
                </div>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  {currentDeltas.stockoutDelta >= 0 ? `+${currentDeltas.stockoutDelta} new stockouts` : 'stock improved'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Product Catalog Table */}
          {metricsTab === 'catalog' && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] bg-slate-50">
                    <th className="py-2 px-3 font-semibold">SKU ID</th>
                    <th className="py-2 px-3 font-semibold">Product Title</th>
                    <th className="py-2 px-3 font-semibold">Category</th>
                    <th className="py-2 px-3 font-semibold">Price</th>
                    <th className="py-2 px-3 font-semibold">Current Stock</th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSeller.products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.id}</td>
                      <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{p.category}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">₹{p.price}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{p.stock} units</td>
                      <td className="py-2 px-3">{getStockBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Main Voice KAM Interface */}
      <main className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-1">
        {!isStarted ? (
          /* Landing Screen */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center flex-1 my-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#e40046] via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-xl shadow-rose-200">
                <span className="text-5xl font-light">{activeAvatar}</span>
              </div>
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Namaste, {currentSeller.name}!
            </h1>
            <p className="text-base text-rose-600 font-semibold mt-1">
              {persona} &bull; Virtual Key Account Manager ({persona === 'Priya' ? 'Female' : 'Male'} Voice)
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Store: <span className="text-slate-800 font-bold">{currentSeller.store}</span> &bull; Category: {currentSeller.category}
            </p>
            <p className="text-sm text-slate-500 max-w-lg mx-auto mt-3 leading-relaxed">
              I have loaded your real-time account data ({currentSeller.sellerId}). Click below to start an interactive voice consultation to diagnose bottlenecks and formulate practical recovery steps.
            </p>

            {/* Quick Scenario prompt helper */}
            <div className="mt-5 mb-7 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-700 max-w-md text-left">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Primary Bottleneck:</strong> {currentSeller.primaryBottleneck}
              </span>
            </div>

            <button
              onClick={startConversation}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#e40046] hover:bg-[#c1003b] active:scale-95 text-white font-bold text-lg shadow-lg shadow-rose-300 hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Voice Call for {currentSeller.name.split(' ')[0]}</span>
            </button>

            {!hasVoiceSupport && (
              <p className="mt-4 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                Speech recognition is best experienced in Google Chrome or Microsoft Edge.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Web Speech STT + TTS
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Dynamic Function Calling
              </span>
              <span>&bull;</span>
              <span>10 Distinct Mock Sellers</span>
            </div>
          </div>
        ) : (
          /* Active Call Screen */
          <div className="flex flex-col flex-1 h-[620px]">
            {/* Call Header */}
            <div className="bg-[#e40046] text-white px-6 py-3.5 flex items-center justify-between shadow-md flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl transition-transform ${
                      botState === 'speaking' ? 'scale-110 ring-4 ring-white/40' : ''
                    }`}
                  >
                    {activeAvatar}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#e40046] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold leading-none">{persona}</h3>
                    <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live Call &bull; {currentSeller.sellerId}
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 mt-1">
                    Virtual KAM for <strong>{currentSeller.name}</strong> ({currentSeller.store})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceSettingsOpen(true)}
                  className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition border border-white/20"
                  title="Change voice"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice</span>
                </button>
                <button
                  onClick={handleEndCall}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl transition border border-white/20"
                >
                  <PhoneOff className="w-4 h-4 text-rose-200" />
                  <span>End Call</span>
                </button>
              </div>
            </div>

            {/* Conversation Transcript Window */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {visibleMessages.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-12 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-rose-300 border-t-transparent animate-spin"></div>
                  <span>Connecting with {persona} for {currentSeller.store}...</span>
                </div>
              )}

              {visibleMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#e40046] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span
                        className={`text-[11px] font-semibold ${
                          msg.role === 'user' ? 'text-rose-200' : 'text-rose-600'
                        }`}
                      >
                        {msg.role === 'user' ? `${currentSeller.name} (Seller)` : `${persona} (Snapdeal KAM)`}
                      </span>
                      {msg.timestamp && (
                        <span
                          className={`text-[10px] ${
                            msg.role === 'user' ? 'text-rose-200/80' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Real-time speech / thinking animation */}
              {botState === 'speaking' && (
                <div className="flex justify-start items-center gap-2 text-xs text-indigo-600 pl-2">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span className="font-medium">{persona} is speaking via text-to-speech...</span>
                </div>
              )}

              {botState === 'processing' && (
                <div className="flex justify-start items-center gap-2 text-xs text-amber-600 pl-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="font-medium">
                    Retrieving {currentSeller.sellerId} account data & generating recommendations...
                  </span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Speech Suggestions */}
            <div className="bg-white/80 border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">
                Ask {persona}:
              </span>
              <button
                onClick={() => {
                  setTextInput("My sales have dropped significantly this month. Can you help me understand why?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Why did my sales drop?&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("What is the primary root cause and bottleneck in my account?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Diagnose my bottleneck&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("What 2-3 practical actions should I take immediately?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Top recommendations&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("Can you summarize our call and my next action items?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Summarize call&rdquo;
              </button>
            </div>

            {/* Status Bar */}
            <div
              className={`px-4 py-2 border-t text-xs font-medium text-center flex items-center justify-center gap-2 ${currStyle.bg} ${currStyle.text} ${currStyle.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${currStyle.dot} animate-pulse`}></span>
              <span>{statusText}</span>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-500 hover:text-rose-800 font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Voice & Text Interaction Bar */}
            <div className="bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-3">
              {/* Voice Push-to-Talk Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                <button
                  onClick={handleMicClick}
                  disabled={botState === 'processing'}
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                    botState === 'listening'
                      ? 'bg-rose-600 text-white scale-110 ring-8 ring-rose-200 animate-pulse'
                      : botState === 'speaking'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-[#e40046] text-white hover:bg-[#c1003b] active:scale-95'
                  } ${botState === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={
                    botState === 'listening'
                      ? 'Click to stop listening'
                      : botState === 'speaking'
                      ? `Click to interrupt ${persona}`
                      : 'Click to speak'
                  }
                >
                  {botState === 'listening' ? (
                    <Mic className="w-6 h-6 animate-bounce" />
                  ) : botState === 'speaking' ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>

                <div className="text-left sm:hidden">
                  <p className="text-xs font-bold text-slate-800">
                    {botState === 'listening'
                      ? 'Listening...'
                      : botState === 'speaking'
                      ? `${persona} Speaking`
                      : 'Tap to Speak'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {botState === 'listening' ? 'Tap again to cancel' : 'Indian English voice'}
                  </p>
                </div>
              </div>

              {/* Text Input Fallback */}
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Speak via mic or type question for ${currentSeller.store}...`}
                    disabled={botState === 'processing'}
                    className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 rounded-xl outline-none transition"
                  />
                  {textInput && (
                    <button
                      type="button"
                      onClick={() => setTextInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!textInput.trim() || botState === 'processing'}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Attribution */}
      <footer className="mt-4 text-center text-xs text-slate-400 max-w-5xl w-full flex flex-wrap items-center justify-between gap-2 px-2">
        <span>Snapdeal AI First Intern Assignment &bull; Mini AI Voice KAM</span>
        <span>Built with Next.js 14, Google Gemini Tools, Web Speech API & Tailwind CSS</span>
      </footer>

      {/* Seller Selector Modal */}
      {sellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Select Seller Account (10 Available)</h3>
                  <p className="text-xs text-slate-500">
                    Switch between different business scenarios and categories
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSellerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Seller List Grid */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allSellers.map((s) => {
                const isSelected = s.sellerId === selectedSellerId;
                return (
                  <div
                    key={s.sellerId}
                    onClick={() => handleSellerChange(s.sellerId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-200 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                          isSelected ? 'bg-[#e40046] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.sellerId}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                          <span className="text-xs text-slate-500 font-normal">({s.store})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {s.category} &bull; {s.city}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md inline-block mb-0.5">
                        {s.scenario}
                      </span>
                      <div className="text-xs font-bold text-slate-900">
                        ₹{s.currentSales.toLocaleString('en-IN')}{' '}
                        <span
                          className={`text-[10px] ${
                            s.salesChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          ({s.salesChangePct >= 0 ? '+' : ''}
                          {s.salesChangePct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                SD001 preserves original assignment data.
              </span>
              <button
                type="button"
                onClick={() => setSellerModalOpen(false)}
                className="text-xs px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice & Persona Settings Modal */}
      {voiceSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Voice & Persona Settings</h3>
              </div>
              <button
                onClick={() => setVoiceSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Persona Switch */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Assistant Persona & Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePersonaChange('Priya')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    persona === 'Priya'
                      ? 'border-rose-400 bg-rose-50/70 text-rose-900 ring-2 ring-rose-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">👩‍💼</span>
                  <span className="text-xs font-bold">Priya</span>
                  <span className="text-[10px] text-rose-600 font-medium">Female Voice KAM</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaChange('Rahul')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    persona === 'Rahul'
                      ? 'border-slate-800 bg-slate-100 text-slate-900 ring-2 ring-slate-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">👨‍💼</span>
                  <span className="text-xs font-bold">Rahul</span>
                  <span className="text-[10px] text-slate-600 font-medium">Male Voice KAM</span>
                </button>
              </div>
            </div>

            {/* Specific Voice Picker */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Synthesizer Voice ({availableVoices.length} detected)
                </label>
                <button
                  type="button"
                  onClick={() => testVoice()}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-indigo-600" /> Test Voice
                </button>
              </div>

              <select
                value={selectedVoiceURI}
                onChange={(e) => {
                  setSelectedVoiceURI(e.target.value);
                  testVoice(e.target.value);
                }}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none"
              >
                <option value="">Default auto-selected for {persona}</option>
                {availableVoices.map((v) => {
                  const isFem = isFemaleVoice(v);
                  const isM = isMaleVoice(v);
                  const labelGender = isFem ? '👩 Female' : isM ? '👨 Male' : '🗣️';
                  return (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {labelGender} {v.name} ({v.lang})
                    </option>
                  );
                })}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Microsoft Zira or Heera / Neerja provide female speech; Microsoft Ravi or David provide male speech.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVoiceSettingsOpen(false)}
                className="text-xs px-4 py-2 bg-[#e40046] hover:bg-[#c1003b] text-white font-semibold rounded-lg shadow-sm transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Gemini API Key Setup</h3>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Snapdeal Voice KAM uses <strong>Google Gemini</strong> for real-time seller dialog
              intelligence with function calling. You can enter your API key here or place it in{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">.env.local</code>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>Free tier: 1500 req/day</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 hover:underline"
                >
                  Get free key from Google AI Studio &rarr;
                </a>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => saveApiKey('')}
                className="text-xs px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={() => saveApiKey(customApiKey)}
                className="text-xs px-4 py-2 bg-[#e40046] hover:bg-[#c1003b] text-white font-semibold rounded-lg shadow-sm transition"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
