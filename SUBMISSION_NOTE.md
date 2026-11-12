# Snapdeal Mini AI Voice KAM — Solution Architecture & Submission Note

**Candidate:** AI First Intern Candidate  
**Project:** Snapdeal Virtual Key Account Manager (Voice KAM)  
**Target Scenario:** Multi-Seller Voice Assistant (10 Distinct Business Scenarios & Categories)  

---

## 1. Executive Summary

This project implements an enterprise-ready, browser-native **AI Voice Key Account Manager (Priya / Rahul)** for Snapdeal sellers. Unlike basic chatbots that hardcode seller numbers, this system features a **dynamic function calling architecture** powered by **Google Gemini 1.5 Flash** and an integrated mock dataset of **10 realistic sellers (`SD001` through `SD010`)**. 

Each seller exhibits a distinct business bottleneck—including inventory stockouts, high return rates, visibility collapse, poor conversions, and logistics cancellations. The Virtual KAM dynamically queries seller data through function calls (`get_seller_profile`, `get_seller_products`, `get_seller_analytics`) and delivers tailored, data-grounded voice advice without mixing seller accounts.

---

## 2. Multi-Seller Dataset & Scenario Matrix

| Seller ID | Seller Name | Store Name | Category | Primary Business Scenario & Bottleneck |
| :---: | :--- | :--- | :--- | :--- |
| **SD001** | **Rajesh Sharma** | Rajesh Electronics | Electronics & Accessories | **Original Assignment Data:** 18 stockouts + 14% cancellation spike triggering algorithm demotion. |
| **SD002** | Pooja Gupta | Vastra Trends | Fashion & Ethnic Apparel | **High Return Rate (28%):** Buyer returns surging due to incorrect kurti size charts. |
| **SD003** | Amit Verma | HomeCraft Living | Home & Kitchen | **Low Visibility (-76% Impressions):** Expired promotion tags and zero keyword bidding. |
| **SD004** | Neha Kapoor | GlowNatural Beauty | Beauty & Personal Care | **Poor Conversion (2.7%):** High clicks (4,800) but low buyer trust; lacks photo reviews and bundles. |
| **SD005** | Vikas Malhotra | StepUp Footwear | Footwear & Athletic Shoes | **Hero SKU Stockout:** Top 2 running shoes out of stock in sizes 8 & 9, cutting revenue by 54%. |
| **SD006** | Sunita Rao | Prakriti Organics | Gourmet & Organic Staples | **Logistics SLA Spike (23% Cancellations):** Regional warehouse courier pickup backlog. |
| **SD007** | Karan Mehta | IronGrip Fitness | Sports & Home Fitness | **Healthy Growth (+40% Sales):** Low returns (3.0%), ready for Snapdeal Gold Tier & bundles. |
| **SD008** | Deepak Patel | GizmoWorld Accessories | Mobile Accessories | **Severe ASP Erosion (-43%):** Aggressive price wars with unauthorized gray-market sellers. |
| **SD009** | Meera Joshi | Vidya Books & Stationers | Books & Exam Stationery | **Ad Inefficiency:** Broad keyword bidding drains ad budget on casual non-converting traffic. |
| **SD010** | Ananya Singhal | Aashirwad Traditional Jewelry | Fashion Jewelry | **Post-Festive Slump & 74% Cart Abandonment:** Over-reliance on heavy bridal sets. |

---

## 3. Dynamic Tool & Function Calling Architecture

To satisfy strict prompt decoupling guidelines, **zero seller metrics are hardcoded into the Gemini system prompt**. Instead, Gemini interacts with the seller repository via real-time function declarations:

```
+---------------------------------------------------------------------------------------+
|                                    BROWSER CLIENT                                     |
|                                                                                       |
|   +-------------------+       User speaks      +----------------------------------+   |
|   | Active Seller     | ---------------------> | Web Speech STT (Indian English)  |   |
|   | (SD001 - SD010)   |                        +----------------------------------+   |
|   +-------------------+                                         |                     |
|             ^                                                   | Spoken transcript   |
|             | Audio playback                                    v                     |
|   +-------------------+     Spoken text        +----------------------------------+   |
|   | SpeechSynthesis   | <--------------------- | VoiceBot.tsx (React State)       |   |
|   | (Priya / Rahul)   |                        | - Selected Seller: SD001..SD010  |   |
|   +-------------------+                        +----------------------------------+   |
+-----------------------------------------------------------------|---------------------+
                                                                  |
                                    POST /api/chat with sellerId  |
                                                                  v
+---------------------------------------------------------------------------------------+
|                                   NEXT.JS BACKEND                                     |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   | /api/chat/route.ts                                                            |   |
|   | - System Prompt (Voice rules, zero hardcoded numbers)                         |   |
|   | - Google Gemini 1.5 Flash Model                                               |   |
|   +-------------------------------------------------------------------------------+   |
|                                          |                                            |
|                                          | Gemini emits Function Call                 |
|                                          v                                            |
|                       +---------------------------------------+                       |
|                       | Function Calling Dispatcher           |                       |
|                       | - get_seller_profile(sellerId)        |                       |
|                       | - get_seller_products(sellerId)       |                       |
|                       | - get_seller_analytics(sellerId)      |                       |
|                       +---------------------------------------+                       |
|                                          |                                            |
|                                          | Evaluated against Deterministic Engine     |
|                                          v                                            |
|                       +---------------------------------------+                       |
|                       | lib/seller-data.ts                    |                       |
|                       | - 10 Sellers, 40 SKUs, Variance Math  |                       |
|                       +---------------------------------------+                       |
|                                          |                                            |
|                                          | Function Response fed back to Gemini       |
|                                          v                                            |
|                       +---------------------------------------+                       |
|                       | Gemini Formulates Grounded Spoken Turn|                       |
|                       +---------------------------------------+                       |
+---------------------------------------------------------------------------------------+
```

---

## 4. REST API Infrastructure

The backend exposes dedicated endpoints to inspect seller data, catalogs, and analytics:

- `GET /api/sellers`: Returns list of all 10 sellers with store details, scenario types, and current sales.
- `GET /api/sellers?id=SD001`: Returns full seller profile, historical comparison metrics, product catalog, and computed analytics.
- `GET /api/sellers?id=SD001&type=products`: Returns the active seller's 3–5 catalog items with SKU IDs, prices, and stock status.
- `GET /api/sellers?id=SD001&type=analytics`: Returns computed deltas, identified bottlenecks, root cause diagnosis, and prioritized action items.

---

## 5. Automated Verification & Isolation Proof

The test suite (`node test_multi_seller.mjs`) proves:
1. **10 Distinct Sellers:** All 10 sellers load with unique IDs, correct store names, and scenario tags.
2. **SD001 Data Integrity:** Original assignment figures (Sales ₹2,00,000 &rarr; ₹1,35,000; Orders 400 &rarr; 270; Cancellations 8% &rarr; 14%; Stockouts 5 &rarr; 18) remain 100% intact.
3. **SKU Uniqueness:** All 40 products have globally unique SKU IDs with stock tracking.
4. **Zero Data Leakage:** Switching between SD001, SD002, SD003, and SD007 retrieves only that seller's name, category, and bottleneck in voice responses without cross-contamination.
