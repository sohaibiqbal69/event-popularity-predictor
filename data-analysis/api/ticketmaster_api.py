# import requests
# import os
# import logging

# def fetch_trending_events(api_key, size=50): # Added size parameter with default 50
#     """
#     Fetches trending events from Ticketmaster API for global scope.
#     Now accepts 'size' parameter to control the number of events.
#     """
#     url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": api_key,
#         "sort": "relevance,desc", # Sort by relevance
#         "size": size # Use the size parameter here to request more events
#     }

#     try:
#         response = requests.get(url, params=params)
#         response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
#         data = response.json()

#         if data and data.get('_embedded') and data['_embedded'].get('events'):
#             events = data['_embedded']['events']
#             print(f"DEBUG PRINT: Fetched {len(events)} events from Ticketmaster API.") # Debug print for event count
#             return events
#         else:
#             print("DEBUG PRINT: No trending events found or unexpected API response format.")
#             return [] # Return empty list if no events are found or API response is not as expected

#     except requests.exceptions.HTTPError as http_err:
#         logging.error(f"HTTP error fetching Ticketmaster events: {http_err}")
#         return []
#     except requests.exceptions.RequestException as req_err:
#         logging.error(f"Request error fetching Ticketmaster events: {req_err}")
#         return []
#     except Exception as e:
#         logging.error(f"Error fetching trending events from Ticketmaster API: {e}")
#         return []

# import requests
# import os
# import logging

# def fetch_trending_events(api_key, size=50, segment=None):
#     """
#     Fetches trending events from Ticketmaster API with optional segment filtering.
    
#     Args:
#         api_key (str): Ticketmaster API key.
#         size (int): Number of events to fetch (default: 50).
#         segment (str): Optional segment name to filter events (e.g., 'Music', 'Sports').
    
#     Returns:
#         list: A list of trending events.
#     """
#     url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": api_key,
#         "sort": "relevance,desc",  # Sort by relevance
#         "countryCode": "US",       # Filter by country (can be adjusted or removed)
#         "size": size               # Number of events to fetch
#     }
    
#     # Add segment filtering if provided
#     if segment:
#         params["segmentName"] = segment

#     try:
#         response = requests.get(url, params=params)
#         response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
#         data = response.json()

#         if data and data.get('_embedded') and data['_embedded'].get('events'):
#             events = data['_embedded']['events']
#             logging.debug(f"Fetched {len(events)} events from Ticketmaster API.")
#             return events
#         else:
#             logging.warning("No trending events found or unexpected API response format.")
#             return []  # Return empty list if no events are found or API response is not as expected

#     except requests.exceptions.HTTPError as http_err:
#         logging.error(f"HTTP error fetching Ticketmaster events: {http_err}")
#         return []
#     except requests.exceptions.RequestException as req_err:
#         logging.error(f"Request error fetching Ticketmaster events: {req_err}")
#         return []
#     except Exception as e:
#         logging.error(f"Error fetching trending events from Ticketmaster API: {e}")
#         return []

# def get_event_categories():
#     """
#     Returns a list of supported event categories (segments) for filtering.
    
#     Returns:
#         list: A list of category names.
#     """
#     return [
#         "Music",
#         "Sports",
#         "Arts & Theatre",
#         "Film",
#         "Miscellaneous"
#     ]


import requests
import logging
import time
from typing import Optional, Dict, List, Union

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_all_events(api_key: str, segment: Optional[str] = None, 
                    page: int = 0, size: int = 20,
                    keyword: Optional[str] = None) -> Dict[str, Union[List[Dict], Dict]]:
    if not api_key:
        logger.error("No Ticketmaster API key provided")
        return {"events": [], "page": {"number": page, "size": size, "totalElements": 0, "totalPages": 1}}

    url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": api_key,
        "sort": "relevance,desc",
        "size": min(size, 200),
        "page": page
    }
    
    if segment and segment.lower() != 'all':
        params["segmentName"] = segment
        
    if keyword:
        params["keyword"] = keyword

    result = {"events": [], "page": {"number": page, "size": size, "totalElements": 0, "totalPages": 1}}

    try:
        logger.info(f"Fetching events - keyword: {keyword}, category: {segment}, page: {page}, size: {size}")
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if data and data.get('_embedded') and data['_embedded'].get('events'):
            result["events"] = data['_embedded']['events']
            result["page"] = data.get('page', result["page"])
        else:
            logger.warning("No events found in Ticketmaster response")
            
        return result

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error: {http_err}")
        if response.status_code == 429:
            logger.warning("Rate limit exceeded - adding delay")
            time.sleep(1)
            return fetch_all_events(api_key, segment, page, size, keyword)
        return result
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return result
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return result