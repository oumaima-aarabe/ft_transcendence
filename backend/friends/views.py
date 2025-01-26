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
    authentication_classes = [JWTAuthentication]

    def serialize_friend(self, friendship, current_user):
        friend_user = friendship.recipient if friendship.sender == current_user else friendship.sender
        return {
            'id': friendship.id,
            'friend_id': friend_user.id,
            'username': friend_user.username,
            'state': friendship.state
        }


class AcceptedFriendView(BaseFriendView):
    def get(self, request):
        current_user = request.user

        accepted_friends = Friend.objects.filter(
            Q(sender=current_user) | Q(recipient=current_user),
            state='accepted'
        )

        serialized_friends = [
            self.serialize_friend(friendship, current_user)
            for friendship in accepted_friends
        ]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class BlockedFriendView(BaseFriendView):
    def get(self, request):
        current_user = request.user

        blocked_friends = Friend.objects.filter(
            sender=current_user,
            state='blocked'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.recipient.id,
            'username': friendship.recipient.username,
            'state': friendship.state
        } for friendship in blocked_friends]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class IncomingFriendRequestView(BaseFriendView):
    def get(self, request):
        current_user = request.user

        incoming_requests = Friend.objects.filter(
            recipient=current_user,
            state='pending'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.sender.id,
            'username': friendship.sender.username,
            'state': friendship.state
        } for friendship in incoming_requests]

        return Response(
            {"data": serialized_friends},
            status=status.HTTP_200_OK
        )


class OutgoingFriendRequestView(BaseFriendView):
    def get(self, request):
        current_user = request.user

        outgoing_requests = Friend.objects.filter(
            sender=current_user,
            state='pending'
        )

        serialized_friends = [{
            'id': friendship.id,
            'friend_id': friendship.recipient.id,
            'username': friendship.recipient.username,
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

        Friend.objects.create(sender=current_user, recipient=target_user, state='pending')
        return Response({'status': 'Friend request sent'}, status=status.HTTP_201_CREATED)


class ConfirmFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        current_user = request.user
        target_user = get_object_or_404(User, id=target_user_id)

        friend_request = get_object_or_404(Friend, sender=target_user, recipient=current_user, state='pending')
        if not friend_request:
            return Response({'Error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)
        friend_request.state = 'accepted'
        friend_request.save()
        return Response({'data': 'Friend request confirmed'}, status=status.HTTP_200_OK)


class CancelFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        current_user = request.user
        target_user = get_object_or_404(User, id=target_user_id)

        try:
            Friend.objects.filter(
                Q(sender=current_user, recipient=target_user, state='pending') |
                Q(sender=target_user, recipient=current_user, state='pending')
            ).delete()
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': 'Friend request cancelled'}, status=status.HTTP_200_OK)


class RemoveFriendView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        current_user = request.user
        target_user = get_object_or_404(User, id=target_user_id)
        try:
            Friend.objects.filter(
                Q(user=current_user, friend=target_user, state='accepted') |
                Q(user=target_user, friend=current_user, state='accepted')
            ).delete()
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': 'Friend removed'}, status=status.HTTP_200_OK)


