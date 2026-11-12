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

// Dynamic dialog engine fallback that inspects active seller data deterministically
function getDynamicFallbackResponse(
  messages: { role: string; content: string }[],
  assistantName: KAMName = 'Priya',
  sellerId: string = 'SD001'
): string {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  const historyText = messages.map((m) => m.content.toLowerCase()).join(' ');

  const seller = getSellerById(sellerId) || MOCK_SELLERS.SD001;
  const analytics = getSellerAnalytics(seller.sellerId);
  const deltas = computeSellerDeltas(seller);
  const name = assistantName === 'Rahul' ? 'Rahul' : 'Priya';

  // STAGE 1: Greeting
  if (lastMsg.includes('[call_started]') || messages.length <= 1) {
    return `Hello ${seller.name.split(' ')[0]}! This is ${name} calling from Snapdeal. I'm really glad you reached out, as I can already see some notable shifts in your store performance this month. What has been worrying you the most?`;
  }

  // STAGE 2: Active Listening / Inquiries
  if (
    lastMsg.includes('sales') ||
    lastMsg.includes('drop') ||
    lastMsg.includes('fell') ||
    lastMsg.includes('decline') ||
    lastMsg.includes('help') ||
    lastMsg.includes('worry') ||
    lastMsg.includes('orders') ||
    lastMsg.includes('concern')
  ) {
    if (!historyText.includes('noticed') && !historyText.includes('factor')) {
      if (seller.scenarioType === 'high_returns') {
        return `I can see you maintained good volume with ${seller.thisMonth.orders} orders, but your returns climbed steeply to ${seller.thisMonth.returnRate} percent. Have customers reached out with sizing or fabric concerns on your kurti listings?`;
      } else if (seller.scenarioType === 'low_visibility') {
        return `I noticed your monthly orders dropped to ${seller.thisMonth.orders}, while conversion stayed strong at ${seller.thisMonth.conversionRate} percent. Have you checked whether your search impressions and traffic dropped recently?`;
      } else if (seller.scenarioType === 'poor_conversion') {
        return `I see your store received over ${seller.thisMonth.clicks.toLocaleString('en-IN')} clicks this month, but orders fell to ${seller.thisMonth.orders}. Have you noticed customers dropping off without completing purchases on your product pages?`;
      } else if (seller.scenarioType === 'healthy_growth') {
        return `Actually, ${seller.name.split(' ')[0]}, your numbers are looking phenomenal with sales up ${deltas.salesChangePct} percent to ₹${seller.thisMonth.sales.toLocaleString('en-IN')}! Were you looking to scale up inventory or enroll in our festive promotions?`;
      } else if (seller.scenarioType === 'asp_erosion') {
        return `Your order count is steady at ${seller.thisMonth.orders}, but your average selling price dropped from ₹${seller.lastMonth.avgSellingPrice} down to ₹${seller.thisMonth.avgSellingPrice}. Have you been discounting heavily to match competitor prices?`;
      } else {
        return `I can see your monthly orders dropped from ${seller.lastMonth.orders} to ${seller.thisMonth.orders}, and sales fell to ₹${seller.thisMonth.sales.toLocaleString('en-IN')}. Have you noticed any of your top-selling products going out of stock recently?`;
      }
    }
  }

  // STAGE 3: Root Cause Diagnosis
  if (
    lastMsg.includes('stock') ||
    lastMsg.includes('inventory') ||
    lastMsg.includes('yes') ||
    lastMsg.includes('why') ||
    lastMsg.includes('reason') ||
    lastMsg.includes('return') ||
    lastMsg.includes('traffic') ||
    lastMsg.includes('impression') ||
    lastMsg.includes('bad') ||
    lastMsg.includes('situation')
  ) {
    if (!historyText.includes('first') && !historyText.includes('recommend')) {
      return analytics.diagnosis;
    }
  }

  // STAGE 4: Recommendations
  if (
    lastMsg.includes('what should i do') ||
    lastMsg.includes('recommend') ||
    lastMsg.includes('how to fix') ||
    lastMsg.includes('solution') ||
    lastMsg.includes('action') ||
    lastMsg.includes('what to do') ||
    lastMsg.includes('steps')
  ) {
    return `First, ${analytics.recommendations[0].toLowerCase()} Second, ${analytics.recommendations[1].toLowerCase()} Third, ${analytics.recommendations[2].toLowerCase()}`;
  }

  // STAGE 5: Summary & Recap
  if (
    lastMsg.includes('summary') ||
    lastMsg.includes('recap') ||
    lastMsg.includes('summarize') ||
    lastMsg.includes('clear') ||
    lastMsg.includes('understand') ||
    lastMsg.includes('next steps')
  ) {
    return `${analytics.summary} I have sent these exact action items to your registered Snapdeal email. Is there anything else I can clarify for you today?`;
  }

  // Closing
  if (
    lastMsg.includes('thank') ||
    lastMsg.includes('bye') ||
    lastMsg.includes('nothing') ||
    lastMsg.includes('no') ||
    lastMsg.includes('all good') ||
    lastMsg.includes('done')
  ) {
    return `Wonderful, ${seller.name.split(' ')[0]}! I'm confident these steps will help you achieve great results. Don't hesitate to reach back out to Snapdeal seller support anytime. Have a wonderful day!`;
  }

  // General default grounded in analytics
  return `${seller.name.split(' ')[0]}, ${analytics.diagnosis} I recommend reviewing your dashboard metrics and implementing our recovery steps to regain algorithm ranking.`;
}

