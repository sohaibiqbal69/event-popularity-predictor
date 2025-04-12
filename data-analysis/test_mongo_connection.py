import pymongo
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
load_dotenv(dotenv_path=dotenv_path)
MONGO_CONN = os.environ.get("MONGO_CONN")

print("DEBUG PRINT: Trying to connect to MongoDB using connection string:")
print(f"DEBUG PRINT: {MONGO_CONN}") # Print the connection string just before trying to connect

try:
    client = pymongo.MongoClient(MONGO_CONN)
    client.admin.command('ping')  # Send a ping command to test connection
    print("DEBUG PRINT: MongoDB connection successful!")
    print(client.server_info()) # Optional: Print server info for more details
except Exception as e:
    print("DEBUG PRINT: MongoDB connection failed!")
    print(f"DEBUG PRINT: Error details: {e}")