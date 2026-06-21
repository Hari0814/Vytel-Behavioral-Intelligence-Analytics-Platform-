"""
Pattern Detection Layer — identifies recurring behavioral patterns
using time-based segmentation and clustering.
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List


def detect_patterns(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point. Returns structured patterns from raw user data.
    """
    screen_time = data.get("screen_time", [])
    expenses    = data.get("expenses", [])
    activity    = data.get("activity", [])

    patterns = {}
    patterns["screen_time"] = _analyze_screen_time(screen_time)
    patterns["spending"]    = _analyze_spending(expenses)
    patterns["activity"]    = _analyze_activity(activity)
    patterns["clusters"]    = _cluster_behavior(screen_time, expenses, activity)

    return patterns


def _analyze_screen_time(entries: List[Dict]) -> Dict:
    if not entries:
        return {}
    df = pd.DataFrame(entries)
    df["date"] = pd.to_datetime(df["date"])
    df["weekday"] = df["date"].dt.weekday  # 0=Mon, 6=Sun

    daily = df.groupby("date")["hours"].mean().reset_index()
    daily["is_weekend"] = df.groupby("date")["weekday"].first().values >= 5

    weekday_avg = daily[~daily["is_weekend"]]["hours"].mean()
    weekend_avg = daily[daily["is_weekend"]]["hours"].mean()
    daily_avg   = daily["hours"].mean()
    peak_day    = daily.loc[daily["hours"].idxmax(), "date"].strftime("%A")
    threshold   = 5.0  # recommended daily limit

    return {
        "daily_avg": round(float(daily_avg), 2),
        "weekday_avg": round(float(weekday_avg or 0), 2),
        "weekend_avg": round(float(weekend_avg or 0), 2),
        "peak_day": peak_day,
        "above_threshold": bool(daily_avg > threshold),
        "threshold": threshold,
        "weekend_vs_weekday_ratio": round(float((weekend_avg or 0) / max(weekday_avg or 1, 0.1)), 2),
        "total_entries": len(entries),
    }


def _analyze_spending(entries: List[Dict]) -> Dict:
    if not entries:
        return {}
    df = pd.DataFrame(entries)
    df["date"] = pd.to_datetime(df["date"])
    df["weekday"] = df["date"].dt.weekday

    daily = df.groupby("date")["amount"].sum().reset_index()
    daily["is_weekend"] = df.groupby("date")["weekday"].first().values >= 5

    weekday_avg = daily[~daily["is_weekend"]]["amount"].mean()
    weekend_avg = daily[daily["is_weekend"]]["amount"].mean()
    total       = df["amount"].sum()
    by_category = df.groupby("category")["amount"].sum().to_dict()

    return {
        "total": round(float(total), 2),
        "daily_avg": round(float(daily["amount"].mean()), 2),
        "weekday_avg": round(float(weekday_avg or 0), 2),
        "weekend_avg": round(float(weekend_avg or 0), 2),
        "by_category": {k: round(float(v), 2) for k, v in by_category.items()},
        "weekend_vs_weekday_ratio": round(float((weekend_avg or 0) / max(weekday_avg or 1, 0.1)), 2),
        "top_category": max(by_category, key=by_category.get) if by_category else "Unknown",
    }


def _analyze_activity(entries: List[Dict]) -> Dict:
    if not entries:
        return {}
    df = pd.DataFrame(entries)
    by_type = df.groupby("type")["hours"].mean().to_dict()
    exercise_days = len(df[df["type"] == "exercise"])
    work_avg = float(by_type.get("work", 0))

    return {
        "by_type": {k: round(float(v), 2) for k, v in by_type.items()},
        "exercise_days": exercise_days,
        "work_hours_avg": round(work_avg, 2),
        "productive": work_avg >= 6,
    }


def _cluster_behavior(screen_time: List, expenses: List, activity: List) -> Dict:
    """
    K-Means clustering on combined daily behavioral features.
    Identifies behavioral clusters (high-usage days, low-activity days, etc.)
    """
    try:
        if not screen_time or not expenses:
            return {"clusters": [], "n_clusters": 0}

        screen_df = pd.DataFrame(screen_time)
        screen_df["date"] = pd.to_datetime(screen_df["date"])
        screen_daily = screen_df.groupby("date")["hours"].sum().reset_index()
        screen_daily.columns = ["date", "screen_hours"]

        expense_df = pd.DataFrame(expenses)
        expense_df["date"] = pd.to_datetime(expense_df["date"])
        expense_daily = expense_df.groupby("date")["amount"].sum().reset_index()
        expense_daily.columns = ["date", "spending"]

        merged = screen_daily.merge(expense_daily, on="date", how="inner")
        if len(merged) < 3:
            return {"clusters": [], "n_clusters": 0}

        features = merged[["screen_hours", "spending"]].values
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)

        n_clusters = min(3, len(merged))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        merged["cluster"] = kmeans.fit_predict(features_scaled)

        cluster_labels = {
            0: "High Usage Day",
            1: "Balanced Day",
            2: "Low Activity Day",
        }

        clusters = merged[["date", "cluster", "screen_hours", "spending"]].copy()
        clusters["date"] = clusters["date"].dt.strftime("%Y-%m-%d")
        clusters["label"] = clusters["cluster"].map(cluster_labels)

        return {
            "n_clusters": n_clusters,
            "clusters": clusters.to_dict(orient="records"),
            "centers": scaler.inverse_transform(kmeans.cluster_centers_).tolist(),
        }
    except Exception as e:
        print(f"Clustering error: {e}")
        return {"clusters": [], "n_clusters": 0}
