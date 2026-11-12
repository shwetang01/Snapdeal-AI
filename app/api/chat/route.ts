// app/api/chat/route.ts
// Dynamic Voice KAM Route with Gemini Function Calling & Resilient Analytics Engine

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getSystemPrompt, KAMName } from '@/lib/system-prompt';
import {
  MOCK_SELLERS,
  getSellerById,
  getSellerProducts,
  getSellerAnalytics,
  computeSellerDeltas,
} from '@/lib/seller-data';

// Tool declarations for dynamic Gemini function calling
const tools: any = [
  {
    functionDeclarations: [
      {
        name: 'get_seller_profile',
        description: 'Get seller identity, store details, and last vs this month performance metrics (sales, orders, cancellations, ASP, impressions, clicks, conversions, returns, stockouts).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            sellerId: {
              type: SchemaType.STRING,
              description: 'Unique Seller ID (e.g., SD001, SD002, etc.)',
            },
          },
          required: ['sellerId'],
        },
      },
      {
        name: 'get_seller_products',
        description: 'Get the product catalog, SKU IDs, pricing, and stock status for a seller.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            sellerId: {
              type: SchemaType.STRING,
              description: 'Unique Seller ID (e.g., SD001, SD002, etc.)',
            },
          },
          required: ['sellerId'],
        },
      },
      {
        name: 'get_seller_analytics',
        description: 'Compute variances, diagnose primary root causes, and retrieve prioritized business recovery recommendations for a seller.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            sellerId: {
              type: SchemaType.STRING,
              description: 'Unique Seller ID (e.g., SD001, SD002, etc.)',
            },
          },
          required: ['sellerId'],
        },
      },
    ],
  },
];

