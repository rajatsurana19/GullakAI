import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.merchant import Merchant, MerchantProfile, MerchantPreferences, MerchantDevice
from app.models.inventory import Product, Inventory, Supplier, SupplierOrder, SupplierOrderItem
from app.models.customer import Customer
from app.models.transaction import Transaction, Settlement
from app.models.campaign import Campaign
from app.models.consent import Consent
from app.services.audit_service import AuditService
from app.core.logging import logger

DEMO_PRODUCTS = [
    {"sku": "GHEE-001", "name": "Pure Desi Cow Ghee (1 Litre)", "name_hindi": "शुद्ध गाय का देसी घी (1 लीटर)", "name_marathi": "शुद्ध देशी गायीचे तूप (1 लिटर)", "category": "Dairy & Ghee", "unit": "litre", "cost": 450.0, "price": 620.0, "festive": True, "stock": 8.0, "safety": 15.0, "daily_sales": 3.8},
    {"sku": "GHEE-005", "name": "Pure Buffalo Ghee Tin (5 Litre)", "name_hindi": "भैंस का घी टिन (5 लीटर)", "name_marathi": "म्हशीचे तूप डबा (5 लिटर)", "category": "Dairy & Ghee", "unit": "tin", "cost": 2100.0, "price": 2750.0, "festive": True, "stock": 4.0, "safety": 8.0, "daily_sales": 1.5},
    {"sku": "DRYF-001", "name": "Royal Diwali Dry Fruits Hamper (1 kg)", "name_hindi": "रॉयल दिवाली ड्राई फ्रूट हैम्पर (1 किग्रा)", "name_marathi": "रॉयल दिवाळी सुकामेवा भेटपेटी (1 किलो)", "category": "Festive & Sweets", "unit": "box", "cost": 650.0, "price": 999.0, "festive": True, "stock": 6.0, "safety": 20.0, "daily_sales": 4.2},
    {"sku": "DRYF-002", "name": "Premium California Almonds (500g)", "name_hindi": "प्रीमियम कैलिफ़ोर्निया बादाम (500 ग्राम)", "name_marathi": "प्रीमियम बदाम (500 ग्रॅम)", "category": "Festive & Sweets", "unit": "packet", "cost": 320.0, "price": 460.0, "festive": True, "stock": 14.0, "safety": 15.0, "daily_sales": 2.5},
    {"sku": "DRYF-003", "name": "Kaju W320 Whole Cashews (500g)", "name_hindi": "काजू साबुत (500 ग्राम)", "name_marathi": "काजू (500 ग्रॅम)", "category": "Festive & Sweets", "unit": "packet", "cost": 340.0, "price": 490.0, "festive": True, "stock": 11.0, "safety": 15.0, "daily_sales": 2.8},
    {"sku": "RICE-001", "name": "Daawat Rozana Basmati Rice (5 kg)", "name_hindi": "दावत बासमती चावल (5 किग्रा)", "name_marathi": "दावत बासमती तांदूळ (5 किलो)", "category": "Grains & Rice", "unit": "bag", "cost": 310.0, "price": 425.0, "festive": False, "stock": 28.0, "safety": 15.0, "daily_sales": 3.0},
    {"sku": "ATTA-001", "name": "Aashirvaad Shudh Chakki Atta (10 kg)", "name_hindi": "आशीर्वाद शुद्ध चक्की आटा (10 किग्रा)", "name_marathi": "आशीर्वाद चक्की आटा (10 किलो)", "category": "Grains & Rice", "unit": "bag", "cost": 380.0, "price": 460.0, "festive": False, "stock": 35.0, "safety": 20.0, "daily_sales": 5.0},
    {"sku": "OIL-001", "name": "Fortune Sunlite Refined Oil (1 Litre)", "name_hindi": "फॉर्च्यून रिफाइंड तेल (1 लीटर)", "name_marathi": "फॉर्च्यून रिफाइंड तेल (1 लिटर)", "category": "Oils & Spices", "unit": "pouch", "cost": 110.0, "price": 138.0, "festive": False, "stock": 42.0, "safety": 25.0, "daily_sales": 6.5},
    {"sku": "OIL-002", "name": "Engine Brand Kachi Ghani Mustard Oil (1L)", "name_hindi": "सरसों का तेल (1 लीटर)", "name_marathi": "मोहरीचे तेल (1 लिटर)", "category": "Oils & Spices", "unit": "bottle", "cost": 125.0, "price": 155.0, "festive": False, "stock": 25.0, "safety": 15.0, "daily_sales": 2.2},
    {"sku": "SUG-001", "name": "Madhur Pure & Hygienic Sugar (5 kg)", "name_hindi": "मधुर शुद्ध चीनी (5 किग्रा)", "name_marathi": "मधुर साखर (5 किलो)", "category": "Staples", "unit": "bag", "cost": 195.0, "price": 240.0, "festive": True, "stock": 18.0, "safety": 20.0, "daily_sales": 4.0},
    {"sku": "TEA-001", "name": "Tata Tea Gold (500g)", "name_hindi": "टाटा टी गोल्ड (500 ग्राम)", "name_marathi": "टाटा चहा गोल्ड (500 ग्रॅम)", "category": "Beverages", "unit": "packet", "cost": 215.0, "price": 270.0, "festive": False, "stock": 30.0, "safety": 15.0, "daily_sales": 3.2},
    {"sku": "SPICE-001", "name": "Everest Garam Masala (100g)", "name_hindi": "एवरेस्ट गरम मसाला (100 ग्राम)", "name_marathi": "एव्हरेस्ट गरम मसाला (100 ग्रॅम)", "category": "Oils & Spices", "unit": "box", "cost": 65.0, "price": 85.0, "festive": False, "stock": 40.0, "safety": 20.0, "daily_sales": 3.0},
    {"sku": "SPICE-002", "name": "MDH Deggi Mirch Powder (100g)", "name_hindi": "एमडीएच देगी मिर्च (100 ग्राम)", "name_marathi": "एमडीएच देगी मिरची (100 ग्रॅम)", "category": "Oils & Spices", "unit": "box", "cost": 62.0, "price": 80.0, "festive": False, "stock": 35.0, "safety": 15.0, "daily_sales": 2.8},
    {"sku": "POOJA-001", "name": "Handmade Terracotta Diwali Diyas (Pack of 12)", "name_hindi": "मिट्टी के दीये (12 का पैक)", "name_marathi": "मातीचे दिवे (12 चा संच)", "category": "Festive & Sweets", "unit": "pack", "cost": 35.0, "price": 80.0, "festive": True, "stock": 22.0, "safety": 50.0, "daily_sales": 8.0},
    {"sku": "POOJA-002", "name": "Mangaldeep Sandalwood Agarbatti (Pack of 3)", "name_hindi": "मंगलदीप अगरबत्ती (3 का पैक)", "name_marathi": "मंगलदीप अगरबत्ती (3 चा संच)", "category": "Festive & Sweets", "unit": "pack", "cost": 45.0, "price": 65.0, "festive": True, "stock": 50.0, "safety": 30.0, "daily_sales": 4.5},
    {"sku": "DAIRY-001", "name": "Amul Taaza Homogenised Toned Milk (1 Litre)", "name_hindi": "अमूल ताज़ा दूध (1 लीटर)", "name_marathi": "अमुल ताझा दूध (1 लिटर)", "category": "Dairy & Ghee", "unit": "tetra", "cost": 62.0, "price": 72.0, "festive": False, "stock": 45.0, "safety": 30.0, "daily_sales": 15.0},
    {"sku": "SNACK-001", "name": "Haldiram's Nagpur Soan Papdi (500g)", "name_hindi": "हल्दीराम सोन पापड़ी (500 ग्राम)", "name_marathi": "हल्दीराम सोन पापडी (500 ग्रॅम)", "category": "Festive & Sweets", "unit": "box", "cost": 120.0, "price": 170.0, "festive": True, "stock": 9.0, "safety": 25.0, "daily_sales": 5.0},
    {"sku": "SNACK-002", "name": "Bikaji Bhujia Sev (1 kg)", "name_hindi": "बीकाजी भुजिया सेव (1 किग्रा)", "name_marathi": "बिकाजी भुजिया शेव (1 किलो)", "category": "Snacks", "unit": "packet", "cost": 190.0, "price": 250.0, "festive": False, "stock": 24.0, "safety": 15.0, "daily_sales": 3.1},
    {"sku": "CLEAN-001", "name": "Surf Excel Easy Wash Detergent (1 kg)", "name_hindi": "सर्फ एक्सेल डिटर्जेंट (1 किग्रा)", "name_marathi": "सर्फ एक्सेल डिटर्जंट (1 किलो)", "category": "Household", "unit": "packet", "cost": 115.0, "price": 145.0, "festive": False, "stock": 30.0, "safety": 15.0, "daily_sales": 2.5},
    {"sku": "CLEAN-002", "name": "Dettol Antiseptic Liquid (500ml)", "name_hindi": "डेटॉल लिक्विड (500 मिली)", "name_marathi": "डेटॉल लिक्विड (500 मिली)", "category": "Household", "unit": "bottle", "cost": 160.0, "price": 205.0, "festive": False, "stock": 20.0, "safety": 10.0, "daily_sales": 1.2}
]

