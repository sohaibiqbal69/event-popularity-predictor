import pymongo
from pymongo.errors import ConnectionFailure
from datetime import datetime, timedelta

class Database:
    def __init__(self, connection_string):
        self.connection_string = connection_string
        self.client = None
        self.db = None

    def connect(self):
        if self.client is None:
            try:
                self.client = pymongo.MongoClient(self.connection_string)
                self.client.admin.command('ping')  # Verify connection
                self.db = self.client.get_database() # Get default database - you might want to specify a name here if needed
                print("DEBUG PRINT: Connected to MongoDB!")
            except ConnectionFailure as e:
                print(f"DEBUG PRINT: Connection to MongoDB failed: {e}")
                raise

    def close(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            print("DEBUG PRINT: MongoDB connection closed.")

    # --- New functions for caching ---
    def get_cached_trending_events(self):
        """
        Retrieves cached trending events from the database if they are less than 24 hours old.
        Returns cached data if valid, None otherwise.
        """
        self.connect() # Ensure connection before operating
        if self.db is None: # Corrected check: compare to None explicitly
            print("DEBUG PRINT: Database not initialized, cannot get cached events.")
            return None

        cache_collection = self.db["trending_events_cache"]
        cached_data = cache_collection.find_one({"cache_type": "trending_events_global"})

        if cached_data:
            if cached_data.get('timestamp') and datetime.utcnow() - cached_data['timestamp'] < timedelta(hours=24):
                print("DEBUG PRINT: Returning trending events from cache.")
                return cached_data.get('events_data') # Return the cached event data
            else:
                print("DEBUG PRINT: Cached trending events are older than 24 hours or timestamp missing. Invalidating cache.")
                return None # Cache expired or invalid timestamp
        else:
            print("DEBUG PRINT: No trending events cache found.")
            return None # No cache found

    def store_trending_events_cache(self, events_data):
        """
        Stores trending events data in the cache collection with a timestamp.
        """
        self.connect() # Ensure connection before operating
        if self.db is None: # Corrected check: compare to None explicitly
            print("DEBUG PRINT: Database not initialized, cannot store cache.")
            return False

        cache_collection = self.db["trending_events_cache"]
        cache_collection.update_one(
            {"cache_type": "trending_events_global"}, # Query to find existing cache entry (if any)
            {"$set": {"cache_type": "trending_events_global", "events_data": events_data, "timestamp": datetime.utcnow()}}, # Data to insert/update
            upsert=True # If no document matches, insert a new document
        )
        print("DEBUG PRINT: Trending events cache stored in database.")
        return True
    # --- End of new cache functions ---