// Resilient dynamic dialog engine fallback that inspects active seller data deterministically
function getDynamicFallbackResponse(
  messages: { role: string; content: string }[],
  assistantName: KAMName = 'Priya',
  sellerId: string = 'SD001'
): string {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase().trim();
  const historyText = messages.map((m) => m.content.toLowerCase()).join(' ');

  const seller = getSellerById(sellerId) || MOCK_SELLERS.SD001;
  const analytics = getSellerAnalytics(seller.sellerId);
  const deltas = computeSellerDeltas(seller);
  const name = assistantName === 'Rahul' ? 'Rahul' : 'Priya';
  const firstName = seller.name.split(' ')[0];

  // STAGE 1: Greeting - ONLY triggered if call just started or it's the very first turn
  if (lastMsg.includes('[call_started]') || (messages.length === 1 && messages[0].content.includes('[call_started]'))) {
    return `Hello ${firstName}! This is ${name} calling from Snapdeal. I'm really glad you reached out, as I can already see some notable shifts in your store performance this month. What has been worrying you the most?`;
  }

  // Combined Root Cause + Improvements ("what is the main problem and how can i improve")
  if (
    (lastMsg.includes('problem') || lastMsg.includes('issue') || lastMsg.includes('why') || lastMsg.includes('reason') || lastMsg.includes('what happened')) &&
    (lastMsg.includes('improve') || lastMsg.includes('fix') || lastMsg.includes('do') || lastMsg.includes('solution') || lastMsg.includes('better'))
  ) {
    if (seller.scenarioType === 'high_returns') {
      return `${firstName} ji, the main problem is your return rate spiked to ${seller.thisMonth.returnRate} percent due to kurti sizing mismatches. To improve, we should immediately update your size charts with exact bust measurements and add fabric care notes.`;
    } else if (seller.scenarioType === 'low_visibility') {
      return `${firstName} ji, your main issue is a 76 percent drop in search impressions due to expired promotion tags. To improve this, re-enroll your top kitchenware in festive flash sales and enable Snapdeal automatic keyword bidding.`;
    } else {
      return `${firstName} ji, the main problem is that your 18 stockouts caused Snapdeal's ranking algorithm to demote your listings, while cancellations doubled to 14 percent. To improve this, prioritize restocking your top 2 fast chargers immediately and enable same-day dispatch.`;
    }
  }

  // Problem / Issue / Bottleneck / Why / Drop inquiry / Inquiries
  if (
    lastMsg.includes('problem') ||
    lastMsg.includes('issue') ||
    lastMsg.includes('bottleneck') ||
    lastMsg.includes('why') ||
    lastMsg.includes('what happened') ||
    lastMsg.includes('wrong') ||
    lastMsg.includes('reason') ||
    lastMsg.includes('sales') ||
    lastMsg.includes('drop') ||
    lastMsg.includes('fell') ||
    lastMsg.includes('decline') ||
    lastMsg.includes('down') ||
    lastMsg.includes('stock') ||
    lastMsg.includes('inventory') ||
    lastMsg.includes('worry') ||
    lastMsg.includes('orders') ||
    lastMsg.includes('cancellation') ||
    lastMsg.includes('return')
  ) {
    return `${firstName} ji, ${analytics.diagnosis}`;
  }

  // Recommendations / Improvements / Solutions / Actions
  if (
    lastMsg.includes('improve') ||
    lastMsg.includes('fix') ||
    lastMsg.includes('recommend') ||
    lastMsg.includes('what should i do') ||
    lastMsg.includes('how to') ||
    lastMsg.includes('solution') ||
    lastMsg.includes('action') ||
    lastMsg.includes('steps') ||
    lastMsg.includes('suggestion') ||
    lastMsg.includes('how can i')
  ) {
    return `Here are the top recovery steps for ${seller.store}: First, ${analytics.recommendations[0].toLowerCase()} Second, ${analytics.recommendations[1].toLowerCase()} Third, ${analytics.recommendations[2].toLowerCase()}`;
  }

  // Objections / Capital pushback
  if (
    lastMsg.includes('capital') ||
    lastMsg.includes('money') ||
    lastMsg.includes('funds') ||
    lastMsg.includes('expensive') ||
    lastMsg.includes('cannot') ||
    lastMsg.includes("can't") ||
    lastMsg.includes('cost') ||
    lastMsg.includes('block') ||
    lastMsg.includes('budget') ||
    lastMsg.includes('hard') ||
    lastMsg.includes('difficult')
  ) {
    return `I completely understand your working capital concern, ${firstName} ji. Instead of stocking all SKUs, let's focus only on your top 2 fastest-selling items. That requires minimal capital while recovering over 80 percent of your lost sales.`;
  }

  // Summary / Agreement / Next Steps / OK
  if (
    lastMsg.includes('summary') ||
    lastMsg.includes('recap') ||
    lastMsg.includes('summarize') ||
    lastMsg.includes('ok') ||
    lastMsg.includes('okay') ||
    lastMsg.includes('agree') ||
    lastMsg.includes('sure') ||
    lastMsg.includes('fine') ||
    lastMsg.includes('done') ||
    lastMsg.includes('next steps') ||
    lastMsg.includes('understand') ||
    lastMsg.includes('noted')
  ) {
    return `${analytics.summary} I have noted your commitments and will check your store metrics again in 7 days. Is there anything else I can assist you with today?`;
  }

  // Polite closing
  if (
    lastMsg.includes('thank') ||
    lastMsg.includes('bye') ||
    lastMsg.includes('nothing') ||
    lastMsg.includes('no') ||
    lastMsg.includes('all good')
  ) {
    return `Wonderful, ${firstName} ji! I'm confident these adjustments will restore your growth on Snapdeal. Have a great day and happy selling!`;
  }

  // Grounded Default - NEVER repeats greeting if conversation has started
  return `${firstName} ji, ${analytics.diagnosis} To improve your performance, I strongly recommend: ${analytics.recommendations[0]}.`;
}

