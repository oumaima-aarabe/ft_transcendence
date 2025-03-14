# pong_game/serializers.py
from rest_framework import serializers
from .models import Game, Match, Preferences
from authentication.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'level']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'id', 'match_number', 'created_at', 'completed_at',
            'status', 'score_player1', 'score_player2', 'winner'
        ]

class GameSerializer(serializers.ModelSerializer):
    player1_info = UserBasicSerializer(source='player1', read_only=True)
    player2_info = UserBasicSerializer(source='player2', read_only=True)
    winner_info = UserBasicSerializer(source='winner', read_only=True)
    matches = MatchSerializer(many=True, read_only=True)
    
    class Meta:
        model = Game
        fields = [
            'id', 'created_at', 'updated_at', 'theme', 'difficulty',
            'status', 'player1', 'player2', 'winner', 'player1_info',
            'player2_info', 'winner_info', 'final_score_player1',
            'final_score_player2', 'matches']
        
class PreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preferences
        fields = ['theme', 'difficulty']