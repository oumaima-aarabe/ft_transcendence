from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Friend
from .serializers import FriendSerializer
from rest_framework import status
from django.db.models import Q
from authentication.models import User


class Friend_view(APIView):
    serializer_class = FriendSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        print('request userID: ', self.request.GET.get('userId'))
        
        userId = self.request.GET.get('userId')
        if not userId:
            return Response(
                {"error": "UserId not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        current_user = User.objects.get(pk=userId)
        if not current_user:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        accepted_friends = Friend.objects.filter(
            Q(user=current_user) | Q(friend=current_user),
            state='accepted'
        )
        if not accepted_friends:
            return Response(
                {"data": []},
                status=status.HTTP_200_OK
            )
        return Response(
            {"data": accepted_friends},
            status=status.HTTP_200_OK
        )

