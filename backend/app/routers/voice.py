import base64
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.conversation import Conversation, ConversationMessage
from app.ai.sarvam.client import SarvamClient
from app.ai.agents.orchestrator import GullakOrchestrator
from app.schemas.schemas import VoiceProcessRequest, VoiceProcessResponse
from app.core.logging import logger

router = APIRouter(prefix="/voice", tags=["Voice & Multilingual"])

def map_lang_to_bcp47(lang: Optional[str]) -> str:
    """Maps internal language codes (mr, hi, hinglish, en) to Sarvam BCP-47 codes."""
    if not lang or lang == "auto":
        return "hi-IN"
    lang = lang.lower().strip()
    if lang.startswith("mr"):
        return "mr-IN"
    if lang.startswith("hi") or lang == "hinglish":
        return "hi-IN"
    if lang.startswith("en"):
        return "en-IN"
    return "hi-IN"

@router.post("/process", response_model=VoiceProcessResponse)
async def process_voice_or_text(
    req: VoiceProcessRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    sarvam = SarvamClient()
    transcript = (req.text_query or "").strip()
    req_lang = req.language or "auto"
    stt_lang = map_lang_to_bcp47(req_lang)

    # If audio is provided, transcribe with Sarvam Saaras v4
    if req.audio_base64 and not transcript:
        try:
            audio_bytes = base64.b64decode(req.audio_base64)
            stt_res = await sarvam.speech_to_text(audio_bytes, language_code=stt_lang)
            transcript = (stt_res.get("transcript") or "").strip()
        except Exception as e:
            logger.warning(f"Audio transcription error: {e}")
            transcript = ""

    # If no speech or text detected: ask merchant to repeat/clarify instead of defaulting to today's sales
    if not transcript:
        effective_lang = req_lang if req_lang != "auto" else (merchant.preferred_language or "en")
        if effective_lang == "mr":
            msg = "मला तुमचा आवाज नीट ऐकू आला नाही. कृपया माइक दाबून पुन्हा बोला किंवा तुमचा प्रश्न टाईप करा."
        elif effective_lang in ["hi", "hinglish"]:
            msg = "मुझे आपकी आवाज़ साफ़ नहीं सुनाई दी। कृपया माइक दबाकर दोबारा बोलें या अपना सवाल टाइप करें।"
        else:
            msg = "I could not hear any speech clearly. Please tap the microphone and speak again or type your question."

        return {
            "conversation_id": req.conversation_id or str(uuid.uuid4()),
            "transcript": "",
            "detected_language": effective_lang,
            "intent": "UNCLEAR_CLARIFY",
            "response_text": msg,
            "audio_base64": None,
            "agent_name": "VoiceListenerAgent",
            "why_explanation": "Speech input was silent or not recognized clearly by speech recognition.",
            "suggested_action": "Tap microphone to speak again in Marathi, Hindi, or English.",
            "approval_required": False,
            "approval_id": None,
            "execution_data": None
        }

    # Orchestrator executes multi-agent workflow
    orchestrator = GullakOrchestrator(db)
    state = await orchestrator.execute_query(
        merchant_id=merchant.id,
        query=transcript,
        conversation_id=req.conversation_id,
        language_override=req.language
    )

    # Persist message in conversation history
    conv = Conversation(
        merchant_id=merchant.id,
        channel="WEB_VOICE" if req.audio_base64 else "WEB_CHAT",
        language=state["language"],
        title=transcript[:50]
    )
    db.add(conv)
    await db.flush()

    user_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="USER",
        text_content=transcript,
        detected_language=state["language"]
    )
    agent_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="AGENT",
        text_content=state["response_text"],
        detected_language=state["language"],
        agent_name=state["agent_name"],
        why_explanation=state["why_explanation"],
        approval_id=state["approval_id"]
    )
    db.add_all([user_msg, agent_msg])
    await db.commit()

    return {
        "conversation_id": conv.id,
        "transcript": transcript,
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
