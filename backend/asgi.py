import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from users.routing import websocket_urlpatterns as notifications_websocket_urlpatterns
from pong_game.routing import websocket_urlpatterns as pong_game_websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_websocket_urlpatterns + notifications_websocket_urlpatterns + 
            pong_game_websocket_urlpatterns

        )
    ),
}) 