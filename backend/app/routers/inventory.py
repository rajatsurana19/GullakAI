from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.inventory_service import InventoryService
from app.schemas.schemas import ProductResponse, ReorderDraftRequest

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[ProductResponse])
async def list_inventory(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await InventoryService.get_products_with_inventory(db, merchant.id)

@router.get("/alerts")
async def get_inventory_alerts(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await InventoryService.get_low_stock_alerts(db, merchant.id)

@router.post("/reorder-drafts")
async def create_reorder_draft(
    req: ReorderDraftRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    order = await InventoryService.create_reorder_draft(
        db=db,
        merchant_id=merchant.id,
        supplier_id=req.supplier_id,
        items=req.items
    )
    return {
        "order_id": order.id,
        "order_reference": order.order_reference,
        "total_amount": order.total_amount,
        "status": order.status,
        "message": "Reorder draft created successfully."
    }
