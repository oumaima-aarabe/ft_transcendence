# The above code defines API views for user signup, login, 42 OAuth authentication, and logout with
# token generation and cookie handling.
from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import redirect, HttpResponse
from django.utils.http import urlencode
from django.contrib.auth import authenticate
import datetime
import os
from django.conf import settings
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


class signup_view(APIView):
    def post(self, request):
        data = request.data

        print('DATA: ', data)

        userserializer = UserSerializer(data=data)
        userserializer.is_valid(raise_exception=True)
        userserializer.save()
        return Response(
            {"data": "User created successfully"},
            status=status.HTTP_201_CREATED
        )


class login_view(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            user = User.objects.get(email=email)

            if user is None:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
            check_password = user.check_password(password)
            
            if not check_password:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            response = Response()

            cookie_settings = {
                "httponly": True,
                "secure": False,
                "samesite": "Lax",  # Use 'None' if using HTTPS
                "domain": None,  # This will use the current domain
                "path": "/"
            }
            response.set_cookie(
                key="refreshToken",
                value=str(refresh_token),
                max_age=settings.REFRESH_TOKEN_LIFETIME.total_seconds(),
                **cookie_settings,
            )
            response.set_cookie(
                key="accessToken",
                value=str(access_token),
                max_age=settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
                **cookie_settings,
            )

            response.status_code = status.HTTP_200_OK
            response.data = {
                'data': 'User authenticated successfully'
            }

            return response
        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)


class fortytwo_view(APIView):
    def get(self, request):
        ft_auth_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            "client_id": os.getenv("42_CLIENT_ID"),
            "response_type": "code",
            "redirect_uri": os.getenv("42_CALLBACK_URL")
        }
        # return redirect(f"{ft_auth_url}?{urlencode(params)}")
        return Response({"url": f"{ft_auth_url}?{urlencode(params)}"})
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

        print('DATA: ', data)

        ft_token_url = "https://api.intra.42.fr/oauth/token"
        response = requests.post(ft_token_url, data=data)
        response_data = response.json()
        
        print('response data ------>: ', response_data)
        
        if response.status_code == 200:
            access_token = response_data.get("access_token")
            ft_user_url = "https://api.intra.42.fr/v2/me"
            user_data = requests.get(
                ft_user_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_data.json()
            
            # print('USER data ------>: ', user_data)

            user_email = user_data.get("email")
            print('USER email ------>: ', user_email)
            if not user_email:
                return Response(
                    {"error": "Unable to retrieve user email from 42 API"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # create user with email
            user = User.objects.filter(email=user_email).first()
            print('USER: ', user)
            if user is None:
                user = User.objects.create_user(
                    email=user_email, username=user_email
                )
            try:
                authenticated_user = authenticate(request, email=user_email)
            except Exception as e:
                print('ERROR: ', e)
                return Response(
                    {"error": "Error authenticating user"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            print('AUTH: ', authenticated_user)
            if authenticated_user is not None:
                # login(request, authenticated_user)
                refresh = RefreshToken.for_user(authenticated_user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                response = Response()
                cookie_settings = {
                    "httponly": True,
                    "secure": False,
                    "samesite": "Lax",  # Use 'None' if using HTTPS
                    "domain": None,  # This will use the current domain
                    "path": "/"
                }
                response.set_cookie(
                    key="refreshToken",
                    value=str(refresh_token),
                    max_age=settings.REFRESH_TOKEN_LIFETIME.total_seconds(),
                    **cookie_settings,
                )
                response.set_cookie(
                    key="accessToken",
                    value=str(access_token),
                    max_age=settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
                    **cookie_settings,
                )
                response.status_code = status.HTTP_200_OK
                response.data = {
                    'data': 'User authenticated successfully'
                }

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
