from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.consent import Consent
from app.services.audit_service import AuditService
from app.core.logging import logger

class ConsentService:
    @staticmethod
    async def get_merchant_consents(db: AsyncSession, merchant_id: str) -> List[Consent]:
        result = await db.execute(select(Consent).where(Consent.merchant_id == merchant_id))
        return result.scalars().all()

    @staticmethod
    async def check_consent(db: AsyncSession, merchant_id: str, purpose: str) -> bool:
        result = await db.execute(
            select(Consent).where(
                Consent.merchant_id == merchant_id,
                Consent.purpose == purpose,
                Consent.status == "GRANTED"
            )
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def grant_consent(
        db: AsyncSession,
        merchant_id: str,
        purpose: str,
        data_categories: List[str],
        activity_description: str
    ) -> Consent:
        # Check if already exists
        result = await db.execute(
            select(Consent).where(
                Consent.merchant_id == merchant_id,
                Consent.purpose == purpose
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.status = "GRANTED"
            existing.data_categories = data_categories
            existing.processing_activity = activity_description
            existing.granted_at = datetime.utcnow()
            existing.withdrawn_at = None
            consent = existing
        else:
            consent = Consent(
                merchant_id=merchant_id,
                purpose=purpose,
                data_categories=data_categories,
                processing_activity=activity_description,
                status="GRANTED",
                granted_at=datetime.utcnow()
            )
            db.add(consent)
            
        await db.commit()
        await db.refresh(consent)
        
        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type="CONSENT_GRANTED",
            consent_id=consent.id,
            input_payload={"purpose": purpose, "categories": data_categories}
        )
        return consent

    @staticmethod
    async def withdraw_consent(db: AsyncSession, merchant_id: str, consent_id: str) -> Optional[Consent]:
        result = await db.execute(
            select(Consent).where(
                Consent.id == consent_id,
                Consent.merchant_id == merchant_id
            )
        )
        consent = result.scalar_one_or_none()
        if consent:
            consent.status = "WITHDRAWN"
            consent.withdrawn_at = datetime.utcnow()
            await db.commit()
            await db.refresh(consent)
            
            await AuditService.log_event(
                db=db,
                merchant_id=merchant_id,
                action_type="CONSENT_WITHDRAWN",
                consent_id=consent.id,
                input_payload={"purpose": consent.purpose}
            )
            logger.info(f"Consent {consent_id} withdrawn for merchant {merchant_id}")
        return consent
