# Snapdeal Mini AI Voice KAM — Technical Architecture & Submission Note

**Project:** Snapdeal Virtual Key Account Manager (Mini AI Voice KAM)  
**Candidate Submission for:** Snapdeal AI First Intern Practical Assignment  
**Tech Stack:** Next.js 14 (App Router, React 18, TypeScript), Tailwind CSS, Google Gemini 1.5 Flash, Web Speech API (STT & TTS)  
**Demo Prototype:** `http://localhost:3000` (Local runnable) / GitHub Repository  

---

## 1. Executive Summary & Objective

The **Snapdeal Mini AI Voice KAM** is an autonomous, voice-first account manager designed to help Snapdeal sellers diagnose revenue declines, identify underlying root causes (e.g., inventory stockouts, high cancellations, size-mismatch returns, ad budget leakage), and formulate immediate operational recovery plans. 

Unlike conventional chatbots with static scripts or hardcoded prompts, this solution implements a **dynamic tool-calling architecture** spanning **10 realistic sellers (`SD001`–`SD010`)** and **40 unique SKUs**. It preserves the exact figures for `SD001` (Rajesh Sharma / Sharma Electronics: ₹2,00,000 → ₹1,35,000 sales, 14% cancellation spike, 18 stockouts) while delivering completely isolated, contextual guidance across 10 diverse retail categories without data contamination.

---

## 2. AI Model(s) & Reasoning Architecture

### Primary LLM: Google Gemini 1.5 Flash
- **Model Choice:** Chosen for its ultra-low latency (<600ms first token), cost efficiency, and native support for structured function declarations (Tool Calling).
- **Dynamic Tool Calling (Zero Hardcoded Metrics):** To adhere to strict enterprise separation of concerns, the system prompt contains **zero hardcoded seller numbers**. When a voice turn is processed, Gemini dynamically queries the seller database using declared schema tools:
  1. `get_seller_profile(sellerId)`: Fetches current vs. last month sales, orders, ASP, cancellations, returns, and conversion rates.
  2. `get_seller_products(sellerId)`: Queries catalog items with SKU-level stock quantities and status badges.
  3. `get_seller_analytics(sellerId)`: Computes percentage deltas, isolates core bottlenecks, and generates ranked recovery actions.
- **Conversational Guardrails:** Enforced via system prompt to keep responses natural for audio playback (2–3 sentences per turn, no bullet points or markdown syntax, conversational Indian English context, and natural currency references in Lakhs/Thousands).

### Resilient Dual-Engine Design: Deterministic Rule Fallback
- A built-in dialog state machine models the 5 conversation stages (Greeting → Problem Diagnosis → Recommendations → Pushback Handling → Agreement).
- If an API key is missing or internet connectivity drops, the system falls back seamlessly to the deterministic engine without breaking the voice call, guaranteeing 100% uptime during live presentations.

---

## 3. Speech-to-Text (STT) & Text-to-Speech (TTS) Platform

To ensure zero telephony infrastructure overhead, minimal audio latency, and universal accessibility, the solution utilizes the **Browser-Native Web Speech API**:

| Subsystem | Technology | Implementation & Optimizations |
| :--- | :--- | :--- |
| **Speech-to-Text (STT)** | `window.webkitSpeechRecognition` / `SpeechRecognition` | • Continuous listening with `interimResults: false` for clean sentence capture.<br>• Configured for `en-IN` (Indian English) to accurately parse Indian names, product terms, and currency formats (e.g., "lakhs", "rupees").<br>• Real-time animated microphone visualizer with automatic restart on speech pauses. |
| **Text-to-Speech (TTS)** | `window.speechSynthesis` | • Dual Persona Support: **Priya (Female)** and **Rahul (Male)**.<br>• Smart Voice Resolution: Automatically filters out male voices for Priya (matching `Microsoft Zira`, `Heera`, `Neerja`, or `Google UK Female` at pitch `1.15`) and selects `Ravi`/`David` at pitch `0.95` for Rahul.<br>• Built-in Voice Inspector with a **"Test Voice 🔊"** preview button.<br>• Automatic speech queue cleanup on tab blur, reload, or call termination. |
| **Silent Fallback** | Text Chat Bar | Provides dual-mode accessibility if the user’s microphone is muted or unsupported in non-Chromium browsers. |

---

## 4. Overall Workflow & Conversation Lifecycle

```
[Seller Speaks in Chrome/Edge] 
        │ (Audio input)
        ▼
[Web Speech STT: en-IN] ──► (Transcribed Text)
                                    │
                                    ▼
[VoiceBot.tsx UI] ────────► [POST /api/chat { sellerId, message, stage }]
                                    │
                                    ▼
                    [Next.js Dynamic Route Handler]
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼ (With Gemini Key)                             ▼ (Without Key)
   [Google Gemini 1.5 Flash]                      [Deterministic Dialog Engine]
            │                                               │
            │ Emits Function Call                           │ Evaluates Seller Scenarios
            ▼                                               │
   [Tool Dispatcher: lib/seller-data.ts]                    │
   - get_seller_profile(id)                                 │
   - get_seller_products(id)                                │
   - get_seller_analytics(id)                               │
            │                                               │
            ▼                                               │
   [Function Response returned to LLM]                      │
            │                                               │
            └───────────────────────┬───────────────────────┘
                                    ▼
                       [Synthesized Voice Text]
                                    │
                                    ▼
[Web Speech TTS: Priya / Rahul] ──► [Seller Hears Conversational Audio]
```

### The 5-Stage Conversational Protocol:
1. **Introduction & Context Setting:** Virtual KAM introduces themselves, confirms the seller's store name, and acknowledges their recent performance shift.
2. **Data Review & Root Cause Identification:** Identifies specific metric drops (e.g., ₹2L → ₹1.35L revenue, 18 stockouts, 14% cancellations) and pinpoints algorithmic down-ranking.
3. **Actionable Recommendations:** Delivers 2–3 concrete operational steps (replenish hero SKUs, enable Fast Shipping SLA, optimize keywords).
4. **Seller Pushback & Objection Handling:** Empathizes with working capital or margin constraints and suggests pragmatic compromises (e.g., reallocating capital to top 20% high-velocity SKUs instead of bulk ordering).
5. **Agreement & Next Steps:** Confirms immediate seller commitment and schedules a structured 7-day follow-up review.

---

## 5. Deliverables & Demonstration Links

- **Runnable Local Prototype:** `http://localhost:3000` (run `run_dev.bat` or `npm run dev`)
- **Multi-Seller Test Suite:** `node test_multi_seller.mjs` (verifies 10 sellers, 40 SKUs, zero cross-seller data leakage)
- **Voice Protocol Test Suite:** `node test_voice_kam.mjs` (verifies the complete 5-stage conversation flow)
- **Source Code Repository:** Complete Next.js 14 project with Tailwind CSS, TypeScript types, and REST APIs (`GET /api/sellers`).
