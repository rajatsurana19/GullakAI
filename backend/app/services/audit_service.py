import hashlib
import json
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.audit import AuditLog
from app.core.logging import logger

class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        merchant_id: str,
        action_type: str,
        tool_called: Optional[str] = None,
        input_payload: Optional[Dict[str, Any]] = None,
        output_payload: Optional[Dict[str, Any]] = None,
        approval_id: Optional[str] = None,
        consent_id: Optional[str] = None,
        external_provider_ref: Optional[str] = None,
        status: str = "SUCCESS",
        error_details: Optional[str] = None,
        agent_run_id: Optional[str] = None
    ) -> AuditLog:
        """Appends an immutable audit entry with SHA-256 hash chaining."""
        # Fetch the most recent audit log for this merchant to chain the hash
        latest_stmt = select(AuditLog).where(
            AuditLog.merchant_id == merchant_id
        ).order_by(desc(AuditLog.timestamp)).limit(1)
        
        result = await db.execute(latest_stmt)
        latest_log = result.scalar_one_or_none()
        previous_hash = latest_log.current_hash if latest_log else "0" * 64
        
        now = datetime.utcnow()
        payload_for_hash = {
            "input": input_payload or {},
            "output": output_payload or {},
            "status": status,
            "tool": tool_called
        }
        
        current_hash = AuditLog.generate_hash(
            merchant_id=merchant_id,
            action=action_type,
            prev_hash=previous_hash,
            ts=now,
            payload=payload_for_hash
        )
        
        audit_entry = AuditLog(
            merchant_id=merchant_id,
            agent_run_id=agent_run_id,
            action_type=action_type,
            tool_called=tool_called,
            input_payload=input_payload,
            output_payload=output_payload,
            approval_id=approval_id,
            consent_id=consent_id,
            external_provider_ref=external_provider_ref,
            status=status,
            error_details=error_details,
            previous_hash=previous_hash,
            current_hash=current_hash,
            timestamp=now
        )
        
        db.add(audit_entry)
        await db.commit()
        await db.refresh(audit_entry)
        logger.info(f"Audit log recorded: {action_type} for merchant {merchant_id} [Hash: {current_hash[:12]}...]")
        return audit_entry
