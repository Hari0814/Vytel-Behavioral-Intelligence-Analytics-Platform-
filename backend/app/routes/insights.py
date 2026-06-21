from fastapi import APIRouter, HTTPException
from app.models.data_models import DataUpload, InsightsResponse
from app.services.insight_generation import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/analyze", response_model=InsightsResponse)
async def analyze(body: DataUpload):
    """
    Full AI analysis pipeline: Pattern Detection → Relationship Analysis
    → Prediction → Insight Generation → Life Score.
    """
    try:
        result = await generate_insights(body.data)
        return InsightsResponse(
            insights=result["insights"],
            life_score=result["life_score"],
            generated_at=result["generated_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/patterns")
async def patterns_only(body: DataUpload):
    """Returns raw pattern detection results without LLM insight generation."""
    from app.services.pattern_detection import detect_patterns
    try:
        return detect_patterns(body.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/relationships")
async def relationships_only(body: DataUpload):
    """Returns correlation and relationship analysis."""
    from app.services.pattern_detection import detect_patterns
    from app.services.relationship_analysis import analyze_relationships
    try:
        patterns = detect_patterns(body.data)
        return analyze_relationships(body.data, patterns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
