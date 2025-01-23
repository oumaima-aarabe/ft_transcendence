from django.urls import path
from .views import (
    AcceptedFriendView,
    BlockedFriendView,
    IncomingFriendRequestView,
    OutgoingFriendRequestView
)


urlpatterns = [
    path("/", AcceptedFriendView.as_view(), name='accepted_friends'),
    path("/blocked", BlockedFriendView.as_view(), name='blocked_friends'),
    path("/invitations", IncomingFriendRequestView.as_view(), name='invitations'),
    path("/requests", OutgoingFriendRequestView.as_view(), name='requests'),
]
