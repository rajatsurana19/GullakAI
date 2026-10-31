import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from app.core.database import Base

class ActionOutcome(Base):
    """
    Closed-loop sales impact measurement record linked to execution, approval, and audit trail.
    Tracks proven incremental revenue and causal return rates.
    """
    __tablename__ = "action_outcomes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False) # CAMPAIGN_BROADCAST, SUPPLIER_ORDER, LENDING_APPLICATION
    
    approval_id = Column(String(36), ForeignKey("approval_requests.id", ondelete="SET NULL"), nullable=True, index=True)
    audit_log_id = Column(String(36), nullable=True)
    recommendation_id = Column(String(36), nullable=True)
    
    title = Column(String(255), nullable=False)
    status = Column(String(30), default="MEASURED") # MEASURED, IN_PROGRESS, TOO_EARLY
    
    # Uplift measurement metrics
    treated_count = Column(Integer, default=0)
    control_count = Column(Integer, default=0)
    treated_conversions = Column(Integer, default=0)
    control_conversions = Column(Integer, default=0)
    
    treated_rate = Column(Float, default=0.0) # e.g. 0.35
    control_rate = Column(Float, default=0.0) # e.g. 0.15
    incremental_rate = Column(Float, default=0.0) # e.g. 0.20
    
    incremental_revenue_inr = Column(Float, default=0.0) # (treated_rate - control_rate) * treated_count * avg_ticket
    measured_sales_lift_inr = Column(Float, default=0.0)
    stock_loss_avoided_inr = Column(Float, default=0.0) # units saved * margin
    
    # Plain language results for the merchant in 3 languages
    plain_language_summary = Column(Text, nullable=False)
    plain_language_summary_mr = Column(Text, nullable=True)
    plain_language_summary_hi = Column(Text, nullable=True)
    
    metrics_payload = Column(JSON, nullable=True)
    is_synthetic = Column(Boolean, default=True)
    measured_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
