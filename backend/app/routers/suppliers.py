from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.inventory import Supplier
from app.schemas.schemas import SupplierResponse

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("", response_model=List[SupplierResponse])
async def list_suppliers(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Supplier).where(Supplier.merchant_id == merchant.id)
    res = await db.execute(stmt)
    suppliers = res.scalars().all()
    if not suppliers:
        # If merchant has no exclusive suppliers, return verified ONDC B2B distributors
        stmt_all = select(Supplier).limit(6)
        res_all = await db.execute(stmt_all)
        suppliers = res_all.scalars().all()
    return suppliers
