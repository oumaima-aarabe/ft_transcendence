from rest_framework import serializers
from .models import Game, Match, PlayerProfile, GameInvite, MatchmakingQueue
from authentication.models import User

class PlayerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='player.username', read_only=True)
    avatar = serializers.URLField(source='player.avatar', read_only=True)
    
    class Meta:
        model = PlayerProfile
        fields = ['id', 'username', 'avatar', 'theme', 'difficulty', 
                  'matches_played', 'matches_won', 'matches_lost',
                  'first_win', 'pure_win', 'triple_win']

class GameListSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    player1_avatar = serializers.URLField(source='player1.avatar', read_only=True)
    player2_avatar = serializers.URLField(source='player2.avatar', read_only=True)
    
    class Meta:
        model = Game
        fields = ['id', 'player1_username', 'player2_username', 
                  'player1_avatar', 'player2_avatar',
                  'theme', 'difficulty', 'status', 
                  'final_score_player1', 'final_score_player2',
                  'created_at']

class GameDetailSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    player1_avatar = serializers.URLField(source='player1.avatar', read_only=True)
    player2_avatar = serializers.URLField(source='player2.avatar', read_only=True)
    matches = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = ['id', 'player1_username', 'player2_username', 
                  'player1_avatar', 'player2_avatar',
                  'theme', 'difficulty', 'status', 
                  'final_score_player1', 'final_score_player2',
                  'created_at', 'started_at', 'completed_at',
                  'matches']
    
    def get_matches(self, obj):
        matches = obj.matches.all()
        return MatchSerializer(matches, many=True).data

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['id', 'match_number', 'status', 
                  'score_player1', 'score_player2', 
                  'winner', 'created_at', 'completed_at']

class GameInviteSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.player.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.player.username', read_only=True)
    
    class Meta:
        model = GameInvite
        fields = ['id', 'invitation_code', 'sender_username', 
                  'receiver_username', 'status', 'created_at']
        read_only_fields = ['invitation_code', 'created_at']

class MatchmakingQueueSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='player.username', read_only=True)
    
    class Meta:
        model = MatchmakingQueue
        fields = ['id', 'username', 'difficulty_preference', 
                  'status', 'joined_at']
        read_only_fields = ['joined_at', 'status']

class GameStateSerializer(serializers.Serializer):
    """Serializer for the real-time game state"""
    ball = serializers.DictField()
    left_paddle = serializers.DictField()
    right_paddle = serializers.DictField()
    match_wins = serializers.DictField()
    current_match = serializers.IntegerField()
    game_status = serializers.CharField()
    winner = serializers.CharField(allow_null=True)
    
    # These fields are not sent to clients but help with validation
    game_id = serializers.CharField(write_only=True)
    players = serializers.DictField(write_only=True)
    difficulty = serializers.CharField(write_only=True)
    theme = serializers.CharField(write_only=True)
    settings = serializers.DictField(write_only=True)
    last_update_time = serializers.FloatField(write_only=True)
    loop_running = serializers.BooleanField(write_only=True, required=False)

class PaddleMoveSerializer(serializers.Serializer):
    """Serializer for paddle movement messages"""
    position = serializers.FloatField(min_value=0, max_value=400)