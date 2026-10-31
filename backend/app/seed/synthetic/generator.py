import random
import uuid
import hashlib
import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.core.database import AsyncSessionLocal, init_db, reset_db
from app.core.security import get_password_hash
from app.models.merchant import Merchant, MerchantProfile, MerchantPreferences, MerchantDevice
from app.models.inventory import Product, Inventory, Supplier, SupplierOrder, SupplierOrderItem
from app.models.customer import Customer
from app.models.transaction import Transaction, Settlement
from app.models.campaign import Campaign, CampaignRecipient
from app.models.approval import ApprovalRequest
from app.models.audit import AuditLog
from app.models.consent import Consent
from app.models.recommendation import Recommendation
from app.models.outcome import ActionOutcome
from app.seed.synthetic.constants import (
    DEMO_TODAY, SYNTHETIC_MERCHANTS, FESTIVALS_2026, HERO_ONDC_SUPPLIERS
)
from app.core.logging import logger

class SyntheticDataGenerator:
    def __init__(self, seed: int = 42, merchant_count: int = 12):
        self.seed = seed
        self.merchant_count = min(merchant_count, len(SYNTHETIC_MERCHANTS))
        random.seed(seed)

    async def generate_all(self, state: str = "before"):
        """
        Generates deterministic synthetic data across all 12 merchants.
        state options: 'before', 'mid', 'after'
        """
        logger.info(f"Generating synthetic dataset (seed={self.seed}, merchants={self.merchant_count}, state={state})...")
        await reset_db()
        async with AsyncSessionLocal() as db:

            # 2. Seed Merchants
            merchants = []
            for m_spec in SYNTHETIC_MERCHANTS[:self.merchant_count]:
                m = await self.create_merchant(db, m_spec)
                merchants.append(m)

            # Hero merchant is always index 0
            hero_m = merchants[0]

            # 3. Seed Suppliers & Products for all merchants
            for m in merchants:
                await self.seed_catalog_for_merchant(db, m)

            # 4. Seed Customers (Hero gets exactly 60 lapsed customers)
            hero_customers = []
            for m in merchants:
                custs = await self.seed_customers_for_merchant(db, m)
                if m.id == hero_m.id:
                    hero_customers = custs

            # 5. Seed 180 Days of Transactions & Settlements
            for m in merchants:
                await self.seed_transactions_for_merchant(db, m)

            # 6. Seed DPDPA Consents
            for m in merchants:
                await self.seed_consents(db, m)

            # 7. Seed ~50 Chained Audit Log Events for Hero Merchant
            await self.seed_audit_chain(db, hero_m)

            # 8. Seed Hero Recommendations & Approvals based on state ('before', 'mid', 'after')
            await self.setup_hero_state(db, hero_m, state)

            await db.commit()
            logger.info(f"Synthetic generation complete for state '{state}'!")

    async def clean_synthetic_data(self, db: AsyncSession):
        logger.info("Cleaning previous synthetic records...")
        await db.execute(delete(ActionOutcome))
        await db.execute(delete(Recommendation))
        await db.execute(delete(AuditLog))
        await db.execute(delete(ApprovalRequest))
        await db.execute(delete(CampaignRecipient))
        await db.execute(delete(Campaign))
        await db.execute(delete(Settlement))
        await db.execute(delete(Transaction))
        await db.execute(delete(Customer))
        await db.execute(delete(SupplierOrderItem))
        await db.execute(delete(SupplierOrder))
        await db.execute(delete(Inventory))
        await db.execute(delete(Product))
        await db.execute(delete(Supplier))
        await db.execute(delete(Consent))
        await db.execute(delete(MerchantDevice))
        await db.execute(delete(MerchantPreferences))
        await db.execute(delete(MerchantProfile))
        await db.execute(delete(Merchant))
        await db.commit()

    async def create_merchant(self, db: AsyncSession, spec: Dict[str, Any]) -> Merchant:
        m = Merchant(
            id=spec["id"],
            business_name=spec["business_name"],
            owner_name=spec["owner_name"],
            phone_number=spec["phone_number"],
            email=spec["email"],
            hashed_password=get_password_hash("diwali2026"),
            is_active=True,
            is_demo=spec.get("is_demo", False),
            is_synthetic=True,
            created_at=DEMO_TODAY - timedelta(days=spec["join_days_ago"])
        )
        db.add(m)
        await db.flush()

        profile = MerchantProfile(
            merchant_id=m.id,
            category=spec["category"],
            gstin=f"27AAACS{random.randint(1000, 9999)}F1Z5",
            pan=f"AAACS{random.randint(1000, 9999)}F",
            address=f"{spec['ward']}, Mumbai",
            city="Mumbai",
            state="Maharashtra",
            pincode=spec["pincode"],
            settlement_vpa=f"{spec['phone_number']}@paytm"
        )
        prefs = MerchantPreferences(
            merchant_id=m.id,
            preferred_language=spec["preferred_language"],
            whatsapp_notification_enabled=True,
            soundbox_announcement_enabled=True
        )
        device = MerchantDevice(
            merchant_id=m.id,
            device_type="SOUNDBOX",
            device_id=spec["soundbox_id"],
            model="Paytm Soundbox 4G (Voice Enabled)",
            battery_level=86.0
        )
        db.add_all([profile, prefs, device])
        return m

    async def seed_catalog_for_merchant(self, db: AsyncSession, m: Merchant):
        # 1. Suppliers
        suppliers = []
        for s_spec in HERO_ONDC_SUPPLIERS:
            s = Supplier(
                merchant_id=m.id,
                name=s_spec["name"],
                contact_person=s_spec["contact_person"],
                phone_number=s_spec["phone_number"],
                category=s_spec["category"],
                platform=s_spec["platform"],
                lead_time_days=s_spec["lead_time_days"],
                rating=s_spec["rating"]
            )
            suppliers.append(s)
            db.add(s)
        await db.flush()

        # 2. Products tailored for merchant type
        # For Hero: 42 products, including Pure Desi Cow Ghee (1 Litre) with stock=15, daily_sales=3.75 -> runs out in 4 days!
        from app.seed.seed_data import DEMO_PRODUCTS
        for idx, item in enumerate(DEMO_PRODUCTS):
            # Signature hero product: Pure Desi Cow Ghee (1 Litre)
            stock = 15.0 if item["sku"] == "GHEE-001" else float(item["stock"])
            daily_burn = 3.75 if item["sku"] == "GHEE-001" else float(item["daily_sales"])

            p = Product(
                merchant_id=m.id,
                sku=f"{item['sku']}-{m.id[:4]}",
                name=item["name"],
                name_hindi=item["name_hindi"],
                name_marathi=item["name_marathi"],
                category=item["category"],
                unit=item["unit"],
                selling_price=item["price"],
                cost_price=item["cost"],
                is_festive=item["festive"]
            )
            db.add(p)
            await db.flush()

            inv = Inventory(
                merchant_id=m.id,
                product_id=p.id,
                current_stock=stock,
                safety_stock=float(item["safety"]),
                reorder_quantity=50.0,
                avg_daily_sales=daily_burn,
                stock_coverage_days=round(stock / daily_burn, 1) if daily_burn > 0 else 10.0
            )
            db.add(inv)

    async def seed_customers_for_merchant(self, db: AsyncSession, m: Merchant) -> List[Customer]:
        from app.seed.seed_data import INDIAN_CUSTOMER_NAMES
        is_hero = "hero" in m.id
        target = 450 if is_hero else 250
        customers = []

        # For Hero Merchant: exactly 60 customers lapsed 30+ days (recency 31-65 days)
        # who previously bought ghee / sweets!
        for i in range(target):
            name = INDIAN_CUSTOMER_NAMES[i % len(INDIAN_CUSTOMER_NAMES)]
            if i >= len(INDIAN_CUSTOMER_NAMES):
                name = f"{name} {i // len(INDIAN_CUSTOMER_NAMES) + 1}"

            if is_hero and i < 60:
                # The exact 60 lapsed customers for the Diwali campaign!
                recency = random.randint(31, 62)
                orders = random.randint(5, 12)
                spend = random.randint(3500, 11000)
                seg = "At-Risk Customers"
            elif i < target * 0.15:
                recency = random.randint(1, 4)
                orders = random.randint(15, 30)
                spend = random.randint(12000, 30000)
                seg = "Champions"
            elif i < target * 0.70:
                recency = random.randint(3, 14)
                orders = random.randint(6, 14)
                spend = random.randint(4500, 12000)
                seg = "Loyal Customers"
            else:
                recency = random.randint(15, 45)
                orders = random.randint(2, 6)
                spend = random.randint(1500, 5000)
                seg = "Potential Loyalists"

            c = Customer(
                merchant_id=m.id,
                name=name,
                phone_number=f"98{random.randint(10000000, 99999999)}",
                total_orders=orders,
                total_spend=float(spend),
                last_purchase_date=DEMO_TODAY - timedelta(days=recency),
                recency_days=recency,
                segment=seg,
                churn_probability=0.75 if seg == "At-Risk Customers" else 0.15
            )
            customers.append(c)
            db.add(c)
        await db.flush()
        return customers

    async def seed_transactions_for_merchant(self, db: AsyncSession, m: Merchant):
        # 180 days of realistic history
        # Today's date is DEMO_TODAY
        days_history = 7 if "coldstart" in m.id else 180
        daily_base = 6 if "lowvol" in m.id else 35

        for d_idx in range(days_history, -1, -1):
            cur_date = DEMO_TODAY - timedelta(days=d_idx)
            is_weekend = cur_date.weekday() in [5, 6]
            multiplier = 1.3 if is_weekend else 1.0

            # Festive boost in late October
            if d_idx <= 15:
                multiplier *= 1.45 # Festive shopping buildup

            tx_count = max(2, int(daily_base * multiplier + random.randint(-4, 6)))
            daily_total = 0.0

            for _ in range(tx_count):
                # Ticket size: log-normal around ₹750
                amount = round(random.choice([150, 280, 450, 620, 850, 1200, 1850, 2400]) + random.uniform(5, 40), 2)
                method = random.choices(
                    ["UPI", "SOUNDBOX_QR", "CASH", "CARD"],
                    weights=[45, 25, 25, 5]
                )[0]

                # Peak hours: 9-12 morning, 17-21 evening
                hour = random.choice([9, 10, 11, 12, 17, 18, 19, 20, 21])
                txn = Transaction(
                    merchant_id=m.id,
                    amount=amount,
                    currency="INR",
                    status="SUCCESS",
                    payment_method=method,
                    paytm_order_id=f"PTM-{uuid.uuid4().hex[:10].upper()}",
                    paytm_txn_id=f"TXN-{random.randint(1000000000, 9999999999)}",
                    provenance_source="demo",
                    is_synthetic=True,
                    created_at=cur_date.replace(hour=hour, minute=random.randint(0, 59))
                )
                db.add(txn)
                daily_total += amount

            # T+1 Settlement (excluding today)
            if d_idx > 0:
                settlement = Settlement(
                    merchant_id=m.id,
                    settlement_reference=f"SETTLE-{cur_date.strftime('%Y%m%d')}-{m.id[-8:]}",
                    gross_amount=round(daily_total * 0.75, 2), # 75% digital
                    net_amount=round(daily_total * 0.745, 2),
                    status="SETTLED",
                    destination_vpa=f"{m.phone_number}@paytm",
                    settled_at=cur_date + timedelta(days=1, hours=7),
                    created_at=cur_date
                )
                db.add(settlement)

    async def seed_consents(self, db: AsyncSession, m: Merchant):
        consents = [
            ("SALES_ANALYTICS", ["TRANSACTIONS", "SETTLEMENTS"], "Processing transaction volumes for sales analytics"),
            ("INVENTORY_AUTOMATION", ["INVENTORY", "SUPPLIERS"], "Forecasting stockouts and preparing supplier orders"),
            ("CUSTOMER_MARKETING", ["CUSTOMER_PHONE_NUMBERS"], "Generating personalized WhatsApp festive offers with consent"),
            ("VOICE_PROCESSING", ["AUDIO_RECORDINGS"], "Transcribing spoken Hindi and Marathi for voice interactions")
        ]
        for purp, cats, desc in consents:
            c = Consent(
                merchant_id=m.id,
                purpose=purp,
                data_categories=cats,
                processing_activity=desc,
                status="GRANTED"
            )
            db.add(c)

    async def seed_audit_chain(self, db: AsyncSession, m: Merchant):
        """Creates ~50 cryptographically chained SHA-256 audit log records."""
        prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        actions = [
            ("MERCHANT_ONBOARDED", {"plan": "PAYTM_AI_RETAIL_PARTNER"}),
            ("SOUNDBOX_ACTIVATED", {"device_id": "SB-MUM-4G-9820"}),
            ("INVENTORY_INITIALIZED", {"skus_loaded": 42}),
            ("DIWALI_FORECAST_CALCULATED", {"horizon_days": 14, "model": "LightGBM_Prophet_Ensemble"}),
            ("STOCK_OUT_WARNING_TRIGGERED", {"sku": "GHEE-001", "days_left": 4}),
            ("ONDC_SUPPLIER_DISCOVERED", {"supplier": "Mahalaxmi Wholesale Distributors", "rating": 4.9}),
            ("CAMPAIGN_DRAFTED", {"segment": "At-Risk Customers", "target_count": 60}),
            ("SETTLEMENT_PROCESSED", {"amount": 30386.0, "status": "SETTLED"})
        ]

        now = DEMO_TODAY - timedelta(days=10)
        for i in range(50):
            action, payload = actions[i % len(actions)]
            ts = now + timedelta(hours=i * 4)
            curr_hash = AuditLog.generate_hash(m.id, action, prev_hash, ts, payload)

            entry = AuditLog(
                merchant_id=m.id,
                action_type=action,
                previous_hash=prev_hash,
                current_hash=curr_hash,
                input_payload=payload,
                status="SUCCESS",
                timestamp=ts
            )
            db.add(entry)
            prev_hash = curr_hash

    async def setup_hero_state(self, db: AsyncSession, hero_m: Merchant, state: str):
        """
        Sets up the 3 demo states for the hero story:
        'before': Ghee order & WhatsApp campaign drafted, pending merchant approval
        'mid': Merchant tapped approve; ONDC order placed, WhatsApp dispatched
        'after': Execution completed, measured causal uplift & savings shown in Results!
        """
        # 1. Draft Supplier Order Approval
        order_approval = ApprovalRequest(
            id="hero-approval-ghee-reorder",
            merchant_id=hero_m.id,
            action_type="SUPPLIER_ORDER",
            title="Approve Diwali Restock: Pure Desi Cow Ghee (45 Litres)",
            business_justification=(
                "Pure Desi Cow Ghee will run out in 4 days (Thursday before Diwali). "
                "Restocking 45 litres from Mahalaxmi Wholesale Distributors protects ₹18,500 in festive sales."
            ),
            estimated_amount=20250.0,
            status="PENDING" if state == "before" else "COMPLETED",
            idempotency_key="IDEMP-HERO-GHEE-2026",
            action_payload={
                "supplier_name": "Mahalaxmi Wholesale Distributors",
                "supplier_id": "supplier-mahalaxmi",
                "items": [{"name": "Pure Desi Cow Ghee (1 Litre)", "quantity": 45, "unit_price": 450.0}],
                "lead_time": "2 days"
            },
            data_sources_used=["Paytm Soundbox Records", "Festive Demand Surge", "Shop Stock Count"]
        )
        db.add(order_approval)
        await db.flush()

        # 2. Draft Campaign & Campaign Approval
        camp = Campaign(
            id="hero-campaign-diwali-lapsed",
            merchant_id=hero_m.id,
            title="Diwali Special 10% Off for 60 Inactive Customers",
            channel="WHATSAPP",
            target_segment="At-Risk Customers",
            message_template="दिवाळी सणानिमित्त तुमच्यासाठी विशेष १०% सवलत! श्री साई किराणा दुकानात आजच भेट द्या.",
            message_marathi="दिवाळी सणानिमित्त तुमच्यासाठी विशेष १०% सवलत! श्री साई किराणा दुकानात आजच भेट द्या.",
            message_hindi="दिवाली पर आपके लिए खास 10% छूट! श्री साई किराना स्टोर पर आज ही पधारें।",
            total_recipients=60,
            estimated_cost=60.0,
            estimated_revenue=12600.0,
            status="DRAFT" if state == "before" else "DISPATCHED"
        )
        db.add(camp)
        await db.flush()

        # Seed 60 recipients (48 Treatment, 12 Control = 20% holdout!)
        cust_res = await db.execute(
            select(Customer).where(Customer.merchant_id == hero_m.id, Customer.segment == "At-Risk Customers").limit(60)
        )
        recip_custs = cust_res.scalars().all()
        for idx, c in enumerate(recip_custs):
            is_control = (idx % 5 == 0) # exactly 20% holdout!
            group = "CONTROL" if is_control else "TREATMENT"
            
            # If state is 'after', set conversions:
            # Treated: ~35% conversion (e.g. 17 out of 48)
            # Control: ~15% conversion (e.g. 2 out of 12)
            has_conv = False
            if state == "after":
                if group == "TREATMENT":
                    has_conv = (idx % 3 == 0 or idx % 7 == 0) and (idx % 11 != 0)
                else:
                    has_conv = (idx == 0 or idx == 30)

            recip = CampaignRecipient(
                campaign_id=camp.id,
                customer_id=c.id,
                phone_number=c.phone_number,
                delivery_status="DELIVERED" if state in ["mid", "after"] else "PENDING",
                treatment_group=group,
                has_converted=has_conv
            )
            db.add(recip)

        campaign_approval = ApprovalRequest(
            id="hero-approval-whatsapp-campaign",
            merchant_id=hero_m.id,
            action_type="CAMPAIGN_BROADCAST",
            title="Approve Diwali WhatsApp Broadcast to 60 Inactive Customers",
            business_justification=(
                "60 loyal customers haven't visited in 30+ days. "
                "Sending a 10% Diwali coupon brings ~35% back, generating approx ₹12,600 in extra festival revenue."
            ),
            estimated_amount=60.0,
            status="PENDING" if state == "before" else "COMPLETED",
            idempotency_key="IDEMP-HERO-WHATSAPP-2026",
            action_payload={"campaign_id": camp.id, "message_text": camp.message_template},
            data_sources_used=["30+ days absence", "Previous purchase history", "Diwali festival calendar"]
        )
        db.add(campaign_approval)
        await db.flush()

        # 3. Create the Top 3 Unified Recommendations
        rec1 = Recommendation(
            id="rec-hero-ghee-stockout",
            merchant_id=hero_m.id,
            type="STOCK",
            headline="Desi Ghee will run out Thursday before Diwali — Reorder 45 Litres",
            headline_mr="दिवाळीपूर्वी गुरुवारी देशी तूप संपेल — ४५ लिटरची ऑर्डर द्या",
            headline_hi="दिवाली से पहले गुरुवार को देसी घी खत्म होगा — 45 लीटर का ऑर्डर दें",
            why="Current stock is only 15 units. At 3.8 units/day festival demand, stock will run out in 4 days. Reordering protects ₹18,500 in holiday sales.",
            why_mr="सध्या फक्त १५ लिटर तूप शिल्लक आहे. सणाच्या ३.८ लिटर/दिवस मागणीमुळे ४ दिवसांत साठा संपेल. ४५ लिटर मागवल्यास ₹१८,५०० ची विक्री सुरक्षित राहील.",
            why_hi="दुकान में केवल 15 लीटर घी बचा है। त्योहारी मांग से 4 दिन में खत्म हो जाएगा। नया ऑर्डर देने से ₹18,500 की बिक्री सुरक्षित होगी।",
            expected_impact_inr=18500.0,
            confidence="High",
            confidence_score=0.95,
            action_type="SUPPLIER_ORDER",
            approval_id=order_approval.id,
            signals_used=["दिवाळी अवघ्या ९ दिवसांवर (Diwali in 9 days)", "सणात तुपाची विक्री ३ पट वाढते", "स्थानिक घाऊक व्यापारी उपलब्ध"],
            status="PENDING" if state == "before" else "APPROVED",
            is_top_action=True,
            rank=1
        )
        rec2 = Recommendation(
            id="rec-hero-whatsapp-campaign",
            merchant_id=hero_m.id,
            type="CUSTOMER",
            headline="Bring back 60 inactive customers with 10% Diwali WhatsApp offer",
            headline_mr="६० जुन्या ग्राहकांसाठी १०% दिवाळी सवलत व्हॉट्सॲप संदेश पाठवा",
            headline_hi="60 पुराने ग्राहकों को 10% दिवाली स्पेशल व्हाट्सएप ऑफर भेजें",
            why="60 regular customers haven't visited in 30+ days. A festive greeting coupon typically reactivates 35% of shoppers, adding ₹12,600 extra revenue.",
            why_mr="६० नियमित ग्राहक गेल्या ३० दिवसांत आलेले नाहीत. १०% सवलत दिल्यास ३५% ग्राहक परत येऊन ₹१२,६०० ची अतिरिक्त कमाई होईल.",
            why_hi="60 नियमित ग्राहक 30+ दिनों से नहीं आए हैं। 10% स्पेशल छूट से 35% ग्राहक वापस आकर लगभग ₹12,600 का अतिरिक्त सामान खरीदेंगे।",
            expected_impact_inr=12600.0,
            confidence="High",
            confidence_score=0.92,
            action_type="CAMPAIGN_BROADCAST",
            approval_id=campaign_approval.id,
            signals_used=["६० ग्राहक ३० दिवसांपासून गैरहजर", "दिवाळी सणाच्या खरेदीची सुरुवात", "१०% कूपन ऑफर"],
            status="PENDING" if state == "before" else "APPROVED",
            is_top_action=True,
            rank=2
        )
        rec3 = Recommendation(
            id="rec-hero-working-capital",
            merchant_id=hero_m.id,
            type="CAPITAL",
            headline="Activate pre-qualified ₹50,000 Diwali credit line for festival stock",
            headline_mr="दिवाळी मालासाठी ₹५०,००० ची पूर्व-मंजूर खेळते भांडवल सुविधा घ्या",
            headline_hi="त्योहार का माल भरने के लिए ₹50,000 की प्री-अप्रूव्ड क्रेडिट लाइन लें",
            why="Based on steady ₹40,000+ daily Soundbox sales, you qualify for ₹50,000 stock-up credit with easy 1.2% daily settlement deduction.",
            why_mr="साउंडबॉक्सवरील दररोजच्या ₹४०,०००+ चांगल्या विक्रीमुळे तुम्ही ₹५०,००० च्या सुविधेसाठी पात्र आहात. रोजच्या सेटलमेंटमधून १.२% सुलभ कपात होईल.",
            why_hi="साउंडबॉक्स पर रोजाना ₹40,000+ की अच्छी बिक्री के आधार पर आप ₹50,000 के स्टॉक लोन हेतु पात्र हैं। 1.2% दैनिक सेटलमेंट से आसान भुगतान होगा।",
            expected_impact_inr=9000.0,
            confidence="Medium",
            confidence_score=0.75,
            action_type="LENDING_APPLICATION",
            signals_used=["साउंडबॉक्स दैनिक सरासरी ₹४०,०००+", "दिवाळी साठा भरण्याची वेळ", "सुलभ दैनिक कपात"],
            status="PENDING",
            is_top_action=True,
            rank=3
        )
        db.add_all([rec1, rec2, rec3])

        # If state is 'after', record the measured outcomes!
        if state == "after":
            outcome1 = ActionOutcome(
                id="hero-outcome-whatsapp",
                merchant_id=hero_m.id,
                action_type="CAMPAIGN_BROADCAST",
                approval_id=campaign_approval.id,
                title="दिवाळी व्हॉट्सॲप मोहीम प्रत्यक्ष निकाल (Diwali WhatsApp Campaign Results)",
                status="MEASURED",
                treated_count=48,
                control_count=12,
                treated_conversions=17, # ~35.4%
                control_conversions=2,  # ~16.7%
                treated_rate=0.354,
                control_rate=0.167,
                incremental_rate=0.187,
                incremental_revenue_inr=5834.0, # (0.354 - 0.167) * 48 * 650
                plain_language_summary="48 customers messaged, 17 came back (35%). Without the message about 8 (17%) would have. You earned about ₹5,834 extra.",
                plain_language_summary_mr="४८ ग्राहकांना मेसेज पाठवला, त्यातील १७ ग्राहक परत खरेदीला आले (३५%). मेसेज न पाठवता फक्त ८ आले असते. तुम्हाला अंदाजे ₹५,८३४ अतिरिक्त नफा मिळाला.",
                plain_language_summary_hi="48 ग्राहकों को मैसेज भेजा गया, जिनमें से 17 वापस आए (35%)। बिना मैसेज केवल 8 आते। आपको लगभग ₹5,834 की अतिरिक्त कमाई हुई।"
            )
            outcome2 = ActionOutcome(
                id="hero-outcome-ghee",
                merchant_id=hero_m.id,
                action_type="SUPPLIER_ORDER",
                approval_id=order_approval.id,
                title="देशी तूप साठा संरक्षण निकाल (Stockout Prevention Outcome)",
                status="MEASURED",
                stock_loss_avoided_inr=18500.0,
                incremental_revenue_inr=18500.0,
                plain_language_summary="Restocked 45 litres of Desi Ghee before Diwali stock-out. Avoided losing 38 customer purchases, protecting ₹18,500 in holiday sales.",
                plain_language_summary_mr="दिवाळीपूर्वी ४५ लिटर देशी तूप वेळेत मागवल्याने साठा संपला नाही. ३८ ग्राहकांचे खरेदी नुकसान टळले आणि ₹१८,५०० ची विक्री सुरक्षित राहिली.",
                plain_language_summary_hi="दिवाली से पहले 45 लीटर देसी घी का स्टॉक आ गया। 38 ग्राहकों का नुकसान बचा और ₹18,500 की बिक्री सुरक्षित रही।"
            )
            db.add_all([outcome1, outcome2])
