from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Top 3 Actions & Recommendations"])

@router.get("/top3")
async def get_top_3_actions(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns the hard-capped Top 3 Actions Today, ranked by impact * confidence * learn_boost."""
    actions = await RecommendationService.get_top_3_actions(db, merchant.id, lang)
    return actions

@router.post("/{rec_id}/dismiss")
async def dismiss_recommendation(
    rec_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    success = await RecommendationService.dismiss_action(db, merchant.id, rec_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {"status": "DISMISSED", "id": rec_id}
