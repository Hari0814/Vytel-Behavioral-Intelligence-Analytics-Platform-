from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

# MongoDB client
client = AsyncIOMotorClient(settings.mongodb_url)

# Database
db = client.vytel

# Collection
user_collection = db["user_data"]

async def connect_db():
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")

async def close_db():
    client.close()

def get_db():
    return db