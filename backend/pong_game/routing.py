from django.urls import re_path
from .consumers import MatchmakingConsumer
from .game_consumers import GameConsumer
from .invitation_consumers import InvitationConsumer

websocket_urlpatterns = [
    re_path(r'ws/matchmaking/$', MatchmakingConsumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>[^/]+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/invitations/$', InvitationConsumer.as_asgi()),
]