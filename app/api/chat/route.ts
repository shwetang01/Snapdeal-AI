import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt, KAMName } from '@/lib/system-prompt';

// Rule-based fallback conversational brain in case Gemini API key is missing or invalid
function getDeterministicResponse(
  messages: { role: string; content: string }[],
  assistantName: KAMName = 'Priya'
): string {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  const historyText = messages.map((m) => m.content.toLowerCase()).join(' ');
  const name = assistantName === 'Rahul' ? 'Rahul' : 'Priya';

  if (lastMsg.includes('[call_started]') || messages.length <= 1) {
    return `Hello Rajesh! This is ${name} calling from Snapdeal. I'm really glad you reached out, as I can already see some concerning changes in your store performance this month. What has been worrying you the most?`;
  }

  if (
    lastMsg.includes('sales') ||
    lastMsg.includes('drop') ||
    lastMsg.includes('fell') ||
    lastMsg.includes('decline') ||
    lastMsg.includes('help') ||
    lastMsg.includes('orders')
  ) {
    if (!historyText.includes('out of stock')) {
      return "I can see your monthly orders dropped from 400 to 270, and sales fell to 1,35,000 rupees. Have you noticed any of your top-selling products going out of stock recently?";
    }
  }

  if (
    lastMsg.includes('stock') ||
    lastMsg.includes('inventory') ||
    lastMsg.includes('product') ||
    lastMsg.includes('yes') ||
    lastMsg.includes('many')
  ) {
    if (!historyText.includes('downward spiral') && !historyText.includes('algorithm')) {
      return "Rajesh, looking at your data, your out-of-stock products jumped from 5 to 18, and your cancellation rate climbed to 14 percent. When stockouts and cancellations rise, Snapdeal's search algorithm reduces your listing visibility, creating a downward spiral.";
    }
  }

  if (
    lastMsg.includes('what should i do') ||
    lastMsg.includes('recommend') ||
    lastMsg.includes('how to fix') ||
    lastMsg.includes('solution') ||
    lastMsg.includes('action') ||
    lastMsg.includes('cancellation') ||
    lastMsg.includes('what to do')
  ) {
    return "First, restock those 18 out-of-stock products within the next 48 hours to stop losing orders. Second, investigate cancellation reasons in your dashboard and connect with our priority logistics partner. Third, run a 7-day promotional discount of 10 to 15 percent on your top 5 products to quickly rebuild visibility.";
  }

  if (
    lastMsg.includes('summary') ||
    lastMsg.includes('recap') ||
    lastMsg.includes('summarize') ||
    lastMsg.includes('clear') ||
    lastMsg.includes('understand') ||
    lastMsg.includes('next steps')
  ) {
    return "To summarize today's call, Rajesh: your 33 percent sales drop was caused by 13 new stockouts and cancellations rising to 14 percent. Your three priorities are restocking within 48 hours, checking cancellation reasons in your dashboard, and running a short discount campaign. I've sent these recommendations to your registered Snapdeal email as well. Is there anything else I can help you with?";
  }

  if (
    lastMsg.includes('thank') ||
    lastMsg.includes('bye') ||
    lastMsg.includes('nothing') ||
    lastMsg.includes('no') ||
    lastMsg.includes('all good') ||
    lastMsg.includes('done')
  ) {
    return "Wonderful, Rajesh! I'm confident these steps will help you recover your sales quickly. Don't hesitate to reach back out to Snapdeal seller support anytime. Have a great day!";
  }

  // Default empathetic response moving conversation forward
  return "Rajesh, our data shows 18 products currently out of stock and a 14 percent cancellation rate costing you 65,000 rupees this month. I recommend immediately restocking your top inventory and launching a 10 to 15 percent promotion on your top products to recover algorithm ranking.";
}

export async function POST(req: NextRequest) {
  let activeAssistantName: KAMName = 'Priya';
  try {
    const body = await req.json();
    const {
      messages,
      apiKey: clientApiKey,
      assistantName,
    } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      apiKey?: string;
      assistantName?: KAMName;
    };

    if (assistantName === 'Rahul') activeAssistantName = 'Rahul';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    // If no API key is provided, use deterministic fallback with high accuracy
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-google-gemini-api-key-here')) {
      const fallbackReply = getDeterministicResponse(messages, activeAssistantName);
      return NextResponse.json({
        text: fallbackReply,
        source: 'deterministic-fallback',
        assistantName: activeAssistantName,
        note: 'Using built-in dialog engine. Add GEMINI_API_KEY in .env.local for live Gemini AI calls.',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: getSystemPrompt(activeAssistantName),
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.7,
      },
    });

    // Format history for Gemini SDK
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMsg = messages[messages.length - 1];

    const result = await chat.sendMessage(lastMsg.content);
    let text = result.response.text();

    // Clean any unwanted markdown asterisks or bullet formatting to guarantee natural voice
    text = text.replace(/[*#_`]/g, '').trim();

    return NextResponse.json({ text, source: 'gemini', assistantName: activeAssistantName });
  } catch (error: any) {
    console.error('[chat API error]', error);

    // If Gemini fails, fallback gracefully
    try {
      const body = await req.json().catch(() => null);
      const messages = body?.messages || [];
      const fallbackReply = getDeterministicResponse(messages, activeAssistantName);
      return NextResponse.json({
        text: fallbackReply,
        source: 'error-fallback',
        assistantName: activeAssistantName,
        warning: error?.message || 'Gemini error, used fallback response',
      });
    } catch {
      return NextResponse.json(
        { error: error?.message || 'Chat failed' },
        { status: 500 }
      );
    }
  }
}
