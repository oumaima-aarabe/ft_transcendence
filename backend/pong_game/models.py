from django.db import models
from authentication.models import User
from django.utils import timezone


# Common status choices that can be reused
class StatusChoices:
    # User statuses
    ONLINE = 'online'
    INVISIBLE = 'invisible'
    DO_NOT_DISTURB = 'donotdisturb'
    OFFLINE = 'offline'
    
    # Game statuses
    WAITING = 'waiting'
    CANCELLED = 'cancelled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    PAUSED = 'paused'
    
    # Match statuses
    MATCH_IN_PROGRESS = 'in_progress'
    MATCH_COMPLETED = 'completed'
    
    # Invitation statuses
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    DECLINED = 'declined'
    EXPIRED = 'expired'
    
    # Queue statuses
    QUEUE_WAITING = 'waiting'
    QUEUE_MATCHED = 'matched'
    QUEUE_TIMEOUT = 'timed_out'


class PlayerProfile(models.Model):
    THEME_CHOICES = [
        ('fire', 'Fire'),
        ('water', 'Water')
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ]
    
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='fire')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    player = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    
    # Stats
    matches_played = models.IntegerField(default=0)
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    
    # Achievements (now default to False)
    first_win = models.BooleanField(default=False)  # First match won
    pure_win = models.BooleanField(default=False)  # Win without losing a match
    triple_win = models.BooleanField(default=False)  # Win 3 matches in a row
    
    def __str__(self):
        return f"{self.player.username}'s Profile"
    
    def join_matchmaking_queue(self, difficulty_preference=None):
        """Add the player to the matchmaking queue and update status"""
        # Use player's default difficulty if none specified
        if difficulty_preference is None:
            difficulty_preference = self.difficulty
            
        # Create queue entry if not already in queue
        if not self.is_in_queue():
            MatchmakingQueue.objects.create(
                player=self.player,
                difficulty_preference=difficulty_preference,
                is_active=True,
                status=StatusChoices.QUEUE_WAITING
            )
            return True
        return False
    
    def leave_matchmaking_queue(self):
        """Remove the player from the matchmaking queue"""
        entries = MatchmakingQueue.objects.filter(
            player=self.player, 
            is_active=True
        )
        entries.update(
            is_active=False,
            status=StatusChoices.QUEUE_TIMEOUT
        )
        return entries.count() > 0
    
    def is_in_queue(self):
        """Check if player is currently in an active matchmaking queue"""
        return MatchmakingQueue.objects.filter(
            player=self.player,
            is_active=True
        ).exists()
    
    def update_achievements(self, game):
        """Update player achievements based on game results"""
        # Logic to update achievements after a game
        if game.winner == self.player:
            # First win achievement
            if not self.first_win:
                self.first_win = True
                
            # Track consecutive wins logic could be added here
            
            self.save()
        if game.winner == self.player and game.final_score_player2 == 0:
            # Pure win achievement
            if not self.pure_win:
                self.pure_win = True
            self.save()
        if game.winner == self.player and self.matches_won == 3:
            # Triple win achievement
            if not self.triple_win:
                self.triple_win = True
            self.save()


