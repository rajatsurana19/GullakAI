from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger

class DistributorIntegrationAdapter(ABC):
    @abstractmethod
    async def place_order(self, supplier_id: str, items: List[Dict[str, Any]], order_ref: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def track_order_status(self, order_ref: str) -> Dict[str, Any]:
        pass

class DemoDistributorAdapter(DistributorIntegrationAdapter):
    """Simulates ONDC network / local distributor order placement and tracking."""
    async def place_order(self, supplier_id: str, items: List[Dict[str, Any]], order_ref: str) -> Dict[str, Any]:
        logger.info(f"[Demo Distributor] Order {order_ref} placed with supplier {supplier_id} for {len(items)} items")
        return {
            "order_reference": order_ref,
            "distributor_name": "Mahalaxmi Wholesale Distributors (Mumbai)",
            "channel": "ONDC / Direct B2B Distributor",
            "status": "ACCEPTED",
            "estimated_delivery": "Within 48 hours",
            "invoice_amount": sum(item["quantity"] * item["unit_price"] for item in items),
            "tracking_number": f"TRK-ONDC-{order_ref[-6:]}",
            "provenance": "demo"
        }

    async def track_order_status(self, order_ref: str) -> Dict[str, Any]:
        return {
            "order_reference": order_ref,
            "status": "DISPATCHED",
            "current_location": "Bhiwandi Central Fulfillment Centre",
            "estimated_delivery_time": "Tomorrow, 2:00 PM"
        }

class LiveDistributorAdapter(DistributorIntegrationAdapter):
    async def place_order(self, supplier_id: str, items: List[Dict[str, Any]], order_ref: str) -> Dict[str, Any]:
        raise PermissionError("Live ONDC B2B Gateway integration requires registered Beckn protocol credentials.")

    async def track_order_status(self, order_ref: str) -> Dict[str, Any]:
        raise PermissionError("Live ONDC tracking requires authorized Beckn subscription.")

def get_distributor_adapter() -> DistributorIntegrationAdapter:
    if settings.DISTRIBUTOR_PROVIDER == "live":
        return LiveDistributorAdapter()
    return DemoDistributorAdapter()
