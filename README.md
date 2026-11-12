# Snapdeal Mini AI Voice KAM (Key Account Manager)

An autonomous AI-powered voice assistant built for Snapdeal sellers to diagnose sales performance drops, uncover root causes, and deliver actionable, data-driven recovery steps in a natural voice conversation.

Built for the **Snapdeal AI First Intern Practical Assignment**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshwetang01%2FSnapdeal-AI)

---

## 📌 Project Resources
- 🚀 **GitHub Repository:** [https://github.com/shwetang01/Snapdeal-AI](https://github.com/shwetang01/Snapdeal-AI)
- 📄 **Technical Architecture & Submission Note:** [`SUBMISSION_NOTE.md`](./SUBMISSION_NOTE.md)

---

## 🌟 Features

- 🎙️ **Two-Way Voice Conversation:** Uses the browser's native **Web Speech API** (`SpeechRecognition` for STT and `SpeechSynthesis` for TTS) with zero external telephony or audio API costs.
- 🏪 **10 Realistic Sellers & Distinct Business Scenarios:**
  - **SD001 (Rajesh Sharma):** Stockout & Cancellations Spike (Preserves original assignment data).
  - **SD002 (Pooja Gupta):** High Return Rate Crisis (28% returns from kurti size mismatches).
  - **SD003 (Amit Verma):** Low Visibility / 76% Impression Collapse on Kitchen Essentials.
  - **SD004 (Neha Kapoor):** Poor Conversion Rate (High ad clicks, low buyer trust).
  - **SD005 (Vikas Malhotra):** Hero Running Shoe Stockout in prime sizes 8 & 9.
  - **SD006 (Sunita Rao):** Logistics SLA Delays & 23% Cancellation Spike.
  - **SD007 (Karan Mehta):** Healthy Growth (+40% Sales) & Scale-up Opportunity.
  - **SD008 (Deepak Patel):** ASP Erosion (-43%) from Competitor Price Wars.
  - **SD009 (Meera Joshi):** Ad Spend Inefficiency (Broad keyword budget drain).
  - **SD010 (Ananya Singhal):** Post-Festive Slump & 74% Cart Abandonment on Jewelry.
- 📦 **Product Catalog & Unique SKUs:** Each seller includes 3–5 realistic products with globally unique SKU IDs (`SKU-SD001-01`, etc.), prices, stock levels, and status badges (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`).
- 🔄 **Seller Selector on Dashboard:** Switch between sellers anytime via the top navigation bar or modal. The KPI cards, product catalog, and voice assistant greeting immediately adapt to the active seller without mixing data.
- 🛠️ **Dynamic Function Calling (Zero Metric Hardcoding):** Gemini dynamically queries real-time account data via function calling tools:
  - `get_seller_profile`: Retrieves seller metrics, store details, and historical comparisons.
  - `get_seller_products`: Fetches active SKU inventory and stock levels.
  - `get_seller_analytics`: Computes variances, identifies bottlenecks, and fetches tailored recovery steps.
- 👩‍💼 / 👨‍💼 **Dual Voice Persona Flexibility:**
  - **Priya (Female Voice):** Optimized Indian/English female voice (`Microsoft Zira`, `Heera`, `Neerja`, `Google UK English Female`) with higher vocal pitch (`1.15`).
  - **Rahul (Male Voice):** Tailored Indian/English male voice (`Microsoft Ravi`, `Prabhat`, `David`) with deeper vocal pitch (`0.95`).
  - **Voice Settings Modal:** Complete voice synthesizer inspector with a **"Test Voice 🔊"** preview button.
- 🛡️ **Zero-Failure Architecture:** Includes a smart dynamic dialog engine fallback so the entire voice experience is 100% testable out-of-the-box even before adding an API key!

---

## 🏗️ Architecture

```
[Seller in Browser]
       │ (Spoken Audio)
       ▼
[Web Speech STT]
       │ (Spoken Transcript Text)
       ▼
[VoiceBot.tsx] ── (POST /api/chat with sellerId) ──► [Next.js Route Handler]
                                                              │
                                                              ▼
                                                 [Google Gemini 1.5 Flash]
                                                 (Dynamic Function Calling)
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                        ▼                                        ▼
           [get_seller_profile]                     [get_seller_products]                    [get_seller_analytics]
                     │                                        │                                        │
                     └────────────────────────────────────────┬────────────────────────────────────────┘
                                                              ▼
                                                 [lib/seller-data.ts Engine]
                                                              │
                                                              ▼ (Grounded Spoken Advice)
[SpeechSynthesis TTS] ◄────── (Priya / Rahul Voice) ──────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ or v22+
- **Browser**: **Google Chrome** or **Microsoft Edge** (for full native Web Speech STT & TTS support)

### 2. Configure Environment (Optional)
Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).  
Add it to `.env.local`:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: You can also enter the API key directly in the web UI using the "API Key" button in the top bar).*

### 3. Run the Development Server

Double-click `run_dev.bat` or run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Google Chrome** or **Microsoft Edge**.

---

## 🌐 REST APIs

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/sellers` | `GET` | Returns summary list of all 10 sellers with current sales and scenario tags. |
| `/api/sellers?id=SD001` | `GET` | Returns full dossier for seller (profile, metrics, products, and analytics). |
| `/api/sellers?id=SD001&type=products` | `GET` | Returns catalog products and SKU inventory for a seller. |
| `/api/sellers?id=SD001&type=analytics` | `GET` | Returns computed deltas, bottlenecks, diagnosis, and recommendations. |
| `/api/chat` | `POST` | Interacts with the Virtual KAM, supporting `sellerId`, `assistantName`, and messages. |

---

## 🧪 Automated Test Suites

Run the automated test suites anytime:

```powershell
# Test multi-seller dataset, API endpoints, SKU uniqueness & seller isolation
node test_multi_seller.mjs

# Test 5-stage voice conversation protocol
node test_voice_kam.mjs
```

---

## 📁 Project Structure

```
snapdeal/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Gemini Function Calling route & dynamic dialog engine
│   │   └── sellers/route.ts   # REST API for sellers, metrics, products & analytics
│   ├── globals.css            # Tailwind styles & smooth scrollbars
│   ├── layout.tsx             # Root layout with Snapdeal branding metadata
│   └── page.tsx               # Client-mounted home page (zero hydration issues)
├── components/
│   └── VoiceBot.tsx           # Voice UX, Seller Selector, Product Catalog & Voice Settings
├── lib/
│   ├── seller-data.ts         # 10 realistic sellers, 40 SKUs, deltas & analytics engine
│   └── system-prompt.ts       # Tool-driven system prompt (zero hardcoded metrics)
├── test_multi_seller.mjs      # Test suite for 10 sellers, APIs & seller isolation
├── test_voice_kam.mjs         # Test suite for 5-stage conversation flow
├── .env.local                 # Gemini API credentials
├── run_dev.bat                # Windows 1-click launcher
├── SUBMISSION_NOTE.md         # Comprehensive 1-page architecture & technical report
└── README.md                  # Documentation and demo guide
```
