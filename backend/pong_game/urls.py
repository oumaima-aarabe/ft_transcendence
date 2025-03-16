from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.PlayerProfileView.as_view(), name='profile'),
    path('games/', views.GameListView.as_view(), name='game-list'),
    path('games/<str:game_id>/', views.GameDetailView.as_view(), name='game-detail'),
    path('invites/', views.GameInviteView.as_view(), name='invites'),
    path('invites/<str:invitation_code>/', views.GameInviteResponseView.as_view(), name='invitation-response'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    
    # New endpoints for game state
    path('games/<str:game_id>/state/', views.GameStateView.as_view(), name='game-state'),
    path('active-games/', views.ActiveGamesView.as_view(), name='active-games'),
]