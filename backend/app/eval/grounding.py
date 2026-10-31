import re
from typing import Dict, Any, List, Set, Optional

class NumberGroundingValidator:
    """
    Number Grounding Validator:
    Ensures EVERY numeric value in an LLM-phrased answer originates from
    the structured source data payload.
    Rejects or flags any hallucinations.
    """

    @classmethod
    def extract_numbers_from_text(cls, text: str) -> Set[float]:
        """Extracts all numerical values from text, handling commas, decimals, and Devanagari numerals."""
        devanagari_to_arabic = str.maketrans("०१२३४५६७८९", "0123456789")
        normalized = text.translate(devanagari_to_arabic)
        # Remove commas inside numbers like 40,717 -> 40717
        normalized = re.sub(r'(?<=\d),(?=\d)', '', normalized)
        
        # Find all integer or float numbers
        matches = re.findall(r'\b\d+(?:\.\d+)?\b', normalized)
        numbers = set()
        for m in matches:
            try:
                numbers.add(float(m))
            except ValueError:
                pass
        return numbers

    @classmethod
    def extract_numbers_from_payload(cls, payload: Any) -> Set[float]:
        """Recursively extracts all numbers from a structured dict or list payload."""
        numbers = set()
        if isinstance(payload, dict):
            for k, v in payload.items():
                numbers.update(cls.extract_numbers_from_payload(v))
        elif isinstance(payload, (list, tuple, set)):
            for item in payload:
                numbers.update(cls.extract_numbers_from_payload(item))
        elif isinstance(payload, (int, float)):
            val = float(payload)
            numbers.add(val)
            # Also allow rounded integer version
            numbers.add(float(int(val)))
        elif isinstance(payload, str):
            numbers.update(cls.extract_numbers_from_text(payload))
        return numbers

    @classmethod
    def validate(
        cls,
        text: str,
        source_payload: Dict[str, Any],
        allowed_constants: Optional[Set[float]] = None
    ) -> Dict[str, Any]:
        """
        Validates text numbers against source payload numbers.
        Allows common trivial indices or dates (e.g. 1, 2, 3, 4, 7, 9, 30 days, 2026).
        """
        text_numbers = cls.extract_numbers_from_text(text)
        payload_numbers = cls.extract_numbers_from_payload(source_payload)

        # Standard permitted constants (days, rankings, year)
        constants = {1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 9.0, 10.0, 14.0, 24.0, 30.0, 48.0, 60.0, 2026.0}
        if allowed_constants:
            constants.update(allowed_constants)

        unrounded_payload = {round(n, 0) for n in payload_numbers}
        ungrounded = []

        for num in text_numbers:
            if (num in payload_numbers or 
                round(num, 0) in unrounded_payload or 
                num in constants):
                continue
            ungrounded.append(num)

        is_valid = len(ungrounded) == 0
        return {
            "is_grounded": is_valid,
            "text_numbers": list(text_numbers),
            "payload_numbers": list(payload_numbers),
            "ungrounded_numbers": ungrounded,
            "action": "ACCEPT" if is_valid else "REGENERATE_OR_FALLBACK"
        }
