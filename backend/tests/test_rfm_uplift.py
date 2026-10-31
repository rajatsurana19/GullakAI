import pytest
from app.ml.rfm.engine import RFMEngine
from app.ml.uplift.engine import UpliftEngine

def test_rfm_engine():
    sample_customers = [
        {"id": "1", "name": "Rajesh", "recency_days": 2, "total_orders": 25, "total_spend": 15000.0},
        {"id": "2", "name": "Pooja", "recency_days": 4, "total_orders": 18, "total_spend": 11000.0},
        {"id": "3", "name": "Amit", "recency_days": 12, "total_orders": 6, "total_spend": 4500.0},
        {"id": "4", "name": "Neha", "recency_days": 5, "total_orders": 1, "total_spend": 850.0},
        {"id": "5", "name": "Suresh", "recency_days": 45, "total_orders": 12, "total_spend": 9000.0},
        {"id": "6", "name": "Sunil", "recency_days": 90, "total_orders": 2, "total_spend": 1500.0},
    ]
    results = RFMEngine.calculate_rfm_scores(sample_customers)
    assert len(results) == len(sample_customers)
    # Check that segments exist
    segments = [r["segment"] for r in results]
    assert any("Champions" in s or "Loyal" in s for s in segments)
    assert any("At-Risk" in s or "Lost" in s for s in segments)

def test_uplift_engine():
    treatment = [{"has_converted": True}] * 22 + [{"has_converted": False}] * 78 # 22% conversion
    control = [{"has_converted": True}] * 4 + [{"has_converted": False}] * 96 # 4% conversion
    
    metrics = UpliftEngine.estimate_campaign_uplift(treatment, control)
    assert metrics["treatment_conversion_rate"] == 0.22
    assert metrics["control_conversion_rate"] == 0.04
    assert metrics["incremental_uplift_percent"] == 18.0
    assert metrics["statistically_significant"] is True
