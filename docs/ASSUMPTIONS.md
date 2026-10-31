# Gullak AI: Technical & Product Assumptions

This document articulates the baseline assumptions underpinning Gullak AI's design, architecture, algorithms, and evaluation frameworks.

---

## 1. Merchant Persona & Operating Context
1. **Language & Interface Literacy:** The typical Indian shopkeeper is highly business-literate but wary of complex software interfaces and English financial jargon (e.g., RFM, ATV, WAPE, Hash). Spoken Marathi or Hindi is the preferred medium for daily decision-making.
2. **Attention & Time Constraints:** A shopkeeper experiences dozens of interruptions per hour. They do not have time to browse 19 analytical screens. Information must be condensed into a single daily screen with a hard cap of 3 high-impact actions.
3. **Trust & Human-in-the-Loop:** Merchants will not trust autonomous agents that debit their bank account or order goods without permission. Gullak AI strictly operates as an **advisor that drafts actions**, requiring an explicit one-tap merchant approval before any money moves.

---

## 2. Hardware & Connectivity (Paytm Soundbox 4G)
1. **Audio Briefing Hardware:** The Paytm Soundbox 4G is equipped with an integrated cellular modem (eSIM) and an audio speaker capable of streaming regional TTS scripts under 40 words.
2. **Bandwidth Efficiency:** Edge audio processing or concise TTS text streams (<1 KB payload per daily brief) minimize cellular bandwidth consumption across 1M+ deployed devices.
3. **Device Pairing:** When interactive voice queries are spoken at the counter, audio streams can be captured directly through the Paytm Merchant App or via the Soundbox microphone array.

---

## 3. Financial Settlements & Bank Deposits
1. **Deposit Timing:** Paytm UPI settlements operate on a $T+1$ morning schedule. Cash collected in the till remains physically with the merchant.
2. **Never Show ₹0 Rule:** Because bank settlement rails (IMPS/NEFT/RTGS) can experience batch delays, Gullak AI assumes that an unconfirmed bank deposit must never be displayed as ₹0. It must explicitly state: *"उद्या किती पैसे जमा होतील याची माहिती सध्या उपलब्ध नाही."*

---

## 4. ONDC & WhatsApp Integration Ecosystem
1. **ONDC Wholesale (B2B):** Verified regional distributors (e.g., Amul, Fortune, Britannia distributors) publish live inventory and price lists via ONDC protocol endpoints. Gullak AI connects via standard Beckn-protocol schemas.
2. **WhatsApp Business API:** Merchants maintain active WhatsApp accounts registered to their Paytm business mobile number. Customer outreach complies with WhatsApp opt-in guidelines, using approved transactional and festive utility templates.

---

## 5. Working Capital Underwriting
1. **Cash Flow-Based Lending:** Partner NBFCs (e.g., Tata Capital, Piramal) approve revolving credit lines up to ₹2,50,000 based exclusively on 180 days of verified Paytm UPI transaction velocity and settlement consistency, requiring zero physical collateral.
2. **Micro-Repayment Mechanics:** Loan repayments are automatically deducted in daily micro-installments (e.g., ₹200–₹500/day) directly from morning UPI settlements, preventing lump-sum cash flow shock.

---

## 6. Privacy & Regulatory Compliance (DPDPA 2023)
1. **Explicit Purpose Limitation:** Merchant and customer data is processed solely for inventory restocking, customer retention, and credit underwriting as authorized by the merchant.
2. **Revocable Consent:** Merchants retain the right to toggle off Soundbox voice announcements, WhatsApp summaries, or anonymized ranking optimization at any time via the Profile & Consent Drawer.
