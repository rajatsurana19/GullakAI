from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.campaign import Campaign, CampaignRecipient
from app.models.customer import Customer
from app.core.logging import logger

class CampaignService:
    @staticmethod
    async def generate_campaign_draft(
        db: AsyncSession,
        merchant_id: str,
        target_segment: str = "At-Risk Customers",
        festival_context: str = "Diwali",
        discount_percent: float = 10.0
    ) -> Campaign:
        """Generates a personalized campaign with estimated uplift and WhatsApp template."""
        # Find matching customers
        stmt = select(Customer).where(
            Customer.merchant_id == merchant_id,
            Customer.segment == target_segment,
            Customer.opt_out_marketing == False
        )
        result = await db.execute(stmt)
        customers = result.scalars().all()
        recipient_count = len(customers)
        
        # Multilingual templates
        msg_template = (
            f"✨ Diwali Special from Sharma General Stores! ✨\n\n"
            f"Namaste! We missed seeing you recently. Celebrate this Diwali with pure Desi Ghee & Dry Fruits! "
            f"Enjoy an exclusive {int(discount_percent)}% OFF on your entire festive basket today.\n\n"
            f"📍 Visit us or reply to order directly on WhatsApp. Valid till Sunday!"
        )
        
        msg_hindi = (
            f"✨ शर्मा जनरल स्टोर्स की ओर से दिवाली की शुभकामनाएं! ✨\n\n"
            f"नमस्ते! बहुत दिनों से आप दुकान पर नहीं आए। इस दिवाली शुद्ध देसी घी और मेवों पर "
            f"पाएं विशेष {int(discount_percent)}% की छूट!\n\n"
            f"दुकान पर पधारें या सीधे व्हाट्सएप पर ऑर्डर करें।"
        )
        
        msg_marathi = (
            f"✨ शर्मा जनरल स्टोअर्स कडून दिवाळीच्या हार्दिक शुभेच्छा! ✨\n\n"
            f"नमस्कार! खूप दिवसांपासून आपली भेट झाली नाही. या दिवाळीत शुद्ध देशी तूप आणि सुकामेव्यावर "
            f"मिळवा खास {int(discount_percent)}% सवलत!\n\n"
            f"आजच दुकानाला भेट द्या किंवा व्हॉट्सॲपवर ऑर्डर करा."
        )

        # Uplift estimation (Treatment vs Control experimental framework)
        # Avg order value approx 850 INR, expected conversion uplift 18.5%
        avg_aov = 850.0
        conversion_rate_control = 0.04 # 4% without campaign
        expected_uplift = 0.185 # +18.5% incremental uplift
        expected_conversions = max(1, int(recipient_count * (conversion_rate_control + expected_uplift)))
        estimated_revenue = expected_conversions * avg_aov
        cost_per_msg = 0.40 # 40 paise per WhatsApp utility message
        estimated_cost = recipient_count * cost_per_msg

        campaign = Campaign(
            merchant_id=merchant_id,
            title=f"Diwali Re-engagement: {target_segment}",
            channel="WHATSAPP",
            target_segment=target_segment,
            message_template=msg_template,
            message_hindi=msg_hindi,
            message_marathi=msg_marathi,
            status="DRAFT",
            total_recipients=recipient_count,
            estimated_cost=round(estimated_cost, 2),
            estimated_revenue=round(estimated_revenue, 2),
            estimated_uplift_percent=round(expected_uplift * 100, 1)
        )
        db.add(campaign)
        await db.flush()
        
        # Create recipient records with randomized 80/20 treatment/control assignment
        for idx, cust in enumerate(customers):
            is_treatment = (idx % 5 != 0) # 80% treatment, 20% control
            recipient = CampaignRecipient(
                campaign_id=campaign.id,
                customer_id=cust.id,
                phone_number=cust.phone_number,
                delivery_status="PENDING",
                treatment_group="TREATMENT" if is_treatment else "CONTROL"
            )
            db.add(recipient)
            
        await db.commit()
        await db.refresh(campaign)
        logger.info(f"Campaign draft {campaign.id} created for {recipient_count} recipients with {campaign.estimated_uplift_percent}% uplift")
        return campaign

    @staticmethod
    async def get_campaigns(db: AsyncSession, merchant_id: str) -> List[Campaign]:
        stmt = select(Campaign).where(Campaign.merchant_id == merchant_id).order_by(Campaign.created_at.desc())
        result = await db.execute(stmt)
        return result.scalars().all()
