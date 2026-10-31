import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    channel = Column(String(50), default="WHATSAPP") # WHATSAPP, SMS
    target_segment = Column(String(50), default="At-Risk Customers")
    message_template = Column(Text, nullable=False)
    message_hindi = Column(Text, nullable=True)
    message_marathi = Column(Text, nullable=True)
    
    status = Column(String(50), default="DRAFT") # DRAFT, PENDING_APPROVAL, APPROVED, DISPATCHED, COMPLETED, CANCELLED
    approval_id = Column(String(36), nullable=True)
    
    total_recipients = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    read_count = Column(Integer, default=0)
    converted_count = Column(Integer, default=0)
    
    estimated_cost = Column(Float, default=0.0)
    estimated_revenue = Column(Float, default=0.0)
    estimated_uplift_percent = Column(Float, default=18.5) # e.g. 18.5%
    
    created_at = Column(DateTime, default=datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)

    recipients = relationship("CampaignRecipient", back_populates="campaign", cascade="all, delete-orphan")

class CampaignRecipient(Base):
    __tablename__ = "campaign_recipients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    phone_number = Column(String(20), nullable=False)
    delivery_status = Column(String(30), default="PENDING") # PENDING, SENT, DELIVERED, READ, FAILED
    treatment_group = Column(String(20), default="TREATMENT") # TREATMENT, CONTROL
    has_converted = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)

    campaign = relationship("Campaign", back_populates="recipients")
