def calculate_trending_score(event_data):
    """
    Calculates a trending score based on social volume and sentiment score.
    Returns a normalized score between -1 and 1.

    Args:
        event_data (dict): A dictionary containing event data with keys:
            - "social_volume" (int): The volume of social media mentions.
            - "sentiment_score" (float): The sentiment score (-1 to 1).

    Returns:
        float: The calculated trending score between -1 and 1.
    """
    social_volume = event_data.get("social_volume", 0)
    sentiment_score = event_data.get("sentiment_score", 0)

    # Dynamic normalization based on volume
    # Use log scale for better handling of large numbers
    # log(x+1) ensures we handle 0 volume gracefully
    normalized_volume = 0
    if social_volume > 0:
        normalized_volume = min(1.0, (1 + social_volume) / 1000.0)

    # Calculate weighted score
    # Weight distribution: 60% sentiment, 40% volume
    sentiment_weight = 0.6
    volume_weight = 0.4

    # Combine scores
    trending_score = (
        (sentiment_score * sentiment_weight) +  # Sentiment is already between -1 and 1
        (normalized_volume * volume_weight)     # Volume is normalized to 0-1
    )

    # Ensure the final score is between -1 and 1
    return max(-1.0, min(1.0, trending_score))