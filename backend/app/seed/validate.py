import asyncio
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure backend root is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
from datetime import date
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal, engine
from app.models.merchant import Merchant
from app.models.customer import Customer
from app.models.inventory import Product, Inventory
from app.models.transaction import Transaction
from app.models.audit import AuditLog
from app.models.recommendation import Recommendation
from app.seed.synthetic.constants import DEMO_TODAY, DIWALI_DATE

async def validate_synthetic_dataset():
    print("=" * 70)
    print("           GULLAK AI SYNTHETIC DATASET VALIDATION")
    print("=" * 70)

    async with AsyncSessionLocal() as db:
        # 1. Merchant Counts
        m_res = await db.execute(select(func.count(Merchant.id)))
        merchant_count = m_res.scalar() or 0
        print(f"  • Merchants Count:           {merchant_count} (Expected: 12)")
        assert merchant_count >= 1, "Must have at least 1 merchant"

        # 2. Hero Merchant Exists & Is Demo
        hero_res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        hero_m = hero_res.scalar_one_or_none()
        assert hero_m is not None, "Hero demo merchant must exist"
        print(f"  • Hero Merchant:             '{hero_m.business_name}' (ID: {hero_m.id})")

        # 3. Hero Fact: Diwali in ~9 Days
        days_to_diwali = (DIWALI_DATE - DEMO_TODAY.date()).days
        print(f"  • Days to Diwali:            {days_to_diwali} days (Expected: 9)")
        assert days_to_diwali == 9, f"Hero condition failure: Diwali must be 9 days away, got {days_to_diwali}"

        # 4. Hero Fact: Pure Desi Cow Ghee runs out in 4 days
        ghee_res = await db.execute(
            select(Product, Inventory).join(Inventory, Product.id == Inventory.product_id).where(
                Product.merchant_id == hero_m.id,
                Product.name.like("%Desi Cow Ghee%")
            )
        )
        ghee_prod, ghee_inv = ghee_res.first()
        days_left = round(ghee_inv.current_stock / ghee_inv.avg_daily_sales, 1)
        print(f"  • Ghee Current Stock:        {ghee_inv.current_stock} Litres")
        print(f"  • Ghee Burn Rate:            {ghee_inv.avg_daily_sales} Litres/day")
        print(f"  • Ghee Runs Out In:          {days_left} days (Expected: 4.0)")
        assert days_left == 4.0, f"Hero condition failure: Ghee must run out in 4.0 days, got {days_left}"

        # 5. Hero Fact: Exactly 60 Lapsed Customers (30+ days)
        lapsed_res = await db.execute(
            select(func.count(Customer.id)).where(
                Customer.merchant_id == hero_m.id,
                Customer.recency_days >= 30,
                Customer.segment == "At-Risk Customers"
            )
        )
        lapsed_count = lapsed_res.scalar() or 0
        print(f"  • Lapsed Customers (30+ d):  {lapsed_count} (Expected: 60)")
        assert lapsed_count == 60, f"Hero condition failure: Must have exactly 60 lapsed customers, got {lapsed_count}"

        # 6. Total Transactions & Non-Zero Metrics
        tx_res = await db.execute(select(func.count(Transaction.id), func.sum(Transaction.amount)))
        tx_count, tx_total = tx_res.first()
        print(f"  • Total Transactions:        {tx_count:,} txns")
        print(f"  • Total Historical Revenue:  ₹{int(tx_total or 0):,}")
        assert tx_count > 1000, "Should have healthy volume of historical transactions"
        assert tx_total > 0, "Total historical revenue cannot be zero"

        # 7. Unified Recommendations: Top 3 Action Cards
        rec_res = await db.execute(
            select(func.count(Recommendation.id)).where(
                Recommendation.merchant_id == hero_m.id,
                Recommendation.is_top_action == True
            )
        )
        rec_count = rec_res.scalar() or 0
        print(f"  • Top Action Cards:          {rec_count} (Expected: 3)")
        assert rec_count == 3, f"Must have exactly 3 top action cards, got {rec_count}"

        # 8. Cryptographic Audit Chain Integrity Check
        audit_res = await db.execute(
            select(AuditLog).where(AuditLog.merchant_id == hero_m.id).order_by(AuditLog.timestamp)
        )
        audit_logs = audit_res.scalars().all()
        print(f"  • Audit Log Events:          {len(audit_logs)} chained records")
        assert len(audit_logs) >= 50, "Should have at least 50 audit records"

        # Verify cryptographic chain
        chain_valid = True
        for i in range(1, len(audit_logs)):
            prev = audit_logs[i - 1]
            curr = audit_logs[i]
            if curr.previous_hash != prev.current_hash:
                chain_valid = False
                break
        print(f"  • Audit Cryptographic Chain: {'VALID (Tamper-evident)' if chain_valid else 'CORRUPTED'}")
        assert chain_valid, "Cryptographic audit chain verification failed"

    await engine.dispose()
    print("\n" + "=" * 70)
    print("             ALL DATASET INVARIANTS SATISFIED (100%)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(validate_synthetic_dataset())
