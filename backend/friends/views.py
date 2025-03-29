from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import Friend
from authentication.models import User
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from users.utils import send_notification


class BaseFriendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def serialize_friend(self, friendship):
        return {
            'id': friendship.id,
            'recipient': friendship.recipient.username,
            'sender': friendship.sender.username,
            'state': friendship.state,
        }

    def serialize_list_friends(self, target_user):
        return {
            'id': target_user.id,
            'username': target_user.username,
            'first_name': target_user.first_name,
            'last_name': target_user.last_name,
            'avatar': target_user.avatar
        }


class FriendShipStatus(BaseFriendView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        username = request.GET.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            friendship = Friend.objects.get(
                Q(sender=current_user, recipient=target_user) |
                Q(sender=target_user, recipient=current_user)
            )
        except Friend.DoesNotExist:
            friendship = Friend.objects.create(sender=current_user, recipient=target_user, state='none')
            friend = self.serialize_friend(friendship)
            return Response(friend, status=status.HTTP_200_OK)

        friend = self.serialize_friend(friendship)

        return Response(
            friend,
            status=status.HTTP_200_OK
        )


# lists
class AcceptedFriendView(BaseFriendView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_user = request.user

        accepted_friends = Friend.objects.filter(
            Q(sender=current_user) | Q(recipient=current_user),
            state='accepted'
        )

        serialized_friends = []
        for friendship in accepted_friends:
            target_user = friendship.recipient if friendship.sender == current_user else friendship.sender
            serialized_friends.append(self.serialize_list_friends(target_user))

        return Response(
            serialized_friends,
            status=status.HTTP_200_OK
        )



class BlockedFriendView(BaseFriendView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_user = request.user

        blocked_friends = Friend.objects.filter(
            sender=current_user,
            state='blocked'
        )

        serialized_friends = []
        for friendship in blocked_friends:
            target_user = friendship.recipient
            serialized_friends.append(self.serialize_list_friends(target_user))

        return Response(
            serialized_friends,
            status=status.HTTP_200_OK
        )


class IncomingFriendRequestView(BaseFriendView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_user = request.user

        incoming_requests = Friend.objects.filter(
            recipient=current_user,
            state='pending'
        )

        serialized_friends = []
        for friendship in incoming_requests:
            target_user = friendship.sender
            serialized_friends.append(self.serialize_list_friends(target_user))

        return Response(
            serialized_friends,
            status=status.HTTP_200_OK
        )


class OutgoingFriendRequestView(BaseFriendView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_user = request.user

        outgoing_requests = Friend.objects.filter(
            sender=current_user,
            state='pending'
        )

        serialized_friends = []
        for friendship in outgoing_requests:
            target_user = friendship.recipient
            serialized_friends.append(self.serialize_list_friends(target_user))

        return Response(
            serialized_friends,
            status=status.HTTP_200_OK
        )


# actions

class SendFriendRequestView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            friendship = Friend.objects.get(sender=current_user, recipient=target_user, state='none')
            friendship.state = 'pending'
            friendship.save()
            friend = self.serialize_friend(friendship)
            
            # Send notification to the recipient
            send_notification(
                username=target_user.username,
                notification_type='friend_request',
                message=f"{current_user.username} sent you a friend request",
                data={
                    "user": {
                        "id": current_user.id,
                        "username": current_user.username,
                        "first_name": current_user.first_name,
                        "last_name": current_user.last_name,
                        "avatar": current_user.avatar
                    }
                }
            )
            
            return Response(friend, status=status.HTTP_201_CREATED)
        except Friend.DoesNotExist:
            try:
                friendship = Friend.objects.get(sender=target_user, recipient=current_user, state='none').delete()
                raise Friend.DoesNotExist
            except Friend.DoesNotExist:
                friendship = Friend.objects.create(sender=current_user, recipient=target_user, state='pending')
                friend = self.serialize_friend(friendship)

                # Send notification to the recipient
                send_notification(
                    username=target_user.username,
                    notification_type='friend_request',
                    message=f"{current_user.username} sent you a friend request",
                    data={
                        "user": {
                            "id": current_user.id,
                            "username": current_user.username,
                            "first_name": current_user.first_name,
                            "last_name": current_user.last_name,
                            "avatar": current_user.avatar
                        }
                    }
                )

                return Response(friend, status=status.HTTP_201_CREATED)


class ConfirmFriendRequestView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        friend_request = get_object_or_404(Friend, sender=target_user, recipient=current_user, state='pending')
        friend_request.state = 'accepted'
        friend_request.save()
        friend = self.serialize_friend(friendship=friend_request)

        # Send notification to the user who sent the friend request
        send_notification(
            username=target_user.username,
            notification_type='friend_request_accepted',
            message=f"{current_user.username} accepted your friend request",
            data={
                "user": {
                    "id": current_user.id,
                    "username": current_user.username,
                    "first_name": current_user.first_name,
                    "last_name": current_user.last_name,
                    "avatar": current_user.avatar
                }
            }
        )
        
        return Response(friend, status=status.HTTP_200_OK)


class CancelFriendRequestView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            Friend.objects.filter(
                Q(sender=current_user, recipient=target_user, state='pending') |
                Q(sender=target_user, recipient=current_user, state='pending')
            ).delete()
            
            send_notification(
                username=target_user.username,
                notification_type='cancel_request',
                message=f"{current_user.username} cancel your friend request",
                data={
                    "user": {
                        "id": current_user.id,
                        "username": current_user.username,
                        "first_name": current_user.first_name,
                        "last_name": current_user.last_name,
                        "avatar": current_user.avatar
                    }
                }
            )
            
            return Response("canceled", status=status.HTTP_200_OK)
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)


class RemoveFriendView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)
        try:
            Friend.objects.filter(
                Q(sender=current_user, recipient=target_user, state='accepted') |
                Q(sender=target_user, recipient=current_user, state='accepted')
            ).delete()
            
            send_notification(
                username=target_user.username,
                notification_type='remove_friend',
                message=f"{current_user.username} remove your friendship",
                data={
                    "user": {
                        "id": current_user.id,
                        "username": current_user.username,
                        "first_name": current_user.first_name,
                        "last_name": current_user.last_name,
                        "avatar": current_user.avatar
                    }
                }
            )
            
            return Response("removed", status=status.HTTP_200_OK)
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)


class BlockView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            Friend.objects.filter(
                Q(sender=current_user, recipient=target_user) |
                Q(sender=target_user, recipient=current_user)
            ).delete()
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        channel_layer = get_channel_layer()
        friendship = Friend.objects.create(sender=current_user, recipient=target_user, state='blocked')
        friend = self.serialize_friend(friendship)

        # Send WebSocket notification to the blocked user
        async_to_sync(channel_layer.group_send)(
            f"chat_{target_user.username}",
            {
                "type": "block_status_update",
                "event": "block_status_update",
                "status": "blocked",
                "blocker": {
                    "id": current_user.id,
                    "username": current_user.username,
                }
            }
        )
        
        # Send notification using the new notification system
        send_notification(
            username=target_user.username,
            notification_type='block',
            message=f"{current_user.username} has blocked you",
            data={
                "blocker": {
                    "id": current_user.id,
                    "username": current_user.username,
                }
            }
        )
        return Response(friend, status=status.HTTP_200_OK)


class UnblockView(BaseFriendView):
    def post(self, request):
        username = request.data.get('username')
        current_user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            friendship = Friend.objects.filter(
                Q(sender=current_user, recipient=target_user, state='blocked')
            ).delete()
            friendship = Friend.objects.create(sender=current_user, recipient=target_user, state="none")
            friend = self.serialize_friend(friendship)

            # Send WebSocket notification to the blocked user
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"chat_{target_user.username}",
                {
                    "type": "block_status_update",
                    "event": "block_status_update",
                    "status": "unblocked",
                    "blocker": {
                        "id": current_user.id,
                        "username": current_user.username,
                    }
                }
            )
            
            # Send notification using the new notification system
            send_notification(
                username=target_user.username,
                notification_type='unblock',
                message=f"{current_user.username} has unblocked you",
                data={
                    "blocker": {
                        "id": current_user.id,
                        "username": current_user.username,
                    }
                }
            )
            
            return Response(friend, status=status.HTTP_200_OK)
        except Friend.DoesNotExist:
            return Response({'error': 'relation not found'}, status=status.HTTP_404_NOT_FOUND)


class CheckBlockedByView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        current_user = request.user
        target_user = get_object_or_404(User, id=user_id)
        
        # Check if target_user has blocked current_user
        is_blocked = Friend.objects.filter(
            sender=target_user,
            recipient=current_user,
            state='blocked'
        ).exists()
        
        return Response({'is_blocked': is_blocked}, status=status.HTTP_200_OK)