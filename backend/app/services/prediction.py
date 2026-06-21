"""
Prediction Engine — forecasts future behavioral trends using
linear regression on recent behavioral data.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from typing import Dict, Any, List
import pandas as pd


def generate_predictions(data: Dict[str, Any], patterns: Dict[str, Any]) -> Dict[str, Any]:
    """
    Forecasts next-week screen time and spending using linear regression.
    """
    predictions = {}

    screen_time = data.get("screen_time", [])
    expenses    = data.get("expenses", [])

    if screen_time:
        predictions["screen_time_next_week"] = _predict_next_week(
            screen_time, "hours", patterns.get("screen_time", {})
        )

    if expenses:
        predictions["spending_next_week"] = _predict_next_week(
            expenses, "amount", patterns.get("spending", {})
        )

    return predictions


def _predict_next_week(entries: List[Dict], value_col: str, pattern: Dict) -> Dict:
    try:
        df = pd.DataFrame(entries)
        df["date"] = pd.to_datetime(df["date"])
        daily = df.groupby("date")[value_col].sum().reset_index()
        daily = daily.sort_values("date").reset_index(drop=True)

        if len(daily) < 3:
            return {"predicted": None, "trend": "insufficient_data"}

        X = np.arange(len(daily)).reshape(-1, 1)
        y = daily[value_col].values.astype(float)

        model = LinearRegression()
        model.fit(X, y)

        next_x = np.array([[len(daily)], [len(daily) + 6]])
        next_preds = model.predict(next_x)

        current_avg = float(y[-7:].mean()) if len(y) >= 7 else float(y.mean())
        predicted_avg = max(0, float(next_preds.mean()))
        pct_change = ((predicted_avg - current_avg) / max(current_avg, 1)) * 100

        trend = "increasing" if pct_change > 5 else "decreasing" if pct_change < -5 else "stable"

        return {
            "current_avg": round(current_avg, 2),
            "predicted_avg": round(predicted_avg, 2),
            "pct_change": round(pct_change, 1),
            "trend": trend,
            "confidence": round(max(0.5, min(0.9, abs(model.score(X, y)))), 2),
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"predicted": None, "trend": "error"}
