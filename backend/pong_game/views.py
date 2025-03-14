# pong_game/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Game, Match, Preferences, MatchmakingQueue
from .serializers import GameSerializer, MatchSerializer, PreferencesSerializer
from authentication.models import User

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_game(self, request):
        """Create a new game and join as player 1"""
        theme = request.data.get('theme', 'fire')
        difficulty = request.data.get('difficulty', 'medium')
        
        game = Game.objects.create(
            player1=request.user,
            theme=theme,
            difficulty=difficulty,
            status='waiting'
        )
        
        return Response({
            'game_id': game.id,
            'status': 'waiting',
            'join_url': f'/game/{game.id}/',
            'websocket_url': f'ws/game/{game.id}/'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def find_match(self, request):
        """Find an open game to join or create a new one"""
        theme = request.query_params.get('theme', 'fire')
        difficulty = request.query_params.get('difficulty', 'medium')
        
        # Find an open game
        open_game = Game.objects.filter(
            player2__isnull=True,
            status='waiting',
            theme=theme,
            difficulty=difficulty
        ).exclude(player1=request.user).first()
        
        if open_game:
            return Response({
                'game_id': open_game.id,
                'status': 'joining',
                'join_url': f'/game/{open_game.id}/',
                'websocket_url': f'ws/game/{open_game.id}/'
            })
        else:
            # Create a new game
            game = Game.objects.create(
                player1=request.user,
                theme=theme,
                difficulty=difficulty,
                status='waiting'
            )
            
            return Response({
                'game_id': game.id,
                'status': 'waiting',
                'join_url': f'/game/{game.id}/',
                'websocket_url': f'ws/game/{game.id}/'
            })
    
    @action(detail=True, methods=['post'])
    def join_game(self, request, pk=None):
        """Join a specific game as player 2"""
        game = get_object_or_404(Game, pk=pk)
        
        if game.player2 is not None:
            return Response({'error': 'Game is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        if game.player1 == request.user:
            return Response({'error': 'You cannot join your own game'}, status=status.HTTP_400_BAD_REQUEST)
        
        game.player2 = request.user
        game.status = 'in_progress'
        game.save()
        
        return Response({
            'game_id': game.id,
            'status': 'joined',
            'join_url': f'/game/{game.id}/',
            'websocket_url': f'ws/game/{game.id}/'
        })
    
    @action(detail=True, methods=['get'])
    def game_history(self, request, pk=None):
        """Get the history of matches for a game"""
        game = get_object_or_404(Game, pk=pk)
        matches = Match.objects.filter(game=game).order_by('match_number')
        
        match_data = MatchSerializer(matches, many=True).data
        
        return Response({
            'game_id': game.id,
            'player1': game.player1.username,
            'player2': game.player2.username if game.player2 else None,
            'final_score': f"{game.final_score_player1} - {game.final_score_player2}",
            'winner': game.winner.username if game.winner else None,
            'matches': match_data
        })
    
    @action(detail=False, methods=['get'])
    def player_stats(self, request):
        """Get pong statistics for the current user"""
        user = request.user
        
        # Games played
        games_played = Game.objects.filter(status='completed').filter(
            player1=user
        ) | Game.objects.filter(status='completed').filter(
            player2=user
        ).count()
        
        # Games won
        games_won = Game.objects.filter(winner=user).count()
        
        # Win rate
        win_rate = (games_won / games_played) * 100 if games_played > 0 else 0
        
        # Matches played and won
        matches_as_p1 = Match.objects.filter(game__player1=user, status='completed')
        matches_as_p2 = Match.objects.filter(game__player2=user, status='completed')
        
        matches_played = matches_as_p1.count() + matches_as_p2.count()
        matches_won = matches_as_p1.filter(winner='player1').count() + matches_as_p2.filter(winner='player2').count()
        
        return Response({
            'games_played': games_played,
            'games_won': games_won,
            'win_rate': round(win_rate, 2),
            'matches_played': matches_played,
            'matches_won': matches_won
        })

class PreferencesViewSet(viewsets.ModelViewSet):
    queryset = Preferences.objects.all()
    serializer_class = PreferencesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Preferences.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, theme='water', difficulty='medium')
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put'])
    def user_preferences(self, request):
        """Get and update preferences for the current user"""
        preferences, created = Preferences.objects.get_or_create(user=request.user, defaults={'theme': 'water', 'difficulty': 'medium'})
        
        if request.method == 'GET':
            serializer = self.get_serializer(preferences)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = self.get_serializer(preferences, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)