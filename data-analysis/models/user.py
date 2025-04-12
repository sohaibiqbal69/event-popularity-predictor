class User:
    def __init__(self, user_id, preferences=None, interactions=None):
        self.user_id = user_id
        self.preferences = preferences or []
        self.interactions = interactions or []

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "preferences": self.preferences,
            "interactions": self.interactions,
        }