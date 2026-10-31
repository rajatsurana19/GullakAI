import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.approval import ApprovalRequest
from app.models.inventory import SupplierOrder
from app.models.campaign import Campaign
from app.models.recommendation import Recommendation
from app.services.audit_service import AuditService
from app.services.consent_service import ConsentService
from app.integrations.adapters import ondc_adapter, whatsapp_adapter, credit_adapter
from app.services.outcome_service import OutcomeTrackingService
from app.core.logging import logger

class ApprovalService:
    @staticmethod
    async def create_approval_request(
        db: AsyncSession,
        merchant_id: str,
        action_type: str,
        title: str,
        business_justification: str,
        estimated_amount: float,
        action_payload: Dict[str, Any],
        data_sources_used: Optional[List[str]] = None,
        risk_assessment: Optional[str] = None,
        idempotency_key: Optional[str] = None
    ) -> ApprovalRequest:
        """Creates an approval request following the merchant approval workflow."""
        if not idempotency_key:
            idempotency_key = f"IDEMP-{uuid.uuid4()}"
            
        # Check for existing idempotency key
        existing = await db.execute(
            select(ApprovalRequest).where(ApprovalRequest.idempotency_key == idempotency_key)
        )
        existing_req = existing.scalar_one_or_none()
        if existing_req:
            return existing_req

        approval = ApprovalRequest(
            merchant_id=merchant_id,
            action_type=action_type,
            title=title,
            business_justification=business_justification,
            estimated_amount=estimated_amount,
            data_sources_used=data_sources_used or ["Past sales history", "Inventory levels"],
            risk_assessment=risk_assessment or "Low risk. Action requires your explicit consent.",
            action_payload=action_payload,
            status="PENDING",
            idempotency_key=idempotency_key
        )
        db.add(approval)
        await db.commit()
        await db.refresh(approval)
        
        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type="APPROVAL_REQUEST_CREATED",
            approval_id=approval.id,
            input_payload={"title": title, "amount": estimated_amount, "action_type": action_type}
        )
        logger.info(f"Approval request {approval.id} created: {title}")
        return approval

    @staticmethod
    async def approve(
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        user_name: str = "Merchant"
    ) -> ApprovalRequest:
        """Executes the approved operation idempotently through the appropriate adapter."""
        stmt = select(ApprovalRequest).where(
            ApprovalRequest.id == approval_id,
            ApprovalRequest.merchant_id == merchant_id
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()
        if not req:
            raise ValueError("Approval request not found.")
            
        if req.status == "COMPLETED":
            return req # Idempotent safe return
            
        if req.status not in ["PENDING", "APPROVED"]:
            raise ValueError(f"Cannot approve request in '{req.status}' status.")

        # Transition state machine: APPROVED -> EXECUTING
        req.status = "EXECUTING"
        req.executed_by_user = user_name
        req.updated_at = datetime.utcnow()
        await db.commit()

        try:
            execution_res = {}
            if req.action_type == "SUPPLIER_ORDER":
                # Execute order placement via ONDC Adapter
                order_id = req.action_payload.get("order_id")
                supplier_id = req.action_payload.get("supplier_id", "supplier-mahalaxmi")
                items = req.action_payload.get("items", [{"name": "Pure Desi Cow Ghee (1 Litre)", "quantity": 45, "unit_price": 450.0}])
                
                execution_res = await ondc_adapter.place_b2b_order(
                    db=db,
                    merchant_id=merchant_id,
                    approval_id=req.id,
                    supplier_id=supplier_id,
                    items=items,
                    estimated_amount=req.estimated_amount or 20250.0
                )
                if order_id:
                    order_res = await db.execute(select(SupplierOrder).where(SupplierOrder.id == order_id))
                    order = order_res.scalar_one_or_none()
                    if order:
                        order.status = "PLACED"

            elif req.action_type == "CAMPAIGN_BROADCAST":
                campaign_id = req.action_payload.get("campaign_id")
                msg_text = req.action_payload.get("message_text", "दिवाळी सणानिमित्त १०% विशेष सवलत!")
                execution_res = await whatsapp_adapter.broadcast_campaign(
                    db=db,
                    merchant_id=merchant_id,
                    approval_id=req.id,
                    campaign_id=campaign_id or f"camp-{req.id[:8]}",
                    message_text=msg_text
                )
                if campaign_id:
                    # Record measured causal uplift!
                    await OutcomeTrackingService.record_campaign_outcome(
                        db=db,
                        merchant_id=merchant_id,
                        campaign_id=campaign_id,
                        approval_id=req.id
                    )

            elif req.action_type == "LENDING_APPLICATION":
                limit_amt = req.estimated_amount or 50000.0
                execution_res = await credit_adapter.activate_credit_line(
                    db=db,
                    merchant_id=merchant_id,
                    approval_id=req.id,
                    credit_amount=limit_amt
                )
            else:
                execution_res = {"status": "SUCCESS", "message": "Action completed successfully."}

            # Update corresponding recommendation if linked
            rec_stmt = select(Recommendation).where(Recommendation.approval_id == req.id)
            rec_res = await db.execute(rec_stmt)
            rec = rec_res.scalar_one_or_none()
            if rec:
                rec.status = "EXECUTED"

            # Transition to COMPLETED
            req.status = "COMPLETED"
            req.execution_result = execution_res
            await db.commit()
            await db.refresh(req)

            # Log audit event with SHA-256 hash chaining
            await AuditService.log_event(
                db=db,
                merchant_id=merchant_id,
                action_type=f"ACTION_EXECUTED_{req.action_type}",
                approval_id=req.id,
                output_payload=execution_res,
                status="SUCCESS"
            )
            logger.info(f"Approval request {req.id} executed successfully.")
            return req

        except Exception as e:
            req.status = "FAILED"
            req.error_message = str(e)
            await db.commit()
            await AuditService.log_event(
                db=db,
                merchant_id=merchant_id,
                action_type=f"ACTION_FAILED_{req.action_type}",
                approval_id=req.id,
                status="FAILED",
                error_details=str(e)
            )
            raise e

    @staticmethod
    async def reject(
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        rejection_reason: Optional[str] = None
    ) -> ApprovalRequest:
        stmt = select(ApprovalRequest).where(
            ApprovalRequest.id == approval_id,
            ApprovalRequest.merchant_id == merchant_id
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()
        if not req:
            raise ValueError("Approval request not found.")
            
        req.status = "REJECTED"
        req.error_message = rejection_reason or "Rejected by merchant."
        req.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(req)

        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type=f"ACTION_REJECTED_{req.action_type}",
            approval_id=req.id,
            status="REJECTED",
            input_payload={"reason": rejection_reason}
        )
        return req

    @staticmethod
    async def list_approvals(
        db: AsyncSession,
        merchant_id: str,
        status: Optional[str] = None
    ) -> List[ApprovalRequest]:
        stmt = select(ApprovalRequest).where(ApprovalRequest.merchant_id == merchant_id)
        if status:
            stmt = stmt.where(ApprovalRequest.status == status)
        stmt = stmt.order_by(desc(ApprovalRequest.created_at))
        result = await db.execute(stmt)
        return result.scalars().all()
