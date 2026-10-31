import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("MerchantProfile", back_populates="merchant", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("MerchantPreferences", back_populates="merchant", uselist=False, cascade="all, delete-orphan")
    devices = relationship("MerchantDevice", back_populates="merchant", cascade="all, delete-orphan")

class MerchantProfile(Base):
    __tablename__ = "merchant_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, unique=True)
    category = Column(String(100), default="Grocery & General Store") # Kirana, Electronics, etc.
    gstin = Column(String(20), nullable=True)
    pan = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), default="Mumbai")
    state = Column(String(100), default="Maharashtra")
    pincode = Column(String(10), default="400001")
    settlement_vpa = Column(String(100), default="sharma.stores@paytm")
    bank_account_number = Column(String(30), default="919876543210")
    bank_ifsc = Column(String(20), default="PYTM0123456")
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="profile")

class MerchantPreferences(Base):
    __tablename__ = "merchant_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, unique=True)
    preferred_language = Column(String(20), default="mr") # mr (Marathi), hi (Hindi), en (English)
    voice_speed = Column(Float, default=1.0)
    auto_reorder_low_stock = Column(Boolean, default=False)
    whatsapp_notification_enabled = Column(Boolean, default=True)
    soundbox_announcement_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="preferences")

class MerchantDevice(Base):
    __tablename__ = "merchant_devices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    device_type = Column(String(50), default="SOUNDBOX") # SOUNDBOX, EDC_POS, QR_DISPLAY
    device_id = Column(String(100), nullable=False)
    model = Column(String(100), default="Paytm Soundbox 4G")
    is_active = Column(Boolean, default=True)
    battery_level = Column(Float, default=85.0)
    firmware_version = Column(String(50), default="v4.2.1-indic")
    last_heartbeat = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="devices")
