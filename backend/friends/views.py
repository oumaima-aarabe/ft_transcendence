from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Friend
from .serializers import FriendSerializer
from rest_framework import status


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

        return Friend.objects.filter(
            user=self.request.user,
            state='accepted'
        )

