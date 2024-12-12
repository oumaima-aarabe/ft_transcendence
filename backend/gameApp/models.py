from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class GameSession(models.Model):
    player1 = ForeignKey(User)
    player2 = ForeignKey(User)
    status = CharField(choices=['waiting', 'in_progress', 'completed'])
    created_at = DateTimeField()
    matches_won1 = IntegerField()
    matches_won2 = IntegerField()
    completed_at = DateTimeField(null=True)
    tournament = ForeignKey(Tournament, null=True)

class Match(models.Model):
    session = ForeignKey(GameSession)
    game_number = IntegerField(1-5)
    player1_score = IntegerField()
    player2_score = IntegerField()
    status = CharField()
    winner = ForeignKey(User, null=True)
    history = TextField()

class GameHistory(models.Model):
    session = ForeignKey(GameSession)
    winner = ForeignKey(User)
    loser = ForeignKey(User)
    created_at = DateTimeField()
    completed_at = DateTimeField()
    duration = IntegerField()
    end_reason = CharField()
    is_tourn = BooleanField()
    winner_score = IntegerField()
    loser_score = IntegerField()


class PlayerStats(models.Model):
    user = OneToOneField(User)
    games_played = IntegerField(default=0)
    games_won = IntegerField(default=0)
    current_level = IntegerField(default=0)
    experience_points = IntegerField(default=0)
    skill_rating = FloatField() # maybe a serializer field, it s just calculated from the other fields
