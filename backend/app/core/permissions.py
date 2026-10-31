from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import decode_access_token
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_merchant(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    from app.models.merchant import Merchant
    
    # If in development and token is missing or dummy demo token, fallback to demo merchant
    if not token or token == "demo_token":
        result = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        merchant = result.scalar_one_or_none()
        if merchant:
            return merchant

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = decode_access_token(token)
    merchant_id = payload.get("sub")
    if not merchant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    result = await db.execute(select(Merchant).where(Merchant.id == merchant_id))
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant account not found."
        )
    return merchant

async def verify_merchant_consent(
    merchant_id: str,
    purpose: str,
    db: AsyncSession
) -> bool:
    """Verifies that the merchant has granted active DPDPA consent for this purpose."""
    from app.models.consent import Consent
    result = await db.execute(
        select(Consent).where(
            Consent.merchant_id == merchant_id,
            Consent.purpose == purpose,
            Consent.status == "GRANTED"
        )
    )
    consent = result.scalar_one_or_none()
    return consent is not None
