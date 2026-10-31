import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.database import init_db
from app.routers import (
    auth,
    dashboard,
    transactions,
    analytics,
    inventory,
    suppliers,
    customers,
    campaigns,
    voice,
    agent,
    approvals,
    consent,
    audit,
    finance,
    hyperlocal,
    integrations,
    recommendations,
    outcomes,
    brief,
    eval_router,
    gullak_central,
    what_if,
    stock_rescue
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Gullak AI Backend Services...")
    await init_db()
    # Auto-seed synthetic dataset if empty
    from app.core.database import AsyncSessionLocal
    from app.models.merchant import Merchant
    from sqlalchemy import select
    from app.seed.synthetic.generator import SyntheticDataGenerator
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Merchant).where(Merchant.is_demo == True))
        if not res.scalar_one_or_none():
            gen = SyntheticDataGenerator(seed=42, merchant_count=12)
            await gen.generate_all(state="before")
    logger.info("Gullak AI Backend Ready.")
    yield
    logger.info("Shutting down Gullak AI Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Gullak AI — Multilingual Autonomous Merchant Intelligence Platform for Paytm Ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance & Correlation ID Middleware
@app.middleware("http")
async def add_process_time_and_logging(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    return response

# Layman-Friendly Exception Handlers (Gap Add-on Requirement 9)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal error processing {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Something went wrong on our end. Please try again in a moment.",
            "detail": "Our team has been notified. No data was lost.",
            "code": "SERVER_RETRYABLE"
        }
    )

# Include Routers with /api/v1 prefix
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(transactions.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(inventory.router, prefix=settings.API_V1_PREFIX)
app.include_router(suppliers.router, prefix=settings.API_V1_PREFIX)
app.include_router(customers.router, prefix=settings.API_V1_PREFIX)
app.include_router(campaigns.router, prefix=settings.API_V1_PREFIX)
app.include_router(voice.router, prefix=settings.API_V1_PREFIX)
app.include_router(agent.router, prefix=settings.API_V1_PREFIX)
app.include_router(approvals.router, prefix=settings.API_V1_PREFIX)
app.include_router(consent.router, prefix=settings.API_V1_PREFIX)
app.include_router(audit.router, prefix=settings.API_V1_PREFIX)
app.include_router(finance.router, prefix=settings.API_V1_PREFIX)
app.include_router(hyperlocal.router, prefix=settings.API_V1_PREFIX)
app.include_router(integrations.router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_V1_PREFIX)
app.include_router(outcomes.router, prefix=settings.API_V1_PREFIX)
app.include_router(brief.router, prefix=settings.API_V1_PREFIX)
app.include_router(eval_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(gullak_central.router, prefix=settings.API_V1_PREFIX)
app.include_router(what_if.router, prefix=settings.API_V1_PREFIX)
app.include_router(stock_rescue.router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "sarvam_enabled": settings.SARVAM_ENABLED,
        "providers": {
            "payment": settings.PAYMENT_PROVIDER,
            "soundbox": settings.SOUNDBOX_PROVIDER,
            "whatsapp": settings.WHATSAPP_PROVIDER,
            "distributor": settings.DISTRIBUTOR_PROVIDER,
            "lending": settings.LENDING_PROVIDER
        }
    }
