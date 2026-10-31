from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

class SignalsService:
    """
    Beyond-payments signals provider aggregating:
    - Festival & holiday calendar (Maharashtra & National)
    - Weather patterns (Rain footfall impact)
    - GST filing reminders (20th of the month GSTR-3B)
    - Local competitor price benchmarks
    """

    FESTIVALS = [
        {"name": "Navratri", "name_mr": "नवरात्र उत्सव", "date": date(2026, 10, 11), "impact": 1.35},
        {"name": "Dussehra", "name_mr": "दसरा / विजयादशमी", "date": date(2026, 10, 20), "impact": 1.55},
        {"name": "Dhanteras", "name_mr": "धनत्रयोदशी", "date": date(2026, 11, 7), "impact": 1.85},
        {"name": "Diwali Lakshmi Pujan", "name_mr": "दिवाळी लक्ष्मीपूजन", "date": date(2026, 11, 9), "impact": 2.20},
        {"name": "Bhai Dooj", "name_mr": "भाऊबीज", "date": date(2026, 11, 11), "impact": 1.40}
    ]

    @classmethod
    def get_active_signals(cls, reference_date: Optional[date] = None, lang: str = "mr") -> List[Dict[str, Any]]:
        ref = reference_date or date(2026, 10, 31)
        signals = []

        # 1. Festival signals (within next 14 days)
        for fest in cls.FESTIVALS:
            diff = (fest["date"] - ref).days
            if 0 <= diff <= 14:
                if diff == 9: # Diwali Hero Signal!
                    signals.append({
                        "type": "FESTIVAL",
                        "title": f"दिवाळी अवघ्या {diff} दिवसांवर (9 Days to Diwali)" if lang == "mr" else f"दिवाली केवल {diff} दिन दूर (Diwali in {diff} Days)",
                        "description": "सणासुदीमुळे शुद्ध देशी तूप, सुकामेवा आणि मिठाईच्या मागणीत 3 पटीने वाढ अपेक्षित आहे.",
                        "days_remaining": diff,
                        "multiplier": fest["impact"],
                        "tag": "दिवाळी सण मागणी" if lang == "mr" else "दिवाली मांग"
                    })
                elif diff <= 7:
                    signals.append({
                        "type": "FESTIVAL",
                        "title": f"{fest['name_mr']} {diff} दिवसांत",
                        "description": "स्थानिक ग्राहकांची खरेदी गती उच्चांकी पातळीवर पोहोचत आहे.",
                        "days_remaining": diff,
                        "multiplier": fest["impact"],
                        "tag": fest["name_mr"]
                    })

        # 2. Weather Signal
        # Dry festive week vs heavy monsoon
        signals.append({
            "type": "WEATHER",
            "title": "सध्याचे हवामान: कोरडे व निरभ्र (Dry & Clear Weather)" if lang == "mr" else "मौसम: सूखा और साफ",
            "description": "पुढील ७ दिवस कोणताही पाऊस नाही, त्यामुळे संध्याकाळची ग्राहक वर्दळ (+20%) वाढेल.",
            "footfall_impact": "+20%",
            "tag": "हवामान अनुकूल" if lang == "mr" else "मौसम अनुकूल"
        })

        # 3. GST Filing Reminder
        # e.g. Monthly GST payment due
        signals.append({
            "type": "GST",
            "title": "GST GSTR-3B विवरणपत्र स्मरणपत्र (GSTR-3B Reminder)" if lang == "mr" else "जीएसटी GSTR-3B रिटर्न रिमाइंडर",
            "description": "या महिन्याचे जीएसटी रिटर्न वेळेत दाखल करण्यासाठी खेळते भांडवल आणि बँक खात्यातील रक्कम तयार ठेवा.",
            "due_date": "20 Nov 2026",
            "tag": "कर पूर्तता" if lang == "mr" else "टैक्स फाइलिंग"
        })

        return signals

    @classmethod
    def get_signals_text_for_recommendation(cls, action_type: str, lang: str = "mr") -> List[str]:
        """Provides concise bullet-points of contributing signals for a recommendation card."""
        if action_type == "SUPPLIER_ORDER":
            if lang == "mr":
                return [
                    "दिवाळी अवघ्या ९ दिवसांवर (Diwali in 9 days)",
                    "सणात तुपाची विक्री ३ पटीने वाढते (Ghee demand 3x)",
                    "पाऊस नसल्याने संध्याकाळची गर्दी जास्त (Clear weather)"
                ]
            elif lang == "hi":
                return [
                    "दिवाली 9 दिन दूर (Diwali in 9 days)",
                    "त्योहार पर घी की मांग 3 गुना बढ़ती है",
                    "मौसम साफ होने से शाम को ग्राहकों की भीड़"
                ]
            else:
                return [
                    "Diwali in 9 days",
                    "Ghee sales surge 3x during festival week",
                    "Clear weather boosting evening footfall"
                ]

        elif action_type == "CAMPAIGN_BROADCAST":
            if lang == "mr":
                return [
                    "६० जुने ग्राहक गेल्या महिनाभरात आलेले नाहीत",
                    "दिवाळी सवलत संदेशामुळे ३५% ग्राहक परत खरेदीला येतात",
                    "१०% कूपन ऑफरमुळे नफा टिकून राहतो"
                ]
            elif lang == "hi":
                return [
                    "60 पुराने ग्राहक 30+ दिनों से नहीं आए हैं",
                    "दिवाली डिस्काउंट से 35% ग्राहक वापस खरीदारी करते हैं",
                    "10% कूपन ऑफर से तुरंत बिक्री बढ़ेगी"
                ]
            else:
                return [
                    "60 lapsed customers haven't visited in 30+ days",
                    "WhatsApp festive offer delivers ~35% return rate",
                    "10% discount coupon boosts holiday retention"
                ]

        elif action_type == "LENDING_APPLICATION":
            if lang == "mr":
                return [
                    "साउंडबॉक्स दैनिक सरासरी विक्री ₹४०,०००+",
                    "दिवाळीसाठी जास्त माल भरण्याची आवश्यकता",
                    "रोजच्या सेटलमेंटमधून सुलभ हप्ते कपात"
                ]
            elif lang == "hi":
                return [
                    "साउंडबॉक्स पर रोजाना बिक्री ₹40,000+",
                    "त्योहार का अतिरिक्त स्टॉक भरने हेतु जरूरत",
                    "दैनिक सेटलमेंट से बिना झंझट आसान कटौती"
                ]
            else:
                return [
                    "Soundbox daily collections average ₹40,000+",
                    "Stock replenishment needed ahead of festive surge",
                    "Hassle-free daily micro-deductions from settlement"
                ]

        return ["स्थानिक व्यवसाय नोंदींवर आधारित"]
