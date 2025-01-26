from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import Friend
from authentication.models import User
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404


# lists
class BaseFriendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def serialize_friend(self, friendship, current_user):
        friend_user = friendship.friend if friendship.user == current_user else friendship.user
        return {
            'id': friendship.id,
            'friend_id': friend_user.id,
            'username': friend_user.username,
            'state': friendship.state
        }


class AcceptedFriendView(BaseFriendView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_user = self.get_user(user_id)
        if not current_user:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        accepted_friends = Friend.objects.filter(
            Q(user=current_user) | Q(friend=current_user),
            state='accepted'
        )

        serialized_friends = [
            self.serialize_friend(friend, current_user) 
            for friend in accepted_friends
        ]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class BlockedFriendView(BaseFriendView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_user = self.get_user(user_id)
        if not current_user:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        blocked_friends = Friend.objects.filter(
            user=current_user,
            state='blocked'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.friend.id,
            'username': friendship.friend.username,
            'state': friendship.state
        } for friendship in blocked_friends]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class IncomingFriendRequestView(BaseFriendView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_user = self.get_user(user_id)
        if not current_user:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        incoming_requests = Friend.objects.filter(
            friend=current_user,
            state='pending'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.user.id,
            'username': friendship.user.username,
            'state': friendship.state
        } for friendship in incoming_requests]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class OutgoingFriendRequestView(BaseFriendView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_user = self.get_user(user_id)
        if not current_user:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        outgoing_requests = Friend.objects.filter(
            user=current_user,
            state='pending'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.friend.id,
            'username': friendship.friend.username,
            'state': friendship.state
        } for friendship in outgoing_requests]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


# actions

class SendFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        current_user = request.user
        target_user = get_object_or_404(User, id=target_user_id)

        Friend.objects.create(sender=current_user, recipient=target_user)
        return Response({'status': 'Friend request sent'}, status=status.HTTP_201_CREATED)
    
