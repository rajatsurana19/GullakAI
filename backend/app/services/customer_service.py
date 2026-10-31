from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.customer import Customer
from app.core.logging import logger

class CustomerService:
    @staticmethod
    async def get_customers(
        db: AsyncSession,
        merchant_id: str,
        segment: str = None,
        limit: int = 100
    ) -> List[Customer]:
        stmt = select(Customer).where(Customer.merchant_id == merchant_id)
        if segment:
            stmt = stmt.where(Customer.segment == segment)
        stmt = stmt.order_by(desc(Customer.total_spend)).limit(limit)
        
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_rfm_segments_summary(db: AsyncSession, merchant_id: str) -> Dict[str, Any]:
        stmt = select(
            Customer.segment,
            func.count(Customer.id),
            func.coalesce(func.sum(Customer.total_spend), 0.0)
        ).where(Customer.merchant_id == merchant_id).group_by(Customer.segment)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        segments = {
            "Champions": {"count": 0, "total_spend": 0.0, "description": "Frequent buyers with high spend"},
            "Loyal Customers": {"count": 0, "total_spend": 0.0, "description": "Regular visitors with steady revenue"},
            "Potential Loyalists": {"count": 0, "total_spend": 0.0, "description": "Recent shoppers with high order potential"},
            "New Customers": {"count": 0, "total_spend": 0.0, "description": "First-time shoppers this month"},
            "At-Risk Customers": {"count": 0, "total_spend": 0.0, "description": "Have not visited in 30+ days"},
            "Lost Customers": {"count": 0, "total_spend": 0.0, "description": "Inactive for more than 60 days"}
        }
        
        for seg_name, count, spend in rows:
            if seg_name in segments:
                segments[seg_name]["count"] = int(count)
                segments[seg_name]["total_spend"] = float(spend)
                
        return segments
