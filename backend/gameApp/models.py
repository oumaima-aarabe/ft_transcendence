from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass

STATUS = (
    ('Waiting', 'Waiting'),
    ('In_progress', 'In_progress'),
    ('Completed', 'Completed'),
)
# Create your models here.
class GameSession(models.Model):
    

    player1 = models.ForeignKey("User", related_name="player1", on_delete=models.CASCADE)
    player2 = models.ForeignKey("User", related_name="player2", on_delete=models.CASCADE)
    status = models.CharField(max_length=16, choices=STATUS, default='Waiting')
    created_at = models.DateTimeField(auto_now_add=True)
    matches_won1 = models.IntegerField(default=0)
    matches_won2 = models.IntegerField(default=0)
    compketed_at = models.DateTimeField(null=True)
    # tournament = models.ForeignKey("Tournament", null=True, on_delete=models.CASCADE)

class Match(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    game_number = models.IntegerField()
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    status = models.CharField(max_length=16, default='waiting', choices=STATUS)
    winner = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    history = models.TextField()

class GameHistory(models.Model):
    
    REASON = (
        ('Completed', 'Completed'),
        ('Abandoned', 'Abandoned'),
        ('Timeout', 'Timeout'),
    )
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE)
    loser = models.ForeignKey(User, related_name='loser', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(null=True)
    duration = models.IntegerField()
    end_reason = models.CharField(max_length=16, choices=STATUS, default='Completed')
    is_tourn = models.BooleanField(default=False)
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()


class PlayerStats(models.Model):
    player = models.OneToOneField(User, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    current_level = models.IntegerField(default=0)
    experience_points = models.IntegerField(default=0)
