import pytest
from app.ai.sarvam.intent import IndicIntentDetector
from app.ai.sarvam.client import SarvamClient

def test_intent_detection_cross_lingual():
    # Marathi: Today's sales
    intent_mr, lang_mr, _ = IndicIntentDetector.detect_intent("आज माझी किती विक्री झाली?")
    assert intent_mr == "SALES_QUERY_TODAY"
    assert lang_mr == "mr"

    # Hinglish: Today's sales
    intent_hi, lang_hi, _ = IndicIntentDetector.detect_intent("Aaj meri total sale kitni hui?")
    assert intent_hi == "SALES_QUERY_TODAY"

    # English: Today's sales
    intent_en, lang_en, _ = IndicIntentDetector.detect_intent("Show me today's sales.")
    assert intent_en == "SALES_QUERY_TODAY"

    # Signature Diwali scenario
    intent_diwali, _, _ = IndicIntentDetector.detect_intent("Kal meri kitni sale hui aur aaj mujhe kya stock mangwana chahiye?")
    assert intent_diwali == "DIWALI_SALES_AND_RESTOCK"

    # At-risk customer query
    intent_cust, _, _ = IndicIntentDetector.detect_intent("Kaunse customers bahut din se nahi aaye?")
    assert intent_cust == "AT_RISK_CUSTOMERS_CAMPAIGN"

def test_all_required_voice_intents():
    # 0. Direct conversational Marathi "विक्री किती झाली" -> Today's sales
    intent0, lang0, _ = IndicIntentDetector.detect_intent("विक्री किती झाली")
    assert intent0 == "SALES_QUERY_TODAY"
    assert lang0 == "mr"

    # 1. "Aaj ki sales kitni hui?" -> Today's sales
    intent1, lang1, _ = IndicIntentDetector.detect_intent("Aaj ki sales kitni hui?")
    assert intent1 == "SALES_QUERY_TODAY"

    # 2. "Mera stock check karo" -> Inventory status
    intent2, lang2, _ = IndicIntentDetector.detect_intent("Mera stock check karo")
    assert intent2 == "INVENTORY_STATUS_QUERY"

    # 3. "Kaunse products khatam hone wale hain?" -> Low-stock products
    intent3, lang3, _ = IndicIntentDetector.detect_intent("Kaunse products khatam hone wale hain?")
    assert intent3 == "LOW_STOCK_QUERY"

    # 4. "Kal kitni sales hui?" -> Yesterday's sales
    intent4, lang4, _ = IndicIntentDetector.detect_intent("Kal kitni sales hui?")
    assert intent4 == "YESTERDAY_SALES_QUERY"

    # 5. "Mujhe order prepare karke do" -> Draft purchase order
    intent5, lang5, _ = IndicIntentDetector.detect_intent("Mujhe order prepare karke do")
    assert intent5 == "DRAFT_PURCHASE_ORDER"

    # 6. "Mere inactive customers kaun hain?" -> Inactive customers
    intent6, lang6, _ = IndicIntentDetector.detect_intent("Mere inactive customers kaun hain?")
    assert intent6 == "AT_RISK_CUSTOMERS_CAMPAIGN"

    # 7. "Mujhe sales forecast batao" -> Sales forecast
    intent7, lang7, _ = IndicIntentDetector.detect_intent("Mujhe sales forecast batao")
    assert intent7 == "SALES_FORECAST_QUERY"

def test_language_override_and_switching():
    # When user overrides language to Marathi
    intent, lang, _ = IndicIntentDetector.detect_intent("Today sales", preferred_lang="mr")
    assert lang == "mr"
    assert intent == "SALES_QUERY_TODAY"

    # When user overrides language to Hindi
    intent, lang, _ = IndicIntentDetector.detect_intent("Check stock", preferred_lang="hi")
    assert lang == "hi"
    assert intent == "INVENTORY_STATUS_QUERY"

    # Marathi Devanagari detection
    intent_mr, lang_mr, _ = IndicIntentDetector.detect_intent("काल किती विक्री झाली")
    assert intent_mr == "YESTERDAY_SALES_QUERY"
    assert lang_mr == "mr"

    intent_order_mr, lang_order_mr, _ = IndicIntentDetector.detect_intent("ऑर्डर तयार करा")
    assert intent_order_mr == "DRAFT_PURCHASE_ORDER"
    assert lang_order_mr == "mr"

def test_unclear_query_not_defaulting_to_today_sales():
    # Unintelligible query must map to UNCLEAR_CLARIFY, NEVER to today's sales!
    intent, _, conf = IndicIntentDetector.detect_intent("asdkjhasdf blabla xyzzy")
    assert intent == "UNCLEAR_CLARIFY"
    assert intent != "SALES_QUERY_TODAY"

def test_sarvam_client_fallback():
    import asyncio
    async def _test():
        client = SarvamClient(api_key="")
        assert client.is_configured is False
        stt_res = await client.speech_to_text(b"mock_audio")
        assert "transcript" in stt_res
    asyncio.run(_test())
