from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.core.config import settings
from app.core.logging import logger

class LendingIntegrationAdapter(ABC):
    @abstractmethod
    async def get_eligible_lender_products(self, merchant_id: str, estimated_gap: float) -> List[Dict[str, Any]]:
        pass

class DemoLendingAdapter(LendingIntegrationAdapter):
    """Presents indicative merchant working capital options from authorized partner NBFCs/Banks."""
    async def get_eligible_lender_products(self, merchant_id: str, estimated_gap: float) -> List[Dict[str, Any]]:
        return [
            {
                "lender_name": "Paytm Payments Bank / Partner NBFC",
                "product_type": "Diwali Merchant Quick Working Capital",
                "indicative_limit": 50000.0,
                "daily_deduction_rate": "1.2% of daily Soundbox settlements",
                "tenure_months": 3,
                "processing_fee": "Zero fee for Diwali festive season",
                "eligibility_status": "Pre-qualified based on past 30-day Soundbox UPI volume",
                "disclaimer": "Indicative terms only. Final approval subject to authorized lender underwriting."
            },
            {
                "lender_name": "Tata Capital B2B Merchant Finance",
                "product_type": "Stock-Up Inventory Credit Line",
                "indicative_limit": 100000.0,
                "daily_deduction_rate": "Flexible monthly EMI or weekly sweep",
                "tenure_months": 6,
                "processing_fee": "0.5%",
                "eligibility_status": "Requires GSTIN verification",
                "disclaimer": "Gullak AI does not issue loans or approve credit."
            }
        ]

class LiveLendingAdapter(LendingIntegrationAdapter):
    async def get_eligible_lender_products(self, merchant_id: str, estimated_gap: float) -> List[Dict[str, Any]]:
        raise PermissionError("Regulated lending API integration requires authorized NBFC/Bank partner credentials.")

def get_lending_adapter() -> LendingIntegrationAdapter:
    if settings.LENDING_PROVIDER == "live":
        return LiveLendingAdapter()
    return DemoLendingAdapter()
