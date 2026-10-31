import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from app.core.database import Base

class Recommendation(Base):
    """
    Unified Recommendation data model that ALL agents write to.
    Ranked by expected_impact_inr * confidence_score, de-duplicated, capped to 3 per day.
    """
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    type = Column(String(50), nullable=False) # STOCK, CUSTOMER, CAPITAL, PRICING
    headline = Column(String(255), nullable=False)
    headline_mr = Column(String(255), nullable=True)
    headline_hi = Column(String(255), nullable=True)
    
    why = Column(Text, nullable=False) # Plain everyday language
    why_mr = Column(Text, nullable=True)
    why_hi = Column(Text, nullable=True)
    
    expected_impact_inr = Column(Float, default=0.0)
    confidence = Column(String(20), default="High") # High, Medium, Low
    confidence_score = Column(Float, default=0.90) # 0.0 to 1.0 numeric
    
    action_type = Column(String(50), nullable=False) # SUPPLIER_ORDER, CAMPAIGN_BROADCAST, LENDING_APPLICATION
    action_payload = Column(JSON, nullable=True)
    approval_id = Column(String(36), nullable=True)
    
    signals_used = Column(JSON, nullable=True) # e.g. ["Diwali in 9 days", "Ghee sales up 3x", "Rain-free weekend"]
    status = Column(String(30), default="PENDING", index=True) # PENDING, APPROVED, DISMISSED, EXECUTED
    is_top_action = Column(Boolean, default=False) # Top 3 flagged
    rank = Column(Integer, default=1)
    
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    @property
    def ranking_score(self) -> float:
        return (self.expected_impact_inr or 0.0) * (self.confidence_score or 0.5)
