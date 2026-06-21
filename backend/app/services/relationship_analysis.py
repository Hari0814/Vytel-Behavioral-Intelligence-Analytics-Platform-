"""
Relationship Analysis Layer — detects correlations and cause-effect
relationships between behavioral variables using statistical methods.
"""

import pandas as pd
import numpy as np
from scipy.stats import pearsonr
from typing import Dict, Any, List


CORRELATION_THRESHOLD = 0.6


def analyze_relationships(data: Dict[str, Any], patterns: Dict[str, Any]) -> Dict[str, Any]:
    """
    Find statistically significant relationships between behavioral variables.
    Returns correlation scores and detected cause-effect pairs.
    """
    screen_time = data.get("screen_time", [])
    expenses    = data.get("expenses", [])
    activity    = data.get("activity", [])

    daily = _build_daily_frame(screen_time, expenses, activity)
    relationships = {}

    if len(daily) >= 3:
        relationships["screen_vs_spending"]    = _correlate(daily, "screen_hours", "spending")
        relationships["screen_vs_productivity"] = _correlate(daily, "screen_hours", "work_hours")
        relationships["screen_vs_exercise"]     = _correlate(daily, "screen_hours", "exercise_hours")
        relationships["spending_vs_weekend"]    = _correlate(daily, "spending", "is_weekend")

    # Rule-based threshold checks
    sp = patterns.get("screen_time", {})
    ep = patterns.get("spending", {})

    rules_triggered = []

    # High usage rule
    if sp.get("above_threshold"):
        rules_triggered.append({
            "rule": "high_screen_usage",
            "value": sp.get("daily_avg"),
            "threshold": sp.get("threshold"),
            "severity": "high" if sp.get("daily_avg", 0) > 7 else "medium",
        })

    # Weekend spending spike rule
    ratio = ep.get("weekend_vs_weekday_ratio", 1)
    if ratio > 1.3:
        rules_triggered.append({
            "rule": "weekend_spending_spike",
            "ratio": round(ratio, 2),
            "severity": "high" if ratio > 3 else "medium",
        })

    # Screen–spending correlation rule
    ss = relationships.get("screen_vs_spending", {})
    if abs(ss.get("correlation", 0)) > CORRELATION_THRESHOLD:
        rules_triggered.append({
            "rule": "screen_spending_correlation",
            "correlation": ss.get("correlation"),
            "severity": "high" if abs(ss.get("correlation", 0)) > 0.8 else "medium",
        })

    # Low exercise rule
    ap = patterns.get("activity", {})
    if ap.get("exercise_days", 7) < 3:
        rules_triggered.append({
            "rule": "low_exercise",
            "exercise_days": ap.get("exercise_days", 0),
            "severity": "medium",
        })

    return {
        "correlations": relationships,
        "rules_triggered": rules_triggered,
        "daily_frame_size": len(daily),
    }


def _build_daily_frame(screen_time: List, expenses: List, activity: List) -> pd.DataFrame:
    frames = []

    if screen_time:
        df = pd.DataFrame(screen_time)
        df["date"] = pd.to_datetime(df["date"])
        screen_daily = df.groupby("date")["hours"].sum().reset_index()
        screen_daily.columns = ["date", "screen_hours"]
        frames.append(screen_daily)

    if expenses:
        df = pd.DataFrame(expenses)
        df["date"] = pd.to_datetime(df["date"])
        exp_daily = df.groupby("date")["amount"].sum().reset_index()
        exp_daily.columns = ["date", "spending"]
        frames.append(exp_daily)

    if activity:
        df = pd.DataFrame(activity)
        df["date"] = pd.to_datetime(df["date"])
        work_daily = df[df["type"] == "work"].groupby("date")["hours"].sum().reset_index()
        work_daily.columns = ["date", "work_hours"]
        ex_daily = df[df["type"] == "exercise"].groupby("date")["hours"].sum().reset_index()
        ex_daily.columns = ["date", "exercise_hours"]
        frames.append(work_daily)
        frames.append(ex_daily)

    if not frames:
        return pd.DataFrame()

    result = frames[0]
    for f in frames[1:]:
        result = result.merge(f, on="date", how="outer")

    result = result.fillna(0)
    if "date" in result.columns:
        result["is_weekend"] = result["date"].dt.weekday >= 5
        result["is_weekend"] = result["is_weekend"].astype(int)

    return result


def _correlate(df: pd.DataFrame, col_a: str, col_b: str) -> Dict:
    try:
        if col_a not in df.columns or col_b not in df.columns:
            return {"correlation": 0, "p_value": 1, "significant": False}

        a = df[col_a].values.astype(float)
        b = df[col_b].values.astype(float)

        if len(a) < 3 or np.std(a) == 0 or np.std(b) == 0:
            return {"correlation": 0, "p_value": 1, "significant": False}

        corr, pvalue = pearsonr(a, b)
        return {
            "correlation": round(float(corr), 3),
            "p_value": round(float(pvalue), 4),
            "significant": bool(abs(corr) > CORRELATION_THRESHOLD and pvalue < 0.05),
        }
    except Exception:
        return {"correlation": 0, "p_value": 1, "significant": False}