INDIAN_CUSTOMER_NAMES = [
    "Rajesh Patil", "Sunita Deshmukh", "Anil Kadam", "Pooja Shinde", "Sachin More",
    "Deepak Joshi", "Neha Kulkarni", "Amit Sharma", "Kavita Rane", "Prakash Sawant",
    "Ramesh Pawar", "Vandana Gokhale", "Suresh Jadhav", "Meena Gaikwad", "Ganesh Tambe",
    "Rohit Bhosale", "Anita Chavan", "Vikram Kale", "Smita Salvi", "Manoj Shirke",
    "Sunil Thakre", "Swati Mahajan", "Kishore Ghag", "Asha Narvekar", "Mahesh Tendulkar"
]

async def check_and_seed_database():
    """Checks if database contains the demo merchant; seeds if missing."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        if res.scalar_one_or_none():
            logger.info("Demo database already seeded. Skipping seed.")
            return

        logger.info("Seeding Sharma General Stores demo environment...")
        
        # 1. Create Merchant
        merchant = Merchant(
            business_name="Sharma General Stores",
            owner_name="Ramesh Sharma",
            phone_number="9820012345",
            email="ramesh.sharma@paytm.demo",
            hashed_password=get_password_hash("diwali2026"),
            is_active=True,
            is_demo=True
        )
        db.add(merchant)
        await db.flush()

        # 2. Profile & Preferences & Devices
        profile = MerchantProfile(
            merchant_id=merchant.id,
            category="Grocery & General Store",
            gstin="27AABCS1234F1Z5",
            pan="AABCS1234F",
            address="Shop 14, Dadar West Market, Mumbai",
            city="Mumbai",
            state="Maharashtra",
            pincode="400028",
            settlement_vpa="sharma.stores@paytm"
        )
        prefs = MerchantPreferences(
            merchant_id=merchant.id,
            preferred_language="mr",
            whatsapp_notification_enabled=True,
            soundbox_announcement_enabled=True
        )
        device = MerchantDevice(
            merchant_id=merchant.id,
            device_type="SOUNDBOX",
            device_id="SB-MUM-4G-9820",
            model="Paytm Soundbox 4G (Voice Enabled)",
            battery_level=88.0,
            firmware_version="v4.2.1-indic"
        )
        db.add_all([profile, prefs, device])

        # 3. Suppliers
        suppliers_data = [
            ("Mahalaxmi Wholesale Distributors", "Rakesh Agarwal", "9821144556", "Dairy & Festive Hampers", "DIRECT_DISTRIBUTOR", 2, 4.9),
            ("Gujarat Cooperative Milk Federation (Amul)", "Devang Patel", "9820088991", "Dairy & Ghee", "DIRECT_DISTRIBUTOR", 1, 4.8),
            ("Mumbai Mandi Grain Traders", "Kailash Shah", "9822233445", "Grains & Rice", "ONDC_NETWORK", 3, 4.6),
            ("Hindustan FMCG Supply Hub", "Pankaj Varma", "9819977665", "Household & Staples", "ONDC_NETWORK", 2, 4.7)
        ]
        suppliers = []
        for name, cp, phone, cat, plat, lead, rating in suppliers_data:
            s = Supplier(
                merchant_id=merchant.id,
                name=name,
                contact_person=cp,
                phone_number=phone,
                category=cat,
                platform=plat,
                lead_time_days=lead,
                rating=rating
            )
            suppliers.append(s)
            db.add(s)
        await db.flush()

        # 4. Products & Inventory
        for item in DEMO_PRODUCTS:
            prod = Product(
                merchant_id=merchant.id,
                sku=item["sku"],
                name=item["name"],
                name_hindi=item["name_hindi"],
                name_marathi=item["name_marathi"],
                category=item["category"],
                unit=item["unit"],
                selling_price=item["price"],
                cost_price=item["cost"],
                is_festive=item["festive"]
            )
            db.add(prod)
            await db.flush()

            inv = Inventory(
                merchant_id=merchant.id,
                product_id=prod.id,
                current_stock=item["stock"],
                safety_stock=item["safety"],
                reorder_quantity=item["safety"] * 2.5,
                avg_daily_sales=item["daily_sales"],
                stock_coverage_days=round(item["stock"] / item["daily_sales"], 1)
            )
            db.add(inv)

        # 5. Customers (100 customers with RFM segmentation)
        customers = []
        for i in range(100):
            name = INDIAN_CUSTOMER_NAMES[i % len(INDIAN_CUSTOMER_NAMES)]
            if i >= len(INDIAN_CUSTOMER_NAMES):
                name = f"{name} {i // len(INDIAN_CUSTOMER_NAMES) + 1}"

            # Create specific segment distributions
            if i < 20:
                # Champions
                recency = random.randint(1, 4)
                orders = random.randint(15, 35)
                spend = random.randint(12000, 32000)
                seg = "Champions"
            elif i < 45:
                # Loyal Customers
                recency = random.randint(3, 10)
                orders = random.randint(8, 18)
                spend = random.randint(6000, 15000)
                seg = "Loyal Customers"
            elif i < 65:
                # Potential Loyalists
                recency = random.randint(2, 12)
                orders = random.randint(3, 7)
                spend = random.randint(2500, 7000)
                seg = "Potential Loyalists"
            elif i < 75:
                # New Customers
                recency = random.randint(1, 7)
                orders = 1
                spend = random.randint(450, 1800)
                seg = "New Customers"
            elif i < 90:
                # At-Risk Customers (Signature Scenario target: 24 at-risk customers)
                recency = random.randint(32, 58)
                orders = random.randint(5, 14)
                spend = random.randint(4500, 11000)
                seg = "At-Risk Customers"
            else:
                # Lost Customers
                recency = random.randint(65, 120)
                orders = random.randint(2, 5)
                spend = random.randint(1200, 3500)
                seg = "Lost Customers"

            c = Customer(
                merchant_id=merchant.id,
                name=name,
                phone_number=f"98{random.randint(10000000, 99999999)}",
                total_orders=orders,
                total_spend=float(spend),
                last_purchase_date=datetime.utcnow() - timedelta(days=recency),
                recency_days=recency,
                segment=seg,
                churn_probability=0.75 if seg == "At-Risk Customers" else 0.15
            )
            customers.append(c)
            db.add(c)
        await db.flush()

        # 6. Transactions (500+ transactions spanning 30 days)
        now = datetime.utcnow()
        txns_created = 0
        for day in range(30, -1, -1):
            day_date = now - timedelta(days=day)
            # More transactions closer to Diwali festive days
            daily_count = random.randint(15, 25) if day > 5 else random.randint(28, 42)
            
            for _ in range(daily_count):
                cust = random.choice(customers)
                amount = round(random.choice([120, 250, 450, 620, 850, 999, 1250, 1600, 2400, 3200]) + random.uniform(5, 45), 2)
                method = random.choice(["UPI", "UPI", "UPI", "SOUNDBOX_QR", "SOUNDBOX_QR", "CARD", "CASH"])
                
                txn = Transaction(
                    merchant_id=merchant.id,
                    customer_id=cust.id,
                    amount=amount,
                    currency="INR",
                    status="SUCCESS",
                    payment_method=method,
                    paytm_order_id=f"PTM-ORD-{uuid.uuid4().hex[:12].upper()}",
                    paytm_txn_id=f"TXN-{random.randint(1000000000, 9999999999)}",
                    payer_name=cust.name,
                    payer_vpa=f"{cust.phone_number}@paytm",
                    provenance_source="demo",
                    created_at=day_date.replace(hour=random.randint(8, 21), minute=random.randint(0, 59))
                )
                db.add(txn)
                txns_created += 1

        # 7. Today's Settlements
        settlement = Settlement(
            merchant_id=merchant.id,
            settlement_reference=f"SETTLE-{datetime.utcnow().strftime('%Y%m%d')}-01",
            gross_amount=28450.0,
            net_amount=28450.0,
            status="SETTLED",
            destination_vpa="sharma.stores@paytm",
            destination_bank="Paytm Payments Bank / HDFC",
            transaction_count=36,
            settled_at=now - timedelta(hours=4),
            provenance_source="demo"
        )
        db.add(settlement)

        # 8. DPDPA 2023 Consents
        consents_data = [
            ("SALES_ANALYTICS", ["TRANSACTIONS", "SETTLEMENTS"], "Processing transaction volumes for sales and revenue analytics"),
            ("INVENTORY_AUTOMATION", ["INVENTORY", "SUPPLIERS"], "Forecasting stockouts and preparing supplier reorder drafts"),
            ("CUSTOMER_MARKETING", ["CUSTOMER_PHONE_NUMBERS", "PURCHASE_HISTORY"], "Generating personalized WhatsApp festive offers with customer consent"),
            ("VOICE_PROCESSING", ["AUDIO_RECORDINGS", "INDIC_SPEECH"], "Transcribing spoken Hindi and Marathi for voice-based agent interactions")
        ]
        for purp, cats, desc in consents_data:
            c = Consent(
                merchant_id=merchant.id,
                purpose=purp,
                data_categories=cats,
                processing_activity=desc,
                status="GRANTED"
            )
            db.add(c)

        await db.commit()
        
        # Log initial cryptographic audit root
        await AuditService.log_event(
            db=db,
            merchant_id=merchant.id,
            action_type="MERCHANT_DEMO_INITIALIZED",
            input_payload={"business_name": "Sharma General Stores", "txns": txns_created}
        )
        logger.info(f"Demo environment initialized with {len(DEMO_PRODUCTS)} products, {len(customers)} customers, and {txns_created} transactions.")
