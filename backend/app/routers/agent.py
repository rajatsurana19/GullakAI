import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.conversation import Conversation, ConversationMessage
from app.ai.agents.orchestrator import GullakOrchestrator
from app.schemas.schemas import VoiceProcessRequest, VoiceProcessResponse

router = APIRouter(prefix="/agent", tags=["Agent Brain"])

@router.post("/chat", response_model=VoiceProcessResponse)
async def chat_with_agent(
    req: VoiceProcessRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    query = (req.text_query or "").strip()
    req_lang = req.language or "auto"
    effective_lang = req_lang if req_lang != "auto" else (getattr(merchant, "preferred_language", None) or "en")

    if not query:
        if effective_lang == "mr":
            msg = "नमस्कार! मी तुम्हाला काय मदत करू? तुम्ही मला आजची विक्री, साठा, किंवा परचेस ऑर्डर्सबद्दल विचारू शकता."
        elif effective_lang in ["hi", "hinglish"]:
            msg = "नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ? आप मुझसे आज की बिक्री, स्टॉक या परचेज़ ऑर्डर्स के बारे में पूछ सकते हैं।"
        else:
            msg = "Hello! How can I assist you today? You can ask me about today's sales, stock levels, or purchase orders."

        return {
            "conversation_id": req.conversation_id or str(uuid.uuid4()),
            "transcript": "",
            "detected_language": effective_lang,
            "intent": "GREETING",
            "response_text": msg,
            "audio_base64": None,
            "agent_name": "GullakAssistant",
            "why_explanation": None,
            "suggested_action": "Ask a question about sales, inventory, orders, or customers.",
            "approval_required": False,
            "approval_id": None,
            "execution_data": None
        }

    orchestrator = GullakOrchestrator(db)
    state = await orchestrator.execute_query(
        merchant_id=merchant.id,
        query=query,
        conversation_id=req.conversation_id,
        language_override=req.language
    )
    return {
        "conversation_id": state["conversation_id"],
        "transcript": query,
        "detected_language": state["language"],
        "intent": state["intent"],
        "response_text": state["response_text"],
        "audio_base64": state.get("audio_base64"),
        "agent_name": state["agent_name"],
        "why_explanation": state.get("why_explanation"),
        "suggested_action": state.get("suggested_action"),
        "approval_required": state.get("approval_required", False),
        "approval_id": state.get("approval_id"),
        "execution_data": state.get("execution_data")
    }

@router.get("/conversations")
async def list_conversations(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(
        Conversation.merchant_id == merchant.id
    ).order_by(desc(Conversation.created_at)).limit(20)
    res = await db.execute(stmt)
    return res.scalars().all()
