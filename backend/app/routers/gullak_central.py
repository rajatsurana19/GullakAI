import base64
import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant
from app.models.conversation import Conversation, ConversationMessage
from app.ai.sarvam.client import SarvamClient
from app.ai.agents.orchestrator import GullakOrchestrator
from app.core.logging import logger

router = APIRouter(prefix="/gullak", tags=["Gullak Central Copilot API"])

def map_lang_to_bcp47(lang: Optional[str]) -> str:
    if not lang or lang == "auto":
        return "hi-IN"
    lang = lang.lower().strip()
    if lang.startswith("mr"):
        return "mr-IN"
    if lang.startswith("hi") or lang == "hinglish":
        return "hi-IN"
    if lang.startswith("gu"):
        return "gu-IN"
    if lang.startswith("en"):
        return "en-IN"
    return "hi-IN"

@router.post("/ask")
async def ask_gullak(
    payload: Dict[str, Any] = Body(...),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Central API: POST /api/v1/gullak/ask
    Receives merchant text, reasons with Gullak Orchestrator & Agents, and returns grounded 3-part answer.
    """
    query = (payload.get("query") or "").strip()
    lang = payload.get("language") or "auto"
    conv_id = payload.get("conversation_id")

    if not query:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    orchestrator = GullakOrchestrator(db)
    state = await orchestrator.execute_query(
        merchant_id=merchant.id,
        query=query,
        conversation_id=conv_id,
        language_override=lang
    )

    # Persist in conversation log
    conv = Conversation(
        merchant_id=merchant.id,
        channel="WEB_CHAT",
        language=state["language"],
        title=query[:50]
    )
    db.add(conv)
    await db.flush()

    user_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="USER",
        text_content=query,
        detected_language=state["language"]
    )
    agent_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="AGENT",
        text_content=state["response_text"],
        detected_language=state["language"],
        agent_name=state["agent_name"],
        why_explanation=state.get("why_explanation"),
        approval_id=state.get("approval_id")
    )
    db.add_all([user_msg, agent_msg])
    await db.commit()

    return {
        "conversation_id": conv.id,
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

@router.post("/voice")
async def voice_gullak(
    payload: Dict[str, Any] = Body(...),
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Central API: POST /api/v1/gullak/voice
    Complete voice pipeline: Merchant Audio -> Sarvam Saaras STT -> Intent -> Agent -> Bulbul TTS -> Result
    """
    audio_base64 = payload.get("audio_base64")
    text_query = (payload.get("text_query") or "").strip()
    req_lang = payload.get("language") or "auto"
    conv_id = payload.get("conversation_id")
    sarvam = SarvamClient()

    transcript = text_query
    if audio_base64 and not transcript:
        try:
            audio_bytes = base64.b64decode(audio_base64)
            stt_res = await sarvam.speech_to_text(audio_bytes, language_code=map_lang_to_bcp47(req_lang))
            transcript = (stt_res.get("transcript") or "").strip()
        except Exception as e:
            logger.warning(f"Sarvam STT failed: {e}")
            transcript = ""

    if not transcript:
        effective_lang = req_lang if req_lang != "auto" else (merchant.preferred_language or "en")
        msg = (
            "मला तुमचा आवाज नीट ऐकू आला नाही. कृपया माइक दाबून पुन्हा बोला."
            if effective_lang == "mr" else
            "मुझे आपकी आवाज़ साफ़ नहीं सुनाई दी। कृपया माइक दबाकर दोबारा बोलें।"
        )
        return {
            "conversation_id": conv_id or str(uuid.uuid4()),
            "transcript": "",
            "detected_language": effective_lang,
            "intent": "UNCLEAR_CLARIFY",
            "response_text": msg,
            "audio_base64": None,
            "agent_name": "VoiceListenerAgent",
            "why_explanation": "Microphone audio was silent or unparseable.",
            "suggested_action": "Tap microphone and speak again."
        }

    orchestrator = GullakOrchestrator(db)
    state = await orchestrator.execute_query(
        merchant_id=merchant.id,
        query=transcript,
        conversation_id=conv_id,
        language_override=req_lang
    )

    # Persist in conversation log
    conv = Conversation(
        merchant_id=merchant.id,
        channel="WEB_VOICE" if audio_base64 else "WEB_CHAT",
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
        why_explanation=state.get("why_explanation"),
        approval_id=state.get("approval_id")
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

@router.post("/tts")
async def tts_gullak(
    payload: Dict[str, Any] = Body(...)
):
    """
    Central API: POST /api/v1/gullak/tts
    Converts text to speech using Sarvam Bulbul v4 Flash TTS.
    """
    text = (payload.get("text") or "").strip()
    language = payload.get("language") or "hi-IN"
    speaker = payload.get("speaker") or "meera"

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    sarvam = SarvamClient()
    audio_base64 = await sarvam.text_to_speech(
        text=text,
        language_code=map_lang_to_bcp47(language),
        speaker=speaker
    )

    return {
        "text": text,
        "language": language,
        "speaker": speaker,
        "audio_base64": audio_base64,
        "format": "wav" if audio_base64 else None
    }
