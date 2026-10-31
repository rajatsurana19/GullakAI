import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Integer, DateTime, Date, ForeignKey, Text, JSON, Boolean
from app.core.database import Base

class SalesForecast(Base):
    __tablename__ = "sales_forecasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_demand = Column(Float, nullable=False) # Predicted units or INR
    confidence_lower = Column(Float, nullable=False)
    confidence_upper = Column(Float, nullable=False)
    model_name = Column(String(50), default="LightGBM_Prophet_Ensemble") # LightGBM, Prophet, Moving_Average
    features_used = Column(JSON, nullable=True) # festival, day_of_week, historical_sales
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_name = Column(String(50), nullable=False)
    evaluation_date = Column(DateTime, default=datetime.utcnow)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    wape = Column(Float, nullable=False) # Weighted Absolute Percentage Error
    forecast_bias = Column(Float, nullable=False)
    data_points = Column(Integer, default=500)

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="INVENTORY") # INVENTORY, SALES, CUSTOMER, CAPITAL, PRICING
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    
    # Layman-Friendly Humanized Content
    summary_text = Column(Text, nullable=False) # e.g. "Desi Ghee may run out in 4 days before Diwali."
    why_explanation = Column(Text, nullable=False) # "Diwali demand surge is predicted at +180% based on neighbourhood patterns."
    suggested_action = Column(Text, nullable=False) # "Reorder 50 units from Mahalaxmi Distributors."
    
    action_type = Column(String(50), nullable=True) # DRAFT_ORDER, SEND_CAMPAIGN, APPLY_LOAN
    action_payload = Column(JSON, nullable=True)
    
    status = Column(String(30), default="PENDING") # PENDING, ACTIONED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)

class HyperlocalAggregate(Base):
    __tablename__ = "hyperlocal_aggregates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pincode = Column(String(10), nullable=False, index=True)
    region_name = Column(String(100), default="Mumbai Central / Dadar")
    category = Column(String(100), default="Grocery & General Store")
    metric_name = Column(String(100), nullable=False) # DIWALI_SWEET_DEMAND_SURGE, AVG_DAILY_UPI_TXNS
    metric_value = Column(Float, nullable=False)
    trend_direction = Column(String(20), default="UP") # UP, DOWN, STABLE
    benchmark_comparison = Column(String(255), nullable=True) # "15% higher than Mumbai city average"
    anonymised_sample_size = Column(Integer, default=142)
    period = Column(String(50), default="October 2026")
    updated_at = Column(DateTime, default=datetime.utcnow)
