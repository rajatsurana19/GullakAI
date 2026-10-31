from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Auth & Merchant Schemas -----------------
class MerchantRegisterRequest(BaseModel):
    business_name: str
    owner_name: str
    phone_number: str
    password: str
    email: Optional[str] = None
    category: Optional[str] = "Grocery & General Store"
    city: Optional[str] = "Mumbai"
    preferred_language: Optional[str] = "mr"

class MerchantLoginRequest(BaseModel):
    phone_number: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    merchant: Dict[str, Any]

class MerchantProfileResponse(BaseModel):
    id: str
    business_name: str
    owner_name: str
    phone_number: str
    email: Optional[str]
    category: str
    city: str
    state: str
    settlement_vpa: str
    preferred_language: str
    is_demo: bool

# ----------------- Dashboard & Analytics Schemas -----------------
class DashboardSummaryResponse(BaseModel):
    today_revenue: float
    today_revenue_growth_percent: float
    today_transaction_count: int
    avg_transaction_value: float
    pending_settlement_amount: float
    low_stock_item_count: int
    at_risk_customer_count: int
    pending_approvals_count: int
    daily_briefing: str
    sales_trend_7d: List[Dict[str, Any]]
    top_selling_products: List[Dict[str, Any]]
    urgent_alerts: List[Dict[str, Any]]

class SalesAnalyticsResponse(BaseModel):
    total_sales: float
    growth_rate: float
    period: str
    hourly_breakdown: List[Dict[str, Any]]
    payment_method_distribution: Dict[str, float]
    category_breakdown: List[Dict[str, Any]]

# ----------------- Transactions -----------------
class TransactionResponse(BaseModel):
    id: str
    amount: float
    status: str
    payment_method: str
    paytm_order_id: str
    payer_name: Optional[str]
    payer_vpa: Optional[str]
    provenance_source: str
    created_at: datetime

# ----------------- Inventory & Supplier -----------------
class ProductResponse(BaseModel):
    id: str
    sku: str
    name: str
    name_hindi: Optional[str]
    name_marathi: Optional[str]
    category: str
    unit: str
    selling_price: float
    cost_price: float
    current_stock: float
    safety_stock: float
    avg_daily_sales: Optional[float] = 0.0
    stock_coverage_days: float
    is_low_stock: bool
    predicted_stock_out_days: int
    is_festive: Optional[bool] = False

class ReorderDraftRequest(BaseModel):
    supplier_id: str
    items: List[Dict[str, Any]] # [{"product_id": "...", "quantity": 50, "unit_price": 450}]
    notes: Optional[str] = None

class SupplierResponse(BaseModel):
    id: str
    name: str
    contact_person: Optional[str]
    phone_number: str
    category: str
    platform: str
    lead_time_days: int
    rating: float

# ----------------- Customers & Campaigns -----------------
class CustomerResponse(BaseModel):
    id: str
    name: str
    phone_number: str
    total_orders: int
    total_spend: float
    last_purchase_date: datetime
    recency_days: int
    segment: str
    churn_probability: float

class CampaignGenerateRequest(BaseModel):
    target_segment: str # "At-Risk Customers", "Champions", etc.
    festival_context: Optional[str] = "Diwali"
    offer_type: Optional[str] = "PERCENTAGE_DISCOUNT" # 10% off
    discount_percent: Optional[float] = 10.0

class CampaignResponse(BaseModel):
    id: str
    title: str
    channel: str
    target_segment: str
    message_template: str
    total_recipients: int
    estimated_cost: float
    estimated_revenue: float
    estimated_uplift_percent: float
    status: str
    created_at: datetime

# ----------------- Voice & Language -----------------
class VoiceProcessRequest(BaseModel):
    audio_base64: Optional[str] = None
    text_query: Optional[str] = None # text fallback
    language: Optional[str] = "auto" # auto | hi | mr | en
    conversation_id: Optional[str] = None

class VoiceProcessResponse(BaseModel):
    conversation_id: str
    transcript: str
    detected_language: str
    intent: str
    response_text: str
    audio_base64: Optional[str] = None # Bulbul TTS playback
    agent_name: str
    why_explanation: Optional[str] = None
    suggested_action: Optional[str] = None
    approval_required: bool = False
    approval_id: Optional[str] = None
    execution_data: Optional[Dict[str, Any]] = None

# ----------------- Approvals & Governance -----------------
class ApprovalResponse(BaseModel):
    id: str
    action_type: str
    title: str
    business_justification: str
    estimated_amount: Optional[float] = 0.0
    currency: str = "INR"
    data_sources_used: Optional[List[str]] = []
    risk_assessment: Optional[str] = "Low Risk"
    action_payload: Optional[Dict[str, Any]] = {}
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None

class ApprovalActionRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    rejection_reason: Optional[str] = None

# ----------------- Consent & Audit -----------------
class ConsentItemResponse(BaseModel):
    id: str
    purpose: str
    data_categories: List[str]
    status: str
    processing_activity: str
    granted_at: datetime
    retention_period_days: int

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    action_type: str
    tool_called: Optional[str]
    status: str
    current_hash: str
    previous_hash: Optional[str]
    details: Dict[str, Any]

# ----------------- Working Capital & Lending -----------------
class WorkingCapitalAnalysisResponse(BaseModel):
    estimated_cashflow_gap: float
    diwali_stockup_requirement: float
    days_to_peak_festive: int
    upcoming_supplier_payables: float
    eligible_lender_products: List[Dict[str, Any]]
    disclaimer: str