class GameInvite(models.Model):
    INVITE_STATUS_CHOICES = [
        (StatusChoices.PENDING, 'Pending'),
        (StatusChoices.ACCEPTED, 'Accepted'),
        (StatusChoices.DECLINED, 'Declined'),
        (StatusChoices.EXPIRED, 'Expired')
    ]
    
    invitation_code = models.CharField(max_length=10, unique=True)
    sender = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE, related_name='sent_invites')
    receiver = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE, related_name='received_invites')
    
    # Timestamps for tracking invite lifecycle
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    declined_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=INVITE_STATUS_CHOICES, default=StatusChoices.PENDING)
    
    # Link to game if created from this invite
    resulting_game = models.OneToOneField('Game', on_delete=models.SET_NULL, 
                                        null=True, blank=True, related_name='created_from_invite')
    
    class Meta:
        indexes = [
            models.Index(fields=['invitation_code']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.sender.player.username} → {self.receiver.player.username} ({self.status})"
    
    def accept(self):
        """Accept an invitation and create a game"""
        if self.status != StatusChoices.PENDING:
            return None
            
        self.status = StatusChoices.ACCEPTED
        self.accepted_at = timezone.now()
        
        # Create a game with players from the invitation
        game = Game.objects.create(
            player1=self.sender.player,
            player2=self.receiver.player,
            status=StatusChoices.WAITING,
            theme=self.sender.theme,  # Using sender's preferences
            difficulty=self.sender.difficulty
        )
        
        self.resulting_game = game
        self.save()
        
        return game
    
    def decline(self):
        """Decline an invitation"""
        if self.status != StatusChoices.PENDING:
            return False
            
        self.status = StatusChoices.DECLINED
        self.declined_at = timezone.now()
        self.save()
        return True
    
    def is_expired(self):
        """Check if invitation has expired"""
        if self.expires_at and timezone.now() > self.expires_at:
            self.status = StatusChoices.EXPIRED
            self.save()
            return True
        return False


class MatchmakingQueue(models.Model):
    QUEUE_STATUS_CHOICES = [
        (StatusChoices.QUEUE_WAITING, 'Waiting'),
        (StatusChoices.QUEUE_MATCHED, 'Matched'),
        (StatusChoices.QUEUE_TIMEOUT, 'Timed Out')
    ]
    
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matchmaking_entries')
    joined_at = models.DateTimeField(auto_now_add=True)
    matched_at = models.DateTimeField(null=True, blank=True)
    
    # Using PlayerProfile's difficulty choices to avoid circular reference
    difficulty_preference = models.CharField(
        max_length=10, 
        choices=PlayerProfile.DIFFICULTY_CHOICES, 
        default='medium'
    )
    
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=10, choices=QUEUE_STATUS_CHOICES, default=StatusChoices.QUEUE_WAITING)
    
    # Resulting game if matched
    resulting_game = models.ForeignKey('Game', on_delete=models.SET_NULL, 
                                     null=True, blank=True, related_name='created_from_queue')
    
    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'status']),
            models.Index(fields=['difficulty_preference', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.player.username} in matchmaking queue since {self.joined_at}"
    
    def match_with_player(self, other_queue_entry):
        """Match this player with another player from the queue"""
        if not self.is_active or self.status != StatusChoices.QUEUE_WAITING:
            return None
            
        if not other_queue_entry.is_active or other_queue_entry.status != StatusChoices.QUEUE_WAITING:
            return None
        
        # Create a game between the two players
        game = Game.objects.create(
            player1=self.player,
            player2=other_queue_entry.player,
            status=StatusChoices.WAITING,
            # Use most common difficulty between the two or fallback to medium
            difficulty=self.difficulty_preference if self.difficulty_preference == other_queue_entry.difficulty_preference 
                       else 'medium'
        )
        
        # Update both queue entries
        now = timezone.now()
        self.status = StatusChoices.QUEUE_MATCHED
        self.is_active = False
        self.matched_at = now
        self.resulting_game = game
        self.save()
        
        other_queue_entry.status = StatusChoices.QUEUE_MATCHED
        other_queue_entry.is_active = False
        other_queue_entry.matched_at = now
        other_queue_entry.resulting_game = game
        other_queue_entry.save()
        
        return game


class Game(models.Model):
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    GAME_STATUS_CHOICES = [
        (StatusChoices.WAITING, 'Waiting for Players'),
        (StatusChoices.IN_PROGRESS, 'In Progress'),
        (StatusChoices.PAUSED, 'Paused'),
        (StatusChoices.COMPLETED, 'Completed'),
        (StatusChoices.CANCELLED, 'Cancelled'),
    ]
    
    # Basic game info
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=GAME_STATUS_CHOICES, default=StatusChoices.WAITING)
    
    # Players
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2', null=True, blank=True)
    
    # Final result
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_won', null=True, blank=True)
    final_score_player1 = models.IntegerField(default=0)  # Matches won
    final_score_player2 = models.IntegerField(default=0)  # Matches won
    
    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['player1']),
            models.Index(fields=['player2']),
        ]
    
    def __str__(self):
        p1_name = self.player1.username
        p2_name = self.player2.username if self.player2 else "Waiting for opponent"
        return f"Game {self.id}: {p1_name} vs {p2_name}"
    
    def start_game(self):
        """Start the game if both players are ready"""
        if self.status != StatusChoices.WAITING or not self.player2:
            return False
            
        self.status = StatusChoices.IN_PROGRESS
        self.started_at = timezone.now()
        self.save()
        
        # Create the first match
        self.create_new_match()
        return True
    
    def create_new_match(self):
        """Create a new match within this game"""
        match_number = self.matches.count() + 1
        return Match.objects.create(
            game=self,
            match_number=match_number,
            status=StatusChoices.MATCH_IN_PROGRESS
        )
    
    def complete_game(self, winner_user):
        """Mark the game as completed and set the winner"""
        if self.status != StatusChoices.IN_PROGRESS:
            return False
            
        self.status = StatusChoices.COMPLETED
        self.completed_at = timezone.now()
        self.winner = winner_user
        
        # Make sure any in-progress matches are completed
        self.matches.filter(status=StatusChoices.MATCH_IN_PROGRESS).update(
            status=StatusChoices.MATCH_COMPLETED
        )
        
        self.save()
        
        # Update player stats
        try:
            winner_profile = winner_user.stats
            winner_profile.matches_won += 1
            winner_profile.update_achievements(self)
            winner_profile.save()
            
            # Determine loser and update their stats
            loser_user = self.player2 if winner_user == self.player1 else self.player1
            loser_profile = loser_user.stats
            loser_profile.matches_lost += 1
            loser_profile.save()
            
            # Update matches_played for both
            winner_profile.matches_played += 1
            loser_profile.matches_played += 1
            winner_profile.save()
            loser_profile.save()
            
        except PlayerProfile.DoesNotExist:
            # Handle case where player doesn't have a profile
            pass
            
        return True


