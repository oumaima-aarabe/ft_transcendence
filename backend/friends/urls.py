from django.urls import path
from .views import (
    FriendShipStatus,
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
    CheckBlockedByView,
)


urlpatterns = [
    path("", AcceptedFriendView.as_view(), name='accepted_friends'),
    path("status/", FriendShipStatus.as_view(), name='friendship_status'),
    path("blocked/", BlockedFriendView.as_view(), name='blocked_friends'),
    path("invitations/", IncomingFriendRequestView.as_view(), name='invitations'),
    path("requests/", OutgoingFriendRequestView.as_view(), name='requests'),
    # actions
    path('send-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('confirm-request/', ConfirmFriendRequestView.as_view(), name='confirm_friend_request'),
    path('cancel-request/', CancelFriendRequestView.as_view(), name='cancel_friend_request'),
    path('remove-friend/', RemoveFriendView.as_view(), name='remove_friend'),
    path('block/', BlockView.as_view(), name='block'),
    path('unblock/', UnblockView.as_view(), name='unblock'),
    path('check-blocked-by/<int:user_id>/', CheckBlockedByView.as_view(), name='check_blocked_by'),
]