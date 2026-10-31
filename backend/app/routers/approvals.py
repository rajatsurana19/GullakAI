from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.services.approval_service import ApprovalService
from app.schemas.schemas import ApprovalResponse, ApprovalActionRequest

router = APIRouter(prefix="/approvals", tags=["Approval Centre"])

@router.get("", response_model=List[ApprovalResponse])
async def list_approvals(
    status: Optional[str] = None,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    return await ApprovalService.list_approvals(db, merchant.id, status=status)

@router.post("/{approval_id}/action", response_model=ApprovalResponse)
async def take_approval_action(
    approval_id: str,
    req: ApprovalActionRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    try:
        if req.action.upper() == "APPROVE":
            return await ApprovalService.approve(db, merchant.id, approval_id, user_name=merchant.owner_name)
        elif req.action.upper() == "REJECT":
            return await ApprovalService.reject(db, merchant.id, approval_id, rejection_reason=req.rejection_reason)
        else:
            raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
