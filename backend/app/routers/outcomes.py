from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.outcome_service import OutcomeTrackingService

router = APIRouter(prefix="/outcomes", tags=["Closed-Loop Outcomes & Results"])

@router.get("/")
async def get_all_outcomes(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns all measured action outcomes for Kriya > Results view."""
    outcomes = await OutcomeTrackingService.get_all_outcomes(db, merchant.id)
    return [
        {
            "id": o.id,
            "action_type": o.action_type,
            "title": o.title,
            "status": o.status,
            "treated_count": o.treated_count,
            "control_count": o.control_count,
            "treated_conversions": o.treated_conversions,
            "control_conversions": o.control_conversions,
            "treated_rate": o.treated_rate,
            "control_rate": o.control_rate,
            "incremental_rate": o.incremental_rate,
            "incremental_revenue_inr": o.incremental_revenue_inr,
            "stock_loss_avoided_inr": o.stock_loss_avoided_inr,
            "plain_language_summary": o.plain_language_summary,
            "plain_language_summary_mr": o.plain_language_summary_mr,
            "plain_language_summary_hi": o.plain_language_summary_hi,
            "measured_at": o.measured_at.isoformat() if o.measured_at else None
        }
        for o in outcomes
    ]

@router.get("/earnings")
async def get_total_earnings(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns Gullak's measured extra earnings this month for the Aaj page header."""
    earnings = await OutcomeTrackingService.get_total_incremental_earnings(db, merchant.id)
    return earnings
