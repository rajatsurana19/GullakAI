from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger

class SoundboxIntegrationAdapter(ABC):
    @abstractmethod
    async def get_device_status(self, device_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def simulate_audio_announcement(self, device_id: str, amount: float, language: str) -> Dict[str, Any]:
        pass

class DemoSoundboxAdapter(SoundboxIntegrationAdapter):
    """Simulated Soundbox adapter with honest device mapping and audio triggers."""
    async def get_device_status(self, device_id: str) -> Dict[str, Any]:
        return {
            "device_id": device_id,
            "model": "Paytm Soundbox 4G (Voice Enabled)",
            "status": "ONLINE",
            "battery_percent": 88,
            "signal_strength": "Excellent (4G)",
            "active_language": "Marathi / Hindi",
            "firmware": "v4.2.1-indic",
            "last_heartbeat": datetime.utcnow().isoformat(),
            "provenance": "demo"
        }

    async def simulate_audio_announcement(self, device_id: str, amount: float, language: str = "hi") -> Dict[str, Any]:
        text_announcement = ""
        if language == "mr":
            text_announcement = f"Paytm वर {int(amount)} रुपये मिळाले!"
        elif language == "hi":
            text_announcement = f"Paytm पर {int(amount)} रुपये प्राप्त हुए!"
        else:
            text_announcement = f"Received {int(amount)} rupees on Paytm!"

        return {
            "device_id": device_id,
            "status": "ANNOUNCEMENT_PLAYED",
            "announcement_text": text_announcement,
            "language": language,
            "timestamp": datetime.utcnow().isoformat(),
            "note": "Simulated hardware broadcast; no direct hardware mic claim made."
        }

class LiveSoundboxAdapter(SoundboxIntegrationAdapter):
    """Production Soundbox adapter requiring official Paytm IoT SDK."""
    async def get_device_status(self, device_id: str) -> Dict[str, Any]:
        raise PermissionError("Official Paytm Soundbox IoT credentials required for live device status.")

    async def simulate_audio_announcement(self, device_id: str, amount: float, language: str) -> Dict[str, Any]:
        raise PermissionError("Direct Soundbox hardware announcement requires registered partner IoT gateway access.")

def get_soundbox_adapter() -> SoundboxIntegrationAdapter:
    if settings.SOUNDBOX_PROVIDER == "live":
        return LiveSoundboxAdapter()
    return DemoSoundboxAdapter()