export async function POST(req: NextRequest) {
  let activeAssistantName: KAMName = 'Priya';
  let activeSellerId = 'SD001';

  try {
    const body = await req.json();
    const {
      messages,
      apiKey: clientApiKey,
      assistantName,
      sellerId,
    } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      apiKey?: string;
      assistantName?: KAMName;
      sellerId?: string;
    };

    if (assistantName === 'Rahul') activeAssistantName = 'Rahul';
    if (sellerId && MOCK_SELLERS[sellerId.toUpperCase()]) {
      activeSellerId = sellerId.toUpperCase();
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    // Use dynamic fallback if Gemini API key is missing or dummy
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-google-gemini-api-key-here')) {
      const fallbackReply = getDynamicFallbackResponse(messages, activeAssistantName, activeSellerId);
      return NextResponse.json({
        text: fallbackReply,
        source: 'deterministic-fallback',
        assistantName: activeAssistantName,
        sellerId: activeSellerId,
        note: 'Using built-in dialog engine. Add GEMINI_API_KEY in .env.local for live Gemini AI calls.',
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

    // Format chat history
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMsg = messages[messages.length - 1];

    let result = await chat.sendMessage(lastMsg.content);
    let candidate = result.response;

    // Handle function calls loop (Gemini calling tools)
    let functionCalls = candidate.functionCalls();
    while (functionCalls && functionCalls.length > 0) {
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

    let text = candidate.text();
    text = text.replace(/[*#_`]/g, '').trim();

    return NextResponse.json({
      text,
      source: 'gemini-function-calling',
      assistantName: activeAssistantName,
      sellerId: activeSellerId,
    });
  } catch (error: any) {
    console.error('[chat API error]', error);

    // If Gemini fails (e.g. quota limit, timeout), seamlessly fall back to dynamic engine
    try {
      const fallbackReply = getDynamicFallbackResponse(
        req ? [] : [],
        activeAssistantName,
        activeSellerId
      );
      return NextResponse.json({
        text: fallbackReply,
        source: 'error-fallback',
        assistantName: activeAssistantName,
        sellerId: activeSellerId,
        warning: error?.message || 'Gemini error, used dynamic fallback',
      });
    } catch {
      return NextResponse.json({ error: error?.message || 'Chat failed' }, { status: 500 });
    }
  }
}
