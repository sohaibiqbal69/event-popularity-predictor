class Event:
    def __init__(self, name, sentiment_score=None, trend_score=None, social_volume=None, prediction_badge=None):
        self.name = name
        self.sentiment_score = sentiment_score
        self.trend_score = trend_score
        self.social_volume = social_volume
        self.prediction_badge = prediction_badge

    def to_dict(self):
        return {
            "name": self.name,
            "sentiment_score": self.sentiment_score,
            "trend_score": self.trend_score,
            "social_volume": self.social_volume,
            "prediction_badge": self.prediction_badge,
        }