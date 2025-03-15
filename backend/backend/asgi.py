"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django

# Set up Django ASGI application early to ensure it's initialized before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import Django-related modules after setup
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from urllib.parse import parse_qs
from django.db import close_old_connections
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings

# Import after Django setup
from chat.routing import websocket_urlpatterns
from pong_game import routing

# Initialize channel layer
channel_layer = get_channel_layer()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        try:
            # Get token from query string
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]

            if token:
                # Verify the token
                try:
                    # Decode the token using Django's SECRET_KEY
                    payload = jwt_decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    user_id = payload.get('user_id')
                    
                    if user_id:
                        scope['user_id'] = user_id
                        scope['channel_layer'] = channel_layer
                        return await super().__call__(scope, receive, send)
                except Exception as e:
                    print(f"Token validation error: {str(e)}")
            
            # If no valid token, close the connection
            if scope["type"] == "websocket":
                await send({
                    "type": "websocket.close",
                    "code": 4001,
                })
            return None
            
        except Exception as e:
            print(f"WebSocket authentication error: {str(e)}")
            if scope["type"] == "websocket":
                await send({
                    "type": "websocket.close",
                    "code": 4001,
                })
            return None

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        URLRouter(
            websocket_urlpatterns + routing.websocket_urlpatterns
        )
    ),
})
