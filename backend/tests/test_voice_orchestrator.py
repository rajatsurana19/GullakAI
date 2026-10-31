import pytest
from app.core.database import AsyncSessionLocal
from app.models.merchant import Merchant
from app.ai.agents.orchestrator import GullakOrchestrator
from app.routers.dashboard import get_dashboard_summary
from app.services.payment_service import PaymentService
from sqlalchemy import select

@pytest.mark.asyncio
async def test_all_distinct_intents_and_agent_responses():
    async with AsyncSessionLocal() as db:
        # Get demo merchant
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = res.scalar_one_or_none()
        if not merchant:
            res_any = await db.execute(select(Merchant).limit(1))
            merchant = res_any.scalar_one_or_none()
        assert merchant is not None, "A merchant must exist in database"
        merchant_id = merchant.id

        orchestrator = GullakOrchestrator(db)

        # 1. Today's sales
        s1 = await orchestrator.execute_query(merchant_id, "Aaj ki sales kitni hui?")
        assert s1["intent"] == "SALES_QUERY_TODAY"
        assert s1["agent_name"] == "SalesIntelligenceAgent"
        assert "बिक्री" in s1["response_text"] or "सेल" in s1["response_text"] or "sales" in s1["response_text"].lower()

        # 2. Inventory status
        s2 = await orchestrator.execute_query(merchant_id, "Mera stock check karo")
        assert s2["intent"] == "INVENTORY_STATUS_QUERY"
        assert s2["agent_name"] == "InventoryIntelligenceAgent"
        assert s2["intent"] != s1["intent"]

        # 3. Low stock products
        s3 = await orchestrator.execute_query(merchant_id, "Kaunse products khatam hone wale hain?")
        assert s3["intent"] == "LOW_STOCK_QUERY"
        assert s3["agent_name"] == "InventoryIntelligenceAgent"
        assert s3["intent"] != s1["intent"]

        # 4. Yesterday's sales
        s4 = await orchestrator.execute_query(merchant_id, "Kal kitni sales hui?")
        assert s4["intent"] == "YESTERDAY_SALES_QUERY"
        assert s4["agent_name"] == "SalesIntelligenceAgent"
        assert s4["intent"] != s1["intent"]

        # 5. Draft purchase order
        s5 = await orchestrator.execute_query(merchant_id, "Mujhe order prepare karke do")
        assert s5["intent"] == "DRAFT_PURCHASE_ORDER"
        assert s5["agent_name"] == "ProcurementAgent"
        assert s5["approval_required"] is True
        assert s5["approval_id"] is not None

        # 6. Inactive customers
        s6 = await orchestrator.execute_query(merchant_id, "Mere inactive customers kaun hain?")
        assert s6["intent"] == "AT_RISK_CUSTOMERS_CAMPAIGN"
        assert s6["agent_name"] == "CustomerGrowthAgent"
        assert s6["approval_required"] is True
        assert s6["approval_id"] is not None

        # 7. Sales forecast
        s7 = await orchestrator.execute_query(merchant_id, "Mujhe sales forecast batao")
        assert s7["intent"] == "SALES_FORECAST_QUERY"
        assert s7["agent_name"] == "DemandForecastingAgent"
        assert s7["intent"] != s1["intent"]

@pytest.mark.asyncio
async def test_language_switching_across_responses():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = res.scalar_one_or_none()
        merchant_id = merchant.id if merchant else "test-merchant"

        orchestrator = GullakOrchestrator(db)

        # Marathi response
        state_mr = await orchestrator.execute_query(
            merchant_id=merchant_id,
            query="Show today's sales",
            language_override="mr"
        )
        assert state_mr["language"] == "mr"
        assert "विक्री" in state_mr["response_text"] or "आज" in state_mr["response_text"]

        # Hindi response
        state_hi = await orchestrator.execute_query(
            merchant_id=merchant_id,
            query="Show today's sales",
            language_override="hi"
        )
        assert state_hi["language"] == "hi"
        assert "बिक्री" in state_hi["response_text"] or "आज" in state_hi["response_text"]

        # English response
        state_en = await orchestrator.execute_query(
            merchant_id=merchant_id,
            query="आज माझी किती विक्री झाली?",
            language_override="en"
        )
        assert state_en["language"] == "en"
        assert "sales" in state_en["response_text"].lower()

@pytest.mark.asyncio
async def test_dashboard_summary_multilingual():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = res.scalar_one_or_none()
        assert merchant is not None

        # Marathi
        data_mr = await get_dashboard_summary(lang="mr", merchant=merchant, db=db)
        assert "नमस्कार" in data_mr["daily_briefing"]
        assert "विक्री" in data_mr["daily_briefing"]
        assert "कमी साठा" in data_mr["urgent_alerts"][0]["title"]

        # Hindi
        data_hi = await get_dashboard_summary(lang="hi", merchant=merchant, db=db)
        assert "नमस्ते" in data_hi["daily_briefing"]
        assert "बिक्री" in data_hi["daily_briefing"]
        assert "कम स्टॉक" in data_hi["urgent_alerts"][0]["title"]

        # English
        data_en = await get_dashboard_summary(lang="en", merchant=merchant, db=db)
        assert "Good day" in data_en["daily_briefing"]
        assert "sales" in data_en["daily_briefing"].lower()
        assert "Low Stock" in data_en["urgent_alerts"][0]["title"]

@pytest.mark.asyncio
async def test_unclear_query_does_not_return_today_sales():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = res.scalar_one_or_none()
        merchant_id = merchant.id if merchant else "test-merchant"

        orchestrator = GullakOrchestrator(db)
        state = await orchestrator.execute_query(
            merchant_id=merchant_id,
            query="xyz gibberish random query 12345"
        )
        assert state["intent"] == "UNCLEAR_CLARIFY"
        assert state["agent_name"] == "VoiceListenerAgent"
        assert "today's total sales" not in state["response_text"].lower()

@pytest.mark.asyncio
async def test_bank_deposit_calculation():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = res.scalar_one_or_none()
        assert merchant is not None

        summary = await PaymentService.get_today_summary(db, merchant.id)
        assert summary["deposit_info_available"] is True
        assert summary["pending_settlement_amount"] > 0
        assert summary["cash_amount"] > 0
        assert round(summary["digital_amount"] + summary["cash_amount"], 2) == round(summary["today_revenue"], 2)
