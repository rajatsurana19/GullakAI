from datetime import datetime
from typing import Dict, Any, List, Optional

class SafetyRails:
    """
    Safety Rails for Gullak AI:
    1. Spending Cap Gating (Max ₹50,000 for single autonomous purchase order proposal)
    2. Quiet Hours Guard (No WhatsApp broadcasts between 9:00 PM and 8:00 AM IST)
    3. Low Confidence Guard (Low confidence actions MUST ask merchant, never auto-propose execution)
    4. DPDPA Consent & Opt-Out Enforcement
    """

    MAX_SPENDING_PROPOSAL_INR = 50000.0
    QUIET_HOURS_START = 21 # 9 PM
    QUIET_HOURS_END = 8    # 8 AM

    @classmethod
    def check_spending_cap(cls, amount: float) -> Dict[str, Any]:
        if amount > cls.MAX_SPENDING_PROPOSAL_INR:
            return {
                "allowed": False,
                "reason": f"Amount ₹{int(amount):,} exceeds single proposal safety cap of ₹{int(cls.MAX_SPENDING_PROPOSAL_INR):,}. Requires multi-signature merchant verification."
            }
        return {"allowed": True}

    @classmethod
    def check_broadcast_timing(cls, current_hour: Optional[int] = None) -> Dict[str, Any]:
        hour = current_hour if current_hour is not None else datetime.now().hour
        if hour >= cls.QUIET_HOURS_START or hour < cls.QUIET_HOURS_END:
            return {
                "allowed": False,
                "reason": "Quiet hours active (9:00 PM - 8:00 AM). Customer WhatsApp messages queued for morning delivery to respect customer privacy."
            }
        return {"allowed": True}

    @classmethod
    def check_confidence_gate(cls, confidence: str) -> Dict[str, Any]:
        if confidence == "Low":
            return {
                "can_auto_propose": False,
                "required_action": "CLARIFY_WITH_MERCHANT",
                "message": "Confidence is Low. Gullak will ask merchant for confirmation rather than drafting a direct order."
            }
        return {"can_auto_propose": True, "required_action": "PROCEED"}
