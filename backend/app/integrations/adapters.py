import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.approval import ApprovalRequest
from app.models.campaign import Campaign, CampaignRecipient
from app.models.inventory import SupplierOrder
from app.services.audit_service import AuditService
from app.core.logging import logger

# ==============================================================================
# 1. ONDC Adapter (Interface + Mock Implementation)
# ==============================================================================

class OndcAdapter(ABC):
    """Interface for ONDC (Open Network for Digital Commerce) B2B wholesale order routing."""
    @abstractmethod
    async def place_b2b_order(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        supplier_id: str,
        items: List[Dict[str, Any]],
        estimated_amount: float
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_order_timeline(self, order_id: str) -> Dict[str, Any]:
        pass

class MockOndcAdapter(OndcAdapter):
    """
    [MOCK ADAPTER] Simulates ONDC protocol Beckn transaction for wholesale procurement.
    Production swap: Replace with LiveBecknProtocolAdapter connecting to ONDC BAP registry.
    """
    async def place_b2b_order(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        supplier_id: str,
        items: List[Dict[str, Any]],
        estimated_amount: float
    ) -> Dict[str, Any]:
        # MANDATORY APPROVAL GATE
        app_res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == approval_id))
        app_req = app_res.scalar_one_or_none()
        if not app_req:
            raise PermissionError("Approval gate check failed: No valid approval found.")

        order_id = f"ONDC-PO-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow()
        timeline = [
            {"status": "PLACED", "time": now.isoformat(), "label": "ऑर्डर नोंदवला (Order Placed)", "done": True},
            {"status": "CONFIRMED", "time": (now + timedelta(minutes=5)).isoformat(), "label": "व्यापाऱ्याने स्वीकारला (Confirmed by Supplier)", "done": True},
            {"status": "DISPATCHED", "time": (now + timedelta(hours=12)).isoformat(), "label": "गोदामातून रवाना (Dispatched)", "done": False},
            {"status": "DELIVERED", "time": (now + timedelta(hours=36)).isoformat(), "label": "दुकानात पोहोचेल (Delivery in 2 Days)", "done": False}
        ]

        result = {
            "adapter": "MockOndcAdapter (Beckn B2B Protocol)",
            "is_mock": True,
            "order_id": order_id,
            "ondc_network_tx_id": f"BKN-TXN-{uuid.uuid4().hex[:12].upper()}",
            "supplier_name": "Mahalaxmi Wholesale Distributors (ONDC)",
            "status": "CONFIRMED",
            "item_count": len(items),
            "total_amount_inr": estimated_amount,
            "estimated_delivery": "Within 48 hours (दिवाळीपूर्वी वेळेत पोहोचेल)",
            "timeline": timeline
        }

        # Audit chain logging
        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type="ONDC_ORDER_PLACED",
            approval_id=approval_id,
            input_payload={"supplier_id": supplier_id, "amount": estimated_amount, "items": len(items)},
            output_payload=result
        )
        return result

    async def get_order_timeline(self, order_id: str) -> Dict[str, Any]:
        return {
            "order_id": order_id,
            "current_status": "CONFIRMED",
            "message": "Order is packed and ready for dispatch from Bhiwandi fulfillment centre."
        }


# ==============================================================================
# 2. WhatsApp Adapter (Interface + Mock Implementation)
# ==============================================================================

class WhatsAppAdapter(ABC):
    """Interface for Meta WhatsApp Business Cloud API marketing broadcast."""
    @abstractmethod
    async def broadcast_campaign(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        campaign_id: str,
        message_text: str
    ) -> Dict[str, Any]:
        pass

