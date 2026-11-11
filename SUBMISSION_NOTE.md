# Snapdeal Mini AI Voice KAM — Solution Architecture & Submission Note

**Candidate:** AI First Intern Candidate  
**Project:** Snapdeal Virtual Key Account Manager (Voice KAM)  
**Target Scenario:** Seller Rajesh Sharma (Rajesh Electronics) calling regarding a 33% monthly sales decline  

---

## 1. Executive Summary

This project implements a real-time, browser-native **AI Voice Key Account Manager (Priya)** designed for Snapdeal sellers. When seller **Rajesh Sharma** reaches out concerned about dropping sales, Priya conducts a natural two-way voice call. She analyzes the account's historical metrics against the current month, diagnoses the underlying bottlenecks (inventory stockouts and spike in cancellation rate leading to search algorithm demotion), recommends 3 concrete, high-impact recovery actions, and summarizes the next steps.

---

## 2. Key Architecture Decisions & Tech Stack

| Component | Technology | Rationale & Trade-offs | Cost |
| :--- | :--- | :--- | :--- |
| **Fullstack Framework** | **Next.js 14 (App Router, TypeScript)** | Unified frontend + serverless API route (`/api/chat`). Zero backend server maintenance, high performance, and rapid deployment. | Free / Open-source |
| **LLM & Reasoning** | **Google Gemini 1.5 Flash (`@google/generative-ai`)** | Ultra-low latency (~300-500ms TTFT), generous free tier (1,500 req/day), superior instruction following for strict conversational limits (2-3 sentences max). | Free tier |
| **Speech-to-Text (STT)** | **Browser Web Speech API (`SpeechRecognition`)** | Real-time on-device/browser audio streaming. Automatically detects silence endpoints (`onend`), requires zero external audio uploads, zero API latency, and zero audio processing costs. Supports `en-IN` (Indian English). | Free / 0 API calls |
| **Text-to-Speech (TTS)** | **Browser `SpeechSynthesis` API** | Native speech synthesis with zero streaming latency. Configured with natural Indian English female voice profile (`en-IN`, rate `0.95`, pitch `1.05`), with fallbacks across Chrome and Edge. | Free / 0 API calls |
| **Styling & UI** | **Tailwind CSS + Lucide Icons** | Pixel-perfect Snapdeal branding (`#e40046`), responsive layout, live metrics dashboard drawer, dynamic audio pulse animations, and real-time chat transcript. | Free / Open-source |

---

## 3. End-to-End Workflow & Data Pipeline

```
+---------------------------------------------------------------------------------------+
|                                    BROWSER CLIENT                                     |
|                                                                                       |
|   +-------------------+       User speaks      +----------------------------------+   |
|   | Rajesh Sharma     | ---------------------> | SpeechRecognition (STT)          |   |
|   | (Seller)          |                        | - lang: 'en-IN'                  |   |
|   +-------------------+                        | - continuous: false              |   |
|             ^                                  +----------------------------------+   |
|             |                                                   |                     |
|             | Audio playback                                    | Spoken transcript   |
|             |                                                   v                     |
|   +-------------------+     Bot text string    +----------------------------------+   |
|   | SpeechSynthesis   | <--------------------- | VoiceBot.tsx (React State Ref)   |   |
|   | (TTS - Priya)     |                        | - Manages conversation history   |   |
|   +-------------------+                        | - Controls Mic / Audio visualizer|   |
|                                                +----------------------------------+   |
+-----------------------------------------------------------------|---------------------+
                                                                  |
                                              POST /api/chat      | Messages History
                                                                  v
+---------------------------------------------------------------------------------------+
|                                   NEXT.JS BACKEND                                     |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   | /api/chat/route.ts                                                            |   |
|   | - Injects System Prompt (lib/system-prompt.ts)                                |   |
|   | - Supplies Seller Context & Computations (lib/seller-data.ts)                 |   |
|   | - Executes Google Gemini 1.5 Flash model.startChat()                          |   |
|   | - Includes deterministic dialog engine fallback (100% testable out-of-the-box)|   |
|   +-------------------------------------------------------------------------------+   |
|                                          |                                            |
+------------------------------------------|--------------------------------------------+
                                           v
                       +----------------------------------------+
                       | Google Gemini 1.5 Flash (AI Studio)   |
                       | - Enforces 2-3 sentence brevity rule   |
                       | - Applies 5-stage advisory protocol    |
                       +----------------------------------------+
```

