from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger

class WhatsAppIntegrationAdapter(ABC):
    @abstractmethod
    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        parameters: List[str]
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_message_delivery_status(self, message_id: str) -> Dict[str, Any]:
        pass

class DemoWhatsAppAdapter(WhatsAppIntegrationAdapter):
    """Simulated WhatsApp Business API adapter for demonstrations."""
    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        parameters: List[str]
    ) -> Dict[str, Any]:
        msg_id = f"wamid.{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{to_phone[-4:]}"
        logger.info(f"[Demo WhatsApp] Dispatched {template_name} to {to_phone}: {parameters}")
        return {
            "message_id": msg_id,
            "status": "SENT",
            "recipient": to_phone,
            "template": template_name,
            "provenance": "demo",
            "delivered_at": datetime.utcnow().isoformat()
        }

    async def get_message_delivery_status(self, message_id: str) -> Dict[str, Any]:
        return {
            "message_id": message_id,
            "status": "DELIVERED",
            "read": True,
            "timestamp": datetime.utcnow().isoformat()
        }

class LiveWhatsAppAdapter(WhatsAppIntegrationAdapter):
    """Production Meta WhatsApp Business Cloud API adapter."""
    def __init__(self, token: Optional[str] = None, phone_number_id: Optional[str] = None):
        self.token = token
        self.phone_number_id = phone_number_id

    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        parameters: List[str]
    ) -> Dict[str, Any]:
        if not self.token or not self.phone_number_id:
            raise PermissionError("WhatsApp Cloud API credentials not configured (WHATSAPP_TOKEN, PHONE_NUMBER_ID).")
        raise NotImplementedError("Live WhatsApp Cloud API requires valid Meta developer token.")

    async def get_message_delivery_status(self, message_id: str) -> Dict[str, Any]:
        if not self.token:
            raise PermissionError("WhatsApp credentials missing.")
        raise NotImplementedError("Live status tracking requires authorized webhook.")

def get_whatsapp_adapter() -> WhatsAppIntegrationAdapter:
    if settings.WHATSAPP_PROVIDER == "live":
        return LiveWhatsAppAdapter()
    return DemoWhatsAppAdapter()
