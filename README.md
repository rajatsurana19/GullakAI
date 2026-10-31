# Gullak AI: Merchant Operations and Decision Support System

Gullak AI is a merchant operating system and decision support platform engineered for Indian retail merchants (kirana, grocery, and general stores) using the Paytm merchant ecosystem. It integrates store transactions, Soundbox audio events, inventory turnover data, and customer visit patterns into actionable business recommendations.

The platform enforces strict financial determinism, explicit human-in-the-loop approvals, tamper-evident cryptographic audit logging, and closed-loop causal uplift measurement.

---

## Architectural Principles

### 1. Deterministic Financial Governance
Financial calculations, ledger positions, safe-to-spend working capital limits, and reorder costs are computed via deterministic Python services. Advisory language models never generate or hallucinate currency balances, interest rates, or accounting totals. Every metric presented on the interface is grounded in underlying database records.

### 2. Human-in-the-Loop Verification
Autonomous execution without merchant consent is prohibited for high-impact actions (purchase orders, distributor payments, customer discount broadcasts, credit line activations). Every action follows a formal state machine:
`PROPOSED` -> `PENDING_APPROVAL` -> `APPROVED` / `REJECTED` -> `EXECUTING` -> `COMPLETED` / `FAILED`.

### 3. Cryptographic Audit Trail (Action Receipts)
Every executed action generates an immutable audit receipt containing:
- Action metadata (timestamp, merchant identifier, category, payload)
- Merchant approval method (web interface, voice confirmation, or biometric)
- SHA-256 seal computed over the action payload and previous audit block hash ($H_i = \text{SHA-256}(H_{i-1} \parallel \text{ActionRecord})$)
- Supporting financial evidence and causal outcome tracking

### 4. Closed-Loop Causal Measurement
Campaign and reorder efficacy is measured using a 20% randomized holdout control group. Rather than reporting gross sales following an action, the platform isolates true incremental lift:
$$\text{Lift} = \text{Conversion}_{\text{treatment}} - \text{Conversion}_{\text{control}}$$
$$\text{Incremental Revenue} = \text{Treated Customers} \times \text{Lift} \times \text{Average Order Value}$$
Samples smaller than statistical significance thresholds are guarded with `TOO_EARLY` state markers.

### 5. Multilingual Indic Localization
The interface supports English, Hindi (हिन्दी), and Marathi (मराठी). In Indic modes, numerals and currency values dynamically render in Devanagari numerals (०, १, २, ३, ४, ५, ६, ७, ८, ९) alongside localized Indian Numbering System formatting (Lakhs and Crores).

### 6. Hardware-Accurate Soundbox Integration
Paytm Soundbox 4G devices are write-only audio broadcast endpoints lacking microphones, screens, or client-side execution environments. Gullak AI generates concise audio briefs (under 40 words) dispatched via cellular audio streaming, paired with synchronous WhatsApp companion summaries for detailed review.

---

## System Architecture

```
                                  +---------------------------------------+
                                  |         Paytm Merchant App UI         |
                                  |    (React 18 / Tailwind / Vite)       |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS / REST / WS
                                                      v
                                  +---------------------------------------+
                                  |          FastAPI Gateway              |
                                  |  - Authentication & RBAC              |
                                  |  - DPDPA 2023 Consent Guard           |
                                  +-------------------+-------------------+
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                 |                                 |
                    v                                 v                                 v
+-----------------------+         +-----------------------+         +-----------------------+
|  Operational Services |         |  Decision & Simulation|         |  Indic Voice Engine   |
|  - Inventory Service  |         |  - Safe-to-Spend Calc |         |  - Sarvam STT/TTS     |
|  - Campaign Service   |         |  - What-If Simulator  |         |  - Rule-Based Parser  |
|  - Reorder Planner    |         |  - Causal Lift Engine |         |  - Number Grounder    |
+-----------+-----------+         +-----------+-----------+         +-----------+-----------+
            |                                 |                                 |
            +---------------------------------+---------------------------------+
                                              |
                                              v
                              +-------------------------------+
                              |    Persistence & Integrity    |
                              |  - SQLAlchemy Async (SQLite)  |
                              |  - SHA-256 Hash Chain Ledger  |
                              |  - Synthetic Validation Suite |
                              +-------------------------------+
```

---

## Core Functional Modules

### 1. Today (Home Dashboard)
- **Financial Status Bar**: Real-time tracking of Today's Sales, Expected Bank Settlement (with scheduled payout time), Cash Position, and Gullak Impact (measured incremental profit).
- **Business Risk Indicator**: Persistent alert highlighting the single most urgent operational risk (e.g., critical stock depletion prior to a high-demand holiday), calculated financial exposure, and one-tap remediation.
- **Priority Recommendations**: Curated queue capped at three high-impact actions per day to prevent decision fatigue.
- **Why Gullak Recommends This**: Transparency modal showing the exact data sources, formulas, assumptions, and risk trade-offs underlying each recommendation.

### 2. Ask Gullak (Conversational Voice Assistant)
- **Trilingual Speech Processing**: Supports Hindi, Marathi, and English voice input via Sarvam AI API integrations with deterministic fallback handling.
- **Structured Explanations**: Adheres to a strict three-tier response format:
  1. Direct Answer (factual data point)
  2. Financial Implication (impact on margin or cash flow)
  3. Recommended Action (executable decision)
- **Token Optimization**: Rule-based intent routing processes standard transactional queries without third-party model inference, reducing API costs and latency.