---

## 4. Seller Data Diagnosis & Mathematical Analysis

Based on the mock dataset provided in the assignment:

| Metric | Last Month | This Month | Delta | Strategic Diagnosis |
| :--- | :--- | :--- | :--- | :--- |
| **Sales** | ₹2,00,000 | ₹1,35,000 | **-₹65,000 (-32.5% ≈ -33%)** | Severe top-line contraction requiring urgent intervention. |
| **Orders** | 400 orders | 270 orders | **-130 orders (-32.5% ≈ -33%)** | Order volume drop correlates exactly with sales decline. |
| **Average Selling Price** | ₹500 | ₹500 | **₹0 (0% change)** | **Pricing is NOT the issue.** Seller should not initiate price wars. |
| **Out-of-Stock SKUs** | 5 | 18 | **+13 products (+260%)** | **Primary root cause.** Each out-of-stock SKU loses ~4-5 orders/day. |
| **Cancellation Rate** | 8% | 14% | **+6 pp (+75% relative spike)** | **Secondary root cause.** High cancellations trigger Snapdeal algorithm penalties, slashing catalog search visibility. |

### The Root Cause: The "Visibility Death Spiral"
1. **Stockouts:** 13 key SKUs went out of stock, causing direct lost orders.
2. **Cancellations:** Fulfillments faltered, pushing cancellations to an unacceptable 14%.
3. **Algorithm Reaction:** The Snapdeal marketplace algorithm demotes listings with high cancellation and stockout rates to preserve customer trust.
4. **Result:** Catalog impressions collapse, causing even the in-stock items to receive fewer views and fewer sales.

---

## 5. The 5-Stage Conversation Protocol

The virtual KAM follows a structured consultation flow tailored for phone/voice calls:

1. **Stage 1 — Warm Greeting & Account Acknowledgement:**  
   Welcomes Rajesh by name, mentions that she can see recent account movements, and asks open-ended questions about his primary concern.
2. **Stage 2 — Active Listening & Targeted Inquiry:**  
   Validates the seller's emotion, cross-references his remarks with the live order drops, and investigates inventory availability.
3. **Stage 3 — Clear & Empathetic Diagnosis:**  
   Explains the connection between the 18 stockouts, the 14% cancellation spike, and the Snapdeal search ranking algorithm visibility penalty.
4. **Stage 4 — Three Practical Action Items:**  
   - **Urgent Restock (Next 48 Hours):** Replenish the 18 depleted SKUs to immediately recapture 4-5 lost orders per product per day.  
   - **Fulfillment Audit:** Review seller dashboard cancellation reasons and connect with Snapdeal's priority logistics partner to eliminate shipping delays.  
   - **7-Day Algorithmic Kickstart:** Run a targeted 10% to 15% promotional campaign on the top 5 SKUs to revive buyer traffic and search impressions.  
5. **Stage 5 — Summary & Closure:**  
   Concise recap of the 3 action items, email confirmation dispatch, and a reassuring closing statement.

---

## 6. Voice UX Guardrails & Prompt Engineering

To guarantee a frictionless voice experience, the system prompt enforces:
- **Strict Brevity:** Maximum 2-3 short spoken sentences per turn. Spoken text over 3 sentences overwhelms the listener.
- **Natural Spoken Phrasing:** Explicitly forbids bullet points, asterisks, numbered headers, and markdown.
- **Localized Cultural Phrasing:** Uses "rupees", Indian number formatting (e.g., 1,35,000), and references to the "Snapdeal Seller Dashboard".
- **Turn-taking Integrity:** Only one single question asked per turn to encourage natural conversational rhythm.
- **Graceful Fallback:** If microphone permission is restricted or browser STT is unsupported, an integrated quick-prompt chip bar and text box allow seamless testing without breaking the voice synthesis.

