from django.urls import path
from .views import (
    AcceptedFriendView,
    BlockedFriendView,
    IncomingFriendRequestView,
    OutgoingFriendRequestView,
    SendFriendRequestView,
    ConfirmFriendRequestView,
    CancelFriendRequestView,
    RemoveFriendView,
    BlockView,
    UnblockView,
)


urlpatterns = [
    path("", AcceptedFriendView.as_view(), name='accepted_friends'),
    path("blocked", BlockedFriendView.as_view(), name='blocked_friends'),
    path("invitations", IncomingFriendRequestView.as_view(), name='invitations'),
    path("requests", OutgoingFriendRequestView.as_view(), name='requests'),
    path('send-request', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('confirm-request', ConfirmFriendRequestView.as_view(), name='confirm_friend_request'),
    path('Cancel-request', CancelFriendRequestView.as_view(), name='cancel_friend_request'),
    path('remove-friend', RemoveFriendView.as_view(), name='remove_friend'),
    path('block', BlockView.as_view(), name='block'),
    path('unblock', UnblockView.as_view(), name='unblock'),
]