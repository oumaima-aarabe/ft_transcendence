# pong_game/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'games', views.GameViewSet)
# router.register(r'invitations', views.GameInvitationViewSet)
# router.register(r'matchmaking', views.MatchmakingQueueViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]