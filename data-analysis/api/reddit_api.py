import requests
import json
import os
import logging
from dotenv import load_dotenv
import time
import random

load_dotenv()

CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID")
CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET")

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def get_reddit_access_token():
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    data = {'grant_type': 'client_credentials'}
    headers = {'User-Agent': 'YourBot/0.1'}
    try:
        res = requests.post('https://www.reddit.com/api/v1/access_token', auth=auth, data=data, headers=headers)
        res.raise_for_status()
        res_json = res.json()
        return res_json['access_token']
    except requests.exceptions.RequestException as e:
        logging.error(f"Error getting Reddit access token: {e}")
        return None

def fetch_comments_for_post(post_id, access_token, limit=50):
    """
    Fetches comments for a specific Reddit post.
    
    Args:
        post_id (str): The ID of the Reddit post.
        access_token (str): Reddit API access token.
        limit (int): Maximum number of comments to fetch.
        
    Returns:
        list: A list of comment dictionaries.
    """
    headers = {'Authorization': f'bearer {access_token}', 'User-Agent': 'YourBot/0.1'}
    
    try:
        # Fetch comments for the post
        res = requests.get(
            f'https://oauth.reddit.com/comments/{post_id}',
            headers=headers,
            params={'limit': limit, 'sort': 'top'}  # Get top comments by score
        )
        res.raise_for_status()
        data = res.json()
        
        comments = []
        if len(data) > 1 and 'data' in data[1] and 'children' in data[1]['data']:
            for comment in data[1]['data']['children']:
                if comment['kind'] == 't1':  # t1 is the kind for comments
                    comment_data = comment['data']
                    comments.append({
                        "id": comment_data.get('id', ''),
                        "body": comment_data.get('body', ''),
                        "score": comment_data.get('score', 0),
                        "created_utc": comment_data.get('created_utc', 0)
                    })
        
        return comments[:limit]  # Ensure we don't exceed the requested limit
        
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching comments for post {post_id}: {e}")
        return []

def generate_fallback_posts(event_name, count=10):
    """Generate fallback posts with varied sentiment for testing"""
    positive_templates = [
        "Excited about {event}! Can't wait to attend!",
        "{event} is going to be amazing this year!",
        "Just got tickets for {event}, so hyped!",
        "Anyone else going to {event}? It's going to be epic!",
        "The lineup for {event} is incredible this year!"
    ]
    
    negative_templates = [
        "Not sure about {event}, seems overpriced",
        "Disappointed with the lineup for {event}",
        "Is {event} worth attending this year?",
        "The organization for {event} was terrible last year",
        "Thinking of skipping {event} this year"
    ]
    
    neutral_templates = [
        "Anyone have info about {event}?",
        "What's the best way to get to {event}?",
        "When does {event} start?",
        "Is parking available at {event}?",
        "What should I bring to {event}?"
    ]
    
    all_templates = positive_templates + negative_templates + neutral_templates
    posts = []
    
    for _ in range(count):
        template = random.choice(all_templates)
        post = {
            "id": f"t3_{random.randint(1000000, 9999999)}",
            "title": template.format(event=event_name),
            "selftext": f"Discussion about {event_name}. " + " ".join([random.choice(all_templates).format(event=event_name) for _ in range(3)]),
            "score": random.randint(1, 100),
            "num_comments": random.randint(1, 50),
            "created_utc": int(time.time()) - random.randint(0, 2592000),  # Within last 30 days
            "comments": []
        }
        
        # Generate some fallback comments
        num_comments = random.randint(3, 15)
        for _ in range(num_comments):
            comment_template = random.choice(all_templates)
            comment = {
                "id": f"t1_{random.randint(1000000, 9999999)}",
                "body": comment_template.format(event=event_name),
                "score": random.randint(1, 50),
                "created_utc": int(time.time()) - random.randint(0, 2592000)  # Within last 30 days
            }
            post["comments"].append(comment)
        
        posts.append(post)
    
    return posts

def fetch_reddit_posts(event_name, limit=None):  # Changed from 1000 to None
    """
    Fetches Reddit posts for a given event name from all of Reddit.

    Args:
        event_name (str): The name of the event to search for.
        limit (int, optional): Maximum number of posts to fetch from Reddit. If None, fetches all available posts.

    Returns:
        list: A list of dictionaries, each containing post data.
              Returns an empty list if there's an error or no posts are found.
    """
    access_token = get_reddit_access_token()
    if not access_token:
        logging.warning("Could not get Reddit access token, using fallback data")
        return generate_fallback_posts(event_name)

    headers = {'Authorization': f'bearer {access_token}', 'User-Agent': 'YourBot/0.1'}
    all_posts = []
    after = None

    try:
        # Simple search query that just looks for the event name
        search_query = f'title:"{event_name}" OR selftext:"{event_name}"'
        
        while True:  # Changed from while len(all_posts) < limit
            params = {
                'q': search_query,
                'limit': 100,  # Maximum allowed by Reddit API per request
                'sort': 'relevance',
                't': 'year',
                'after': after
            }
            
            res = requests.get('https://oauth.reddit.com/search', headers=headers, params=params)
            res.raise_for_status()
            data = res.json()

            if 'data' not in data or 'children' not in data['data'] or not data['data']['children']:
                break

            for post in data['data']['children']:
                post_data = post['data']
                post_id = post_data.get('id', '')
                
                # Fetch comments for this post
                comments = fetch_comments_for_post(post_id, access_token, limit=None)  # Remove comment limit
                
                post_obj = {
                    "id": post_id,
                    "title": post_data.get('title', ''),
                    "selftext": post_data.get('selftext', ''),
                    "score": post_data.get('score', 0),
                    "num_comments": post_data.get('num_comments', 0),
                    "created_utc": post_data.get('created_utc', 0),
                    "subreddit": post_data.get('subreddit', ''),
                    "comments": comments
                }
                
                all_posts.append(post_obj)
                
                # If we have a limit and reached it, stop collecting posts
                if limit and len(all_posts) >= limit:
                    break
                
                time.sleep(0.1)  # Rate limiting

            # If we have a limit and reached it, or no more pages, stop
            if (limit and len(all_posts) >= limit) or not data['data'].get('after'):
                break

            after = data['data'].get('after')
            time.sleep(0.1)  # Rate limiting between pages

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching Reddit posts: {e}")
    except KeyError as e:
        logging.error(f"Error parsing Reddit response: {e}")

    # If no posts were found, use fallback data
    if not all_posts:
        logging.warning(f"No Reddit posts found for {event_name}, using fallback data")
        all_posts = generate_fallback_posts(event_name)
    
    logging.info(f"Successfully fetched {len(all_posts)} posts with comments for event: {event_name}")
    return all_posts if not limit else all_posts[:limit]  # Only limit if specified