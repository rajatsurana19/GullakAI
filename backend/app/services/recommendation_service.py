import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_

from app.models.recommendation import Recommendation
from app.models.approval import ApprovalRequest
from app.models.outcome import ActionOutcome
from app.services.signals_service import SignalsService
from app.core.logging import logger

class RecommendationService:
    """
    Unified Recommendation Engine:
    - ALL agents write to this single pipeline.
    - Ranked by expected_impact_inr * confidence_score * learning_boost.
    - Actions with proven past uplift get higher ranking in the 'Learn' step.
    - De-duplicated by (merchant_id, action_type, type).
    - Hard-capped to the Top 3 Actions Today.
    """

    CONFIDENCE_WEIGHTS = {
        "High": 0.95,
        "Medium": 0.70,
        "Low": 0.45
    }

    @classmethod
    async def get_learning_boost_map(cls, db: AsyncSession, merchant_id: str) -> Dict[str, float]:
        """
        Feedback from the 'Learn' step:
        Calculates category multiplier based on past verified uplift.
        """
        stmt = select(ActionOutcome.action_type, ActionOutcome.incremental_revenue_inr).where(
            ActionOutcome.merchant_id == merchant_id,
            ActionOutcome.status == "MEASURED"
        )
        res = await db.execute(stmt)
        boost_map = {"CAMPAIGN_BROADCAST": 1.0, "SUPPLIER_ORDER": 1.0, "LENDING_APPLICATION": 1.0}
        
        for action_type, extra_inr in res.all():
            if extra_inr and extra_inr > 0:
                boost_map[action_type] = boost_map.get(action_type, 1.0) * 1.15 # 15% rank boost for proven winners!
        return boost_map

    @classmethod
    async def create_recommendation(
        cls,
        db: AsyncSession,
        merchant_id: str,
        rec_type: str, # STOCK, CUSTOMER, CAPITAL
        headline: str,
        why: str,
        expected_impact_inr: float,
        confidence: str, # High, Medium, Low
        action_type: str, # SUPPLIER_ORDER, CAMPAIGN_BROADCAST, LENDING_APPLICATION
        action_payload: Optional[Dict[str, Any]] = None,
        approval_id: Optional[str] = None,
        headline_mr: Optional[str] = None,
        headline_hi: Optional[str] = None,
        why_mr: Optional[str] = None,
        why_hi: Optional[str] = None,
        signals_used: Optional[List[str]] = None
    ) -> Recommendation:
        # Check duplicate pending recommendation
        stmt = select(Recommendation).where(
            Recommendation.merchant_id == merchant_id,
            Recommendation.action_type == action_type,
            Recommendation.status == "PENDING"
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        conf_score = cls.CONFIDENCE_WEIGHTS.get(confidence, 0.70)
        signals = signals_used or SignalsService.get_signals_text_for_recommendation(action_type, "mr")

        if existing:
            # Update existing
            existing.headline = headline
            existing.headline_mr = headline_mr or headline
            existing.headline_hi = headline_hi or headline
            existing.why = why
            existing.why_mr = why_mr or why
            existing.why_hi = why_hi or why
            existing.expected_impact_inr = expected_impact_inr
            existing.confidence = confidence
            existing.confidence_score = conf_score
            existing.action_payload = action_payload
            existing.approval_id = approval_id or existing.approval_id
            existing.signals_used = signals
            await db.commit()
            await db.refresh(existing)
            return existing

        rec = Recommendation(
            merchant_id=merchant_id,
            type=rec_type,
            headline=headline,
            headline_mr=headline_mr or headline,
            headline_hi=headline_hi or headline,
            why=why,
            why_mr=why_mr or why,
            why_hi=why_hi or why,
            expected_impact_inr=expected_impact_inr,
            confidence=confidence,
            confidence_score=conf_score,
            action_type=action_type,
            action_payload=action_payload,
            approval_id=approval_id,
            signals_used=signals,
            status="PENDING"
        )
        db.add(rec)
        await db.commit()
        await db.refresh(rec)
        return rec

    @classmethod
    async def get_top_3_actions(
        cls,
        db: AsyncSession,
        merchant_id: str,
        lang: str = "mr"
    ) -> List[Dict[str, Any]]:
        """
        Returns hard-capped Top 3 Actions Today, ranked by impact * confidence * learn_boost.
        """
        # Fetch pending recommendations
        stmt = select(Recommendation).where(
            Recommendation.merchant_id == merchant_id,
            Recommendation.status == "PENDING"
        )
        res = await db.execute(stmt)
        recs = res.scalars().all()

        boost_map = await cls.get_learning_boost_map(db, merchant_id)

        # Sort dynamically by (impact * confidence * learning_boost)
        scored_recs = []
        for r in recs:
            boost = boost_map.get(r.action_type, 1.0)
            score = (r.expected_impact_inr or 0.0) * (r.confidence_score or 0.70) * boost
            scored_recs.append((score, r))

        scored_recs.sort(key=lambda x: x[0], reverse=True)
        top_3 = scored_recs[:3] # Hard cap of 3!

        result = []
        for rank_idx, (score, r) in enumerate(top_3, start=1):
            h = r.headline_mr if lang == "mr" and r.headline_mr else (
                r.headline_hi if lang in ["hi", "hinglish"] and r.headline_hi else r.headline
            )
            w = r.why_mr if lang == "mr" and r.why_mr else (
                r.why_hi if lang in ["hi", "hinglish"] and r.why_hi else r.why
            )

            # Look up approval status if tied
            approval_status = "PENDING"
            if r.approval_id:
                app_res = await db.execute(select(ApprovalRequest.status).where(ApprovalRequest.id == r.approval_id))
                val = app_res.scalar_one_or_none()
                if val:
                    approval_status = val

            result.append({
                "id": r.id,
                "rank": rank_idx,
                "type": r.type,
                "headline": h,
                "why": w,
                "expected_impact_inr": r.expected_impact_inr,
                "confidence": r.confidence, # High, Medium, Low
                "action_type": r.action_type,
                "action_payload": r.action_payload,
                "approval_id": r.approval_id,
                "approval_status": approval_status,
                "signals_used": r.signals_used or SignalsService.get_signals_text_for_recommendation(r.action_type, lang),
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        return result

    @classmethod
    async def dismiss_action(cls, db: AsyncSession, merchant_id: str, rec_id: str) -> bool:
        stmt = select(Recommendation).where(
            Recommendation.id == rec_id,
            Recommendation.merchant_id == merchant_id
        )
        res = await db.execute(stmt)
        rec = res.scalar_one_or_none()
        if rec:
            rec.status = "DISMISSED"
            await db.commit()
            return True
        return False
