import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

_client = None


def get_db():
    global _client

    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "food_distribution")

    if not mongo_uri:
        raise ValueError("MONGO_URI is not set")

    if _client is None:
        _client = MongoClient(mongo_uri)

    return _client[db_name]


