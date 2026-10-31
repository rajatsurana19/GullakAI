# Gullak AI — Synthetic Data Dictionary & Schema Specification

All synthetic records in this dataset are labeled `is_synthetic = true`. No real personal data or payment credentials are stored.

---

## 1. Core Entities & Tables

### `merchants`
Stores retail merchant master records across diverse Indian SME archetypes.
* **`id`** (`String(36)`, PK): Unique identifier (e.g. `hero-merchant-shree-sai`).
* **`business_name`** (`String(255)`): Trading name (e.g. `Shree Sai Kirana & Sweets, Dadar, Mumbai`).
* **`owner_name`** (`String(255)`): Merchant owner name (`Ramesh Sharma`).
* **`phone_number`** (`String(20)`, Unique, Index): Mobile number (`9820012345`).
* **`is_demo`** (`Boolean`): Set to `true` for hero merchant.
* **`is_synthetic`** (`Boolean`): Flag marking generated data (`true`).

### `merchant_profiles`
Operational configuration and location details.
* **`category`** (`String(100)`): Template archetype: `kirana`, `sweets_bakery`, `restaurant_chai`, `pharmacy`, `salon_service`.
* **`ward`** / **`pincode`**: Mumbai municipal ward (e.g. `Dadar West, Ward G/N`, `400028`).
* **`settlement_vpa`** (`String(100)`): Paytm settlement VPA address.

### `merchant_devices`
Hardware Soundbox binding.
* **`device_id`** (`String(100)`): Hardware serial (e.g. `SB-MUM-4G-9820`).
* **`model`** (`String(100)`): `Paytm Soundbox 4G (Voice Enabled)`.

---

## 2. Transactions & Settlements

### `transactions`
Granular ledger of customer purchases over 180 days.
* **`amount`** (`Float`): Purchase value in INR (log-normal distribution around ₹750).
* **`payment_method`** (`String(50)`): `UPI` (45%), `SOUNDBOX_QR` (25%), `CASH` (25%), `CARD` (5%).
* **`status`** (`String(30)`): `SUCCESS`, `REFUNDED` (~1.5%).
* **`is_synthetic`** (`Boolean`): `true`.
* **`created_at`** (`DateTime`): Timestamp matching Indian shopping peaks (8–12 AM, 5–9 PM).

### `settlements`
T+1 bank settlements from digital transactions.
* **`gross_amount`** (`Float`): Daily digital collection sum.
* **`net_amount`** (`Float`): Net bank transfer after standard deductions.
* **`status`** (`String(30)`): `SETTLED`, `PENDING`.

---

## 3. Inventory & ONDC Supply

### `products` & `inventory`
* **`sku`** (`String(100)`): Product code (e.g. `GHEE-001`).
* **`name`**, **`name_marathi`**, **`name_hindi`**: Multilingual product names.
* **`current_stock`** (`Float`): Units on hand (Hero Ghee = 15 units).
* **`avg_daily_sales`** (`Float`): Units sold per day (Hero Ghee = 3.75/day).
* **`stock_coverage_days`** (`Float`): Days left until stockout (`15 / 3.75 = 4.0 days`).

### `suppliers`
* **`name`** (`String(255)`): Wholesale distributor (e.g. `Mahalaxmi Wholesale Distributors`).
* **`platform`** (`String(50)`): `ONDC_NETWORK`, `DIRECT_DISTRIBUTOR`.
* **`lead_time_days`** (`Integer`): Delivery turnaround (1–3 days).

---

## 4. Customers & RFM Segmentation

### `customers`
* **`segment`** (`String(50)`): `Champions` (15%), `Loyal Customers` (55%), `At-Risk Customers` (20%).
* **`recency_days`** (`Integer`): Days since last purchase.
* **Hero Lapsed Segment**: Exactly 60 customers with `recency_days >= 30` who previously bought Ghee or Sweets.

### `campaigns` & `campaign_recipients`
* **`treatment_group`** (`String(20)`): 80% `TREATMENT` (48 customers), 20% `CONTROL` (12 customers holdout).
* **`has_converted`** (`Boolean`): Ground-truth response (Treated ~35% conversion vs. Control ~15% baseline).

---

## 5. Decision & Governance Layer

### `recommendations`
The unified AI partner action model feeding the **Aaj Top 3 Actions**.
* **`type`** (`String(50)`): `STOCK`, `CUSTOMER`, `CAPITAL`.
* **`headline`**, **`headline_mr`**, **`headline_hi`**: One-line plain-language pitch.
* **`why`**, **`why_mr`**, **`why_hi`**: Merchant explanation (no AI/ML jargon).
* **`expected_impact_inr`** (`Float`): Expected rupee lift or avoided loss.
* **`confidence`** (`String(20)`): `High`, `Medium`, `Low`.
* **`confidence_score`** (`Float`): Numeric confidence (0.45 – 0.95).
* **`signals_used`** (`JSON`): Explanatory signals (Diwali calendar, weather, demand).
* **`rank`** (`Integer`): 1, 2, 3.

### `action_outcomes`
Closed-loop sales impact verification feeding the **Learn** feedback loop.
* **`treated_rate`** (`Float`), **`control_rate`** (`Float`), **`incremental_rate`** (`Float`).
* **`incremental_revenue_inr`** (`Float`): Measured extra earnings = `(treated_rate - control_rate) * treated_count * avg_ticket`.
* **`stock_loss_avoided_inr`** (`Float`): Revenue and margin saved by restocking before stock-out.

### `audit_logs`
Cryptographically chained tamper-evident ledger.
* **`previous_hash`** (`String(64)`): SHA-256 hash of preceding entry.
* **`current_hash`** (`String(64)`): SHA-256 of `merchant_id|action|previous_hash|timestamp|payload`.
