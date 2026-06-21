"""
AI Insight Generation Layer — converts structured findings into
human-readable insights using Gemini 2.5 Flash or rule-based fallback.

Confidence Score = (pattern_strength × 0.4) + (correlation_strength × 0.4) + (consistency × 0.2)
Only top 2–4 highest confidence insights are returned.
"""

import json
from datetime import datetime
from typing import Dict, Any, List

from google import genai

from app.config import get_settings
from app.services.pattern_detection import detect_patterns
from app.services.relationship_analysis import analyze_relationships
from app.services.prediction import generate_predictions


settings = get_settings()

# Modern Gemini Client
client = genai.Client(api_key=settings.gemini_api_key)


async def generate_insights(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full pipeline:
    Pattern → Relationship → Prediction → Insight → Score
    """

    # Layer 1: Pattern Detection
    patterns = detect_patterns(data)

    # Layer 2: Relationship Analysis
    relationships = analyze_relationships(data, patterns)

    # Layer 3: Prediction
    predictions = generate_predictions(data, patterns)

    # Layer 4: Build structured insight candidates
    candidates = _build_insight_candidates(
        patterns,
        relationships,
        predictions
    )

    # Layer 5: Score + Filter
    scored = _score_and_filter(candidates)

    # Layer 6: AI Text Generation
    insights = await _generate_text(
        scored,
        patterns,
        relationships
    )

    # Final Life Score
    life_score = _compute_life_score(patterns, relationships)

    return {
        "insights": insights,
        "life_score": life_score,
        "generated_at": datetime.utcnow().isoformat(),
        "patterns": patterns,
        "relationships": relationships,
        "predictions": predictions,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Candidate Builder
# ──────────────────────────────────────────────────────────────────────────────

def _build_insight_candidates(
    patterns: Dict,
    relationships: Dict,
    predictions: Dict
) -> List[Dict]:

    candidates = []

    corrs = relationships.get("correlations", {})
    sp = patterns.get("screen_time", {})
    ep = patterns.get("spending", {})
    ap = patterns.get("activity", {})

    # 1. High Screen Time
    if sp.get("above_threshold"):

        avg = sp.get("daily_avg", 0)
        ps = min(1.0, avg / 10)

        candidates.append({
            "type": "pattern",
            "title": "High Daily Screen Time Detected",
            "raw": {
                "daily_avg": avg,
                "threshold": sp.get("threshold", 5),
                "peak_day": sp.get("peak_day", "Weekend"),
                "weekend_avg": sp.get("weekend_avg", 0),
                "weekday_avg": sp.get("weekday_avg", 0),
            },
            "variables": [
                "screen_time",
                "usage_threshold"
            ],
            "impact": "high" if avg > 7 else "medium",
            "pattern_strength": round(ps, 2),
            "correlation_strength": 0.5,
            "consistency": 0.8,
        })

    # 2. Screen Time vs Spending
    ss = corrs.get("screen_vs_spending", {})

    if abs(ss.get("correlation", 0)) > 0.6:

        corr = ss["correlation"]

        candidates.append({
            "type": "causal",
            "title": "Screen Time Drives Spending Behavior",
            "raw": {
                "correlation": corr,
                "screen_avg": sp.get("daily_avg", 0),
                "spending_avg": ep.get("daily_avg", 0),
            },
            "variables": [
                "screen_time",
                "spending"
            ],
            "impact": "high" if abs(corr) > 0.8 else "medium",
            "pattern_strength": abs(corr),
            "correlation_strength": abs(corr),
            "consistency": 0.75,
        })

    # 3. Weekend Spending Spike
    ratio = ep.get("weekend_vs_weekday_ratio", 1)

    if ratio > 1.3:

        ps = min(1.0, ratio / 5)

        candidates.append({
            "type": "compare",
            "title": "Weekend Spending Surge Identified",
            "raw": {
                "ratio": ratio,
                "weekend_avg": ep.get("weekend_avg", 0),
                "weekday_avg": ep.get("weekday_avg", 0),
                "top_category": ep.get("top_category", "Shopping"),
            },
            "variables": [
                "spending",
                "weekday_vs_weekend"
            ],
            "impact": "high" if ratio > 3 else "medium",
            "pattern_strength": ps,
            "correlation_strength": 0.7,
            "consistency": 0.85,
        })

    # 4. Productivity Correlation
    sprod = corrs.get("screen_vs_productivity", {})

    if abs(sprod.get("correlation", 0)) > 0.5:

        corr = sprod["correlation"]

        candidates.append({
            "type": "causal",
            "title": "Late-Night Usage Hurts Productivity",
            "raw": {
                "correlation": corr,
                "work_avg": ap.get("work_hours_avg", 6),
            },
            "variables": [
                "screen_time",
                "productivity"
            ],
            "impact": "high",
            "pattern_strength": abs(corr),
            "correlation_strength": abs(corr),
            "consistency": 0.82,
        })

    # 5. Low Exercise
    if ap.get("exercise_days", 7) < 3:

        days = ap.get("exercise_days", 0)

        candidates.append({
            "type": "pattern",
            "title": "Physical Activity Well Below Target",
            "raw": {
                "exercise_days": days,
                "screen_avg": sp.get("daily_avg", 0),
            },
            "variables": [
                "screen_time",
                "exercise"
            ],
            "impact": "medium",
            "pattern_strength": round(1 - days / 7, 2),
            "correlation_strength": abs(
                corrs.get(
                    "screen_vs_exercise",
                    {}
                ).get("correlation", 0.5)
            ),
            "consistency": 0.7,
        })

    # 6. Future Prediction
    sn = predictions.get("screen_time_next_week", {})

    if sn.get("trend") == "increasing" and sn.get("pct_change", 0) > 10:

        candidates.append({
            "type": "predict",
            "title": "Screen Time Projected to Increase",
            "raw": {
                "current_avg": sn.get("current_avg", 0),
                "predicted_avg": sn.get("predicted_avg", 0),
                "pct_change": sn.get("pct_change", 0),
            },
            "variables": [
                "screen_time_trend"
            ],
            "impact": "medium",
            "pattern_strength": 0.65,
            "correlation_strength": sn.get("confidence", 0.6),
            "consistency": 0.6,
        })

    return candidates


# ──────────────────────────────────────────────────────────────────────────────
# Scoring
# ──────────────────────────────────────────────────────────────────────────────

def _score_and_filter(candidates: List[Dict]) -> List[Dict]:

    for c in candidates:

        c["confidence"] = round(
            (
                c.get("pattern_strength", 0.5) * 0.4
                + c.get("correlation_strength", 0.5) * 0.4
                + c.get("consistency", 0.5) * 0.2
            ),
            3,
        )

    candidates.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    return candidates[:4]


# ──────────────────────────────────────────────────────────────────────────────
# Text Generation
# ──────────────────────────────────────────────────────────────────────────────

async def _generate_text(
    candidates: List[Dict],
    patterns: Dict,
    relationships: Dict
) -> List[Dict]:

    use_gemini = settings.gemini_api_key not in (
        "",
        "none",
        "your-gemini-api-key-here"
    )

    insights = []

    # ─────────────────────────────────────────────
    # GEMINI BATCH MODE
    # ─────────────────────────────────────────────

    if use_gemini:

        try:

            ai_results = await _gemini_generate_batch(candidates)

            for i, (c, text) in enumerate(zip(candidates, ai_results)):

                insights.append({
                    "id": i + 1,
                    "type": c["type"],
                    "title": text["title"],
                    "description": text["description"],
                    "confidence": c["confidence"],
                    "impact": c["impact"],
                    "variables": c["variables"],
                    "recommendation": text["recommendation"],
                })

            return insights

        except Exception as e:

            print(f"Gemini batch error, using fallback: {e}")

    # ─────────────────────────────────────────────
    # FALLBACK MODE
    # ─────────────────────────────────────────────

    for i, c in enumerate(candidates):

        text = _rule_generate(c)

        insights.append({
            "id": i + 1,
            "type": c["type"],
            "title": text["title"],
            "description": text["description"],
            "confidence": c["confidence"],
            "impact": c["impact"],
            "variables": c["variables"],
            "recommendation": text["recommendation"],
        })

    return insights


# ──────────────────────────────────────────────────────────────────────────────
# Gemini AI Generation
# ──────────────────────────────────────────────────────────────────────────────

async def _gemini_generate_batch(candidates: List[Dict]) -> List[Dict]:

    prompt = f"""
You are Vytel AI — a behavioral intelligence system.

Convert the following behavioral findings into human-readable AI insights.

Behavioral Findings:
{json.dumps(candidates, indent=2)}

Return ONLY valid JSON array in this exact format:

[
  {{
    "title": "Short insight title",
    "description": "2-3 sentence behavioral insight with specific numbers and analysis",
    "recommendation": "One practical action step"
  }}
]

Rules:
- Keep titles concise
- Use actual numbers from findings
- All monetary values are in Indian Rupees (INR ₹), never USD
- Use ₹ symbol for spending values
- Sound natural and intelligent
- No markdown
- No explanations outside JSON
"""
    print("🔥 SINGLE GEMINI BATCH CALL EXECUTED")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()

    # Remove markdown wrappers
    if raw.startswith("```"):

        raw = raw.split("```")[1]

        if raw.startswith("json"):
            raw = raw[4:]

    raw = raw.strip()

    parsed = json.loads(raw)

    # Ensure list output
    if not isinstance(parsed, list):
        raise Exception("Gemini batch output invalid")

    return parsed

# ──────────────────────────────────────────────────────────────────────────────
# Rule-Based Fallback
# ──────────────────────────────────────────────────────────────────────────────

def _rule_generate(c: Dict) -> Dict:

    raw = c.get("raw", {})
    t = c["type"]

    templates = {

        "pattern": {
            "title": c.get(
                "title",
                "Behavioral Pattern Detected"
            ),

            "description": (
                f"Your daily screen time averages "
                f"{raw.get('daily_avg', '?')} hours, "
                f"which exceeds the recommended "
                f"{raw.get('threshold', 5)} hour limit. "
                f"Peak usage appears on "
                f"{raw.get('peak_day', 'weekends')}."
            ),

            "recommendation":
                "Set app-specific screen limits and use digital wellbeing reminders.",
        },

        "causal": {
            "title": c.get(
                "title",
                "Cause Effect Relationship Found"
            ),

            "description": (
                f"A strong behavioral relationship "
                f"(r={raw.get('correlation', '?')}) "
                f"exists between screen time and spending."
            ),

            "recommendation":
                "Avoid shopping apps during high screen-time sessions.",
        },

        "compare": {
            "title": c.get(
                "title",
                "Comparative Difference Found"
            ),

            "description": (
                f"Weekend spending is significantly "
                f"higher than weekday spending patterns."
            ),

            "recommendation":
                "Create a fixed weekend spending budget.",
        },

        "predict": {
            "title": c.get(
                "title",
                "Behavioral Forecast"
            ),

            "description": (
                f"Your current behavioral trajectory "
                f"indicates increasing future screen usage."
            ),

            "recommendation":
                "Introduce one screen-free session every day.",
        },
    }

    return templates.get(
        t,
        {
            "title": "Insight",
            "description": "Behavioral pattern detected.",
            "recommendation": "Review your analytics dashboard.",
        }
    )


# ──────────────────────────────────────────────────────────────────────────────
# Life Score
# ──────────────────────────────────────────────────────────────────────────────

def _compute_life_score(
    patterns: Dict,
    relationships: Dict
) -> int:

    score = 70

    sp = patterns.get("screen_time", {})
    ep = patterns.get("spending", {})
    ap = patterns.get("activity", {})

    daily_screen = sp.get("daily_avg", 5)

    if daily_screen > 8:
        score -= 20

    elif daily_screen > 6:
        score -= 10

    elif daily_screen <= 4:
        score += 10

    ratio = ep.get("weekend_vs_weekday_ratio", 1)

    if ratio > 4:
        score -= 15

    elif ratio > 2:
        score -= 8

    exercise_days = ap.get("exercise_days", 0)

    score += min(10, exercise_days * 2)

    if ap.get("productive"):
        score += 8

    return max(0, min(100, score))