from datetime import datetime, date

DEMO_TODAY = datetime(2026, 10, 31, 23, 59, 59)
DIWALI_DATE = date(2026, 11, 9) # Exactly 9 days away from DEMO_TODAY
DHANTERAS_DATE = date(2026, 11, 7)

# 12 Merchants specifications
SYNTHETIC_MERCHANTS = [
    {
        "id": "hero-merchant-shree-sai",
        "business_name": "Shree Sai Kirana & Sweets, Dadar, Mumbai",
        "owner_name": "Ramesh Sharma",
        "phone_number": "9820012345",
        "email": "ramesh.sharma@paytm.demo",
        "category": "kirana", # kirana + sweets
        "preferred_language": "mr",
        "ward": "Dadar West, Ward G/N, Mumbai",
        "pincode": "400028",
        "soundbox_id": "SB-MUM-4G-9820",
        "join_days_ago": 180,
        "is_hero": True,
        "is_demo": True,
        "target_customers": 450,
        "avg_daily_txns": 42
    },
    {
        "id": "merchant-mahalaxmi-supermarket",
        "business_name": "Mahalaxmi Supermarket, Parel, Mumbai",
        "owner_name": "Suresh Patil",
        "phone_number": "9820023456",
        "email": "suresh.patil@paytm.demo",
        "category": "kirana",
        "preferred_language": "mr",
        "ward": "Parel, Ward F/S, Mumbai",
        "pincode": "400012",
        "soundbox_id": "SB-MUM-4G-9821",
        "join_days_ago": 160,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 520,
        "avg_daily_txns": 55
    },
    {
        "id": "merchant-gupta-provision",
        "business_name": "Gupta Provision Store, Chembur, Mumbai",
        "owner_name": "Manoj Gupta",
        "phone_number": "9820034567",
        "email": "manoj.gupta@paytm.demo",
        "category": "kirana",
        "preferred_language": "hi",
        "ward": "Chembur, Ward M/W, Mumbai",
        "pincode": "400071",
        "soundbox_id": "SB-MUM-4G-9822",
        "join_days_ago": 140,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 380,
        "avg_daily_txns": 38
    },
    {
        "id": "merchant-udupi-sagar",
        "business_name": "Udupi Sagar Veg Restaurant, Matunga, Mumbai",
        "owner_name": "Venkatesh Rao",
        "phone_number": "9820045678",
        "email": "venkatesh.rao@paytm.demo",
        "category": "restaurant_chai",
        "preferred_language": "en",
        "ward": "Matunga, Ward F/N, Mumbai",
        "pincode": "400019",
        "soundbox_id": "SB-MUM-4G-9823",
        "join_days_ago": 175,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 600,
        "avg_daily_txns": 65
    },
    {
        "id": "merchant-chai-point-kurla",
        "business_name": "Chai Point & Snacks, Kurla, Mumbai",
        "owner_name": "Irfan Khan",
        "phone_number": "9820056789",
        "email": "irfan.khan@paytm.demo",
        "category": "restaurant_chai",
        "preferred_language": "hi",
        "ward": "Kurla West, Ward L, Mumbai",
        "pincode": "400070",
        "soundbox_id": "SB-MUM-4G-9824",
        "join_days_ago": 130,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 420,
        "avg_daily_txns": 48
    },
    {
        "id": "merchant-apollo-dadar",
        "business_name": "Apollo Health Pharmacy, Dadar, Mumbai",
        "owner_name": "Dr. Aniruddh Joshi",
        "phone_number": "9820067890",
        "email": "aniruddh.joshi@paytm.demo",
        "category": "pharmacy",
        "preferred_language": "en",
        "ward": "Dadar East, Ward F/N, Mumbai",
        "pincode": "400014",
        "soundbox_id": "SB-MUM-4G-9825",
        "join_days_ago": 150,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 480,
        "avg_daily_txns": 45
    },
    {
        "id": "merchant-sanjivani-medical",
        "business_name": "Sanjivani Medical & General, Sion, Mumbai",
        "owner_name": "Milind Deshmukh",
        "phone_number": "9820078901",
        "email": "milind.deshmukh@paytm.demo",
        "category": "pharmacy",
        "preferred_language": "mr",
        "ward": "Sion, Ward F/N, Mumbai",
        "pincode": "400022",
        "soundbox_id": "SB-MUM-4G-9826",
        "join_days_ago": 120,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 350,
        "avg_daily_txns": 34
    },
    {
        "id": "merchant-glamour-salon",
        "business_name": "Glamour Family Salon & Spa, Bandra, Mumbai",
        "owner_name": "Natasha Fernandes",
        "phone_number": "9820089012",
        "email": "natasha.fernandes@paytm.demo",
        "category": "salon_service",
        "preferred_language": "en",
        "ward": "Bandra West, Ward H/W, Mumbai",
        "pincode": "400050",
        "soundbox_id": "SB-MUM-4G-9827",
        "join_days_ago": 110,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 310,
        "avg_daily_txns": 20
    },
    {
        "id": "merchant-looks-beauty",
        "business_name": "Looks Beauty Parlour, Ghatkopar, Mumbai",
        "owner_name": "Sunita Verma",
        "phone_number": "9820090123",
        "email": "sunita.verma@paytm.demo",
        "category": "salon_service",
        "preferred_language": "hi",
        "ward": "Ghatkopar East, Ward N, Mumbai",
        "pincode": "400077",
        "soundbox_id": "SB-MUM-4G-9828",
        "join_days_ago": 95,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 280,
        "avg_daily_txns": 18
    },
    {
        "id": "merchant-new-bharat-coldstart",
        "business_name": "New Bharat Traders, Andheri, Mumbai",
        "owner_name": "Deepak Choudhary",
        "phone_number": "9820101234",
        "email": "deepak.choudhary@paytm.demo",
        "category": "kirana",
        "preferred_language": "hi",
        "ward": "Andheri East, Ward K/E, Mumbai",
        "pincode": "400069",
        "soundbox_id": "SB-MUM-4G-9829",
        "join_days_ago": 7, # Cold start merchant!
        "is_hero": False,
        "is_demo": False,
        "target_customers": 85,
        "avg_daily_txns": 14
    },
    {
        "id": "merchant-ganesh-chana-lowvol",
        "business_name": "Ganesh Chana Bhandar, Vashi, Navi Mumbai",
        "owner_name": "Ganesh Kadam",
        "phone_number": "9820112345",
        "email": "ganesh.kadam@paytm.demo",
        "category": "kirana",
        "preferred_language": "mr",
        "ward": "Sector 17, Vashi, Navi Mumbai",
        "pincode": "400703",
        "soundbox_id": "SB-MUM-4G-9830",
        "join_days_ago": 100, # Low volume merchant
        "is_hero": False,
        "is_demo": False,
        "target_customers": 120,
        "avg_daily_txns": 6
    },
    {
        "id": "merchant-swastik-sweets",
        "business_name": "Swastik Sweets & Farsan, Borivali, Mumbai",
        "owner_name": "Kirit Mehta",
        "phone_number": "9820123456",
        "email": "kirit.mehta@paytm.demo",
        "category": "sweets_bakery",
        "preferred_language": "mr",
        "ward": "Borivali West, Ward R/C, Mumbai",
        "pincode": "400092",
        "soundbox_id": "SB-MUM-4G-9831",
        "join_days_ago": 165,
        "is_hero": False,
        "is_demo": False,
        "target_customers": 490,
        "avg_daily_txns": 40
    }
]