export async function POST(req: NextRequest) {
  let activeAssistantName: KAMName = 'Priya';
  let activeSellerId = 'SD001';
  let incomingMessages: { role: string; content: string }[] = [];

  try {
    const body = await req.json();
    const {
      messages,
      apiKey: clientApiKey,
      assistantName,
      sellerId,
    } = body;

    incomingMessages = Array.isArray(messages) ? messages : [];

    if (assistantName === 'Rahul') activeAssistantName = 'Rahul';
    if (sellerId && MOCK_SELLERS[sellerId.toUpperCase()]) {
      activeSellerId = sellerId.toUpperCase();
    }

    if (!incomingMessages || incomingMessages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();

    // Use dynamic fallback if Gemini API key is missing or dummy
    if (!apiKey || apiKey.includes('your-google-gemini-api-key-here')) {
      const fallbackReply = getDynamicFallbackResponse(incomingMessages, activeAssistantName, activeSellerId);
      return NextResponse.json({
        text: fallbackReply,
        source: 'deterministic-fallback',
        assistantName: activeAssistantName,
        sellerId: activeSellerId,
      });
    }

    // Call Google Gemini with function calling
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: getSystemPrompt(activeAssistantName, activeSellerId),
      tools,
      generationConfig: {
        maxOutputTokens: 220,
        temperature: 0.7,
      },
    });

    // Format chat history, alternating user and model
    const history = incomingMessages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMsg = incomingMessages[incomingMessages.length - 1];

    let result = await chat.sendMessage(lastMsg.content);
    let candidate = result.response;

    // Handle function calls loop (Gemini calling tools)
    let functionCalls = candidate.functionCalls();
    let loopCount = 0;
    while (functionCalls && functionCalls.length > 0 && loopCount < 3) {
      loopCount++;
      const functionResponses = [];

      for (const call of functionCalls) {
        const targetSeller = (call.args as any)?.sellerId || activeSellerId;
        let fnResult: any;

        if (call.name === 'get_seller_profile') {
          fnResult = getSellerById(targetSeller);
        } else if (call.name === 'get_seller_products') {
          fnResult = getSellerProducts(targetSeller);
        } else if (call.name === 'get_seller_analytics') {
          fnResult = getSellerAnalytics(targetSeller);
        } else {
          fnResult = { error: `Function ${call.name} unknown` };
        }

        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: fnResult },
          },
        });
      }

      // Send tool results back to Gemini
      result = await chat.sendMessage(functionResponses);
      candidate = result.response;
      functionCalls = candidate.functionCalls();
    }

    let text = '';
    try {
      text = candidate.text();
    } catch {
      // Fallback extraction if candidate.text() cannot be read directly
      const parts = (candidate as any)?.candidates?.[0]?.content?.parts || [];
      text = parts.map((p: any) => p.text || '').filter(Boolean).join(' ');
    }

    if (!text || text.trim() === '') {
      text = getDynamicFallbackResponse(incomingMessages, activeAssistantName, activeSellerId);
    } else {
      text = text.replace(/[*#_`]/g, '').trim();
    }

    return NextResponse.json({
      text,
      source: 'gemini-function-calling',
      assistantName: activeAssistantName,
      sellerId: activeSellerId,
    });
  } catch (error: any) {
    console.error('[chat API error]', error?.message || error);

    // If Gemini fails (e.g. quota limit, network, timeout), seamlessly fall back to dynamic engine
    try {
      const fallbackReply = getDynamicFallbackResponse(
        incomingMessages,
        activeAssistantName,
        activeSellerId
      );
      return NextResponse.json({
        text: fallbackReply,
        source: 'error-fallback',
        assistantName: activeAssistantName,
        sellerId: activeSellerId,
        warning: error?.message || 'Used dynamic fallback',
      });
    } catch (fallbackErr: any) {
      return NextResponse.json({ error: error?.message || 'Chat failed' }, { status: 500 });
    }
  }
}
