import re
from typing import Dict, Any, Tuple, Optional
from app.core.logging import logger

class IndicIntentDetector:
    """Normalizes Hindi, Marathi, Hinglish, and English merchant utterances to unified business intents."""

    INTENT_MAP = {
        # 1. Signature Combined Diwali Sales & Restock scenario
        "DIWALI_SALES_AND_RESTOCK": [
            r"(kal|yesterday|काल).*(kitni|how much|किती|बिक्री|sale).*(stock|maal|स्टॉक|साठा).*(mangwana|reorder|मागवायचा|order|chahiye)",
            r"(stock|maal|स्टॉक|साठा).*(mangwana|reorder|मागवायचा|मागवा).*(kal|yesterday|काल)",
            r"kal meri kitni sale hui aur aaj mujhe kya stock mangwana chahiye",
            r"काल किती विक्री झाली आणि काय स्टॉक मागवायचा"
        ],
        
        # 2. Yesterday's Sales Query
        "YESTERDAY_SALES_QUERY": [
            r"(kal|yesterday|काल|कल)\s+(meri\s+|ki\s+)?(kitni|kya|total|how much|किती|कितनी)?\s*(sales?|bikri|kamai|dhandha|विक्री|बिक्री|सेल|गल्ला)",
            r"kal kitni sales? hui",
            r"yesterday('?s)?\s*(sales?|revenue|income)",
            r"how much (sales?|revenue) (did we make|was there) yesterday",
            r"काल किती विक्री झाली",
            r"काल किती गल्ला जमला",
            r"कालची विक्री (सांगा|किती होती|किती झाली|दाखवा)",
            r"कल कितनी (बिक्री|सेल|कमाई) हुई",
            r"कल का गल्ला (बताओ|दिखाओ)?"
        ],

        # 3. Sales Forecast Query
        "SALES_FORECAST_QUERY": [
            r"(sales?|demand)\s*(forecast|prediction|projections?)",
            r"(mujhe\s+)?(sales?\s+)?forecast\s*(batao|dikhao|karo|bataiye|chahiye)",
            r"forecast (kya hai|batao|dikhao)",
            r"what is the (sales?\s+)?forecast",
            r"(आगामी\s+)?विक्रीचा अंदाज(\s+सांगा|\s+दाखवा|\s+काय आहे)?",
            r"अंदाज",
            r"बिक्री का (पूर्वानुमान|अनुमान|भविष्य)",
            r"अनुमान",
            r"festive (sales?\s+)?(forecast|demand)",
            r"demand prediction",
            r"दिवाळीत.*विक्री",
            r"दिवाली.*ग्राहक"
        ],

        # 4. Low Stock / Running Out Query
        "LOW_STOCK_QUERY": [
            r"(kaunse|kaun se|konsa|which)\s*(products?|items?|saaman|maal|सामान|उत्पादने)?\s*(khatam|kam|depleting|running low)",
            r"kaunse products khatam hone wale hain",
            r"kya stock khatam ho raha hai",
            r"low stock( alerts?| items? list)?",
            r"out of stock",
            r"काय स्टॉक संपत (आला आहे|येत आहे)",
            r"कोणते (उत्पादने|सामान|प्रॉडक्ट्स) संपत आले आहेत",
            r"which (products?|items?) (are|is) (running low|out of stock)",
            r"स्टॉक संपत आला आहे",
            r"साठा संपत आला आहे",
            r"कमी झालेला साठा",
            r"कम स्टॉक वाले",
            r"kaunsa saaman khatam",
            r"काय सामान संपत आले"
        ],

        # 5. General Stock / Inventory Status Check
        "INVENTORY_STATUS_QUERY": [
            r"(mera|meri|apna|check|माझा|आमचा)\s+(stock|inventory|साठा|सामान)\s+(check|status|dekho|karo|तपासा|कसा|दाखवा|कर)",
            r"mera stock check karo",
            r"check (my\s+|shop\s+)?(inventory|stock|stock status)",
            r"stock (status|kaisa hai|dekho|check)",
            r"माझा स्टॉक (तपासा|चेक करा|कसा आहे|चेक कर)",
            r"माझा साठा (तपासा|कसा आहे)",
            r"साठा तपासा",
            r"स्टॉक तपासा",
            r"स्टॉक (तपासा|कसा आहे|चेक करा|चेक कर)",
            r"inventory status"
        ],

        # 6. Draft Purchase Order / Supplier Reorder
        "DRAFT_PURCHASE_ORDER": [
            r"(mujhe\s+)?(purchase\s+)?order\s+(prepare|draft|bana|taiyar)\s*(karke do|karo|banao|kar do|kijiye)",
            r"mujhe order prepare karke do",
            r"order prepare (karo|karke do)",
            r"prepare (a\s+)?(purchase\s+)?order",
            r"draft (a\s+)?(purchase\s+)?order",
            r"create (a\s+)?(purchase\s+|reorder\s+|supplier\s+)?order",
            r"ऑर्डर तयार करा",
            r"मला ऑर्डर तयार करून द्या",
            r"ऑर्डर बनवा",
            r"ऑर्डर (काढा|द्या)",
            r"नवीन माल मागवण्यासाठी",
            r"रीऑर्डर",
            r"reorder\b",
            r"परचेज़ ऑर्डर तैयार (करो|करके दो|बना दो)"
        ],

        # 7. Inactive / At-Risk Customers
        "AT_RISK_CUSTOMERS_CAMPAIGN": [
            r"mere inactive customers kaun hain",
            r"kaunse customers bahut din se nahi aaye",
            r"kaun se customer nahi aaye",
            r"inactive customers?",
            r"at[- ]risk customers?",
            r"कोणते ग्राहक खूप दिवसांपासून आले नाहीत",
            r"माझे निष्क्रिय ग्राहक कोण आहेत",
            r"न आलेले ग्राहक",
            r"गेलेले ग्राहक",
            r"जुने ग्राहक",
            r"पुराने ग्राहक",
            r"offer (bhejo|पाठवा)",
            r"दिवाली.*(ऑफर|offer)",
            r"दिवाळी.*(ऑफर|offer)",
            r"whatsapp.*(campaign|offer)",
            r"customer campaign",
            r"offer bhejo"
        ],

        # 8. Today's / General Sales Query (matches "विक्री किती झाली", "aaj ki sales", "how much sales", etc.)
        "SALES_QUERY_TODAY": [
            r"aaj meri total sale kitni hui",
            r"aaj ki sales kitni hui",
            r"aaj kitni sale hui",
            r"aaj ki (sale|bikri|kamai|dhandha)",
            r"आज माझी किती विक्री झाली",
            r"आज किती विक्री झाली",
            r"आजचा गल्ला",
            r"दुकानवर किती पैसे जमा",
            r"दुकान का गल्ला",
            r"collection today",
            r"आजची विक्री किती झाली",
            r"आजची विक्री",
            r"आज की (बिक्री|कमाई|सेल) कितनी हुई",
            r"विक्री किती झाली",
            r"किती विक्री झाली",
            r"विक्री सांगा",
            r"माझी विक्री किती",
            r"विक्री दाखवा",
            r"बिक्री कितनी हुई",
            r"कितनी बिक्री हुई",
            r"सेल कितनी हुई",
            r"कितनी सेल हुई",
            r"सेल बताओ",
            r"कमाई कितनी हुई",
            r"show me today'?s sales",
            r"today'?s (sales|revenue|income)",
            r"today'?s sales summary",
            r"how much (are\s+the\s+|is\s+the\s+|total\s+)?sales?",
            r"total sales?",
            r"aaj ka dhandha"
        ],

        # 9. Full Marathi Business Briefing
        "BUSINESS_BRIEFING_MARATHI": [
            r"माझ्या व्यवसायाची आजची परिस्थिती सांग",
            r"व्यवसायाची परिस्थिती",
            r"aajchi paristhiti",
            r"business briefing in marathi",
            r"aajcha vyavasay kiti zala"
        ],

        # 10. Working Capital Query
        "WORKING_CAPITAL_QUERY": [
            r"loan",
            r"लोन",
            r"working capital",
            r"paisa chahiye",
            r"funding",
            r"उधारी",
            r"कर्ज",
            r"भांडवल",
            r"क्रेडिट",
            r"credit"
        ],

        # 11. Polite Greeting
        "GREETING": [
            r"^(hi|hello|hey|namaste|pranam|namaskar|kem cho|ram ram)\b"
        ],

        # 12. Record Cash Sale ("Aaj cash mein 2500 ki sale hui", "3500 cash payment mila", "Ramesh ne cash mein 850 ka saman liya")
        "RECORD_CASH_SALE": [
            r"cash.*(sale|bikri|vikri|payment|jama|mila|liya|kiya|add|record)",
            r"(sale|bikri|vikri|payment).*(cash|rokh|rokhad)",
            r"(aaj|today|आज).*(cash|रोख).*(sale|विक्री|बिक्री)",
            r"cash\s*mein\s*(\d+)",
            r"(\d+)\s*ki\s*cash\s*sale",
            r"रोख\s*विक्री",
            r"कॅश\s*(सेल|विक्री|पेमेंट)",
            r"कैश\s*(सेल|बिक्री|पेमेंट|में)"
        ],

        # 13. Add Customer ("Ramesh ko customer mein add karo", "रमेशला ग्राहक म्हणून जोडा", "Ramesh ko customer add karo, number 9876543210 hai")
        "CUSTOMER_ADD": [
            r"customer.*(add|jodo|banaye|banao|karo|nodva)",
            r"(add|naya|नवीन|नया).*(customer|grahak|ग्राहक)",
            r"(ko|la)\s+customer\s+(mein\s+)?(add|jodo|banaye|karo)",
            r"customer\s+mein\s+add",
            r"ग्राहक.*(जोडा|बनवा|नोंदवा|add)",
            r"कस्टमर.*(ऐड|जोड़ो|बनाओ)"
        ],

        # 14. 60-Day Lapsed Customer Query ("Mere jo customers 60 din se nahi aaye unko dikhao", "६० दिवसांत न आलेले ग्राहक दाखवा")
        "GET_LAPSED_CUSTOMERS": [
            r"[6६][0०]\s*(din|days|दिवस|दिवसांत).*(nahi\s*aaye|lapsed|inactive|आले\s*नाहीत|नाहीत|दाखवा)",
            r"(mere|jo|kaunse|कोणते).*(customers?|grahak|ग्राहक).*[6६][0०]\s*(din|days|दिवस|दिवसांत)",
            r"lapsed\s*customers?",
            r"[6६][0०]\s*दिवस.*ग्राहक"
        ],

        # 15. Inventory "Will this product sell?" Agent ("Agar main 50 packet ghee order karu toh kya woh mere customers ko bik jayega?", "५० पॅकेट तूप मागवले तर ग्राहकांना खपेल का?")
        "INVENTORY_WILL_IT_SELL": [
            r"(agar|if|जर).*(order|मागवले|मागवले\s*तर|mangwaya).*(bik|sell|खपेल|sale).*(jayega|ka|ho|का)",
            r"(bik\s*jayega|sell\s*hoga|khapel\s*ka|will.*sell|खपेल\s*का|बिक\s*जायेगा|बिकेगा\s*क्या|बिकेल\s*का)",
            r"([0-9०-९]+|packet|पॅकेट|ghee|तूप|घी).*(खपेल|bik\s*jayega|sell|order.*bik|बिकेगा)"
        ],

        # 16. Customer Detail Lookup with Ambiguity Handling ("Give me detail about Ramesh", "रमेश बद्दल माहिती सांगा")
        "CUSTOMER_LOOKUP": [
            r"(detail|info|history|माहिती|तपशील).*(customer|grahak|ग्राहक|[A-Za-z\u0900-\u097F]+)",
            r"([A-Za-z\u0900-\u097F]+)\s*(बद्दल|विषयी|की|ki|chi|ke|का)\s*(माहिती|तपशील|detail|info)",
            r"(tell\s*me|give\s*me|show).*(detail|info).*(about|of)\s+([A-Za-z]+)"
        ]
    }

    @classmethod
    def detect_intent(cls, utterance: str, preferred_lang: Optional[str] = None) -> Tuple[str, str, float]:
        """
        Returns (intent_name, detected_language, confidence).
        Utterance is matched with regex patterns and language heuristic.
        """
        raw = utterance.strip()
        text = raw.lower()
        if not text:
            return "UNCLEAR_CLARIFY", preferred_lang or "en", 0.0

        # Language detection heuristic
        detected_lang = "en"

        # Check Devanagari Unicode range
        if any('\u0900' <= char <= '\u097F' for char in raw):
            marathi_markers = [
                "माझी", "झाली", "सांग", "नाहीत", "परिस्थिती", "आले", "करायचा", 
                "किती", "विक्री", "माझा", "आहे", "करा", "तपासा", "सांगा", 
                "संपत", "ग्राहक", "द्या", "तयार", "आणखी", "कालची", "आजची", "साठा"
            ]
            if any(w in raw for w in marathi_markers):
                detected_lang = "mr"
            else:
                detected_lang = "hi"
        else:
            # Tokenize words for Latin script
            words = set(re.findall(r'\b[a-z]+\b', text))
            
            marathi_latin = {"aajchi", "paristhiti", "zala", "kiti", "vikri", "sang", "maza", "kasa", "aahe", "karun", "dya", "sampat"}
            hinglish_markers = {
                "aaj", "meri", "mera", "mere", "kitni", "kitna", "hui", "kaunse", "kaun", 
                "nahi", "aaye", "kya", "mangwana", "bhejo", "batao", "karo", "chahiye", 
                "dhandha", "kamai", "khatam", "banao", "hain", "karke", "mujhe", "kal", "dost"
            }

            if words & marathi_latin:
                detected_lang = "mr"
            elif words & hinglish_markers:
                detected_lang = "hinglish"
            else:
                detected_lang = "en"

        # If user explicitly preferred a language and utterance does not strongly contradict
        if preferred_lang and preferred_lang != "auto":
            final_lang = preferred_lang
        else:
            final_lang = detected_lang

        # Regex intent matching (order in INTENT_MAP defines priority)
        for intent, patterns in cls.INTENT_MAP.items():
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    logger.info(f"Utterance '{raw}' mapped to intent '{intent}' ({final_lang})")
                    return intent, final_lang, 0.96

        # Flexible fallback heuristics for natural phrasing
        # Check sales/revenue queries
        if re.search(r'(विक्री|बिक्री|सेल|dhandha|bikri|kamai|sales?|revenue)', text):
            if re.search(r'(yesterday|kal|काल|कालची|कल)', text):
                return "YESTERDAY_SALES_QUERY", final_lang, 0.90
            if re.search(r'(forecast|अंदाज|prediction|पूर्वानुमान)', text):
                return "SALES_FORECAST_QUERY", final_lang, 0.90
            return "SALES_QUERY_TODAY", final_lang, 0.90

        if re.search(r'(forecast|prediction|पूर्वानुमान|अंदाज)', text):
            return "SALES_FORECAST_QUERY", final_lang, 0.88

        if re.search(r'(order|ऑर्डर)', text) and re.search(r'(prepare|draft|bana|banao|तयार|द्या)', text):
            return "DRAFT_PURCHASE_ORDER", final_lang, 0.88

        if re.search(r'(khatam|sampat|संपत|out of stock|low stock|कमी साठा)', text):
            return "LOW_STOCK_QUERY", final_lang, 0.85

        if re.search(r'(stock|maal|माल|स्टॉक|साठा)', text) and re.search(r'(check|status|dekho|तपासा|कसा)', text):
            return "INVENTORY_STATUS_QUERY", final_lang, 0.85

        if re.search(r'(customer|customers|grahak|ग्राहक)', text) and re.search(r'(inactive|purane|nahi aaye|नाहीत|dormant|गेलेले)', text):
            return "AT_RISK_CUSTOMERS_CAMPAIGN", final_lang, 0.88

        # If no business intent matched, classify as UNCLEAR_CLARIFY to ask user to repeat/clarify
        logger.info(f"Utterance '{raw}' unmapped -> asking for clarification ({final_lang})")
        return "UNCLEAR_CLARIFY", final_lang, 0.30
