import httpx
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger

class SarvamClient:
    """Async HTTP client for Sarvam AI Voice & Translation APIs."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key if api_key is not None else settings.SARVAM_API_KEY
        self.base_url = settings.SARVAM_BASE_URL.rstrip('/')
        self.headers = {
            "api-subscription-key": self.api_key or "",
            "Content-Type": "application/json"
        }

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def speech_to_text(self, audio_bytes: bytes, language_code: str = "hi-IN") -> Dict[str, Any]:
        """Calls Sarvam Saaras v4 STT."""
        if not self.is_configured:
            logger.info("Sarvam API key not configured; handling speech-to-text in local/simulated mode.")
            return {
                "transcript": "Kal meri kitni sale hui aur aaj mujhe kya stock mangwana chahiye?" if audio_bytes == b"mock_audio" else "",
                "language_code": language_code,
                "confidence": 0.94 if audio_bytes == b"mock_audio" else 0.0,
                "provider": "saaras_v4_local"
            }

        url = f"{self.base_url}/speech-to-text"
        files = {"file": ("audio.wav", audio_bytes, "audio/wav")}
        data = {"model": "saaras:v4", "language_code": language_code}
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {"api-subscription-key": self.api_key}
            response = await client.post(url, headers=headers, files=files, data=data)
            if response.status_code != 200:
                logger.error(f"Sarvam STT failed: {response.text}")
                raise RuntimeError(f"Sarvam STT error: {response.status_code}")
            return response.json()

    async def text_to_speech(self, text: str, language_code: str = "hi-IN", speaker: Optional[str] = None) -> str:
        """Calls Sarvam Bulbul v4 Flash TTS, returning base64 audio string."""
        if not self.is_configured:
            logger.info("Sarvam API key not configured; skipping remote audio synthesis.")
            return ""

        # Map appropriate regional speakers supported by bulbul:v4-flash
        if not speaker or speaker == "meera":
            if "mr" in language_code.lower():
                speaker = "ishita_mr_conversational"
            elif "en" in language_code.lower():
                speaker = "ishita_en_customer"
            elif "gu" in language_code.lower():
                speaker = "pooja_gu_conversational"
            else:
                speaker = "aditya_hi_conversational"

        url = f"{self.base_url}/text-to-speech"
        payload = {
            "inputs": [text],
            "target_language_code": language_code,
            "speaker": speaker,
            "model": "bulbul:v4-flash"
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, headers=self.headers, json=payload)
            if response.status_code != 200:
                logger.error(f"Sarvam TTS failed: {response.text}")
                return ""
            data = response.json()
            audios = data.get("audios", [])
            return audios[0] if audios else ""
