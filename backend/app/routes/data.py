from fastapi import APIRouter
from app.database import user_collection

router = APIRouter(prefix="/data", tags=["data"])


# ✅ GET REAL DATA FROM MONGODB
@router.get("/")
async def get_data():
    data = await user_collection.find({}, {"_id": 0}).to_list(length=5000)
    return data


# ✅ SAMPLE DATA FORMAT (OPTIONAL REFERENCE)
@router.get("/sample")
async def get_sample_data():
    return {
        "screen_time": [
            {"date": "2024-01-01", "hours": 6.5, "app": "Instagram"},
            {"date": "2024-01-01", "hours": 2.0, "app": "YouTube"},
        ],
        "expenses": [
            {"date": "2024-01-01", "amount": 450, "category": "Food"},
            {"date": "2024-01-01", "amount": 299, "category": "Shopping"},
        ],
        "activity": [
            {"date": "2024-01-01", "type": "work", "hours": 8, "peak_time": "10:00"},
            {"date": "2024-01-01", "type": "exercise", "hours": 1, "peak_time": "07:00"},
        ],
    }