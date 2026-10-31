from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("/status")
async def get_integrations_status(merchant: Merchant = Depends(get_current_merchant)):
    return {
        "paytm_payments": {
            "mode": settings.PAYMENT_PROVIDER,
            "status": "CONNECTED",
            "device": "Paytm Soundbox 4G",
            "vpa": "sharma.stores@paytm"
        },
        "soundbox": {
            "mode": settings.SOUNDBOX_PROVIDER,
            "status": "ONLINE",
            "battery": "88%",
            "language": "Marathi / Hindi"
        },
        "whatsapp_business": {
            "mode": settings.WHATSAPP_PROVIDER,
            "status": "CONNECTED",
            "sender_phone": "+91 98765 43210"
        },
        "ondc_distributors": {
            "mode": settings.DISTRIBUTOR_PROVIDER,
            "status": "CONNECTED",
            "primary_distributor": "Mahalaxmi Wholesale Distributors"
        },
        "lending_partners": {
            "mode": settings.LENDING_PROVIDER,
            "status": "CONNECTED",
            "available_partners": ["Paytm Payments Bank NBFC", "Tata Capital"]
        },
        "voice_engine": {
            "provider": "Sarvam AI (Saaras v4 + Bulbul v4 Flash)",
            "status": "ACTIVE" if settings.SARVAM_ENABLED else "OFFLINE",
            "languages": ["Hindi", "Marathi", "English", "Hinglish"]
        }
    }
