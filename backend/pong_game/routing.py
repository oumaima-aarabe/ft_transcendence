from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<user_id>[^/]+)/$', consumers.MatchmakingConsumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>\w+)/$', consumers.PongGameConsumer.as_asgi()),
]