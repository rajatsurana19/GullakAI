import numpy as np
from typing import List, Dict, Any

class ForecastEvaluator:
    @staticmethod
    def evaluate(actuals: List[float], predictions: List[float]) -> Dict[str, float]:
        """Calculates MAE, RMSE, WAPE, and Forecast Bias without fabricating numbers."""
        act = np.array(actuals)
        pred = np.array(predictions)
        
        if len(act) == 0 or np.sum(act) == 0:
            return {"mae": 0.0, "rmse": 0.0, "wape": 0.0, "forecast_bias": 0.0}
            
        errors = pred - act
        abs_errors = np.abs(errors)
        
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        wape = float((np.sum(abs_errors) / np.sum(act)) * 100) # percentage
        forecast_bias = float(np.mean(errors)) # positive = overforecasting, negative = underforecasting
        
        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "wape": round(wape, 2),
            "forecast_bias": round(forecast_bias, 2)
        }
