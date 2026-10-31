import numpy as np
from typing import List, Dict, Any

class MovingAverageBaseline:
    """Simple 7-day and 14-day moving average baseline forecasting model."""
    def __init__(self, window: int = 7):
        self.window = window

    def predict(self, historical_series: List[float], horizon_days: int = 7) -> List[float]:
        if not historical_series:
            return [10.0] * horizon_days
            
        recent = historical_series[-self.window:] if len(historical_series) >= self.window else historical_series
        avg = float(np.mean(recent))
        return [round(avg, 2)] * horizon_days
