import tweepy

# Twitter API credentials (Replace with your keys)
TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAHv1zQEAAAAAWHGtfZmOL4DnVpiLKJoPen8L1MA%3DlPSQbbbpb13jkERHTBOqE5dQypjHgtqamaRoECtFwt7DcEROh1"

client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)

def fetch_tweets(event_name, max_results=50):
    query = f"{event_name} -is:retweet lang:en"
    tweets = client.search_recent_tweets(query=query, max_results=max_results, tweet_fields=["text"])

    if tweets.data:
        return [{"text": tweet.text} for tweet in tweets.data]
    return []