from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ─── Data ────────────────────────────────────────────────────────────────────

class ScreenTimeEntry(BaseModel):
    date: str
    hours: float
    app: Optional[str] = "Unknown"

class ExpenseEntry(BaseModel):
    date: str
    amount: float
    category: Optional[str] = "General"

class ActivityEntry(BaseModel):
    date: str
    type: str
    hours: float
    peak_time: Optional[str] = None

class UserData(BaseModel):
    screen_time: List[ScreenTimeEntry] = []
    expenses: List[ExpenseEntry] = []
    activity: List[ActivityEntry] = []

class DataUpload(BaseModel):
    data: Dict[str, Any]

# ─── Insights ─────────────────────────────────────────────────────────────────

class Insight(BaseModel):
    id: int
    type: str  # causal | pattern | compare | predict
    title: str
    description: str
    confidence: float
    impact: str  # high | medium | low
    variables: List[str] = []
    recommendation: Optional[str] = None

class InsightsResponse(BaseModel):
    insights: List[Insight]
    life_score: int
    generated_at: str

# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str

