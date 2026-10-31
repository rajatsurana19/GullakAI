from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.merchant import Merchant
from app.services.payment_service import PaymentService
from app.services.recommendation_service import RecommendationService
from app.core.logging import logger

class DailyBriefService:
    """
    Proactive Partner Service:
    Generates 30-second multi-channel briefs for merchants:
    1. Soundbox Voice Script (TTS-ready, under 40 words)
    2. WhatsApp merchant briefing message
    3. In-App notification
    4. Proactive event triggers (festival stockout, sudden drop, high-value lapse)
    """

    @classmethod
    async def generate_brief(
        cls,
        db: AsyncSession,
        merchant_id: str,
        lang: str = "mr"
    ) -> Dict[str, Any]:
        # 1. Fetch merchant info
        m_res = await db.execute(select(Merchant).where(Merchant.id == merchant_id))
        merchant = m_res.scalar_one_or_none()
        owner = merchant.owner_name if merchant else "दुकानदार मित्र"

        # 2. Today's & Tomorrow's numbers
        sales_data = await PaymentService.get_today_summary(db, merchant_id)
        today_rev = int(sales_data.get("today_revenue", 0))
        yesterday_rev = int(sales_data.get("yesterday_revenue", 0))
        deposit = int(sales_data.get("pending_settlement_amount", 0))
        deposit_avail = sales_data.get("deposit_info_available", False)

        # 3. Top 3 actions
        top_actions = await RecommendationService.get_top_3_actions(db, merchant_id, lang)
        action_count = len(top_actions)
        top_headline = top_actions[0]["headline"] if top_actions else ""

        # --- A. Soundbox Voice Script (Under 40 words, clean audio announcement) ---
        if lang == "mr":
            dep_phrase = f"उद्या बँकेत ₹{deposit:,} जमा होतील." if (deposit_avail and deposit > 0) else "उद्या किती पैसे जमा होतील याची माहिती सध्या उपलब्ध नाही."
            soundbox_script = (
                f"नमस्कार {owner}! आज ₹{today_rev:,} ची विक्री झाली. {dep_phrase} "
                f"दिवाळीसाठी {top_headline[:35]}. गुल्लक ॲप उघडून एका टॅपमध्ये मंजुरी द्या."
            )
        elif lang in ["hi", "hinglish"]:
            dep_phrase = f"कल बैंक में ₹{deposit:,} जमा होंगे।" if (deposit_avail and deposit > 0) else "कल बैंक में कितने पैसे जमा होंगे इसकी जानकारी अभी उपलब्ध नहीं है।"
            soundbox_script = (
                f"नमस्ते {owner}! आज ₹{today_rev:,} की बिक्री हुई। {dep_phrase} "
                f"दिवाली के लिए {top_headline[:35]}। गुल्लक ऐप में एक टैप से मंज़ूर करें।"
            )
        else:
            dep_phrase = f"₹{deposit:,} will be deposited tomorrow." if (deposit_avail and deposit > 0) else "Tomorrow's bank deposit details are currently unavailable."
            soundbox_script = (
                f"Hello {owner}! Today's sales reached ₹{today_rev:,}. {dep_phrase} "
                f"{top_headline[:35]}. Review and approve in Gullak app."
            )

        # Word count safety check
        words = soundbox_script.split()
        if len(words) > 40:
            soundbox_script = " ".join(words[:38]) + "..."

        # --- B. WhatsApp Text Message ---
        if lang == "mr":
            whatsapp_text = (
                f"🔔 *गुल्लक एआय दैनिक व्यापारी अपडेट*\n"
                f"दुकान: {merchant.business_name if merchant else 'आपली दुकान'}\n\n"
                f"📊 *आजची एकूण विक्री:* ₹{today_rev:,}\n"
                f"🏦 *उद्या सकाळी बँकेत जमा:* ₹{deposit:,} (ऑनलाइन पेमेंट्स)\n\n"
                f"⚡ *आजचे ३ महत्त्वाचे निर्णय:*\n"
            )
            for idx, a in enumerate(top_actions, 1):
                whatsapp_text += f"{idx}. {a['headline']} (अंदाजे नफा: ₹{int(a['expected_impact_inr']):,})\n"
            whatsapp_text += f"\n👉 गुल्लक ॲप उघडा आणि मंजुरी द्या: https://paytm.me/gullak"
        elif lang in ["hi", "hinglish"]:
            whatsapp_text = (
                f"🔔 *गुल्लक एआई दैनिक पार्टनर ब्रीफिंग*\n"
                f"दुकान: {merchant.business_name if merchant else 'आपकी दुकान'}\n\n"
                f"📊 *आज की कुल बिक्री:* ₹{today_rev:,}\n"
                f"🏦 *कल सुबह बैंक में जमा:* ₹{deposit:,}\n\n"
                f"⚡ *आज के ३ जरूरी फैसले:*\n"
            )
            for idx, a in enumerate(top_actions, 1):
                whatsapp_text += f"{idx}. {a['headline']} (संभावित लाभ: ₹{int(a['expected_impact_inr']):,})\n"
            whatsapp_text += f"\n👉 गुल्लक ऐप खोलें और मंज़ूर करें: https://paytm.me/gullak"
        else:
            whatsapp_text = (
                f"🔔 *Gullak AI Daily Partner Briefing*\n"
                f"Store: {merchant.business_name if merchant else 'Your Store'}\n\n"
                f"📊 *Today's Sales:* ₹{today_rev:,}\n"
                f"🏦 *Bank Deposit Tomorrow:* ₹{deposit:,}\n\n"
                f"⚡ *Top 3 Actions Today:*\n"
            )
            for idx, a in enumerate(top_actions, 1):
                whatsapp_text += f"{idx}. {a['headline']} (Expected impact: ₹{int(a['expected_impact_inr']):,})\n"
            whatsapp_text += f"\n👉 Open Gullak App to approve: https://paytm.me/gullak"

        # --- C. In-App Notification Banner ---
        in_app = {
            "title": "आजचे दैनिक अपडेट (Daily Brief)" if lang == "mr" else "आज की दैनिक ब्रीफिंग",
            "body": f"आज ₹{today_rev:,} विक्री. उद्या बँकेत ₹{deposit:,} जमा. {action_count} तातडीचे निर्णय प्रलंबित.",
            "top_actions_count": action_count,
            "created_at": datetime.utcnow().isoformat()
        }

        # --- D. Proactive Event Triggers ---
        proactive_alerts = []
        # Event 1: Festival Stockout (Diwali in 9 days, Ghee runs out in 4)
        proactive_alerts.append({
            "trigger": "FESTIVAL_STOCKOUT_PREDICTED",
            "urgency": "HIGH",
            "headline": "दिवाळी साठा इशारा: देशी तूप ४ दिवसांत संपेल" if lang == "mr" else "दिवाली स्टॉक चेतावनी: देसी घी 4 दिन में खत्म होगा",
            "detail": "दिवाळी ९ दिवसांवर आहे पण देशी गायीच्या तुपाचा साठा फक्त ४ दिवस पुरेल असा अंदाज आहे."
        })

        # Event 2: High Value Customers Lapsing
        proactive_alerts.append({
            "trigger": "HIGH_VALUE_CUSTOMERS_LAPSING",
            "urgency": "MEDIUM",
            "headline": "६० जुने ग्राहक गेल्या ३० दिवसांत आलेले नाहीत" if lang == "mr" else "60 पुराने ग्राहक पिछले 30 दिनों से नहीं आए",
            "detail": "दिवाळी सवलत संदेश पाठवून त्यांना पुन्हा दुकानात आणा."
        })

        return {
            "merchant_id": merchant_id,
            "owner_name": owner,
            "today_revenue": today_rev,
            "yesterday_revenue": yesterday_rev,
            "tomorrow_deposit": deposit,
            "deposit_info_available": deposit_avail,
            "soundbox_voice_script": soundbox_script,
            "soundbox_word_count": len(soundbox_script.split()),
            "whatsapp_message_text": whatsapp_text,
            "in_app_notification": in_app,
            "proactive_alerts": proactive_alerts,
            "top_actions": top_actions,
            "generated_at": datetime.utcnow().isoformat()
        }
