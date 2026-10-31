import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any

class RFMEngine:
    """Calculates Recency, Frequency, Monetary metrics and segment assignment."""

    @staticmethod
    def calculate_rfm_scores(customers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not customers:
            return []

        df = pd.DataFrame(customers)
        # Recency (lower days is better, so rank inverted)
        df['r_score'] = pd.qcut(df['recency_days'].rank(method='first'), q=5, labels=[5, 4, 3, 2, 1]).astype(int)
        
        # Frequency (higher orders is better)
        df['f_score'] = pd.qcut(df['total_orders'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
        
        # Monetary (higher spend is better)
        df['m_score'] = pd.qcut(df['total_spend'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

        def assign_segment(row):
            r, f, m = row['r_score'], row['f_score'], row['m_score']
            if r >= 4 and f >= 4:
                return "Champions"
            elif r >= 3 and f >= 3:
                return "Loyal Customers"
            elif r >= 4 and f <= 2:
                return "Potential Loyalists"
            elif r >= 4 and f == 1:
                return "New Customers"
            elif r <= 2 and f >= 2:
                return "At-Risk Customers"
            else:
                return "Lost Customers"

        df['segment'] = df.apply(assign_segment, axis=1)
        
        # Calculate churn risk score (0.0 to 1.0)
        # Higher recency days and lower frequency -> higher churn probability
        df['churn_probability'] = np.clip(
            (df['recency_days'] / 60.0) * 0.7 + (1.0 - (df['f_score'] / 5.0)) * 0.3,
            0.05,
            0.95
        ).round(2)

        return df.to_dict(orient='records')
