from django.urls import re_path
from . import consumers
from users import consumers as users_consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/', users_consumers.NotificationsConsumer.as_asgi()),
]