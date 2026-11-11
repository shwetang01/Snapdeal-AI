# Snapdeal Mini AI Voice KAM (Key Account Manager)

An AI-powered voice assistant built for Snapdeal sellers to diagnose sales performance drops, uncover root causes (stockouts and cancellation spikes), and deliver actionable, data-driven recovery steps in a natural voice conversation.

Built for the **Snapdeal AI First Intern Practical Assignment**.

---

## 🌟 Features

- 🎙️ **Two-Way Voice Conversation:** Uses the browser's native **Web Speech API** (`SpeechRecognition` for STT and `SpeechSynthesis` for TTS) with zero external telephony or audio API costs.
- 👩‍💼 / 👨‍💼 **Dual Persona & Voice Flexibility:**
  - **Priya (Female Voice):** Optimized Indian/English female voice (`Microsoft Zira`, `Heera`, `Neerja`, `Google UK English Female`) with higher vocal pitch (`1.15`).
  - **Rahul (Male Voice):** Tailored Indian/English male voice (`Microsoft Ravi`, `Prabhat`, `David`) with deeper vocal pitch (`0.95`).
  - **Voice Settings Modal:** Complete voice synthesizer inspector with a **"Test Voice 🔊"** live preview button.
- 🧠 **AI Account Intelligence:** Powered by **Google Gemini 1.5 Flash** with custom prompt engineering enforcing voice-first brevity rules (2-3 short sentences, zero markdown, natural spoken cadence).
- 📊 **Seller Metrics Dashboard:** Real-time visibility into Rajesh Sharma's key account metrics (Sales, Orders, Cancellation Rate, ASP, and Stockout SKUs).
- 💡 **Algorithmic Root Cause Diagnosis:** Explains how the 14% cancellation spike and 18 out-of-stock items triggered Snapdeal's ranking algorithm downward visibility spiral.
- 🎯 **Practical Action Plan:** 3 prioritized, high-impact recommendations (48h restock, dashboard fulfillment audit, and 7-day promotional discount campaign).
- 🛡️ **Zero-Failure Architecture:** Includes a smart built-in conversational dialog fallback so the entire voice experience is 100% testable out-of-the-box even before adding an API key!
- ⌨️ **Accessibility & Silent Testing:** Interactive quick-suggestion chips and text input bar for testing in quiet environments.

---

## 🏗️ Architecture

```
[Seller Rajesh] 
       │ (Spoken Audio)
       ▼
[Web Speech STT] 
       │ (Spoken Transcript Text)
       ▼
[VoiceBot.tsx] ── (POST /api/chat) ──► [Next.js Route Handler]
                                              │
                                              ▼
                                 [Google Gemini 1.5 Flash]
                                 + System Prompt & Seller Data
                                              │
                                              ▼ (Response Text)
[SpeechSynthesis TTS] ◄── (Priya / Rahul Voice) ─┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ or v22+
- **Browser**: **Google Chrome** or **Microsoft Edge** (for full native Web Speech STT & TTS support)

### 2. Configure Environment (Optional but Recommended)
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

## 🔊 Persona & Voice Selection

In the top bar and landing screen, you can toggle between:
- **👩‍💼 Priya (Female Voice):** Filters for genuine female synthesizers (e.g., `Microsoft Zira`, `Microsoft Heera`, `Google UK English Female`).
- **👨‍💼 Rahul (Male Voice):** Uses male synthesizers (e.g., `Microsoft Ravi`, `Microsoft David`).
- Click **"Voice Settings"** to browse all installed voices on your computer and test them instantly with the **"Test Voice 🔊"** button.

---

## 🎬 1–2 Minute Screen Recording Script

Use this script for your submission video:

| Step | Action | Spoken User Query (Seller Rajesh) | Expected Bot Spoken Response |
| :---: | :--- | :--- | :--- |
| **1** | Click **"Start Voice Call"** | *(Call initiates automatically)* | *"Hello Rajesh! This is Priya [or Rahul] calling from Snapdeal. I'm really glad you reached out, as I can already see some concerning changes in your store performance this month. What has been worrying you the most?"* |
| **2** | Tap Mic 🎙️ and speak | *"My sales have dropped significantly this month. I don't understand why. Can you help me?"* | *"I can see your monthly orders dropped from 400 to 270, and sales fell to 1,35,000 rupees. Have you noticed any of your top-selling products going out of stock recently?"* |
| **3** | Tap Mic 🎙️ and speak | *"Yes, I think some of my products ran out of stock. How bad is the situation?"* | *"Rajesh, looking at your data, your out-of-stock products jumped from 5 to 18, and your cancellation rate climbed to 14 percent. When stockouts and cancellations rise, Snapdeal's search algorithm reduces your listing visibility, creating a downward spiral."* |
| **4** | Tap Mic 🎙️ and speak | *"What should I do to recover my sales?"* | *"First, restock those 18 out-of-stock products within the next 48 hours to stop losing orders. Second, investigate cancellation reasons in your dashboard and connect with our priority logistics partner. Third, run a 7-day promotional discount of 10 to 15 percent on your top 5 products to quickly rebuild visibility."* |
| **5** | Tap Mic 🎙️ and speak | *"Can you give me a quick summary of what I need to do?"* | *"To summarize today's call, Rajesh: your 33 percent sales drop was caused by 13 new stockouts and cancellations rising to 14 percent. Your three priorities are restocking within 48 hours, checking cancellation reasons in your dashboard, and running a short discount campaign. I've sent these recommendations to your registered Snapdeal email as well. Is there anything else I can help you with?"* |
| **6** | Tap Mic 🎙️ and speak | *"That is super helpful. Thank you so much!"* | *"Wonderful, Rajesh! I'm confident these steps will help you recover your sales quickly. Don't hesitate to reach back out to Snapdeal seller support anytime. Have a great day!"* |

---

## 📁 Project Structure

```
snapdeal/
├── app/
│   ├── api/chat/route.ts      # Serverless route handler interfacing with Gemini 1.5 Flash (Priya & Rahul)
│   ├── globals.css            # Tailwind styles & smooth scrollbars
│   ├── layout.tsx             # Root layout with Snapdeal branding metadata
│   └── page.tsx               # Main entry page rendering VoiceBot
├── components/
│   └── VoiceBot.tsx           # Voice UX, SpeechRecognition (STT), SpeechSynthesis (TTS), Voice Settings modal
├── lib/
│   ├── seller-data.ts         # Rajesh Sharma mock performance data & computed deltas
│   └── system-prompt.ts       # Priya & Rahul AI personas, 5-stage conversation rules & constraints
├── .env.local                 # Gemini API credentials
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS styling configuration
├── package.json               # Dependencies and build scripts
├── SUBMISSION_NOTE.md         # Comprehensive 1-page architecture & technical report
└── README.md                  # Documentation and demo guide
```
