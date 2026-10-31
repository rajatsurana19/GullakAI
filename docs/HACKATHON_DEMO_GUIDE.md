# Gullak AI — Hackathon Demonstration Guide

> **Scenario:** DIWALI MERCHANT GROWTH ASSISTANT  
> **Demo Merchant:** Sharma General Stores (Mumbai, Maharashtra)  
> **Category:** Grocery & General Store (Kirana)  
> **Spoken Languages:** Marathi, Hindi, Hinglish, English

---

## 1. Quick Launch Setup

1. **Start Backend (FastAPI)**:
   ```bash
   cd c:\Users\LENOVO\Downloads\paytm
   $env:PYTHONPATH="backend"
   .\venv\Scripts\uvicorn app.main:app --port 8000 --reload
   ```

2. **Start Frontend (Vite + React)**:
   ```bash
   cd c:\Users\LENOVO\Downloads\paytm\frontend
   npm run dev
   ```
   Open `http://localhost:3000` in your web or mobile browser.

---

## 2. Signature Scenario Demonstration Flow

### Step 1: 1-Click Demo Login
1. On the landing page, click **"Launch Sharma General Stores (Demo)"**.
2. Notice the live dashboard load with 100% database-backed metrics:
   - Today's sales with context (`12% higher than yesterday`)
   - Low stock warning banner (`Desi Ghee & Hampers need restock`)
   - AI Daily Briefing card.

### Step 2: Voice Query 1 (Sales + Inventory + Reorder Draft)
1. Click the **"Ask Gullak"** microphone button in the top navbar.
2. Click the preset prompt or speak:
   > *"Kal meri kitni sale hui aur aaj mujhe kya stock mangwana chahiye?"*
3. **What Gullak AI Does**:
   - Transcribes via **Sarvam Saaras v4**.
   - Normalizes Hinglish utterance to `DIWALI_SALES_AND_RESTOCK`.
   - **Sales Agent** queries yesterday's sales (`₹28,450`).
   - **Inventory Agent** analyzes stock levels and calculates that Desi Ghee and Dry Fruits will run out in 4 days.
   - **LightGBM Demand Forecast** predicts +180% festive demand surge.
   - Automatically drafts purchase order to **Mahalaxmi Wholesale Distributors**.
   - Generates an approval card in the **Approval Centre**.
   - Speaks response via **Sarvam Bulbul v4 Flash**.

### Step 3: Merchant Governance & Execution
1. Navigate to the **Approval Centre**.
2. Notice the pending action:
   - **Action:** Approve Diwali Restock: Pure Desi Ghee & Festive Hampers
   - **Business Justification:** Full transparent explanation
   - **Estimated Amount:** ₹18,500
   - **Data Sources:** Verified warehouse stock & LightGBM festive forecast
   - **Risk Assessment:** Governed under DPDPA inventory consent.
3. Click **"Authorize & Execute"**.
4. Observe the state transition: `PENDING` → `EXECUTING` → `COMPLETED`.
5. Check **Audit Logs** to see the newly generated SHA-256 hash-chained immutable audit entry!

### Step 4: Voice Query 2 (Customer Intelligence & WhatsApp Campaign)
1. In the Voice Assistant, speak or click:
   > *"Kaunse customers bahut din se nahi aaye?"*
2. **What Gullak AI Does**:
   - RFM segmentation flags **24 At-Risk Customers** who haven't visited in 30+ days.
   - Drafts a personalized 10% Diwali discount WhatsApp message in Marathi/Hindi.
   - Uplift Engine projects **+18.5% incremental sales uplift (~₹6,800)** at a dispatch cost of only ₹9.60.
   - Requests merchant authorization before dispatching.

### Step 5: Voice Query 3 (Marathi Business Briefing)
1. Switch to Marathi or speak:
   > *"माझ्या व्यवसायाची आजची परिस्थिती सांग."*
2. Gullak AI synthesizes a full Marathi business briefing directly from today's transactions and settlements.

---

## 3. What is Live vs Demo
- **Demo Adapters:** DemoPaymentProvider, DemoSoundboxAdapter, DemoWhatsAppAdapter, DemoDistributorAdapter, DemoLendingAdapter.
- **Live Capabilities:** When environment credentials (`SARVAM_API_KEY`, `PAYTM_MID`, `WHATSAPP_TOKEN`) are supplied, Gullak seamlessly transitions to live APIs with zero code changes.