class MockWhatsAppAdapter(WhatsAppAdapter):
    """
    [MOCK ADAPTER] Simulates WhatsApp Business API with 20% holdout causal assignment.
    Production swap: Replace with LiveMetaCloudWhatsAppAdapter with phone_number_id.
    """
    async def broadcast_campaign(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        campaign_id: str,
        message_text: str
    ) -> Dict[str, Any]:
        # MANDATORY APPROVAL GATE
        app_res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == approval_id))
        app_req = app_res.scalar_one_or_none()
        if not app_req:
            raise PermissionError("Approval gate check failed: No valid approval found.")

        # Query recipients
        camp_res = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        camp = camp_res.scalar_one_or_none()
        if not camp:
            raise ValueError("Campaign not found")

        stmt = select(CampaignRecipient).where(CampaignRecipient.campaign_id == campaign_id)
        res = await db.execute(stmt)
        recipients = res.scalars().all()

        total = len(recipients)
        delivered = 0
        read_count = 0

        # Simulate delivery and conversion rates per customer
        for idx, r in enumerate(recipients):
            r.delivery_status = "DELIVERED"
            r.sent_at = datetime.utcnow()
            delivered += 1
            if idx % 4 != 0: # 75% read rate
                read_count += 1
            
            # Ground truth latent conversion model
            # Treated customers return at ~35% vs ~15% baseline in control
            if r.treatment_group == "TREATMENT":
                # ~35% conversion with slight realistic noise
                r.has_converted = (idx % 3 == 0 or idx % 7 == 0) and (idx % 11 != 0)
            else:
                # Control group baseline ~15%
                r.has_converted = (idx % 6 == 0)

        camp.status = "DISPATCHED"
        camp.dispatched_at = datetime.utcnow()
        camp.delivered_count = delivered
        camp.read_count = read_count
        await db.commit()

        result = {
            "adapter": "MockWhatsAppAdapter (Meta Cloud API)",
            "is_mock": True,
            "campaign_id": campaign_id,
            "total_recipients": total,
            "delivered_count": delivered,
            "read_count": read_count,
            "status": "DISPATCHED",
            "message_sample": message_text[:80] + "..."
        }

        # Audit chain logging
        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type="WHATSAPP_CAMPAIGN_DISPATCHED",
            approval_id=approval_id,
            input_payload={"campaign_id": campaign_id, "recipients": total},
            output_payload=result
        )
        return result


# ==============================================================================
# 3. Credit Adapter (Interface + Mock Implementation)
# ==============================================================================

class CreditAdapter(ABC):
    """Interface for Paytm Payments Bank / Partner NBFC working capital credit."""
    @abstractmethod
    async def activate_credit_line(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        credit_amount: float
    ) -> Dict[str, Any]:
        pass

class MockCreditAdapter(CreditAdapter):
    """
    [MOCK ADAPTER] Simulates pre-qualified credit activation via partner lending platform.
    Production swap: Replace with LivePaytmLendingGatewayAdapter.
    """
    async def activate_credit_line(
        self,
        db: AsyncSession,
        merchant_id: str,
        approval_id: str,
        credit_amount: float
    ) -> Dict[str, Any]:
        # MANDATORY APPROVAL GATE
        app_res = await db.execute(select(ApprovalRequest).where(ApprovalRequest.id == approval_id))
        app_req = app_res.scalar_one_or_none()
        if not app_req:
            raise PermissionError("Approval gate check failed: No valid approval found.")

        loan_id = f"LN-PYTM-{uuid.uuid4().hex[:8].upper()}"
        result = {
            "adapter": "MockCreditAdapter (Paytm Partner Lending)",
            "is_mock": True,
            "loan_account_id": loan_id,
            "credit_limit_inr": credit_amount,
            "daily_deduction_pct": 1.2, # 1.2% daily settlement deduction
            "status": "ACTIVE",
            "available_balance_inr": credit_amount,
            "disbursed_at": datetime.utcnow().isoformat()
        }

        await AuditService.log_event(
            db=db,
            merchant_id=merchant_id,
            action_type="CREDIT_LINE_ACTIVATED",
            approval_id=approval_id,
            input_payload={"limit_amount": credit_amount},
            output_payload=result
        )
        return result

# Global accessors
ondc_adapter = MockOndcAdapter()
whatsapp_adapter = MockWhatsAppAdapter()
credit_adapter = MockCreditAdapter()
