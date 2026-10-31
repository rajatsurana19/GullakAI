import pytest
from app.core.database import AsyncSessionLocal
from app.models.merchant import Merchant
from app.models.approval import ApprovalRequest
from app.models.recommendation import Recommendation
from app.services.outcome_service import OutcomeTrackingService
from app.services.recommendation_service import RecommendationService
from app.core.templates.service import MerchantTemplateService
from app.eval.grounding import NumberGroundingValidator
from app.eval.safety import SafetyRails
from app.integrations.adapters import ondc_adapter, whatsapp_adapter
from sqlalchemy import select

# 1. Uplift Math & Tiny Sample Guards
def test_uplift_math_calculation():
    # Treated: 48, Control: 12. Treated conv: 17 (~35.4%), Control conv: 2 (~16.7%), Ticket: ₹650
    result = OutcomeTrackingService.calculate_campaign_uplift(
        treated_count=48,
        control_count=12,
        treated_conversions=17,
        control_conversions=2,
        avg_ticket=650.0
    )
    assert result["status"] == "MEASURED"
    assert abs(result["treated_rate"] - 0.354) < 0.005
    assert abs(result["control_rate"] - 0.167) < 0.005
    assert abs(result["incremental_rate"] - 0.188) < 0.005
    assert result["incremental_revenue_inr"] > 5000
    assert "extra" in result["summary_en"] or "नफा" in result["summary_mr"]

def test_uplift_tiny_sample_guard():
    # Tiny sample (e.g. 5 customers treated) -> Must return TOO_EARLY
    result = OutcomeTrackingService.calculate_campaign_uplift(
        treated_count=5,
        control_count=1,
        treated_conversions=2,
        control_conversions=0,
        avg_ticket=500.0
    )
    assert result["status"] == "TOO_EARLY"
    assert "too small" in result["reason"].lower() or "अजून माहिती कमी" in result["reason"]

# 2. Number Grounding Validator
def test_number_grounding_validator():
    source_payload = {"today_revenue": 40717.0, "pending_settlement_amount": 30386.0}
    
    # Grounded answer
    grounded_text = "आज दुकानवर एकूण ₹40,717 ची विक्री झाली असून ₹30,386 उद्या सकाळी बँकेत जमा होतील."
    res = NumberGroundingValidator.validate(grounded_text, source_payload)
    assert res["is_grounded"] is True
    assert res["action"] == "ACCEPT"

    # Hallucinated answer with fake ₹99,999
    hallucinated_text = "आज दुकानवर एकूण ₹99,999 ची विक्री झाली आहे."
    res_bad = NumberGroundingValidator.validate(hallucinated_text, source_payload)
    assert res_bad["is_grounded"] is False
    assert 99999.0 in res_bad["ungrounded_numbers"]
    assert res_bad["action"] == "REGENERATE_OR_FALLBACK"

# 3. Merchant-Type Templates (Salon has no inventory, Kirana has inventory)
def test_merchant_type_templates():
    salon_tmpl = MerchantTemplateService.get_template("salon_service")
    assert salon_tmpl["has_inventory"] is False
    assert salon_tmpl["has_suppliers"] is False
    assert MerchantTemplateService.is_feature_applicable("salon_service", "inventory") is False

    kirana_tmpl = MerchantTemplateService.get_template("kirana")
    assert kirana_tmpl["has_inventory"] is True
    assert kirana_tmpl["has_suppliers"] is True
    assert MerchantTemplateService.is_feature_applicable("kirana", "inventory") is True

# 4. Cold-Start Priors
def test_cold_start_priors():
    priors = MerchantTemplateService.get_cold_start_priors("kirana")
    assert priors["avg_daily_sales"] > 0
    assert priors["avg_ticket"] > 0
    assert 0 < priors["typical_margin"] < 1.0

# 5. Recommendation Ranking & Hard Cap of 3
@pytest.mark.asyncio
async def test_recommendation_ranking_and_cap_of_3():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        hero_m = res.scalar_one_or_none()
        assert hero_m is not None

        top3 = await RecommendationService.get_top_3_actions(db, hero_m.id, lang="mr")
        assert len(top3) <= 3
        # Check rank ordering (rank 1 impact >= rank 2 >= rank 3)
        if len(top3) >= 2:
            assert top3[0]["expected_impact_inr"] >= top3[1]["expected_impact_inr"]

# 6. Adapter Mandatory Approval Gating
@pytest.mark.asyncio
async def test_adapter_approval_gating():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Merchant).where(Merchant.is_demo == True))
        hero_m = res.scalar_one_or_none()
        assert hero_m is not None

        # Call with non-existent or unapproved ID must fail
        with pytest.raises(PermissionError):
            await ondc_adapter.place_b2b_order(
                db=db,
                merchant_id=hero_m.id,
                approval_id="non-existent-fake-approval-id",
                supplier_id="supplier-1",
                items=[{"name": "Ghee", "quantity": 10, "unit_price": 450.0}],
                estimated_amount=4500.0
            )

# 7. Safety Rails: Spending Cap & Quiet Hours
def test_safety_rails():
    # Under ₹50k allowed
    assert SafetyRails.check_spending_cap(35000.0)["allowed"] is True
    # Over ₹50k blocked
    assert SafetyRails.check_spending_cap(75000.0)["allowed"] is False

    # Day time (2 PM) allowed
    assert SafetyRails.check_broadcast_timing(14)["allowed"] is True
    # Night time (11 PM) blocked
    assert SafetyRails.check_broadcast_timing(23)["allowed"] is False
