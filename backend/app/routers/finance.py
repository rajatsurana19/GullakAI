from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.integrations.lending.adapter import get_lending_adapter
from app.schemas.schemas import WorkingCapitalAnalysisResponse

router = APIRouter(prefix="/finance", tags=["Working Capital"])

@router.get("/working-capital", response_model=WorkingCapitalAnalysisResponse)
async def get_working_capital_analysis(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    lending_adapter = get_lending_adapter()
    estimated_gap = 45000.0 # INR Diwali inventory gap
    products = await lending_adapter.get_eligible_lender_products(merchant.id, estimated_gap)

    return {
        "estimated_cashflow_gap": estimated_gap,
        "diwali_stockup_requirement": 65000.0,
        "days_to_peak_festive": 5,
        "upcoming_supplier_payables": 18500.0,
        "eligible_lender_products": products,
        "disclaimer": "Gullak AI does not issue loans or make credit decisions. All terms and approvals are provided by authorized partner lenders."
    }
