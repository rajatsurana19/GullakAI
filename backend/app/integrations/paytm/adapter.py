from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger

class PaytmIntegrationAdapter(ABC):
    @abstractmethod
    async def fetch_transaction_status(self, paytm_order_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def fetch_settlement_summary(self, merchant_id: str) -> Dict[str, Any]:
        pass

class PaytmDemoAdapter(PaytmIntegrationAdapter):
    """Simulated Paytm adapter with clearly labelled provenance."""
    async def fetch_transaction_status(self, paytm_order_id: str) -> Dict[str, Any]:
        return {
            "order_id": paytm_order_id,
            "status": "TXN_SUCCESS",
            "provenance": "demo",
            "gateway": "Paytm Payment Gateway (Demo)",
            "message": "Payment confirmed via UPI Soundbox"
        }

    async def fetch_settlement_summary(self, merchant_id: str) -> Dict[str, Any]:
        return {
            "merchant_id": merchant_id,
            "total_settled_today": 24850.0,
            "pending_settlement": 3600.0,
            "next_settlement_time": "Tomorrow at 06:00 AM",
            "destination_vpa": "sharma.stores@paytm",
            "provenance": "demo"
        }

class PaytmLiveAdapter(PaytmIntegrationAdapter):
    """Production Paytm adapter with real credentials check and API endpoints."""
    def __init__(self, mid: Optional[str] = None, merchant_key: Optional[str] = None):
        self.mid = mid
        self.merchant_key = merchant_key
        if not self.mid or not self.merchant_key:
            logger.warning("PaytmLiveAdapter instantiated without credentials. Calls will raise error.")

    async def fetch_transaction_status(self, paytm_order_id: str) -> Dict[str, Any]:
        if not self.mid or not self.merchant_key:
            raise PermissionError("Live Paytm credentials not configured. Please supply PAYTM_MID and PAYTM_KEY.")
        # Production would call official Paytm Order Status API
        raise NotImplementedError("Live Paytm API access requires authorized partner credentials.")

    async def fetch_settlement_summary(self, merchant_id: str) -> Dict[str, Any]:
        if not self.mid:
            raise PermissionError("Live Paytm credentials missing.")
        raise NotImplementedError("Live Paytm Settlement API requires partner authorization.")

def get_paytm_adapter() -> PaytmIntegrationAdapter:
    if settings.PAYMENT_PROVIDER == "live":
        return PaytmLiveAdapter()
    return PaytmDemoAdapter()
