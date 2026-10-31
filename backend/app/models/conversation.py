import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Float, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(50), default="WEB_VOICE") # WEB_VOICE, WEB_CHAT, SOUNDBOX, WHATSAPP
    language = Column(String(20), default="hi") # hi, mr, en, hinglish
    title = Column(String(255), default="Merchant Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False) # USER, AGENT, SYSTEM
    
    # Multilingual & Transcriptions
    text_content = Column(Text, nullable=False)
    audio_url = Column(String(255), nullable=True) # If generated or uploaded
    audio_base64 = Column(Text, nullable=True) # Base64 audio for playback
    detected_language = Column(String(20), nullable=True)
    intent = Column(String(100), nullable=True)
    
    # Metadata for execution & explainability
    agent_name = Column(String(50), nullable=True) # SalesAgent, InventoryAgent, CustomerAgent, etc.
    tools_used = Column(JSON, nullable=True)
    why_explanation = Column(Text, nullable=True)
    approval_id = Column(String(36), nullable=True)
    latency_ms = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
