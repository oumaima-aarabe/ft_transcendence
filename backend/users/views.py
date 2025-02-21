# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from authentication.models import User
from authentication.serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404


class UserView(APIView):
    def get(self, request, username):
        try:
            if username == "me":
                user = request.user
            else:
                user = get_object_or_404(User, username=username)

            serializer = UserSerializer(user)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        except Exception as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, username):
        try:
            if username != "me" and username != request.user.username:
                return Response(
                    {"error": "You can only update your own profile"},
                    status=status.HTTP_403_FORBIDDEN
                )

            user = request.user
            serializer = UserSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST
            )
