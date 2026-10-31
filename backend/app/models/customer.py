import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean, JSON
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(Text, nullable=True)
    
    # RFM metrics
    total_orders = Column(Integer, default=1)
    total_spend = Column(Float, default=0.0)
    last_purchase_date = Column(DateTime, default=datetime.utcnow)
    recency_days = Column(Integer, default=0) # days since last purchase
    frequency_score = Column(Integer, default=3) # 1-5
    monetary_score = Column(Integer, default=3) # 1-5
    recency_score = Column(Integer, default=3) # 1-5
    
    segment = Column(String(50), default="Potential Loyalists") # Champions, Loyal Customers, Potential Loyalists, New Customers, At-Risk, Lost
    churn_probability = Column(Float, default=0.15)
    opt_out_marketing = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CustomerFeature(Base):
    __tablename__ = "customer_features"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
