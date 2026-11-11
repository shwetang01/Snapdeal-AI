'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SELLER_DATA, COMPUTED } from '@/lib/seller-data';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  TrendingDown,
  AlertCircle,
  PackageX,
  Sparkles,
  Send,
  RotateCcw,
  Key,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string; timestamp?: string };
type BotState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const TRIGGER = '[CALL_STARTED]';

export default function VoiceBot() {
  const [botState, setBotState] = useState<BotState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusText, setStatusText] = useState('Click "Start Call" to begin');
  const [isStarted, setIsStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const [showMetricsDrawer, setShowMetricsDrawer] = useState(true);

  const messagesRef = useRef<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Sync ref with messages state so SpeechRecognition event handlers access latest messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botState]);

  // Load custom API key from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('snapdeal_gemini_key');
      if (savedKey) setCustomApiKey(savedKey);

      // Check SpeechRecognition browser support
      const SR =
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      if (!SR) {
        setHasVoiceSupport(false);
      }

      // Pre-load browser voices on mount
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  /** Convert text to speech using browser SpeechSynthesis API */
  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      setBotState('speaking');
      setStatusText('Priya is speaking...');

      window.speechSynthesis.cancel(); // stop any leftover speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      // Pick the best natural-sounding Indian/English female voice available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          (v.lang === 'en-IN' || v.lang.startsWith('en')) &&
          (v.name.includes('Heera') ||
            v.name.includes('Neerja') ||
            v.name.includes('India') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.toLowerCase().includes('female'))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
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

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  /** Send conversation history to /api/chat */
  const askChat = useCallback(
    async (msgs: Message[]): Promise<string> => {
      setBotState('processing');
      setStatusText('Priya is analyzing your account...');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          apiKey: customApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Chat API error');
      }

      const data = await res.json();
      return data.text as string;
    },
    [customApiKey]
  );

  /** Start the conversation — trigger Priya's opening greeting */
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
      setErrorMsg(
        'Could not initialize call. Please check your network or Gemini API key.'
      );
      setBotState('error');
      setIsStarted(false);
    }
  }, [askChat, speakText]);

  /** Start browser SpeechRecognition */
  const startListening = useCallback(() => {
    setErrorMsg(null);

    // Stop TTS if speaking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
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
      recognitionRef.current?.stop();
      setBotState('idle');
      setStatusText('Listening paused. Tap mic to resume.');
    } else if (botState === 'speaking') {
      // Allow user to interrupt Priya
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setBotState('idle');
      startListening();
    }
  };

  /** Send text message (for silent testing or fallback) */
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
      window.speechSynthesis.cancel();
    }
    recognitionRef.current?.stop();
    setIsStarted(false);
    setBotState('idle');
    setStatusText('Call ended. Click "Start Call" to begin a new session.');
  };

  /** Save custom API key */
  const saveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('snapdeal_gemini_key', key);
      } else {
        localStorage.removeItem('snapdeal_gemini_key');
      }
    }
    setApiKeyModalOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e40046] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-rose-200">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#e40046]">Snapdeal</span>
              <span className="text-xs bg-rose-100 text-[#c1003b] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Seller Voice KAM
              </span>
            </div>
            <p className="text-xs text-slate-500">
              AI-Powered Account Manager • 24x7 Seller Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetricsDrawer(!showMetricsDrawer)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-sm"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>{showMetricsDrawer ? 'Hide Seller Data' : 'View Seller Data'}</span>
          </button>
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-sm"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>{customApiKey ? 'API Key Configured' : 'Set API Key'}</span>
          </button>
        </div>
      </header>

      {/* Seller Metrics Bar (Accordion / Summary) */}
      {showMetricsDrawer && (
        <section className="w-full max-w-4xl bg-white border border-rose-100 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Seller Profile
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                {SELLER_DATA.name} &bull;{' '}
                <span className="text-slate-600 font-normal">{SELLER_DATA.store}</span>
              </h2>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Category: <span className="font-semibold text-slate-700">{SELLER_DATA.category}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-center">
            {/* Sales */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Monthly Sales</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                ₹{SELLER_DATA.thisMonth.sales.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-semibold text-rose-600 flex items-center justify-center gap-0.5 mt-0.5">
                <span>↓ ₹{SELLER_DATA.lastMonth.sales.toLocaleString('en-IN')}</span>
                <span className="bg-rose-100 px-1 rounded">-{COMPUTED.salesDropPct}%</span>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Orders</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {SELLER_DATA.thisMonth.orders}
              </div>
              <div className="text-[10px] font-semibold text-rose-600 flex items-center justify-center gap-0.5 mt-0.5">
                <span>↓ was {SELLER_DATA.lastMonth.orders}</span>
                <span className="bg-rose-100 px-1 rounded">-{COMPUTED.ordersDropPct}%</span>
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Cancellation Rate</span>
              <div className="text-sm font-bold text-amber-700 mt-0.5">
                {SELLER_DATA.thisMonth.cancellationRate}%
              </div>
              <div className="text-[10px] font-semibold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                <span>↑ was {SELLER_DATA.lastMonth.cancellationRate}%</span>
                <span className="bg-amber-100 px-1 rounded">+{COMPUTED.cancellationIncrease}pp</span>
              </div>
            </div>

            {/* Avg Selling Price */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Avg Selling Price</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                ₹{SELLER_DATA.thisMonth.avgSellingPrice}
              </div>
              <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                Unchanged (₹500)
              </div>
            </div>

            {/* Out of Stock */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-medium">Out-of-Stock SKUs</span>
              <div className="text-sm font-bold text-rose-700 mt-0.5">
                {SELLER_DATA.thisMonth.outOfStockProducts} items
              </div>
              <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                +{COMPUTED.newOutOfStockCount} new stockouts!
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Call Interface Container */}
      <main className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-1">
        {!isStarted ? (
          /* Landing Screen */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center flex-1 my-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#e40046] via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-xl shadow-rose-200">
                <span className="text-5xl font-light">👩‍💼</span>
              </div>
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Namaste, Rajesh Sharma!
            </h1>
            <p className="text-base text-rose-600 font-semibold mt-1">
              Priya &bull; Virtual Key Account Manager
            </p>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-3 leading-relaxed">
              I noticed your sales dipped from ₹2,00,000 to ₹1,35,000 this month. Start an instant
              voice call to diagnose root causes and get personalized recovery steps.
            </p>

            {/* Quick Scenario prompt helper */}
            <div className="mt-6 mb-8 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                Simulated Seller Concern: <i>&ldquo;My sales have dropped significantly this month. Can you help me?&rdquo;</i>
              </span>
            </div>

            <button
              onClick={startConversation}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#e40046] hover:bg-[#c1003b] active:scale-95 text-white font-bold text-lg shadow-lg shadow-rose-300 hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Voice Call with Priya</span>
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
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Google Gemini 1.5 Flash
              </span>
              <span>&bull;</span>
              <span>Zero external telephony required</span>
            </div>
          </div>
        ) : (
          /* Active Call Screen */
          <div className="flex flex-col flex-1 h-[620px]">
            {/* Call Header */}
            <div className="bg-[#e40046] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl transition-transform ${
                      botState === 'speaking' ? 'scale-110 ring-4 ring-white/40' : ''
                    }`}
                  >
                    👩‍💼
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#e40046] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold leading-none">Priya</h3>
                    <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live Voice Call
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 mt-1">
                    Virtual Key Account Manager &bull; Snapdeal India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  <span>Connecting with Priya...</span>
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
                        {msg.role === 'user' ? 'Rajesh Sharma (You)' : 'Priya (Snapdeal KAM)'}
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
                  <span className="font-medium">Priya is speaking via text-to-speech...</span>
                </div>
              )}

              {botState === 'processing' && (
                <div className="flex justify-start items-center gap-2 text-xs text-amber-600 pl-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="font-medium">Analyzing account data & formulating advice...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Speech Suggestions (Click to speak) */}
            <div className="bg-white/80 border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap text-[11px]">
                Suggested questions:
              </span>
              <button
                onClick={() => {
                  setTextInput("My sales dropped significantly this month. Can you help me?");
                  // Directly ask
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Why did my sales drop?&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("Yes, I think some products are out of stock. How bad is it?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;How bad is the stockout?&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("What are your top 3 recommendations for me to recover?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;What are your 3 recommendations?&rdquo;
              </button>
              <button
                onClick={() => {
                  setTextInput("Can you summarize our call and next steps?");
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleTextSubmit(fakeEvent), 50);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition text-[11px]"
              >
                &ldquo;Summarize next steps&rdquo;
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
              {/* Giant Voice Push-to-Talk / Toggle Button */}
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
                      ? 'Click to interrupt Priya'
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
                      ? 'Priya Speaking'
                      : 'Tap to Speak'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {botState === 'listening' ? 'Tap again to cancel' : 'Indian English voice'}
                  </p>
                </div>
              </div>

              {/* Text Input Fallback (for accessibility or testing) */}
              <form
                onSubmit={handleTextSubmit}
                className="flex-1 flex items-center gap-2 w-full"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Speak via mic or type seller question here..."
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
      <footer className="mt-4 text-center text-xs text-slate-400 max-w-4xl w-full flex flex-wrap items-center justify-between gap-2 px-2">
        <span>Snapdeal AI First Intern Assignment &bull; Mini AI Voice KAM</span>
        <span>Built with Next.js 14, Google Gemini, Web Speech API & Tailwind CSS</span>
      </footer>

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
              intelligence. You can enter your API key here or place it in{' '}
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

