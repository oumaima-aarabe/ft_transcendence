from django.urls import path
from . import views

urlpatterns = [
    path('games/', views.GameListView.as_view(), name='game-list'),
    path('games/<str:game_id>/', views.GameDetailView.as_view(), name='game-detail'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    
    # New endpoints for game state
    path('games/<str:game_id>/state/', views.GameStateView.as_view(), name='game-state'),
    path('active-games/', views.ActiveGamesView.as_view(), name='active-games'),
    path('preferences/', views.UserPreferencesView.as_view(), name='preferences'),
    path('player-status/', views.PlayerGameStatusView.as_view(), name='player-status'),

    # Get current user's profile
    path('profile/', views.PlayerProfileView.as_view(), name='profile'),
    
    # get specific player's profile
    path('profile/<int:player_id>/', views.PlayerDetailView.as_view(), name='player-profile'),
    
    # Get current user's game history
    path('games/history/', views.GameHistoryView.as_view(), name='game-history'),
    
    # Get specific player's game history
    path('games/history/<int:player_id>/', views.GameHistoryView.as_view(), name='player-game-history'),
]