from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.campaign_service import CampaignService
from app.schemas.schemas import CampaignResponse, CampaignGenerateRequest

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await CampaignService.get_campaigns(db, merchant.id)

@router.post("/generate", response_model=CampaignResponse)
async def generate_campaign(
    req: CampaignGenerateRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    campaign = await CampaignService.generate_campaign_draft(
        db=db,
        merchant_id=merchant.id,
        target_segment=req.target_segment,
        festival_context=req.festival_context or "Diwali",
        discount_percent=req.discount_percent or 10.0
    )
    return campaign
