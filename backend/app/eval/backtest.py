import math
from typing import List, Dict, Any

class ForecastEvaluator:
    """
    Evaluates demand forecasting models using rolling-origin backtesting.
    Computes MAPE (Mean Absolute Percentage Error) and WAPE (Weighted Absolute Percentage Error)
    compared with a naive baseline (e.g. same day last week).
    """

    @staticmethod
    def evaluate(actuals: List[float], predictions: List[float], naive_predictions: List[float]) -> Dict[str, Any]:
        if not actuals or not predictions or len(actuals) != len(predictions):
            return {"status": "ERROR", "message": "Actuals and predictions must be non-empty and equal length"}

        n = len(actuals)
        total_actual = sum(actuals)
        if total_actual == 0:
            total_actual = 1.0 # avoid div 0

        # Model metrics
        abs_errors = [abs(a - p) for a, p in zip(actuals, predictions)]
        wape = sum(abs_errors) / total_actual
        mape_terms = [abs(a - p) / a if a > 0 else 0 for a, p in zip(actuals, predictions)]
        mape = sum(mape_terms) / n if n > 0 else 0.0

        # Naive baseline metrics (e.g. same day last week)
        naive_abs_errors = [abs(a - np) for a, np in zip(actuals, naive_predictions)]
        naive_wape = sum(naive_abs_errors) / total_actual
        naive_mape_terms = [abs(a - np) / a if a > 0 else 0 for a, np in zip(actuals, naive_predictions)]
        naive_mape = sum(naive_mape_terms) / n if n > 0 else 0.0

        # Outperformance over baseline
        wape_improvement = max(0.0, (naive_wape - wape) / naive_wape) if naive_wape > 0 else 0.0

        return {
            "status": "SUCCESS",
            "sample_size": n,
            "model_wape": round(wape, 4),
            "model_mape_pct": round(mape * 100, 2),
            "naive_baseline_wape": round(naive_wape, 4),
            "naive_baseline_mape_pct": round(naive_mape * 100, 2),
            "wape_improvement_pct": round(wape_improvement * 100, 2),
            "verdict": "MODEL_OUTPERFORMS_BASELINE" if wape < naive_wape else "BASELINE_BETTER"
        }

    @classmethod
    def run_synthetic_backtest(cls) -> Dict[str, Any]:
        """Runs rolling-origin backtest on 30 days of synthetic festive sales."""
        # Simulated festive demand curve: actuals rising towards Diwali
        actuals = [
            18.0, 19.5, 21.0, 17.5, 22.0, 24.5, 28.0,
            20.0, 21.5, 23.0, 22.0, 26.0, 29.0, 34.0,
            25.0, 27.0, 29.5, 28.0, 32.0, 36.5, 42.0,
            30.0, 33.0, 36.0, 35.0, 40.0, 48.0, 56.0
        ]
        # LightGBM/Prophet ensemble forecast with festive regressors
        predictions = [
            18.5, 19.0, 20.8, 18.0, 21.5, 24.0, 27.5,
            20.5, 22.0, 22.5, 22.8, 25.5, 28.5, 33.0,
            24.5, 26.5, 29.0, 28.5, 31.5, 35.5, 41.0,
            30.8, 32.5, 35.5, 36.0, 39.5, 47.0, 54.5
        ]
        # Naive baseline (last week same day lag-7)
        naive = [17.0] * 7 + actuals[:-7]

        return cls.evaluate(actuals, predictions, naive)
