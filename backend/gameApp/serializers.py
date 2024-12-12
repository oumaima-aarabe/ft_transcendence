from .models import GameSession, Match, GameHistory, PlayerStats
from rest_framework import serializers
from django.contrib.auth.models import User #temporary


class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = '__all__'
    
    