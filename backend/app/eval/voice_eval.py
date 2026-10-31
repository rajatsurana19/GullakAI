from typing import List, Dict, Any
from app.ai.sarvam.intent import IndicIntentDetector

VOICE_EVALUATION_SET = [
    # --- Marathi Utterances (18) ---
    {"text": "आज किती विक्री झाली?", "expected_intent": "SALES_QUERY_TODAY", "lang": "mr"},
    {"text": "विक्री किती झाली", "expected_intent": "SALES_QUERY_TODAY", "lang": "mr"},
    {"text": "आजचा गल्ला दाखवा", "expected_intent": "SALES_QUERY_TODAY", "lang": "mr"},
    {"text": "आज दुकानवर किती पैसे जमा झाले?", "expected_intent": "SALES_QUERY_TODAY", "lang": "mr"},
    {"text": "माझा स्टॉक चेक कर", "expected_intent": "INVENTORY_STATUS_QUERY", "lang": "mr"},
    {"text": "दुकानात काय काय संपत आले आहे?", "expected_intent": "LOW_STOCK_QUERY", "lang": "mr"},
    {"text": "कमी झालेला साठा दाखवा", "expected_intent": "LOW_STOCK_QUERY", "lang": "mr"},
    {"text": "काल किती गल्ला जमला?", "expected_intent": "YESTERDAY_SALES_QUERY", "lang": "mr"},
    {"text": "कालची विक्री किती होती?", "expected_intent": "YESTERDAY_SALES_QUERY", "lang": "mr"},
    {"text": "नवीन माल मागवण्यासाठी ऑर्डर तयार करा", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "mr"},
    {"text": "तुपाची ऑर्डर काढा", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "mr"},
    {"text": "गेलेले ग्राहक कोण आहेत?", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "mr"},
    {"text": "जुने ग्राहक परत कसे आणायचे?", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "mr"},
    {"text": "ग्राहकांना दिवाळी ऑफर मेसेज पाठवा", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "mr"},
    {"text": "उद्याचा विक्री अंदाज काय आहे?", "expected_intent": "SALES_FORECAST_QUERY", "lang": "mr"},
    {"text": "दिवाळीत किती विक्री होईल अंदाज सांगा", "expected_intent": "SALES_FORECAST_QUERY", "lang": "mr"},
    {"text": "मला दुकानासाठी कर्ज मिळू शकेल का?", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "mr"},
    {"text": "खेळते भांडवल किती मिळेल?", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "mr"},

    # --- Hindi / Hinglish Utterances (18) ---
    {"text": "आज की बिक्री कितनी हुई?", "expected_intent": "SALES_QUERY_TODAY", "lang": "hi"},
    {"text": "आज दुकान का गल्ला कितना है?", "expected_intent": "SALES_QUERY_TODAY", "lang": "hi"},
    {"text": "सेल कितनी हुई आज", "expected_intent": "SALES_QUERY_TODAY", "lang": "hi"},
    {"text": "मेरा स्टॉक चेक करो", "expected_intent": "INVENTORY_STATUS_QUERY", "lang": "hi"},
    {"text": "दुकान में कौन सा सामान खत्म होने वाला है?", "expected_intent": "LOW_STOCK_QUERY", "lang": "hi"},
    {"text": "कम स्टॉक वाले आइटम बताओ", "expected_intent": "LOW_STOCK_QUERY", "lang": "hi"},
    {"text": "कल कितनी बिक्री हुई थी?", "expected_intent": "YESTERDAY_SALES_QUERY", "lang": "hi"},
    {"text": "कल का गल्ला बताओ", "expected_intent": "YESTERDAY_SALES_QUERY", "lang": "hi"},
    {"text": "मुझे सप्लायर के लिए नया ऑर्डर तैयार करके दो", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "hi"},
    {"text": "सामान रीऑर्डर करो", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "hi"},
    {"text": "मेरे पुराने ग्राहक कौन से हैं जो नहीं आ रहे?", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "hi"},
    {"text": "ग्राहकों को दिवाली का व्हाट्सएप ऑफर भेजो", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "hi"},
    {"text": "दिवाली पर कितने ग्राहक आएंगे?", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "hi"},
    {"text": "कल या परसों का सेल्स फोरकास्ट बताओ", "expected_intent": "SALES_FORECAST_QUERY", "lang": "hi"},
    {"text": "आने वाले दिनों में बिक्री का क्या अनुमान है?", "expected_intent": "SALES_FORECAST_QUERY", "lang": "hi"},
    {"text": "मुझे वर्किंग कैपिटल लोन चाहिए", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "hi"},
    {"text": "पेटीएम से लोन कैसे मिलेगा?", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "hi"},
    {"text": "क्रेडिट लिमिट कितनी है मेरी?", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "hi"},

    # --- English Utterances (14) ---
    {"text": "Show today's sales", "expected_intent": "SALES_QUERY_TODAY", "lang": "en"},
    {"text": "What is my collection today?", "expected_intent": "SALES_QUERY_TODAY", "lang": "en"},
    {"text": "Check shop stock status", "expected_intent": "INVENTORY_STATUS_QUERY", "lang": "en"},
    {"text": "Which items are running low on stock?", "expected_intent": "LOW_STOCK_QUERY", "lang": "en"},
    {"text": "Low stock items list", "expected_intent": "LOW_STOCK_QUERY", "lang": "en"},
    {"text": "How much was yesterday's sales?", "expected_intent": "YESTERDAY_SALES_QUERY", "lang": "en"},
    {"text": "Prepare purchase order for distributor", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "en"},
    {"text": "Reorder desi ghee", "expected_intent": "DRAFT_PURCHASE_ORDER", "lang": "en"},
    {"text": "Who are my inactive customers?", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "en"},
    {"text": "Send WhatsApp festive campaign", "expected_intent": "AT_RISK_CUSTOMERS_CAMPAIGN", "lang": "en"},
    {"text": "Show sales forecast for next week", "expected_intent": "SALES_FORECAST_QUERY", "lang": "en"},
    {"text": "Demand prediction for festival", "expected_intent": "SALES_FORECAST_QUERY", "lang": "en"},
    {"text": "Can I get a working capital loan?", "expected_intent": "WORKING_CAPITAL_QUERY", "lang": "en"},
    {"text": "Hello Gullak", "expected_intent": "GREETING", "lang": "en"}
]

class VoiceEvaluator:
    @staticmethod
    def evaluate_voice_intent_detection() -> Dict[str, Any]:
        total = len(VOICE_EVALUATION_SET)
        correct = 0
        confusion = []

        for item in VOICE_EVALUATION_SET:
            predicted, detected_lang, confidence = IndicIntentDetector.detect_intent(
                utterance=item["text"],
                preferred_lang=item["lang"]
            )
            if predicted == item["expected_intent"]:
                correct += 1
            else:
                confusion.append({
                    "utterance": item["text"],
                    "lang": item["lang"],
                    "expected": item["expected_intent"],
                    "predicted": predicted,
                    "confidence": confidence
                })

        accuracy = round(correct / total, 4) if total > 0 else 0.0
        return {
            "total_samples": total,
            "correct_matches": correct,
            "accuracy_pct": round(accuracy * 100, 2),
            "errors_count": len(confusion),
            "confusion_samples": confusion
        }
