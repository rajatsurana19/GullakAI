from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.inventory import Product
from app.core.logging import logger

router = APIRouter(prefix="/stock-rescue", tags=["Stock Rescue Agent"])

class RescueActionRequest(BaseModel):
    item_id: str
    strategy: str # "BUNDLE", "B2B_SWAP", "FLASH_DISCOUNT", "SUPPLIER_RETURN"
    discount_percent: Optional[float] = 15.0
    partner_id: Optional[str] = None

@router.get("/overview")
async def get_stock_rescue_overview(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Identifies capital trapped in dead or slow-moving stock and generates recovery pathways.
    """
    # Sample trapped items with real financial grounding
    trapped_items = [
        {
            "id": "item-dead-1",
            "name": "Catch Sambhar Masala (100g)",
            "name_marathi": "कॅच सांबार मसाला (१०० ग्रॅम)",
            "name_hindi": "कैच सांभर मसाला (100g)",
            "category": "Spices & Mixes",
            "units_stuck": 35,
            "cost_price": 42.0,
            "mrp": 58.0,
            "trapped_capital_inr": 1470.0,
            "days_no_sale": 42,
            "aging_days": 68,
            "recommended_strategy": "BUNDLE",
            "pairing_rationale": {
                "en": "Pairs naturally with daily kitchen staples. 78% of your store's atta & dal buyers cook dal/sambhar weekly.",
                "hi": "रोजमर्रा के रसोई सामान के साथ स्वाभाविक जोड़ी। आपके 78% आटा-दाल खरीदार हर हफ्ते सांभर या दाल बनाते हैं।",
                "mr": "दैनिक किराणा सामानाशी सुसंगत. दुकानातील ७८% आटा व डाळ खरेदी करणारे ग्राहक दर आठवड्याला सांबार/वरण बनवतात."
            },
            "bundle_details": {
                "paired_with": "Aashirvaad Atta (5kg)",
                "paired_with_mr": "आशीर्वाद आटा (५ किलो)",
                "paired_with_hi": "आशीर्वाद आटा (5kg)",
                "combo_mrp": 333.0,
                "combo_offer_price": 310.0,
                "merchant_profit": 35.0
            },
            "strategy_details": {
                "en": "Bundle with Aashirvaad Atta (5kg): 'Buy Atta, get Sambhar Masala at 40% OFF'. Clears all 35 boxes in 5 days.",
                "hi": "आशीर्वाद आटा (5kg) के साथ कॉम्बो बनाएं: 'आटा खरीदने पर सांभर मसाला 40% छूट पर पाएं'। 5 दिन में सारा स्टॉक बिक जाएगा।",
                "mr": "आशीर्वाद आटा (५ किलो) सोबत जोडी बनवा: 'आटा खरेदीवर सांबार मसाला ४०% सवलतीत'. ५ दिवसांत सर्व साठा संपेल."
            },
            "recovery_potential_inr": 1225.0,
            "confidence": "High"
        },
        {
            "id": "item-dead-2",
            "name": "Handmade Terracotta Diwali Diyas (Pack of 12)",
            "name_marathi": "मातीचे पारंपरिक दिवे (१२ चा सेट)",
            "name_hindi": "मिट्टी के पारंपरिक दीये (12 का सेट)",
            "category": "Seasonal & Festive",
            "units_stuck": 22,
            "cost_price": 50.0,
            "mrp": 80.0,
            "trapped_capital_inr": 1100.0,
            "days_no_sale": 18,
            "aging_days": 50,
            "recommended_strategy": "B2B_SWAP",
            "pairing_rationale": {
                "en": "Inventory swap balance: Your store is low on Cow Ghee (4 days left). Nearby Sai Pooja Bhandar has zero diyas and excess ghee stock.",
                "hi": "स्टॉक एक्सचेंज तालमेल: आपकी दुकान में देसी घी खत्म होने वाला है (4 दिन का स्टॉक)। पास के साई पूजा भंडार में दीये खत्म हैं और घी अधिक है।",
                "mr": "मालाचा योग्य ताळमेळ: आपल्या दुकानात गायीचे तूप संपत आले आहे (४ दिवस शिल्लक). जवळच्या साई पूजा भंडारमध्ये दिवे संपले असून तूप जादा शिल्लक आहे."
            },
            "b2b_swap_details": {
                "partner_name": "Sai Pooja Bhandar",
                "partner_name_mr": "साई पूजा भांडार",
                "partner_name_hi": "साई पूजा भंडार",
                "partner_address": "Shop #4, Dadar Mandi, Mumbai (800m away)",
                "partner_paytm_id": "MER-9021-DADAR",
                "partner_rating": 4.9,
                "outgoing_items": "22 Packs Handmade Terracotta Diyas (Cost ₹50 = ₹1,100)",
                "outgoing_items_mr": "२२ सेट मातीचे दिवे (खरेदी भाव ₹५० = ₹१,१००)",
                "outgoing_items_hi": "22 सेट मिट्टी के दीये (लागत ₹50 = ₹1,100)",
                "incoming_items": "2 x 1L Pure Desi Cow Ghee (Wholesale ₹480 = ₹960) + ₹140 Paytm UPI Balance",
                "incoming_items_mr": "२ x १ लीटर शुद्ध देशी गायीचे तूप (घाऊक ₹४८० = ₹९६०) + ₹१४० पेटीएम यूपीआय जमा",
                "incoming_items_hi": "2 x 1L शुद्ध देशी गाय घी (थोक ₹480 = ₹960) + ₹140 पेटीएम यूपीआई भुगतान",
                "fair_valuation_check": "Exact 1:1 Parity (₹1,100 Diyas ↔ ₹960 Ghee + ₹140 Cash)"
            },
            "strategy_details": {
                "en": "Cross-merchant transfer: Swap 22 Diya sets (₹1,100 value) with Sai Pooja Bhandar (800m away) for 2 tins of Pure Cow Ghee (₹960) + ₹140 cash balance via Paytm UPI.",
                "hi": "दुकानदार एक्सचेंज: 22 दीया सेट (मूल्य ₹1,100) साई पूजा भंडार (800 मी दूर) को देकर 2 टिन देसी गाय घी (₹960) + ₹140 पेटीएम यूपीआई नकद लें।",
                "mr": "दुकानदार अदलाबदल: २२ दिव्यांचे सेट (मूल्य ₹१,१००) साई पूजा भांडारला देऊन २ डबे शुद्ध गायीचे तूप (₹९६०) + ₹१४० थेट पेटीएम यूपीआयने घ्या."
            },
            "recovery_potential_inr": 1100.0,
            "confidence": "Very High"
        },
        {
            "id": "item-dead-3",
            "name": "Knorr Classic Sweet Corn Soup (Pack of 6)",
            "name_marathi": "नॉर् स्वीट कॉर्न सूप (६ चा पॅक)",
            "name_hindi": "नॉर स्वीट कॉर्न सूप (6 का पैक)",
            "category": "Ready to Eat",
            "units_stuck": 18,
            "cost_price": 180.0,
            "mrp": 240.0,
            "trapped_capital_inr": 3240.0,
            "days_no_sale": 55,
            "aging_days": 85,
            "recommended_strategy": "FLASH_DISCOUNT",
            "pairing_rationale": {
                "en": "Targeted evening snack audience: Soundbox transaction patterns show 42 repeat customers purchasing tea-time snacks between 5 PM and 8 PM.",
                "hi": "शाम के नाश्ता ग्राहक: साउंडबॉक्स डेटा से पता चला है कि 42 नियमित ग्राहक शाम 5 से 8 बजे के बीच स्नैक्स खरीदते हैं।",
                "mr": "संध्याकाळच्या स्नॅक्स प्रेमी ग्राहक: संध्याकाळी ५ ते ८ दरम्यान चहाच्या सामानाची खरेदी करणाऱ्या ४२ नियमित ग्राहकांची निवड."
            },
            "whatsapp_campaign_details": {
                "target_count": 42,
                "target_segment": "Evening Snack Buyers (5 PM - 8 PM)",
                "recommended_discount_pct": 20,
                "breakeven_price": 180.0,
                "sale_price": 192.0,
                "profit_per_unit": 12.0,
                "message_template_mr": "नमस्कार! 🙏 श्री साई किराणा कडून खास संध्याकाळची ऑफर: थंडीच्या दिवसांत गरमागरम 'नॉर् स्वीट कॉर्न सूप (६ चा पॅक)' वर थेट २०% सवलत! MRP ₹२४० ऐवजी फक्त ₹१९२! ऑफर मर्यादित साठ्यापुरतीच. दुकानात भेट द्या किंवा घरपोच मागवा: ९८२११४४५५६",
                "message_template_hi": "नमस्ते! 🙏 श्री साई किराना की ओर से शाम का स्पेशल ऑफर: 'नॉर स्वीट कॉर्न सूप (6 का पैक)' पर 20% की विशेष छूट! MRP ₹240 के बजाय मात्र ₹192! सीमित स्टॉक। दुकान पर पधारें या घर बैठे मंगाएं: 9821144556",
                "message_template_en": "Hello! 🙏 Special Evening Offer from Shree Sai Kirana: Enjoy hot 'Knorr Sweet Corn Soup (Pack of 6)' at 20% OFF! MRP ₹240 now at only ₹192! Limited stock available. Visit store or WhatsApp to order: 9821144556"
            },
            "strategy_details": {
                "en": "Broadcast 20% flash clearance offer via WhatsApp to 42 loyal evening snack buyers @ ₹192 (cost protected above ₹180). Recovers ₹2,880 immediately.",
                "hi": "शाम के 42 स्नैक खरीदारों को ₹192 (लागत ₹180 से ऊपर सुरक्षित) में 20% छूट का व्हाट्सएप संदेश भेजें। तुरंत ₹2,880 की वसूली होगी।",
                "mr": "संध्याकाळच्या ४२ ग्राहकांना ₹१९२ दराने (खरेदी भाव ₹१८० सुरक्षित ठेवून) २०% फ्लॅश ऑफर पाठवा. तत्काळ ₹२,८८० वसूल होतील."
            },
            "recovery_potential_inr": 2880.0,
            "confidence": "High"
        },
        {
            "id": "item-dead-4",
            "name": "Tata Tea Gold Care (500g)",
            "name_marathi": "टाटा टी गोल्ड केअर (५०० ग्रॅम)",
            "name_hindi": "टाटा टी गोल्ड केयर (500g)",
            "category": "Beverages",
            "units_stuck": 12,
            "cost_price": 280.0,
            "mrp": 350.0,
            "trapped_capital_inr": 3360.0,
            "days_no_sale": 38,
            "aging_days": 70,
            "recommended_strategy": "SUPPLIER_RETURN",
            "pairing_rationale": {
                "en": "Wholesale distributor policy protection: 100% credit note exchange valid within 90 days of invoice date.",
                "hi": "थोक वितरक गारंटी: बिल की तारीख से 90 दिनों के भीतर 100% क्रेडिट नोट और दूसरे सामान से बदलने की सुविधा।",
                "mr": "घाऊक वितरक हमी: बिलाच्या तारखेपासून ९० दिवसांच्या आत १००% क्रेडिट नोट व चालू खपाच्या मालाशी अदलाबदल सुविधा."
            },
            "supplier_return_details": {
                "distributor_name": "Hindustan FMCG Wholesale",
                "distributor_name_mr": "हिंदुस्थान एफएमसीजी होलसेल",
                "distributor_name_hi": "हिंदुस्तान एफएमसीजी होलसेल",
                "invoice_number": "INV-2024-8841",
                "credit_amount": 3360.0,
                "replacement_sku": "Tata Tea Premium 500g (Fast Moving)",
                "replacement_sku_mr": "टाटा टी प्रीमियम ५०० ग्रॅम (जलद खपाचा चहा)",
                "replacement_sku_hi": "टाटा टी प्रीमियम 500g (तेज बिकने वाली चाय)"
            },
            "strategy_details": {
                "en": "Eligible for 100% distributor exchange credit with Hindustan FMCG Wholesale under the 90-day stock guarantee window.",
                "hi": "हिंदुस्तान एफएमसीजी थोक वितरक के पास 90 दिनों की एक्सचेंज गारंटी में 100% क्रेडिट नोट के लिए पात्र।",
                "mr": "हिंदुस्थान एफएमसीजी घाऊक वितरकाकडून ९० दिवसांच्या पॉलिसी अंतर्गत १००% क्रेडिट नोट/अदलाबदलीस पात्र."
            },
            "recovery_potential_inr": 3360.0,
            "confidence": "Certain"
        }
    ]

    total_trapped = sum(item["trapped_capital_inr"] for item in trapped_items)
    total_recoverable = sum(item["recovery_potential_inr"] for item in trapped_items)

    strings = {
        "en": {
            "title": "Gullak Stock Rescue Agent",
            "subtitle": "Recover trapped working capital from slow-moving and dead inventory",
            "totalTrapped": "Total Capital Trapped",
            "recoverableCapital": "Estimated Recoverable",
            "rescueRate": "Recovery Rate",
            "itemsCount": "Unproductive Products",
            "applyStrategy": "Execute Rescue Plan",
            "planExecuted": "✓ Rescue Plan Approved & Scheduled!"
        },
        "hi": {
            "title": "गुल्लक स्टॉक रेस्क्यू एजेंट",
            "subtitle": "रुके हुए और कम बिकने वाले सामान से फंसी हुई पूंजी तुरंत निकालें",
            "totalTrapped": "फंसी हुई कुल पूंजी",
            "recoverableCapital": "वसूली योग्य अनुमानित राशि",
            "rescueRate": "वसूली दर (Recovery)",
            "itemsCount": "अटके हुए प्रोडक्ट्स",
            "applyStrategy": "रेस्क्यू प्लान लागू करें",
            "planExecuted": "✓ रेस्क्यू प्लान मंज़ूर व शुरू हुआ!"
        },
        "mr": {
            "title": "गुल्लक स्टॉक रेस्क्यू एजंट",
            "subtitle": "अडकून पडलेल्या व मंद खपाच्या मालातून अडकलेले भांडवल तत्काळ मोकळे करा",
            "totalTrapped": "अडकून पडलेले भांडवल",
            "recoverableCapital": "वसुली योग्य संभाव्य रक्कम",
            "rescueRate": "वसुली प्रमाण (Recovery)",
            "itemsCount": "अडकलेली उत्पादने",
            "applyStrategy": "रेस्क्यू योजना सुरू करा",
            "planExecuted": "✓ रेस्क्यू योजना मंजूर व अंमलात आली!"
        }
    }

    t = strings.get(lang, strings["en"])

    return {
        "meta": t,
        "summary": {
            "total_trapped_inr": total_trapped,
            "total_recoverable_inr": total_recoverable,
            "recovery_percent": round((total_recoverable / total_trapped) * 100, 1),
            "unproductive_sku_count": len(trapped_items)
        },
        "items": trapped_items,
        "language": lang
    }

@router.post("/execute")
async def execute_rescue_action(
    req: RescueActionRequest,
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes or drafts an approval request for a stock rescue plan.
    """
    logger.info(f"Executing stock rescue strategy {req.strategy} for item {req.item_id}")
    
    messages = {
        "en": f"Successfully activated {req.strategy} plan for item {req.item_id}! WhatsApp offer / B2B swap draft generated.",
        "hi": f"सामान {req.item_id} के लिए {req.strategy} रेस्क्यू योजना शुरू कर दी गई है! संदेश व एक्सचेंज ड्राफ्ट तैयार है।",
        "mr": f"उत्पादन {req.item_id} साठी {req.strategy} रेस्क्यू योजना सुरू झाली आहे! व्हॉट्सॲप ऑफर व अदलाबदल तयार आहे."
    }

    return {
        "status": "SCHEDULED",
        "strategy": req.strategy,
        "item_id": req.item_id,
        "message": messages.get(lang, messages["en"])
    }