class Match(models.Model):
    MATCH_STATUS_CHOICES = [
        (StatusChoices.MATCH_IN_PROGRESS, 'In Progress'),
        (StatusChoices.MATCH_COMPLETED, 'Completed'),
    ]
    
    # Link to parent game
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='matches')
    
    # Match info
    match_number = models.IntegerField()  # 1, 2, 3, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=MATCH_STATUS_CHOICES, default=StatusChoices.MATCH_IN_PROGRESS)
    
    # Scores
    score_player1 = models.IntegerField(default=0)  # Points in this match
    score_player2 = models.IntegerField(default=0)  # Points in this match
    winner = models.CharField(max_length=10, choices=[('player1', 'Player 1'), ('player2', 'Player 2')], null=True, blank=True)
    
    class Meta:
        unique_together = ('game', 'match_number')
        ordering = ['game', 'match_number']
        indexes = [
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Match {self.match_number} in Game {self.game.id}"
    
    def start_match(self):
        """Start the match"""
        if self.status != StatusChoices.MATCH_IN_PROGRESS or self.started_at:
            return False
            
        self.started_at = timezone.now()
        self.save()
        return True
    
    def complete_match(self, player1_score, player2_score):
        """Complete the match with final scores"""
        if self.status != StatusChoices.MATCH_IN_PROGRESS:
            return False
            
        self.score_player1 = player1_score
        self.score_player2 = player2_score
        self.status = StatusChoices.MATCH_COMPLETED
        self.completed_at = timezone.now()
        
        # Determine winner
        if player1_score > player2_score:
            self.winner = 'player1'
            self.game.final_score_player1 += 1
        else:
            self.winner = 'player2'
            self.game.final_score_player2 += 1
        
        self.save()
        self.game.save()
        
        # Check if game should be completed based on match results
        if self.game.final_score_player1 >= 2:  # Player 1 won best of 3
            self.game.complete_game(self.game.player1)
        elif self.game.final_score_player2 >= 2:  # Player 2 won best of 3
            self.game.complete_game(self.game.player2)
        else:
            # Create next match if needed
            self.game.create_new_match()
            
        return True