import os
import json
from typing import Dict, Any, Optional

TEMPLATE_FILE = os.path.join(os.path.dirname(__file__), "templates.json")

class MerchantTemplateService:
    _templates: Optional[Dict[str, Any]] = None

    @classmethod
    def load_templates(cls) -> Dict[str, Any]:
        if cls._templates is None:
            with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
                cls._templates = json.load(f)
        return cls._templates

    @classmethod
    def get_template(cls, category_or_code: str) -> Dict[str, Any]:
        templates = cls.load_templates()
        clean = (category_or_code or "").lower().strip()
        if clean in templates:
            return templates[clean]
        
        # Fuzzy match
        if "sweet" in clean or "bakery" in clean:
            return templates["sweets_bakery"]
        elif "restaurant" in clean or "cafe" in clean or "chai" in clean or "food" in clean:
            return templates["restaurant_chai"]
        elif "pharmacy" in clean or "chemist" in clean or "medical" in clean:
            return templates["pharmacy"]
        elif "salon" in clean or "spa" in clean or "beauty" in clean or "barber" in clean:
            return templates["salon_service"]
        
        # Default to kirana
        return templates["kirana"]

    @classmethod
    def is_feature_applicable(cls, category: str, feature: str) -> bool:
        tmpl = cls.get_template(category)
        if feature == "inventory":
            return tmpl.get("has_inventory", True)
        if feature == "suppliers":
            return tmpl.get("has_suppliers", True)
        if feature == "credit":
            return tmpl.get("has_credit", True)
        return True

    @classmethod
    def get_cold_start_priors(cls, category: str) -> Dict[str, float]:
        tmpl = cls.get_template(category)
        return tmpl.get("cold_start_priors", {
            "avg_daily_sales": 25000.0,
            "avg_ticket": 500.0,
            "typical_margin": 0.20,
            "digital_share": 0.70
        })

    @classmethod
    def get_vocabulary(cls, category: str, lang: str = "mr") -> Dict[str, str]:
        tmpl = cls.get_template(category)
        vocabs = tmpl.get("vocabulary", {})
        return vocabs.get(lang, vocabs.get("mr", {}))
