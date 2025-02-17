from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import redirect
from django.utils.http import urlencode
from django.contrib.auth import authenticate, login
from django.http import HttpResponseRedirect
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
        try:
            ft_auth_url = "https://api.intra.42.fr/oauth/authorize"
            params = {
                "client_id": os.getenv("42_CLIENT_ID"),
                "response_type": "code",
                "redirect_uri": os.getenv("42_CALLBACK_URL")
            }
            return Response({"url": f"{ft_auth_url}?{urlencode(params)}"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class Login42API(APIView):
    def get(self, request):
        try:
            code = request.GET.get("code")
            if code is None:
                return redirect(f"{os.getenv('FRONTEND_URL')}?error=no_code")

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

            if response.status_code != 200:
                error_query = urlencode({'error': 'auth_failed'})
                return HttpResponseRedirect(f"{os.getenv('FRONTEND_URL')}?{error_query}")

            access_token = response_data.get("access_token")
            ft_user_url = "https://api.intra.42.fr/v2/me"
            user_data = requests.get(
                ft_user_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_data.json()
            user_email = user_data.get("email")
            if not user_email:
                error_query = urlencode({'error': 'no_email'})
                return redirect(f"{os.getenv('FRONTEND_URL')}?{error_query}")

            user = User.objects.filter(email=user_email).first()
            if user is None:
                user = User.objects.create_user(
                    email=user_email, username=user_email
                )

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            url = os.getenv('FRONTEND_URL') + '/dashboard'
            response = redirect(url)
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
            response.data = {
                'data': 'User authenticated successfully'
            }
            return response
        except Exception as e:
            error_query = urlencode({'error': str(e)})
            return redirect(f"{os.getenv('FRONTEND_URL')}?{error_query}")


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


class RefreshTokenView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refreshToken")
            print('refreshToken: ', refresh_token)
            if not refresh_token:
                return Response({"error": "No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)

            response = Response()
            cookie_settings = {
                "httponly": True,
                "secure": False,
                "samesite": "Lax",  # Use 'None' if using HTTPS
                "domain": None,  # This will use the current domain
                "path": "/"
            }
            response.set_cookie(
                key="accessToken",
                value=str(access_token),
                max_age=settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
                **cookie_settings,
            )
            response.status_code = status.HTTP_200_OK
            response.data = {
                'data': 'Token refreshed successfully'
            }

            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)