# Festival Calendar (Maharashtra & National 2026)
FESTIVALS_2026 = [
    {"name": "Bakrid / Eid-ul-Adha", "date": date(2026, 5, 27), "impact": 1.15},
    {"name": "Ganesh Chaturthi", "date": date(2026, 9, 14), "impact": 1.65},
    {"name": "Anant Chaturdashi", "date": date(2026, 9, 23), "impact": 1.45},
    {"name": "Navratri Starts", "date": date(2026, 10, 11), "impact": 1.35},
    {"name": "Dussehra / Vijayadashami", "date": date(2026, 10, 20), "impact": 1.55},
    {"name": "Dhanteras", "date": date(2026, 11, 7), "impact": 1.85},
    {"name": "Diwali Lakshmi Pujan", "date": date(2026, 11, 9), "impact": 2.20},
    {"name": "Bhai Dooj", "date": date(2026, 11, 11), "impact": 1.40}
]

# ONDC Wholesale Suppliers for Hero Merchant
HERO_ONDC_SUPPLIERS = [
    {
        "name": "Mahalaxmi Wholesale Distributors",
        "contact_person": "Rakesh Agarwal",
        "phone_number": "9821144556",
        "category": "Dairy, Ghee & Festive Hampers",
        "platform": "ONDC_NETWORK",
        "lead_time_days": 2,
        "rating": 4.9,
        "moq_inr": 5000.0
    },
    {
        "name": "Gujarat Cooperative Milk Federation (Amul)",
        "contact_person": "Devang Patel",
        "phone_number": "9820088991",
        "category": "Dairy & Ghee",
        "platform": "DIRECT_DISTRIBUTOR",
        "lead_time_days": 1,
        "rating": 4.8,
        "moq_inr": 3000.0
    },
    {
        "name": "Mumbai Mandi Grain Traders",
        "contact_person": "Kailash Shah",
        "phone_number": "9822233445",
        "category": "Grains & Staples",
        "platform": "ONDC_NETWORK",
        "lead_time_days": 3,
        "rating": 4.6,
        "moq_inr": 4000.0
    },
    {
        "name": "Hindustan FMCG Supply Hub",
        "contact_person": "Pankaj Varma",
        "phone_number": "9819977665",
        "category": "Packaged Goods & Oils",
        "platform": "ONDC_NETWORK",
        "lead_time_days": 2,
        "rating": 4.7,
        "moq_inr": 2500.0
    }
]
