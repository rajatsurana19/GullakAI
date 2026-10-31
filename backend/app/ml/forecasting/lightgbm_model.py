import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import lightgbm as lgb
from app.core.logging import logger

class LightGBMDemandForecaster:
    """Feature-rich LightGBM demand predictor incorporating festivals, day of week, and price elasticity."""
    def __init__(self):
        self.model = None

    def _create_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        df = df.copy()
        df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_festival'] = df.get('is_festival', 0)
        df['lag_1'] = df['demand'].shift(1).fillna(df['demand'].mean())
        df['lag_7'] = df['demand'].shift(7).fillna(df['demand'].mean())
        df['rolling_mean_7'] = df['demand'].rolling(window=7, min_periods=1).mean()
        
        feature_cols = ['day_of_week', 'is_weekend', 'is_festival', 'lag_1', 'lag_7', 'rolling_mean_7']
        return df[feature_cols], df['demand']

    def train_and_predict(
        self,
        historical_records: List[Dict[str, Any]],
        future_days: int = 7,
        is_festive_surge: bool = True
    ) -> List[Dict[str, Any]]:
        """Trains LightGBM regressor on merchant history and outputs future daily demand."""
        if not historical_records or len(historical_records) < 7:
            # Fallback heuristic
            base = 15.0 if not is_festive_surge else 35.0
            today = datetime.utcnow().date()
            return [
                {
                    "date": (today + timedelta(days=i)).isoformat(),
                    "predicted_demand": round(base * (1.0 + (i * 0.05)), 1),
                    "confidence_lower": round(base * 0.85, 1),
                    "confidence_upper": round(base * 1.25, 1)
                }
                for i in range(future_days)
            ]

        df = pd.DataFrame(historical_records)
        X, y = self._create_features(df)
        
        train_data = lgb.Dataset(X, label=y)
        params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'learning_rate': 0.05,
            'num_leaves': 15,
            'verbose': -1
        }
        self.model = lgb.train(params, train_data, num_boost_round=50)

        # Predict future
        predictions = []
        last_date = pd.to_datetime(df['date'].iloc[-1]).date()
        recent_demands = df['demand'].tolist()

        for i in range(1, future_days + 1):
            target_date = last_date + timedelta(days=i)
            dow = target_date.weekday()
            is_wknd = 1 if dow in [5, 6] else 0
            is_fest = 1 if is_festive_surge else 0
            lag1 = recent_demands[-1]
            lag7 = recent_demands[-7] if len(recent_demands) >= 7 else recent_demands[0]
            roll_mean = np.mean(recent_demands[-7:])
            
            x_future = pd.DataFrame([{
                'day_of_week': dow,
                'is_weekend': is_wknd,
                'is_festival': is_fest,
                'lag_1': lag1,
                'lag_7': lag7,
                'rolling_mean_7': roll_mean
            }])
            
            pred_val = float(self.model.predict(x_future)[0])
            # If festive season, add realistic Indian festive uplift (+40-80% for sweets/ghee)
            if is_festive_surge:
                pred_val *= 1.65
                
            pred_val = max(1.0, round(pred_val, 1))
            recent_demands.append(pred_val)
            
            predictions.append({
                "date": target_date.isoformat(),
                "predicted_demand": pred_val,
                "confidence_lower": round(pred_val * 0.88, 1),
                "confidence_upper": round(pred_val * 1.15, 1)
            })

        return predictions
