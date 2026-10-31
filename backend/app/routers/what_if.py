from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.core.logging import logger

router = APIRouter(prefix="/what-if", tags=["What-If Simulation Lab"])

class SimulationRequest(BaseModel):
    mode: str = "KHULA" # "KHULA" (Non-MRP Loose Commodities) | "PACKAGED" (FMCG MRP)
    scenario: str # "PRICE_CHANGE", "BULK_PROCUREMENT", "BUNDLE_PACK", "EARLY_OPENING", "HIRE_STAFF", "EQUIPMENT_INVESTMENT"
    params: Dict[str, Any] = {}

class SimulationOutcome(BaseModel):
    mode: str
    scenario: str
    headline: str
    summary: str
    metrics: Dict[str, Any]
    tradeoffs: List[str]
    recommendation: str
    risk_level: str # Low, Medium, High
    break_even: Optional[str] = None
    language: str

LOOSE_COMMODITIES = [
    {
        "id": "toor_dal",
        "name": "Toor Dal (Polished)",
        "name_mr": "तुरीची डाळ (तूर डाळ)",
        "name_hi": "अरहर / तूर दाल",
        "unit": "kg",
        "cost_price": 125.0,
        "current_price": 140.0,
        "monthly_volume_kg": 450.0,
        "elasticity": -0.42 # inelastic staple
    },
    {
        "id": "chana_dal",
        "name": "Chana Dal (Desi)",
        "name_mr": "हरभरा डाळ (चना डाळ)",
        "name_hi": "चना दाल",
        "unit": "kg",
        "cost_price": 68.0,
        "current_price": 78.0,
        "monthly_volume_kg": 380.0,
        "elasticity": -0.48
    },
    {
        "id": "kolam_rice",
        "name": "Wada Kolam Rice (Steam)",
        "name_mr": "वाडा कोलम तांदूळ",
        "name_hi": "कोलम चावल",
        "unit": "kg",
        "cost_price": 48.0,
        "current_price": 56.0,
        "monthly_volume_kg": 750.0,
        "elasticity": -0.35
    },
    {
        "id": "loose_sugar",
        "name": "Loose Sugar (Medium)",
        "name_mr": "खुली साखर (मध्यम दाणा)",
        "name_hi": "खुली चीनी / शक्कर",
        "unit": "kg",
        "cost_price": 38.0,
        "current_price": 42.0,
        "monthly_volume_kg": 900.0,
        "elasticity": -0.30
    },
    {
        "id": "loose_cashews",
        "name": "Whole Cashews (Kaju W320)",
        "name_mr": "अख्खे काजू (W320)",
        "name_hi": "साबुत काजू (W320)",
        "unit": "kg",
        "cost_price": 680.0,
        "current_price": 800.0,
        "monthly_volume_kg": 80.0,
        "elasticity": -0.65 # more discretionary
    }
]

PACKAGED_FMCG_ITEMS = [
    {
        "id": "desi_ghee_1l",
        "name": "Pure Desi Cow Ghee (1L)",
        "mrp": 620.0,
        "distributor_cost": 558.0, # 10% margin
        "bulk_cost_5_cartons": 527.0, # 15% margin
        "monthly_volume_units": 115
    },
    {
        "id": "refined_oil_1l",
        "name": "Fortune Sunlite Refined Oil (1L)",
        "mrp": 140.0,
        "distributor_cost": 128.0, # 8.5% margin
        "bulk_cost_5_cartons": 121.0, # 13.5% margin
        "monthly_volume_units": 240
    },
    {
        "id": "packaged_atta_5kg",
        "name": "Aashirvaad Shudh Chakki Atta (5kg)",
        "mrp": 275.0,
        "distributor_cost": 247.0, # 10.2% margin
        "bulk_cost_5_cartons": 234.0, # 14.9% margin
        "monthly_volume_units": 180
    }
]

@router.get("/commodities")
async def get_commodities(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant)
):
    """Returns available loose commodities and FMCG products for realistic simulation."""
    return {
        "loose_commodities": LOOSE_COMMODITIES,
        "packaged_fmcg": PACKAGED_FMCG_ITEMS,
        "mrp_notice": {
            "en": "Packaged goods are strictly capped by printed MRP under Indian law. Price increases only apply to unbranded loose commodities.",
            "hi": "पैकेट बंद सामान पर छपे MRP से अधिक दाम नहीं लिया जा सकता। मूल्य वृद्धि केवल बिना-MRP खुले अनाज पर संभव है।",
            "mr": "पाकीटबंद वस्तूंवर कायद्यानुसार छापील MRP पेक्षा जास्त दर घेता येत नाही. दर वाढ केवळ खुल्या धान्यावरच शक्य आहे."
        }
    }