### 3. Actions Command Center
- **Pending Approvals**: Structured queue showing estimated financial impact, confidence score, and expiration window.
- **Active Operations**: Real-time execution tracking for dispatched supplier orders and active WhatsApp campaigns.
- **Action Receipts**: Audit view providing printable, verifiable certificates of completed operations with SHA-256 seals.

### 4. Customers (Grahak CRM)
- **Recency-Frequency-Monetary Segmentation**: Segments customers into Active, At-Risk, and Lapsed cohorts.
- **Offer Profit Guard**: Pre-flight margin validator that checks proposed discount rates against wholesale unit costs, preventing loss-making campaign broadcasts.
- **Causal Sales Lift Analytics**: Transparent breakdown comparing campaign recipients against control groups.

### 5. Stock and Money (Maal & Paisa)
- **Smart Reorder Planner**: Computes replenishment requirements based on daily burn rate, lead time, buffer stock, and supplier minimum order quantities.
- **Safe-to-Spend Calculation**: Evaluates current liquid balance against committed supplier payables and upcoming non-discretionary expenses to prevent liquidity shortfalls.
- **Supplier Directory**: Integrated catalog supporting direct order generation via ONDC-compatible schemas.

### 6. What-If Lab (Scenario Simulation Engine)
- **Pre-Execution Modeling**: Interactive simulations for pricing changes, seasonal inventory buys, and working capital loans.
- **Forecast vs. Actual Comparison**: Tracks completed simulations against real post-execution sales data to quantify forecast error and refine projection models over time.

### 7. Dead Stock Rescue
- **Three-Tier Classification**: Categorizes aged inventory into Slow-Moving (30-60 days), At-Risk (60-90 days), and Dead Stock (90+ days).
- **Capital Recovery Tracker**: Tracks working capital freed through targeted clearance promotions and supplier buybacks.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM & Database**: SQLAlchemy 2.0 (AsyncIO), SQLite for zero-friction evaluation; PostgreSQL + pgvector ready for production deployment
- **Data Validation**: Pydantic v2
- **Voice Pipeline**: Sarvam AI API (Saaras STT, Bulbul TTS) with deterministic local fallback
- **Testing & Validation**: Pytest, Pytest-AsyncIO

### Frontend
- **Core**: React 18 with Vite
- **Styling**: Tailwind CSS with custom Paytm FinTech design tokens
- **Typography & Localization**: Custom Devanagari numeral translation pipeline and Indic string dictionary
- **Icons**: Lucide React

---

## Repository Structure

```
gullak-ai/
├── backend/
│   ├── app/
│   │   ├── ai/               # Agent orchestration and Sarvam voice client
│   │   ├── core/             # Database connection, security, config, and templates
│   │   ├── eval/             # Automated backtesting and grounding verification
│   │   ├── models/           # SQLAlchemy database entity definitions
│   │   ├── routers/          # REST API route handlers
│   │   ├── schemas/          # Pydantic request and response schemas
│   │   ├── seed/             # Synthetic merchant dataset generators
│   │   ├── services/         # Business logic, audit chain, and calculations
│   │   └── main.py           # Application entrypoint and lifespan hooks
│   ├── tests/                # Pytest test suite
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/               # Static assets and official branding
│   ├── src/
│   │   ├── components/       # UI components, layout shell, and modals
│   │   ├── context/          # Authentication and language context providers
│   │   ├── i18n/             # Multilingual translations (EN, HI, MR)
│   │   ├── pages/            # Top-level view controllers
│   │   ├── services/         # Axios API clients
│   │   └── App.jsx           # Root application component
│   ├── package.json          # Node dependencies and build scripts
│   └── tailwind.config.js    # Design system palette and utility definitions
├── docs/                     # Architectural specifications and evaluation guides
├── docker-compose.yml        # Multi-container deployment configuration
└── README.md
```

---

## Local Setup and Installation

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- Git

### 1. Backend Configuration

Navigate to the project root and activate a Python virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
```

*Note: The system functions out of the box with zero external configuration using built-in mock providers. To enable live Indic voice services, provide a valid `SARVAM_API_KEY` in `.env`.*

Start the FastAPI application:

```bash
# Set PYTHONPATH to include backend directory
# Windows PowerShell:
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS:
PYTHONPATH=backend python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend automatically initializes tables and seeds standard merchant test data on initial startup.
Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Configuration

Open a separate terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The merchant web application will run at `http://localhost:3000` (or `http://localhost:3001` depending on port availability).

Default demo credentials:
- **Phone**: `9876543210`
- **Password**: `demo123`

---

## Verification and Evaluation

### Automated Backend Test Suite
Execute the test suite to verify financial calculations, zero-division guards, approval state machines, and audit hashing:

```bash
# Windows PowerShell:
$env:PYTHONPATH="backend"
pytest backend/tests -v

# Linux / macOS:
PYTHONPATH=backend pytest backend/tests -v
```

### Applied AI Evaluation Suite
Run the offline evaluation benchmark to test statistical grounding and Indic intent accuracy:

```bash
# Windows PowerShell:
$env:PYTHONPATH="backend"
python -m app.eval.run

# Linux / macOS:
PYTHONPATH=backend python3 -m app.eval.run
```

---

## Security and Compliance

- **DPDPA 2023 Ready**: The data layer separates merchant transaction data from external inference providers. Customer phone numbers are masked throughout the presentation tier.
- **Audit Tamper-Resistance**: Every state modification produces a cryptographically sealed hash record stored in sequential order.
- **Zero Hallucination Guardrails**: Prompts and rule parsers strictly constrain financial advice to numerical values present in verified database records.

---

## License

This project is developed for merchant operational assistance within the Paytm ecosystem. All rights reserved.
