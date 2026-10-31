from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.permissions import get_current_merchant
from app.models.merchant import Merchant, MerchantProfile, MerchantPreferences, MerchantDevice
from app.schemas.schemas import MerchantRegisterRequest, MerchantLoginRequest, TokenResponse, MerchantProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: MerchantRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check phone
    existing = await db.execute(select(Merchant).where(Merchant.phone_number == req.phone_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A store is already registered with this mobile number.")

    merchant = Merchant(
        business_name=req.business_name,
        owner_name=req.owner_name,
        phone_number=req.phone_number,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        is_demo=False
    )
    db.add(merchant)
    await db.flush()

    # Create default profile & preferences
    profile = MerchantProfile(
        merchant_id=merchant.id,
        category=req.category,
        city=req.city,
        state="Maharashtra",
        settlement_vpa=f"{req.phone_number}@paytm"
    )
    prefs = MerchantPreferences(
        merchant_id=merchant.id,
        preferred_language=req.preferred_language or "mr"
    )
    db.add_all([profile, prefs])
    await db.commit()
    await db.refresh(merchant)

    token = create_access_token({"sub": merchant.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": merchant.id,
            "business_name": merchant.business_name,
            "owner_name": merchant.owner_name,
            "phone_number": merchant.phone_number,
            "preferred_language": req.preferred_language,
            "is_demo": False
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: MerchantLoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Merchant).where(Merchant.phone_number == req.phone_number))
    merchant = res.scalar_one_or_none()
    
    if not merchant or not verify_password(req.password, merchant.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password."
        )

    token = create_access_token({"sub": merchant.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": merchant.id,
            "business_name": merchant.business_name,
            "owner_name": merchant.owner_name,
            "phone_number": merchant.phone_number,
            "is_demo": merchant.is_demo
        }
    }

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(db: AsyncSession = Depends(get_db)):
    """1-Click instant login for the Sharma General Stores demo scenario."""
    res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
    merchant = res.scalar_one_or_none()
    
    if not merchant:
        # Fallback to any active merchant
        res_any = await db.execute(select(Merchant).limit(1))
        merchant = res_any.scalar_one_or_none()
        
    if not merchant:
        raise HTTPException(status_code=404, detail="Demo merchant not found. Please run database seed.")

    token = create_access_token({"sub": merchant.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": merchant.id,
            "business_name": merchant.business_name,
            "owner_name": merchant.owner_name,
            "phone_number": merchant.phone_number,
            "is_demo": True
        }
    }

@router.get("/me")
async def get_me(merchant: Merchant = Depends(get_current_merchant), db: AsyncSession = Depends(get_db)):
    # Fetch profile and preferences
    prof_res = await db.execute(select(MerchantProfile).where(MerchantProfile.merchant_id == merchant.id))
    pref_res = await db.execute(select(MerchantPreferences).where(MerchantPreferences.merchant_id == merchant.id))
    prof = prof_res.scalar_one_or_none()
    pref = pref_res.scalar_one_or_none()

    return {
        "id": merchant.id,
        "business_name": merchant.business_name,
        "owner_name": merchant.owner_name,
        "phone_number": merchant.phone_number,
        "email": merchant.email,
        "category": prof.category if prof else "Grocery & General Store",
        "city": prof.city if prof else "Mumbai",
        "state": prof.state if prof else "Maharashtra",
        "settlement_vpa": prof.settlement_vpa if prof else "sharma.stores@paytm",
        "preferred_language": pref.preferred_language if pref else "mr",
        "is_demo": merchant.is_demo
    }
