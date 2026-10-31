import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from app.core.database import Base

class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # DPDPA 2023 Purpose & Category
    purpose = Column(String(100), nullable=False) # SALES_ANALYTICS, INVENTORY_AUTOMATION, CUSTOMER_MARKETING, LENDING_ASSESSMENT, VOICE_PROCESSING
    data_categories = Column(JSON, nullable=False) # ["TRANSACTIONS", "INVENTORY", "CUSTOMER_CONTACTS", "AUDIO_SPEECH"]
    consent_version = Column(String(20), default="v1.0-dpdpa2023")
    
    status = Column(String(30), default="GRANTED") # GRANTED, WITHDRAWN, EXPIRED
    processing_activity = Column(Text, nullable=False)
    
    granted_at = Column(DateTime, default=datetime.utcnow)
    withdrawn_at = Column(DateTime, nullable=True)
    retention_period_days = Column(Integer, default=365)
    created_at = Column(DateTime, default=datetime.utcnow)