@router.get("/presets")
async def get_what_if_presets(
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant)
):
    """Returns curated merchant decision questions categorized by Khula vs Packaged."""
    presets = {
        "en": [
            {
                "id": "khula_price_change",
                "mode": "KHULA",
                "scenario": "PRICE_CHANGE",
                "question": "What if I adjust Toor Dal price from ₹140 to ₹150/kg?",
                "default_params": {"commodity_id": "toor_dal", "cost_price": 125, "current_price": 140, "new_price": 150},
                "icon": "TrendingUp"
            },
            {
                "id": "fmcg_bulk_procure",
                "mode": "PACKAGED",
                "scenario": "BULK_PROCUREMENT",
                "question": "What if I order 5 cartons of Desi Ghee via ONDC at 15% volume discount?",
                "default_params": {"fmcg_id": "desi_ghee_1l", "cartons": 5},
                "icon": "Package"
            },
            {
                "id": "early_opening",
                "mode": "OPERATIONAL",
                "scenario": "EARLY_OPENING",
                "question": "Should I open my shop two hours earlier (7:00 AM)?",
                "default_params": {"extra_hours": 2, "morning_shift": True},
                "icon": "Clock"
            },
            {
                "id": "hire_staff",
                "mode": "OPERATIONAL",
                "scenario": "HIRE_STAFF",
                "question": "What if I hire a helper at ₹12,000/month?",
                "default_params": {"monthly_salary": 12000, "staff_count": 1},
                "icon": "Users"
            },
            {
                "id": "equipment_investment",
                "mode": "OPERATIONAL",
                "scenario": "EQUIPMENT_INVESTMENT",
                "question": "What if I invest ₹50,000 in a new commercial deep freezer?",
                "default_params": {"investment_amount": 50000, "equipment_type": "Deep Freezer / Oven", "lifespan_months": 36},
                "icon": "ShoppingBag"
            }
        ],
        "hi": [
            {
                "id": "khula_price_change",
                "mode": "KHULA",
                "scenario": "PRICE_CHANGE",
                "question": "अगर मैं खुली तूर दाल का भाव ₹140 से बढ़ाकर ₹150/kg कर दूं तो क्या होगा?",
                "default_params": {"commodity_id": "toor_dal", "cost_price": 125, "current_price": 140, "new_price": 150},
                "icon": "TrendingUp"
            },
            {
                "id": "fmcg_bulk_procure",
                "mode": "PACKAGED",
                "scenario": "BULK_PROCUREMENT",
                "question": "अगर मैं ONDC से देसी घी के 5 कार्टन थोक डिस्काउंट पर मंगाऊं?",
                "default_params": {"fmcg_id": "desi_ghee_1l", "cartons": 5},
                "icon": "Package"
            },
            {
                "id": "early_opening",
                "mode": "OPERATIONAL",
                "scenario": "EARLY_OPENING",
                "question": "क्या मुझे दुकान 2 घंटे पहले (सुबह 7:00 बजे) खोलनी चाहिए?",
                "default_params": {"extra_hours": 2, "morning_shift": True},
                "icon": "Clock"
            },
            {
                "id": "hire_staff",
                "mode": "OPERATIONAL",
                "scenario": "HIRE_STAFF",
                "question": "अगर मैं ₹12,000/महीने पर हेल्पर रखूं तो कितना फायदा होगा?",
                "default_params": {"monthly_salary": 12000, "staff_count": 1},
                "icon": "Users"
            },
            {
                "id": "equipment_investment",
                "mode": "OPERATIONAL",
                "scenario": "EQUIPMENT_INVESTMENT",
                "question": "अगर मैं ₹50,000 का डीप फ्रीजर खरीदूं तो लागत कब वसूल होगी?",
                "default_params": {"investment_amount": 50000, "equipment_type": "Deep Freezer / Oven", "lifespan_months": 36},
                "icon": "ShoppingBag"
            }
        ],
        "mr": [
            {
                "id": "khula_price_change",
                "mode": "KHULA",
                "scenario": "PRICE_CHANGE",
                "question": "तूर डाळीचा भाव ₹140 वरून ₹150/किलो केल्यास नफ्यात किती वाढ होईल?",
                "default_params": {"commodity_id": "toor_dal", "cost_price": 125, "current_price": 140, "new_price": 150},
                "icon": "TrendingUp"
            },
            {
                "id": "fmcg_bulk_procure",
                "mode": "PACKAGED",
                "scenario": "BULK_PROCUREMENT",
                "question": "ONDC वरून तुपाचे 5 खोके घाऊक सवलतीत मागवल्यास किती बचत होईल?",
                "default_params": {"fmcg_id": "desi_ghee_1l", "cartons": 5},
                "icon": "Package"
            },
            {
                "id": "early_opening",
                "mode": "OPERATIONAL",
                "scenario": "EARLY_OPENING",
                "question": "दुकान २ तास लवकर (सकाळी ७:०० वाजता) उघडल्यास नफा होईल का?",
                "default_params": {"extra_hours": 2, "morning_shift": True},
                "icon": "Clock"
            },
            {
                "id": "hire_staff",
                "mode": "OPERATIONAL",
                "scenario": "HIRE_STAFF",
                "question": "दुकानात ₹१२,०००/महिना पगारावर मदतनीस ठेवणे परवडेल का?",
                "default_params": {"monthly_salary": 12000, "staff_count": 1},
                "icon": "Users"
            },
            {
                "id": "equipment_investment",
                "mode": "OPERATIONAL",
                "scenario": "EQUIPMENT_INVESTMENT",
                "question": "₹५०,००० चे डीप फ्रिझर खरेदी केल्यास भांडवल किती दिवसांत वसूल होईल?",
                "default_params": {"investment_amount": 50000, "equipment_type": "Deep Freezer / Oven", "lifespan_months": 36},
                "icon": "ShoppingBag"
            }
        ]
    }
    return presets.get(lang, presets["en"])

