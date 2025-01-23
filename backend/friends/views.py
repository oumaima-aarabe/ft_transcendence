from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Friend
from .serializers import FriendSerializer
from rest_framework import status
from django.db.models import Q
from authentication.models import User


class Friend_view(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def get(self, request):

        userId = request.query_params.get('userId')
        if not userId:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            current_user = User.objects.get(pk=userId)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        accepted_friends = Friend.objects.filter(
            Q(user=current_user) | Q(friend=current_user),
            state='accepted'
        )
        
        # Serialize friends with related user details
        serialized_friends = []
        for friend in accepted_friends:
            if friend.user == current_user:
                friend_user = friend.friend
            else:
                friend.user
            serialized_friends.append({
                'id': friend.id,
                'friend_id': friend_user.id,
                'username': friend_user.username,
                'state': friend.state
            })

        return Response(
            {"data": accepted_friends},
            status=status.HTTP_200_OK
        )
