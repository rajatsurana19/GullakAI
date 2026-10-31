import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from app.core.database import Base

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action_type = Column(String(50), nullable=False) # SUPPLIER_ORDER, CAMPAIGN_BROADCAST, LENDING_APPLICATION, PRICE_UPDATE
    title = Column(String(255), nullable=False)
    business_justification = Column(Text, nullable=False) # Clear explanation for the merchant
    estimated_amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    
    # Transparency fields for layman & governance
    data_sources_used = Column(JSON, nullable=True) # e.g. ["Past 30 days sales", "Diwali demand surge"]
    risk_assessment = Column(Text, nullable=True) # e.g. "Low risk. Stock will be delivered in 2 days."
    action_payload = Column(JSON, nullable=False) # Parameters to execute
    
    # 7-State State Machine
    status = Column(String(30), default="PENDING", index=True) # PENDING, APPROVED, REJECTED, EXECUTING, COMPLETED, FAILED, EXPIRED
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)
    
    consent_id = Column(String(36), nullable=True)
    executed_by_user = Column(String(100), nullable=True)
    execution_result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
