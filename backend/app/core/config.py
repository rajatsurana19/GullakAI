import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Gullak AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "gullak-ai-fintech-hackathon-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./gullak.db"
    
    # Event Bus & Messaging
    EVENT_BUS_MODE: str = "local" # local | kafka
    REDIS_URL: str = "redis://localhost:6379/0"
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    
    # Voice Infrastructure (Sarvam AI)
    SARVAM_ENABLED: bool = True
    SARVAM_API_KEY: Optional[str] = None
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"
    SARVAM_STT_MODEL: str = "saaras:v4"
    SARVAM_TTS_MODEL: str = "bulbul:v4-flash"
    
    # LLM Providers
    LLM_PROVIDER: str = "demo" # demo | sarvam | gemini | claude
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # WhatsApp Cloud / Business API
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: Optional[str] = None

    # Paytm Merchant Partner API
    PAYTM_MERCHANT_ID: Optional[str] = None
    PAYTM_MERCHANT_KEY: Optional[str] = None
    JWT_SECRET: Optional[str] = None
    
    # Integration Providers
    PAYMENT_PROVIDER: str = "demo" # demo | live
    SOUNDBOX_PROVIDER: str = "demo" # demo | live
    WHATSAPP_PROVIDER: str = "demo" # demo | live
    DISTRIBUTOR_PROVIDER: str = "demo" # demo | live
    LENDING_PROVIDER: str = "demo" # demo | live
    
    # Governance & DPDPA
    CONSENT_ENFORCEMENT: bool = True
    MAX_AUTO_APPROVAL_AMOUNT: float = 5000.0 # INR
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
