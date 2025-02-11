# The above code defines API views for user signup, login, 42 OAuth authentication, and logout with
# token generation and cookie handling.
from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import redirect, HttpResponse
from django.utils.http import urlencode
from django.contrib.auth import authenticate, login
import datetime
import os
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated



# Create your views here.


class signup_view(APIView):
    def post(self, request):
        data = request.data

        print('DATA: ', data)

        userserializer = UserSerializer(data=data)
        userserializer.is_valid(raise_exception=True)
        userserializer.save()
        return Response(userserializer.data)
    

class login_view(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token
        
        response = Response()

        response.set_cookie(key='refresh_token', value=str(refresh_token), httponly=True)
        
        response.set_cookie(key='access_token', value=str(access_token), httponly=True)

        response.data = {
            'data': 'User authenticated successfully'
        }

        return response


class fortytwo_view(APIView):
    def get(self, request):
        ft_auth_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            "client_id": os.getenv("42_CLIENT_ID"),
            "response_type": "code",
            "redirect_uri": os.getenv("42_CALLBACK_URL")
        }
        return redirect(f"{ft_auth_url}?{urlencode(params)}")
        # f format string 


class Login42API(APIView):
    def get(self, request):
        code = request.GET.get("code")
        if code is None:
            return Response(
                {"error": "Code not provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = {
            "grant_type": "authorization_code",
            "client_id": os.getenv("42_CLIENT_ID"),
            "client_secret": os.getenv("42_CLIENT_SECRET"),
            "redirect_uri": os.getenv("42_CALLBACK_URL"),
            "code": code,
        }

        ft_token_url = "https://api.intra.42.fr/oauth/token"
        response = requests.post(ft_token_url, data=data)
        response_data = response.json()

        if response.status_code == 200:
            access_token = response_data.get("access_token")
            ft_user_url = "https://api.intra.42.fr/v2/me"
            user_data = requests.get(
                ft_user_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_data.json()

            user_email = user_data.get("email")
            if not user_email:
                return Response(
                    {"error": "Unable to retrieve user email from 42 API"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # create user with email
            user = User.objects.filter(email=user_email).first()
            if user is None:
                user = User.objects.create_user(
                    email=user_email, username=user_email
                )

            authenticated_user = authenticate(request, username=user_email)
            if authenticated_user is not None:
                # login(request, authenticated_user)
                refresh = RefreshToken.for_user(authenticated_user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                response = redirect(os.getenv("dashboard_url"))
                response.set_cookie(key='access', value=access_token, httponly=True)
                response.set_cookie(key='refresh', value=refresh_token, httponly=True)

                return response
            else:
                return Response(
                    {"error": "Error authenticating user"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {"error": "Failed to exchange code for token", "details": response_data},
                status=response.status_code
            )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Blacklist refresh token
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