@router.post("/simulate", response_model=SimulationOutcome)
async def run_simulation(
    req: SimulationRequest,
    lang: str = Query("mr"),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates grounded business decisions respecting MRP laws vs loose commodity pricing.
    """
    mode = req.mode.upper()
    scenario = req.scenario.upper()
    params = req.params

    # 1. KHULA COMMODITY SIMULATION
    if mode == "KHULA" or scenario == "PRICE_CHANGE":
        comm_id = params.get("commodity_id", "toor_dal")
        comm = next((c for c in LOOSE_COMMODITIES if c["id"] == comm_id), LOOSE_COMMODITIES[0])

        cost = float(params.get("cost_price", comm["cost_price"]))
        curr = float(params.get("current_price", comm["current_price"]))
        new_p = float(params.get("new_price", curr + 10.0))
        vol = float(params.get("monthly_volume_kg", comm["monthly_volume_kg"]))
        elast = comm["elasticity"]

        # Calculations
        pct_price_change = (new_p - curr) / curr
        pct_volume_change = round(pct_price_change * elast * 100, 1) # e.g. +7.1% price * -0.42 = -3.0% vol
        new_vol = vol * (1.0 + (pct_volume_change / 100.0))

        old_monthly_profit = vol * (curr - cost)
        new_monthly_profit = new_vol * (new_p - cost)
        net_profit_delta = round(new_monthly_profit - old_monthly_profit, 0)
        old_margin_pct = round(((curr - cost) / curr) * 100, 1)
        new_margin_pct = round(((new_p - cost) / new_p) * 100, 1)

        comm_name = comm["name_mr"] if lang == "mr" else (comm["name_hi"] if lang in ["hi", "hinglish"] else comm["name"])

        if lang == "en":
            headline = f"+₹{int(net_profit_delta):,} Net Profit / month on {comm['name']}"
            summary = (
                f"Changing price from ₹{curr:.0f} to ₹{new_p:.0f}/kg increases your gross margin from {old_margin_pct}% to {new_margin_pct}%. "
                f"Because loose staples are essential, volume dips only by {abs(pct_volume_change)}% ({round(vol - new_vol, 0):.0f} kg), resulting in a net monthly gain of ₹{int(net_profit_delta):,}."
            )
            tradeoffs = [
                f"Margin expansion: +{round(new_margin_pct - old_margin_pct, 1)}% higher margin per kg",
                f"Volume change: {pct_volume_change}% ({round(new_vol, 0):.0f} kg/mo vs {int(vol)} kg)",
                "MRP Compliance: 100% legal (Non-MRP unbranded commodity)"
            ]
            rec = f"Recommended: Safe to execute. Monitor competitor pricing within 500m radius."
        elif lang == "hi":
            headline = f"+₹{int(net_profit_delta):,} शुद्ध मासिक लाभ ({comm_name})"
            summary = (
                f"भाव ₹{curr:.0f} से बढ़ाकर ₹{new_p:.0f}/kg करने पर मार्जिन {old_margin_pct}% से बढ़कर {new_margin_pct}% हो जाएगा। "
                f"दाल रोजमर्रा की ज़रूरत है, इसलिए बिक्री में केवल {abs(pct_volume_change)}% की मामूली कमी आएगी और कुल ₹{int(net_profit_delta):,} का शुद्ध मुनाफा बढ़ेगा।"
            )
            tradeoffs = [
                f"मार्जिन बढ़ोतरी: प्रति किलो +{round(new_margin_pct - old_margin_pct, 1)}% का अधिक लाभ",
                f"मासिक बिक्री: {round(new_vol, 0):.0f} kg (पहले {int(vol)} kg थी)",
                "कानूनी स्थिति: 100% वैध (बिना-MRP खुला अनाज)"
            ]
            rec = "सिफ़ारिश: लागू करना सुरक्षित है। नजदीकी दुकानों के भाव पर नजर रखें।"
        else:
            headline = f"+₹{int(net_profit_delta):,} मासिक अतिरिक्त नफा ({comm_name})"
            summary = (
                f"दर ₹{curr:.0f} वरून ₹{new_p:.0f}/किलो केल्यास मार्जिन {old_margin_pct}% वरून {new_margin_pct}% पर्यंत वाढेल. "
                f"डाळ जीवनावश्यक असल्याने खपात फक्त {abs(pct_volume_change)}% किरकोळ घट होईल आणि दरमहा ₹{int(net_profit_delta):,} जास्तीचा नफा राहील."
            )
            tradeoffs = [
                f"नफ्यातील वाढ: प्रति किलो +{round(new_margin_pct - old_margin_pct, 1)}% अधिक मार्जिन",
                f"खपातील बदल: दरमहा {round(new_vol, 0):.0f} किलो (आधी {int(vol)} किलो)",
                "कायदेशीर स्थिती: १००% सुरक्षित (विना-MRP खुले धान्य)"
            ]
            rec = "शिफारस: दरवाढ करणे सुरक्षित आहे. ५०० मीटर परिसरातील दुकानांवर लक्ष ठेवा."

        return SimulationOutcome(
            mode="KHULA",
            scenario="PRICE_CHANGE",
            headline=headline,
            summary=summary,
            metrics={
                "old_margin_percent": old_margin_pct,
                "new_margin_percent": new_margin_pct,
                "monthly_volume_kg": round(new_vol, 0),
                "monthly_net_profit_delta_inr": net_profit_delta,
                "volume_change_percent": pct_volume_change
            },
            tradeoffs=tradeoffs,
            recommendation=rec,
            risk_level="Low" if abs(pct_volume_change) < 5 else "Medium",
            break_even="Immediate (Day 1)",
            language=lang
        )

    # 2. PACKAGED FMCG BULK PROCUREMENT SIMULATION
    elif mode == "PACKAGED" or scenario == "BULK_PROCUREMENT":
        fmcg_id = params.get("fmcg_id", "desi_ghee_1l")
        item = next((p for p in PACKAGED_FMCG_ITEMS if p["id"] == fmcg_id), PACKAGED_FMCG_ITEMS[0])
        cartons = int(params.get("cartons", 5))
        units = cartons * 12

        cost_standard = item["distributor_cost"]
        cost_bulk = item["bulk_cost_5_cartons"]
        savings_per_unit = cost_standard - cost_bulk
        total_procurement_savings = round(savings_per_unit * units, 0)
        investment_needed = round(cost_bulk * units, 0)
        margin_standard_pct = round(((item["mrp"] - cost_standard) / item["mrp"]) * 100, 1)
        margin_bulk_pct = round(((item["mrp"] - cost_bulk) / item["mrp"]) * 100, 1)

        if lang == "en":
            headline = f"+₹{int(total_procurement_savings):,} Procurement Savings on {item['name']}"
            summary = (
                f"Since FMCG cannot be sold above printed MRP of ₹{item['mrp']:.0f}, profit is unlocked by procurement discounts. "
                f"Ordering {cartons} cartons ({units} units) via ONDC distributor contract lifts margin from {margin_standard_pct}% to {margin_bulk_pct}%, saving ₹{int(total_procurement_savings):,}."
            )
            tradeoffs = [
                f"Upfront working capital locked: ₹{int(investment_needed):,}",
                f"Turnover time: ~{round(units / (item['monthly_volume_units']/30), 0):.0f} days to sell all units",
                "Storage risk: Zero leakage or breakage if stored in cool dry area"
            ]
            rec = "Highly Recommended: Diwali Dhanteras rush will sell this stock within 16 days."
        elif lang == "hi":
            headline = f"+₹{int(total_procurement_savings):,} थोक खरीद में सीधी बचत ({item['name']})"
            summary = (
                f"पैकेट बंद सामान को ₹{item['mrp']:.0f} के MRP से ऊपर नहीं बेचा जा सकता, इसलिए मुनाफा थोक खरीद में छूट से बनता है। "
                f"ONDC से {cartons} कार्टन ({units} पीस) मंगाने पर मार्जिन {margin_standard_pct}% से बढ़कर {margin_bulk_pct}% हो जाएगा।"
            )
            tradeoffs = [
                f"आवश्यक कार्यशील पूंजी: ₹{int(investment_needed):,}",
                f"स्टॉक खाली होने का समय: लगभग {round(units / (item['monthly_volume_units']/30), 0):.0f} दिन",
                "स्टोरेज सुरक्षा: सूखा और सुरक्षित स्थान चाहिए"
            ]
            rec = "सिफ़ारिश: दिवाली की मांग में यह स्टॉक 16 दिनों में आसानी से बिक जाएगा।"
        else:
            headline = f"+₹{int(total_procurement_savings):,} घाऊक खरेदीत थेट बचत ({item['name']})"
            summary = (
                f"पाकीटबंद वस्तू ₹{item['mrp']:.0f} या छापील MRP पेक्षा जास्त दराने विकता येत नाहीत, त्यामुळे घाऊक खरेदी सवलतीतूनच नफा वाढवता येतो. "
                f"ONDC द्वारे {cartons} खोके ({units} नग) मागवल्यास मार्जिन {margin_standard_pct}% वरून {margin_bulk_pct}% होईल."
            )
            tradeoffs = [
                f"आवश्यक खेळते भांडवल: ₹{int(investment_needed):,}",
                f"साठा संपण्याचा कालावधी: सुमारे {round(units / (item['monthly_volume_units']/30), 0):.0f} दिवस",
                "साठवणूक जोखीम: योग्य ठिकाणी ठेवल्यास मालाचे नुकसान शून्य"
            ]
            rec = "उत्तम संधी: दिवाळी सणाच्या खरेदीमुळे हा साठा १६ दिवसांत पूर्ण संपेल."

        return SimulationOutcome(
            mode="PACKAGED",
            scenario="BULK_PROCUREMENT",
            headline=headline,
            summary=summary,
            metrics={
                "mrp_ceiling_inr": item["mrp"],
                "standard_margin_percent": margin_standard_pct,
                "bulk_margin_percent": margin_bulk_pct,
                "total_savings_inr": total_procurement_savings,
                "units_purchased": units
            },
            tradeoffs=tradeoffs,
            recommendation=rec,
            risk_level="Low",
            break_even="16-18 Days",
            language=lang
        )

    # 3. OPERATIONAL SIMULATIONS (HOURS, STAFF, EQUIPMENT)
    elif scenario == "EARLY_OPENING":
        extra_h = int(params.get("extra_hours", 2))
        est_extra_sales_daily = extra_h * 1450
        monthly_sales_gain = est_extra_sales_daily * 30
        extra_electricity = extra_h * 45 * 30
        net_monthly_gain = round((monthly_sales_gain * 0.18) - extra_electricity, 0)

        headline = f"+₹{int(net_monthly_gain):,} Extra Margin / month" if lang == "en" else (f"+₹{int(net_monthly_gain):,} अतिरिक्त मासिक बचत" if lang in ["hi", "hinglish"] else f"+₹{int(net_monthly_gain):,} अतिरिक्त मासिक नफा")
        summary = (
            f"Opening at 7:00 AM captures peak morning milk, curd and bread buyers who currently go to quick-commerce. Generates ₹{int(monthly_sales_gain):,} in gross sales against minimal electricity expense."
            if lang == "en" else
            f"सुबह 7:00 बजे दुकान खोलने से दूध, ब्रेड और नाश्ते का सामान खरीदने वाले नियमित ग्राहक मिलेंगे। ₹{int(monthly_sales_gain):,} की अतिरिक्त बिक्री होगी।"
            if lang in ["hi", "hinglish"] else
            f"सकाळी ७:०० वाजता दुकान उघडल्यास दूध, पाव आणि अंड्यांचे नियमित ग्राहक जोडले जातील, ज्यामुळे दरमहा ₹{int(monthly_sales_gain):,} ची जास्तीची विक्री शक्य होईल."
        )

        return SimulationOutcome(
            mode="OPERATIONAL",
            scenario=scenario,
            headline=headline,
            summary=summary,
            metrics={"monthly_sales_gain_inr": monthly_sales_gain, "net_profit_gain_monthly": net_monthly_gain, "extra_cost_monthly": extra_electricity},
            tradeoffs=["Added morning commuter sales", f"Electricity cost: ₹{extra_electricity}/mo", "Fatigue: workday extends by 2 hours"],
            recommendation="Recommended: Pilot 7:00 AM opening for 14 days focusing on fresh dairy & bread.",
            risk_level="Low",
            break_even="Within 4 days",
            language=lang
        )

    elif scenario == "HIRE_STAFF":
        salary = float(params.get("monthly_salary", 12000))
        saved_abandoned_sales = 30 * 4 * 380
        extra_sales_from_speed = saved_abandoned_sales * 0.18
        break_even_extra_sales_daily = round(salary / (30 * 0.18), 0)

        headline = f"Needs ₹{int(break_even_extra_sales_daily):,}/day extra sales to break even" if lang == "en" else f"ब्रेक-ईवन के लिए रोज ₹{int(break_even_extra_sales_daily):,} की अतिरिक्त बिक्री चाहिए"
        summary = f"A helper costing ₹{int(salary):,}/month drastically cuts evening queues and recovers lost walkout baskets."

        return SimulationOutcome(
            mode="OPERATIONAL",
            scenario=scenario,
            headline=headline,
            summary=summary,
            metrics={"monthly_salary_cost": salary, "saved_walkout_revenue": saved_abandoned_sales, "daily_breakeven_sales_needed": break_even_extra_sales_daily},
            tradeoffs=[f"Fixed monthly overhead: ₹{int(salary):,}", f"Saved checkout walkouts: ~₹{int(saved_abandoned_sales):,}", "Owner freed: 4+ hours daily"],
            recommendation="Recommended: Hire part-time (4 hours during evening rush 5 PM - 9 PM) at ₹6,500/month.",
            risk_level="Medium",
            break_even=f"{int(break_even_extra_sales_daily)} INR/day",
            language=lang
        )

    else:
        inv = float(params.get("investment_amount", 50000))
        est_new_category_sales_monthly = 24000
        gross_profit_monthly = est_new_category_sales_monthly * 0.28
        net_monthly_profit = gross_profit_monthly - 1200
        payback_months = round(inv / net_monthly_profit, 1)

        headline = f"Payback in {payback_months} Months • ₹{int(net_monthly_profit):,}/mo profit" if lang == "en" else f"{payback_months} महीने में लागत वसूल"
        summary = f"A ₹{int(inv):,} investment opens high-margin cold chain dairy, ice cream, and frozen food categories."

        return SimulationOutcome(
            mode="OPERATIONAL",
            scenario="EQUIPMENT_INVESTMENT",
            headline=headline,
            summary=summary,
            metrics={"investment_amount": inv, "monthly_net_profit": net_monthly_profit, "payback_period_months": payback_months},
            tradeoffs=[f"Initial capital outlay: ₹{int(inv):,}", "Opens 28% margin category", "Asset retains 60% resale value"],
            recommendation="Highly Recommended: Use Paytm Pre-Approved Merchant Credit over 6 months.",
            risk_level="Low",
            break_even=f"{payback_months} Months",
            language=lang
        )
