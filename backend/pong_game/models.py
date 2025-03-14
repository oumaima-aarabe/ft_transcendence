# pong_game/models.py
from django.db import models
from authentication.models import User

class Preferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=[('fire', 'Fire'), ('water', 'Water')], default='fire')
    difficulty = models.CharField(max_length=10, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')], default='medium')
    
    def __str__(self):
        return f"Preferences for {self.user.username}"

class Game(models.Model):
    THEME_CHOICES = [
        ('fire', 'Fire'),
        ('water', 'Water'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    STATUS_CHOICES = [
        ('waiting', 'Waiting for Players'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    # Basic game info
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='fire')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='waiting')
    
    # Players
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True)
    
    # Final result
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_won', null=True, blank=True)
    final_score_player1 = models.IntegerField(default=0)  # Matches won
    final_score_player2 = models.IntegerField(default=0)  # Matches won
    
    def __str__(self):
        p1_name = self.player1.username
        p2_name = self.player2.username if self.player2 else "Waiting for opponent"
        return f"Game {self.id}: {p1_name} vs {p2_name}"


class Match(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    # Link to parent game
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='matches')
    
    # Match info
    match_number = models.IntegerField()  # 1, 2, 3, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    
    # Scores
    score_player1 = models.IntegerField(default=0)  # Points in this match
    score_player2 = models.IntegerField(default=0)  # Points in this match
    winner = models.CharField(max_length=10, choices=[('player1', 'Player 1'), ('player2', 'Player 2')], null=True, blank=True)
    
    class Meta:
        unique_together = ('game', 'match_number')
        ordering = ['game', 'match_number']
    
    def __str__(self):
        return f"Match {self.match_number} in Game {self.game.id}"


class MatchmakingQueue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matchmaking_entries')
    joined_at = models.DateTimeField(auto_now_add=True)
    theme_preference = models.CharField(max_length=10, choices=Game.THEME_CHOICES, default='fire')
    difficulty_preference = models.CharField(max_length=10, choices=Game.DIFFICULTY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    connection_id = models.CharField(max_length=100, null=True, blank=True)  # Store WebSocket connection ID
    
    def __str__(self):
        return f"{self.user.username} in matchmaking queue since {self.joined_at}"