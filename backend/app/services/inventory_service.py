from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.inventory import Product, Inventory, Supplier, SupplierOrder, SupplierOrderItem
from app.core.logging import logger

class InventoryService:
    @staticmethod
    async def get_products_with_inventory(db: AsyncSession, merchant_id: str) -> List[Dict[str, Any]]:
        stmt = select(Product, Inventory).join(
            Inventory, Product.id == Inventory.product_id
        ).where(Product.merchant_id == merchant_id)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        products_list = []
        for product, inv in rows:
            is_low = inv.current_stock <= inv.safety_stock
            coverage = inv.current_stock / inv.avg_daily_sales if inv.avg_daily_sales > 0 else 30.0
            predicted_days = max(1, int(coverage))
            
            products_list.append({
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "name_hindi": product.name_hindi,
                "name_marathi": product.name_marathi,
                "category": product.category,
                "unit": product.unit,
                "selling_price": product.selling_price,
                "cost_price": product.cost_price,
                "current_stock": inv.current_stock,
                "safety_stock": inv.safety_stock,
                "avg_daily_sales": inv.avg_daily_sales,
                "stock_coverage_days": round(coverage, 1),
                "is_low_stock": is_low,
                "predicted_stock_out_days": predicted_days,
                "is_festive": product.is_festive
            })
        return products_list

    @staticmethod
    async def get_low_stock_alerts(db: AsyncSession, merchant_id: str) -> List[Dict[str, Any]]:
        products = await InventoryService.get_products_with_inventory(db, merchant_id)
        low_stock = [p for p in products if p["is_low_stock"]]
        
        alerts = []
        for item in low_stock:
            alerts.append({
                "product_id": item["id"],
                "product_name": item["name"],
                "current_stock": item["current_stock"],
                "unit": item["unit"],
                "days_left": item["predicted_stock_out_days"],
                "risk_level": "High stock-out risk" if item["predicted_stock_out_days"] <= 4 else "Moderate risk",
                "human_message": f"This product may run out in about {item['predicted_stock_out_days']} days.",
                "suggested_action": f"Reorder {int(item['safety_stock'] * 3)} {item['unit']}"
            })
        return alerts

    @staticmethod
    async def create_reorder_draft(
        db: AsyncSession,
        merchant_id: str,
        supplier_id: str,
        items: List[Dict[str, Any]],
        approval_id: Optional[str] = None
    ) -> SupplierOrder:
        order_ref = f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        total_amount = sum(item["quantity"] * item["unit_price"] for item in items)
        
        order = SupplierOrder(
            merchant_id=merchant_id,
            supplier_id=supplier_id,
            order_reference=order_ref,
            total_amount=total_amount,
            status="PENDING_APPROVAL" if approval_id else "DRAFT",
            approval_id=approval_id,
            placed_via="GULLAK_AUTO_DRAFT"
        )
        db.add(order)
        await db.flush()
        
        for item in items:
            order_item = SupplierOrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                quantity=float(item["quantity"]),
                unit_price=float(item["unit_price"]),
                total_price=float(item["quantity"] * item["unit_price"])
            )
            db.add(order_item)
            
        await db.commit()
        await db.refresh(order)
        logger.info(f"Reorder draft {order_ref} created for ₹{total_amount}")
        return order
