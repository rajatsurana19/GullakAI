from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.daily_brief_service import DailyBriefService

router = APIRouter(prefix="/brief", tags=["Proactive Partner & Daily Brief"])

@router.get("/")
async def get_daily_brief(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Generates ~30-sec daily brief (Soundbox voice script, WhatsApp message, in-app notification)."""
    brief = await DailyBriefService.generate_brief(db, merchant.id, lang)
    return brief

@router.post("/trigger")
async def trigger_brief_now(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Demo button: 'Run today's brief now' to trigger instant generation and delivery."""
    brief = await DailyBriefService.generate_brief(db, merchant.id, lang)
    return {
        "status": "DISPATCHED",
        "channels": ["SOUNDBOX_VOICE", "WHATSAPP_TEXT", "IN_APP_BANNER"],
        "brief": brief
    }
