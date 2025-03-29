from django.urls import re_path
from .consumers import MatchmakingConsumer
from .game_consumers import GameConsumer

websocket_urlpatterns = [
    re_path(r'ws/matchmaking/$', MatchmakingConsumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>[^/]+)/$', GameConsumer.as_asgi()),
]