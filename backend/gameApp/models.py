from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class GameSession:
    player1 = ForeignKey(User)
    player2 = ForeignKey(User)
    status = CharField(choices=['waiting', 'in_progress', 'completed'])
    created_at = DateTimeField()
    completed_at = DateTimeField(null=True)

class Game:
    session = ForeignKey(GameSession)
    game_number = IntegerField(1-5)
    player1_score = IntegerField()
    player2_score = IntegerField()
    status = CharField()
    winner = ForeignKey(User, null=True)

class PlayerStats:
    user = OneToOneField(User)
    games_played = IntegerField()
    games_won = IntegerField()
    current_level = IntegerField()
    experience_points = IntegerField()
    skill_rating = FloatField()
