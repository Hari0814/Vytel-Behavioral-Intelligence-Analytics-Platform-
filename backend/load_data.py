import pandas as pd
from pymongo import MongoClient

# MongoDB Atlas connection string
MONGO_URL ="mongodb+srv://Vyteluser:vytel0814@cluster0.gbysqk4.mongodb.net/vytel"
# Connect
client = MongoClient(MONGO_URL)

# Database
db = client["vytel"]

# Collection
collection = db["user_data"]

# Load CSV
df = pd.read_csv("generated_dataset.csv")

# Convert to dictionary
data = df.to_dict(orient="records")

# Remove old data
collection.delete_many({})

# Insert data
collection.insert_many(data)

print(f"{len(data)} records inserted successfully!")