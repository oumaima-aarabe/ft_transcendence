from .models import GameSession, Match, GameHistory, PlayerStats
from rest_framework import serializers

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = '__all__'
    
    