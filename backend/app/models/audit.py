import uuid
import hashlib
import json
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_run_id = Column(String(100), nullable=True, index=True)
    
    action_type = Column(String(100), nullable=False) # e.g. AGENT_TOOL_EXECUTION, ORDER_PLACED, CAMPAIGN_SENT, CONSENT_WITHDRAWN
    tool_called = Column(String(100), nullable=True)
    
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    approval_id = Column(String(36), nullable=True)
    consent_id = Column(String(36), nullable=True)
    external_provider_ref = Column(String(100), nullable=True) # e.g. Paytm order ID or distributor ref
    
    status = Column(String(30), default="SUCCESS") # SUCCESS, FAILED, PENDING
    error_details = Column(Text, nullable=True)
    
    # Cryptographic SHA-256 hash chaining for tamper evidence
    previous_hash = Column(String(64), nullable=True)
    current_hash = Column(String(64), nullable=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    @staticmethod
    def generate_hash(merchant_id: str, action: str, prev_hash: str, ts: datetime, payload: dict) -> str:
        data = f"{merchant_id}|{action}|{prev_hash or ''}|{ts.isoformat()}|{json.dumps(payload, sort_keys=True)}"
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
