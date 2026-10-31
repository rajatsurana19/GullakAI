from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit & Governance"])

@router.get("/events")
async def list_audit_events(
    limit: int = Query(50, ge=1, le=100),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).where(
        AuditLog.merchant_id == merchant.id
    ).order_by(desc(AuditLog.timestamp)).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() + "Z",
            "action_type": log.action_type,
            "tool_called": log.tool_called,
            "status": log.status,
            "current_hash": log.current_hash,
            "previous_hash": log.previous_hash,
            "approval_id": log.approval_id,
            "consent_id": log.consent_id,
            "input_payload": log.input_payload,
            "output_payload": log.output_payload
        }
        for log in logs
    ]

@router.get("/verify")
async def verify_audit_chain(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).where(AuditLog.merchant_id == merchant.id).order_by(AuditLog.timestamp)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    if not logs:
        return {"is_valid": True, "total_events": 0, "message": "No events found"}

    for i in range(1, len(logs)):
        prev = logs[i - 1]
        curr = logs[i]
        if curr.previous_hash != prev.current_hash:
            return {
                "is_valid": False,
                "tampered_at_index": i,
                "tampered_event_id": curr.id,
                "action_type": curr.action_type,
                "error": f"Cryptographic mismatch detected: Previous hash '{curr.previous_hash[:12]}...' does not match expected '{prev.current_hash[:12]}...'!",
                "message": "चेतावनी: ऑडिट नोंदींमध्ये छेडछाड आढळली आहे! (Warning: Tampering detected in audit chain)"
            }

    return {
        "is_valid": True,
        "total_events": len(logs),
        "message": "✓ सर्व ऑडिट नोंदी Paytm क्रिप्टोग्राफिक साखळीद्वारे प्रमाणित व सुरक्षित आहेत. (All records valid and tamper-free)"
    }

@router.post("/tamper")
async def toggle_tamper_demo(
    tamper: bool = Query(True),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Demo toggle: Corrupts or restores the audit hash of a record to prove tamper-evidence."""
    stmt = select(AuditLog).where(AuditLog.merchant_id == merchant.id).order_by(AuditLog.timestamp)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    if len(logs) > 5:
        target = logs[3]
        if tamper:
            target.current_hash = "deadbeef" + target.current_hash[8:]
        else:
            # Recompute valid hash
            prev_h = logs[2].current_hash
            target.previous_hash = prev_h
            target.current_hash = AuditLog.generate_hash(
                merchant.id, target.action_type, prev_h, target.timestamp, target.input_payload or {}
            )
        await db.commit()
        return {"status": "TAMPERED" if tamper else "REPAIRED", "target_event_id": target.id}
    return {"status": "SKIPPED", "message": "Not enough audit records to tamper"}
