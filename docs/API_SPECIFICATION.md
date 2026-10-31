# Gullak AI — REST API Specification (`/api/v1`)

### 1. Authentication (`/auth`)
- `POST /api/v1/auth/register`: Merchant registration. Returns JWT access token.
- `POST /api/v1/auth/login`: Merchant login with mobile number & password.
- `POST /api/v1/auth/demo-login`: 1-Click instant login for Sharma General Stores demo.
- `GET /api/v1/auth/me`: Authenticated merchant profile and preferences.

### 2. Dashboard & Analytics (`/dashboard`, `/analytics`)
- `GET /api/v1/dashboard/summary`: Today's sales, percentage growth context, transaction count, ATV, low-stock count, at-risk customers, pending approvals count, and daily briefing.
- `GET /api/v1/analytics/sales`: Hourly sales breakdown, 7-day payment method distribution, and category contributions.

### 3. Transactions (`/transactions`)
- `GET /api/v1/transactions`: Searchable and filterable payment transaction records with provenance source (`demo`, `paytm_live`).
- `GET /api/v1/transactions/summary`: Today's gross vs net settlement summary.

### 4. Inventory & Suppliers (`/inventory`, `/suppliers`)
- `GET /api/v1/inventory`: Product catalogue with stock levels, coverage days, and stockout warnings.
- `GET /api/v1/inventory/alerts`: Urgent low-stock warnings with human-readable suggested reorder quantities.
- `POST /api/v1/inventory/reorder-drafts`: Creates a supplier purchase order draft.
- `GET /api/v1/suppliers`: Directory of wholesale distributors and ONDC partners.

### 5. Customers & Marketing (`/customers`, `/campaigns`)
- `GET /api/v1/customers`: Customer directory filterable by RFM segment.
- `GET /api/v1/customers/segments`: Segment distribution (Champions, Loyal, At-Risk, etc.).
- `POST /api/v1/campaigns/generate`: Generates personalized WhatsApp campaign with causal uplift estimate.
- `GET /api/v1/campaigns`: History of dispatched and drafted campaigns.

### 6. Multilingual Voice & Agent Brain (`/voice`, `/agent`)
- `POST /api/v1/voice/process`: Receives audio or text query, runs Sarvam Saaras STT, normalizes Indic intent, executes LangGraph multi-agent flow, generates Sarvam Bulbul TTS audio, and links approval actions.
- `POST /api/v1/agent/chat`: Text-based agent chat endpoint.
- `GET /api/v1/agent/conversations`: Merchant conversation history.

### 7. Governance & Action (`/approvals`, `/consent`, `/audit`, `/finance`, `/hyperlocal`)
- `GET /api/v1/approvals`: List pending and historical merchant approval requests.
- `POST /api/v1/approvals/{id}/action`: Idempotent action execution (`APPROVE` or `REJECT`).
- `GET /api/v1/consent`: List active DPDPA 2023 consents by purpose.
- `POST /api/v1/consent/{id}/withdraw`: 1-Click consent revocation under DPDPA provisions.
- `GET /api/v1/audit/events`: Immutable SHA-256 hash-chained event timeline.
- `GET /api/v1/finance/working-capital`: Festive inventory cashflow gap estimation and partner lender terms.
- `GET /api/v1/hyperlocal/trends`: Anonymized neighbourhood demand trends for Mumbai.
