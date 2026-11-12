# Snapdeal AI Voice KAM — Screen Recording & Submission Guide

This guide gives you everything you need to complete and submit the 3 deliverables for the **Snapdeal AI First Intern Practical Assignment**:

1. **A working demo link or runnable prototype.**
2. **A 1–2 minute screen recording showing a real voice conversation with the bot.**
3. **A short note (up to one page) explaining the AI model(s), STT/TTS platform, and overall workflow.**

---

## 🎬 Deliverable 1: 1–2 Minute Screen Recording Guide & Script

### How to Record on Windows (No extra software needed)
1. Open Google Chrome or Microsoft Edge at `http://localhost:3000` (or `http://localhost:3002`).
2. Press **`Win + Alt + R`** (or **`Win + G`** to open Xbox Game Bar) to start recording.
3. **Important:** Make sure your **Microphone is toggled ON** in the recording bar so both your voice and the bot's speaker audio are captured.
4. If you prefer a browser tool, you can also use [Loom](https://www.loom.com) or OBS Studio.

---

### 🎙️ Word-for-Word 90-Second Conversation Script

Follow this exact script during your screen recording. It covers all 5 required conversation stages from the assignment doc:

#### Step 0: Dashboard Tour (0:00 - 0:15)
- **Action:** Open `http://localhost:3000`. Point your cursor to the top header showing **"Rajesh Sharma (Sharma Electronics - SD001)"**.
- **Action:** Click on the **"Products & Inventory"** tab to briefly show the 4 unique SKUs (`SKU-SD001-01` to `SKU-SD001-04`) with their Stockout badges.
- **Action:** Click back to **"Performance Overview"**.

#### Step 1: Start Call & Greeting (0:15 - 0:30)
- **Action:** Click the big red **"Start Call 📞"** button.
- **Bot Speaks (Priya):**  
  > *"Namaste Rajesh ji, this is Priya from Snapdeal Seller Support. I noticed your sales dropped from 2 lakhs to 1.35 lakhs this month with 18 out-of-stock products. Let's look into what happened."*

#### Step 2: Root Cause Query (0:30 - 0:50)
- **You Speak into Mic:**  
  > *"Priya, why did my sales drop so much this month?"*
- **Bot Speaks (Priya):**  
  > *"Rajesh ji, your orders dropped from 400 to 270 mainly because your 18 stockouts caused Snapdeal's ranking algorithm to demote your listings. On top of that, your cancellation rate doubled to 14 percent due to dispatch delays."*

#### Step 3: Actionable Recommendation (0:50 - 1:10)
- **You Speak into Mic:**  
  > *"What should I do right now to fix this?"*
- **Bot Speaks (Priya):**  
  > *"First, replenish stock for your top fast chargers and braided cables immediately. Second, activate same-day dispatch to bring cancellations back under 8 percent and restore your search visibility."*

#### Step 4: Pushback & Resolution (1:10 - 1:30)
- **You Speak into Mic:**  
  > *"Keeping 50 units in stock for every item blocks too much of my working capital!"*
- **Bot Speaks (Priya):**  
  > *"I completely understand your capital concern, Rajesh ji. Instead of stocking all products, let's prioritize just your top 2 fastest-selling chargers. That requires minimal capital while recovering 80 percent of your lost sales."*

#### Step 5: Next Steps & Seller Switch (1:30 - 1:45)
- **You Speak into Mic:**  
  > *"Okay, that sounds fair. I will update inventory today."*
- **Bot Speaks (Priya):**  
  > *"Excellent! I have noted this down and will review your listing performance again in 7 days. Thank you for your partnership with Snapdeal!"*
- **Action:** Click **"End Call"**.
- **Action:** Click the **"Switch Seller"** button in the header and select **"SD002 - Pooja Gupta (Vastra Trends - High Returns)"** or **"SD005 - Vikas Malhotra"**. Point out that the metrics, stockout alerts, and seller profile update dynamically!
- **Action:** Stop recording (`Win + Alt + R`).

---

## 💻 Deliverable 2: Runnable Prototype & Demo Link

Include this in your submission text:

```markdown
### Runnable Prototype Instructions
1. Repository: https://github.com/shwetang01/Snapdeal_AI_Voice_KAM (or zip file)
2. Requirements: Node.js (v18+) and Google Chrome / Microsoft Edge
3. Quick Start:
   - Run `npm install`
   - Run `npm run dev` (or double-click `run_dev.bat` on Windows)
   - Open http://localhost:3000 in Google Chrome or Microsoft Edge
4. Features Included:
   - Full 2-way Voice Interaction (STT & TTS)
   - 10 Realistic Sellers (SD001 to SD010) with 40 Unique SKUs
   - Dynamic Tool Calling with Gemini 1.5 Flash (zero hardcoded metrics)
   - Deterministic Fallback Dialog Engine (works even without an API key)
   - Dual Voice Personas (Priya - Female / Rahul - Male)
   - In-app Voice Synthesizer Tester and Seller Selector
```

---

## 📄 Deliverable 3: One-Page Architecture & Solution Note

The complete technical note is saved in your project root at [`SUBMISSION_NOTE.md`](./SUBMISSION_NOTE.md).

You can attach [`SUBMISSION_NOTE.md`](./SUBMISSION_NOTE.md) as a markdown file or export/print it to PDF from VS Code / Chrome.

### Quick Copy-Paste Summary of the Note:
- **AI Models:** **Google Gemini 1.5 Flash** with native Function Calling (`get_seller_profile`, `get_seller_products`, `get_seller_analytics`) paired with a resilient **Deterministic Dialog State Machine** fallback. All seller metrics are queried dynamically with zero hardcoding in the system prompt.
- **Voice Platform (STT & TTS):** Browser-native **Web Speech API** (`SpeechRecognition` configured for `en-IN` Indian English; `SpeechSynthesis` with intelligent female voice filtering for Priya and male voice tuning for Rahul, custom pitch/rate controls, and automated speech queue flushing).
- **Workflow & Business Impact:** 5-stage consultative account management protocol (Intro → Root Cause Analysis → Operational Recommendations → Pushback Handling → Commitment & Follow-up). Seamless multi-seller isolation supporting 10 distinct retail bottleneck scenarios (stockouts, returns, visibility drops, SLA cancellations, ASP erosion).
