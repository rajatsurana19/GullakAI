import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(String(36), nullable=True, index=True)
    
    amount = Column(Float, nullable=False) # In INR
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="SUCCESS") # SUCCESS, PENDING, FAILED, REFUNDED
    payment_method = Column(String(50), default="UPI") # UPI, SOUNDBOX_QR, CARD, PAYTM_WALLET, CASH
    
    paytm_order_id = Column(String(100), unique=True, nullable=False, index=True)
    paytm_txn_id = Column(String(100), nullable=True)
    payer_vpa = Column(String(100), nullable=True)
    payer_name = Column(String(150), nullable=True)
    
    provenance_source = Column(String(50), default="demo") # demo, paytm_live, partner_live, imported
    is_synthetic = Column(Boolean, default=True)
    product_details = Column(JSON, nullable=True) # items purchased in this cart
    note = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    settlement_reference = Column(String(100), unique=True, nullable=False)
    gross_amount = Column(Float, nullable=False)
    net_amount = Column(Float, nullable=False)
    deductions = Column(Float, default=0.0) # MDR/TDS
    status = Column(String(30), default="SETTLED") # PENDING, SETTLED, FAILED
    destination_vpa = Column(String(100), nullable=False)
    destination_bank = Column(String(100), default="Paytm Payments Bank / HDFC")
    transaction_count = Column(Integer, default=1)
    settled_at = Column(DateTime, default=datetime.utcnow)
    provenance_source = Column(String(50), default="demo")
    created_at = Column(DateTime, default=datetime.utcnow)

class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False) # PAYMENT_RECEIVED, REFUND_REQUESTED, SETTLEMENT_INITIATED
    payload = Column(JSON, nullable=False)
    device_id = Column(String(100), nullable=True)
    provenance_source = Column(String(50), default="demo")
    created_at = Column(DateTime, default=datetime.utcnow)
