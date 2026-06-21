from fastapi import APIRouter
from app.models.data_models import ChatMessage, ChatResponse
from app.config import get_settings
from google import genai

router = APIRouter(prefix="/chat", tags=["chat"])

settings = get_settings()

client = genai.Client(api_key=settings.gemini_api_key)

RULE_RESPONSES = {

    "productiv":
    "Based on your data, productivity drops significantly after 10 PM due to increased screen usage. Your peak focus window is 9 AM–12 PM. Protect these morning hours by keeping devices away until after your first focused work block.",

    "spend":
    "Your spending shows a major weekend surge compared to weekdays, primarily driven by impulsive shopping. Setting a fixed weekend budget and removing shopping apps from your phone could dramatically improve financial control.",

    "improv":
    "Top improvements this week: 1) Set a screen cutoff at 10 PM. 2) Apply a fixed weekend spending limit. 3) Schedule 30 minutes of exercise before social media usage.",

    "screen":
    "Your screen time remains significantly above healthy recommendations. Late-night usage patterns are especially impacting productivity and sleep quality.",

    "exercis":
    "Your exercise consistency is currently low compared to your digital activity levels. Even short daily activity sessions could significantly improve energy and focus.",

    "sleep":
    "Late-night screen exposure is likely disrupting sleep quality and recovery. Reducing screen usage before bedtime could improve both sleep duration and mental clarity.",

    "habit":
    "One of your strongest behavioral loops appears to be weekend screen-and-spend spirals. Breaking the initial trigger point can create major improvements across multiple habits.",

    "pattern":
    "Multiple behavioral relationships were detected across screen usage, spending, productivity, and exercise patterns. Several of these show strong consistency over time.",
}


@router.post("", response_model=ChatResponse)
async def chat(body: ChatMessage):

    use_gemini = settings.gemini_api_key not in (
        "",
        "none",
        "your-gemini-api-key-here",
    )

    if use_gemini:

        try:

            reply = await _gemini_chat(
                body.message,
                body.context
            )

            return ChatResponse(reply=reply)

        except Exception as e:

            print(
                f"Gemini chat error, using fallback: {e}"
            )

    return ChatResponse(
        reply=_rule_chat(body.message)
    )


# ──────────────────────────────────────────────────────────────────────────────
# GEMINI CHAT
# ──────────────────────────────────────────────────────────────────────────────

async def _gemini_chat(
    message: str,
    context: dict | None
) -> str:

    insights_text = ""

    conversation_history = ""

    # ──────────────────────────────────────────────────────────────────────────
    # CONTEXT PROCESSING
    # ──────────────────────────────────────────────────────────────────────────

    if context:

        # CURRENT AI INSIGHTS
        insights = context.get("insights", [])

        if insights:

            insights_text = "\n".join([

                f"- {i.get('title', '')}: "
                f"{i.get('description', '')}"

                for i in insights[:4]
            ])

        # CHAT HISTORY MEMORY
        history = context.get("history", [])

        if history:

            conversation_history = "\n".join([

                f"{msg.get('role', 'user')}: "
                f"{msg.get('text', '')}"

                for msg in history[-6:]

            ])

    # ──────────────────────────────────────────────────────────────────────────
    # AI PROMPT
    # ──────────────────────────────────────────────────────────────────────────

    prompt = f"""
You are Vytel AI — a premium behavioral intelligence assistant.

Your role:
Help users understand behavioral patterns from their:
- screen time
- spending
- activity
- productivity
- life score

You should sound:
- intelligent
- analytical
- concise
- modern
- conversational
- naturally supportive

Conversation behavior:
- Remember previous discussion context
- Continue conversations naturally
- Reference previous questions when useful
- Avoid repeating identical answers
- Stay context-aware

Rules:
- Keep responses under 5 sentences
- Use insights when available
- Give practical recommendations
- Never invent fake statistics
- Speak like a premium AI coach

Current behavioral insights:
{insights_text}

Recent conversation history:
{conversation_history}

Current user question:
{message}
"""

    # ──────────────────────────────────────────────────────────────────────────
    # GEMINI RESPONSE
    # ──────────────────────────────────────────────────────────────────────────
    print("🧠 GEMINI CHAT REQUEST EXECUTED")
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()


# ──────────────────────────────────────────────────────────────────────────────
# FALLBACK CHAT
# ──────────────────────────────────────────────────────────────────────────────

def _rule_chat(message: str) -> str:

    lower = message.lower()

    for keyword, response in RULE_RESPONSES.items():

        if keyword in lower:

            return response

    return (
        "I analyzed your recent behavioral patterns and found strong relationships "
        "between screen time, productivity, and spending habits. "
        "Your biggest improvement opportunity currently appears to be reducing "
        "late-night screen usage and improving activity consistency."
    )
