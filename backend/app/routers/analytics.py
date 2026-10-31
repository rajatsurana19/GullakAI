from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/sales")
async def get_sales_analytics(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    analytics = await PaymentService.get_sales_analytics(db, merchant.id)
    summary = await PaymentService.get_today_summary(db, merchant.id)
    
    return {
        "period": "Last 7 Days (Festive Season)",
        "today_revenue": summary["today_revenue"],
        "growth_rate": summary["today_revenue_growth_percent"],
        "hourly_breakdown": analytics["hourly_breakdown"],
        "payment_method_distribution": analytics["payment_methods"],
        "category_breakdown": [
            {"category": "Ghee & Dairy", "sales": 14200.0, "percentage": 38.0},
            {"category": "Dry Fruits & Sweets", "sales": 11500.0, "percentage": 31.0},
            {"category": "Grains & Atta", "sales": 6800.0, "percentage": 18.0},
            {"category": "Spices & Oils", "sales": 4850.0, "percentage": 13.0}
        ]
    }
