from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.customer_service import CustomerService
from app.schemas.schemas import CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
async def list_customers(
    segment: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await CustomerService.get_customers(db, merchant.id, segment=segment, limit=limit)

@router.get("/segments")
async def get_rfm_segments(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await CustomerService.get_rfm_segments_summary(db, merchant.id)
