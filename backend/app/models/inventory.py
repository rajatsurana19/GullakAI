import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    name_hindi = Column(String(255), nullable=True)
    name_marathi = Column(String(255), nullable=True)
    category = Column(String(100), default="Grocery")
    unit = Column(String(30), default="kg") # kg, litre, packet, piece, box
    selling_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    is_festive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, unique=True)
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    current_stock = Column(Float, default=0.0)
    safety_stock = Column(Float, default=10.0) # threshold for alert
    reorder_quantity = Column(Float, default=50.0)
    avg_daily_sales = Column(Float, default=2.0)
    stock_coverage_days = Column(Float, default=5.0)
    last_restocked_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="inventory")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    movement_type = Column(String(50), nullable=False) # SALE, RESTOCK, ADJUSTMENT, RETURN
    quantity = Column(Float, nullable=False)
    reference_id = Column(String(100), nullable=True) # transaction_id or order_id
    created_at = Column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(150), nullable=True)
    phone_number = Column(String(20), nullable=False)
    category = Column(String(100), default="Grains & Dairy")
    platform = Column(String(50), default="DIRECT_DISTRIBUTOR") # DIRECT_DISTRIBUTOR, ONDC_NETWORK, LOCAL_MANDI
    lead_time_days = Column(Integer, default=2)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.utcnow)

class SupplierOrder(Base):
    __tablename__ = "supplier_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id = Column(String(36), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    order_reference = Column(String(100), unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="DRAFT") # DRAFT, PENDING_APPROVAL, PLACED, SHIPPED, DELIVERED, CANCELLED
    approval_id = Column(String(36), nullable=True)
    placed_via = Column(String(50), default="GULLAK_AUTO_DRAFT")
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)

    items = relationship("SupplierOrderItem", back_populates="order", cascade="all, delete-orphan")

class SupplierOrderItem(Base):
    __tablename__ = "supplier_order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("supplier_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("SupplierOrder", back_populates="items")
