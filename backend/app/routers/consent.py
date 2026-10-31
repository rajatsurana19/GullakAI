from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.consent_service import ConsentService
from app.schemas.schemas import ConsentItemResponse

router = APIRouter(prefix="/consent", tags=["Consent & Privacy"])

@router.get("", response_model=List[ConsentItemResponse])
async def list_consents(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await ConsentService.get_merchant_consents(db, merchant.id)

@router.post("/{consent_id}/withdraw")
async def withdraw_consent(
    consent_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    consent = await ConsentService.withdraw_consent(db, merchant.id, consent_id)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found.")
    return {"message": "Consent successfully withdrawn under DPDPA 2023 provisions.", "consent_id": consent_id}
