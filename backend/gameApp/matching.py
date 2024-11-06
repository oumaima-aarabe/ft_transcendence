from datetime import datetime, timedelta

class QueueEntry:
    def __init__(self, user, skill_rating, search_radius=100):
        self.user = user
        self.joined_at = datetime.now()
        self.skill_rating = skill_rating  # user's current rating
        self.status = 'queued'
        self.search_radius = search_radius # to increase with time

    def match(self):
        self.status = 'matched'

    def cancel(self):
        self.status = 'cancelled'


class GameInvite:
    def __init__(self, sender, receiver, expires_in=5):
        self.sender = sender
        self.receiver = receiver
        self.status = 'pending'
        self.created_at = datetime.now()
        self.expires_at = self.created_at + timedelta(minutes=expires_in)
        self.game_session = None

    def accept(self, game_session):
        self.status = 'accepted'
        self.game_session = game_session

    def decline(self):
        self.status = 'declined'

    def check_expiry(self):
        if datetime.now() > self.expires_at:
            self.status = 'expired'
