from rest_framework.views import APIView
from .serializers import UserRegisterSerializer
from .models import User
from rest_framework import status, permissions
from rest_framework.response import Response
from django.shortcuts import redirect
from django.utils.http import urlencode
from django.http import HttpResponseRedirect
import os
from django.conf import settings
import requests
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import qrcode
import io
import base64
from PIL import Image


class signup_view(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        data = request.data

        userserializer = UserRegisterSerializer(data=data)
        userserializer.is_valid(raise_exception=True)
        userserializer.save()
        return Response(
            {"data": "User created successfully"},
            status=status.HTTP_201_CREATED
        )


class login_view(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "No account found with this email"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.check_password(password):
                return Response(
                    {"error": "Incorrect password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if 2FA is enabled for this user
            if user.is_2fa_enabled:
                # Return a response indicating 2FA is required
                return Response({
                    "requires2FA": True,
                    "userId": str(user.id),
                    "message": "2FA verification required"
                }, status=status.HTTP_200_OK)
        
            # If 2FA is not enabled, proceed with normal login
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            user.status = "online"
            user.save()

            response = Response()

            cookie_settings = {
                "httponly": False,
                "secure": False,
                "samesite": "Lax",  #'None' if using HTTPS
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
                'data': 'User authenticated successfully',
                'requires2FA': False
            }

            return response
        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyTwoFactorView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            user_id = request.data.get('userId')
            code = request.data.get('code')

            if not code:
                return Response(
                    {"error": "Verification code is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # If userId is not provided, this might be a verification during 2FA setup
            if not user_id:
                # Get the authenticated user
                if not request.user.is_authenticated:
                    return Response(
                        {"error": "Authentication required"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                user = request.user
                
                # Verify the 2FA code
                totp = pyotp.TOTP(user.tfa_secret)
                if not totp.verify(code):
                    return Response(
                        {"error": "Invalid verification code"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Enable 2FA for the user
                user.is_2fa_enabled = True
                user.save()
                
                # Return a success response
                return Response({
                    "message": "2FA has been successfully enabled"
                }, status=status.HTTP_200_OK)

            # If userId is provided, this is a login verification
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verify the 2FA code
            totp = pyotp.TOTP(user.tfa_secret)
            if not totp.verify(code):
                return Response(
                    {"error": "Invalid verification code"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # If verification is successful, generate tokens and log in the user
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            user.status = "online"
            user.save()

            response = Response()

            cookie_settings = {
                "httponly": False,
                "secure": False,
                "samesite": "Lax",  #'None' if using HTTPS
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


class EnableTwoFactorView(APIView):
    def post(self, request):
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = request.user
            
            # Check if 2FA is already enabled
            if user.is_2fa_enabled:
                return Response(
                    {"error": "2FA is already enabled for this account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate a new secret key for the user
            secret = pyotp.random_base32()
            user.tfa_secret = secret
            user.save()
            
            # Generate a QR code URL
            totp = pyotp.TOTP(secret)
            provisioning_uri = totp.provisioning_uri(user.email, issuer_name="PongArcadia")
            
            # Generate QR code image
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert image to base64
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return Response({
                "message": "2FA setup initiated",
                "secret": secret,
                "qr_code": f"data:image/png;base64,{qr_code_base64}"
            }, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)


class DisableTwoFactorView(APIView):
    def post(self, request):
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user = request.user
            
            # Check if 2FA is enabled
            if not user.is_2fa_enabled:
                return Response(
                    {"error": "2FA is not enabled for this account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Disable 2FA
            user.is_2fa_enabled = False
            user.tfa_secret = None
            user.save()
            
            return Response({
                "message": "2FA has been successfully disabled"
            }, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)


class fortytwo_view(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            ft_auth_url = "https://api.intra.42.fr/oauth/authorize"
            params = {
                "client_id": os.getenv("CLIENT_ID_42"),
                "response_type": "code",
                "redirect_uri": os.getenv("CALLBACK_URL_42")
            }
            return Response({"url": f"{ft_auth_url}?{urlencode(params)}"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class Login42API(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        try:
            code = request.GET.get("code")
            if code is None:
                return redirect(f"{os.getenv('FRONTEND_URL')}?error=no_code")

            data = {
                "grant_type": "authorization_code",
                "client_id": os.getenv("CLIENT_ID_42"),
                "client_secret": os.getenv("CLIENT_SECRET_42"),
                "redirect_uri": os.getenv("CALLBACK_URL_42"),
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
            username = user_data.get("login")
            avatar = user_data.get("image").get("versions").get("medium")
            first_name = user_data.get("first_name")
            last_name = user_data.get("last_name")
            if not user_email or not username:
                error_query = urlencode({'error': 'no_email'})
                return redirect(f"{os.getenv('FRONTEND_URL')}/auth/?{error_query}")

            user = User.objects.filter(email=user_email).first()
            if user is None:
                user = User.objects.create_user(
                    email=user_email, username=username, avatar=avatar,
                    first_name=first_name or '',
                    last_name=last_name or ''
                )

            response = Response()

            # Check if 2FA is enabled for this user
            if user.is_2fa_enabled:
                # Return a JSON response indicating 2FA is required
                response = redirect(f"{os.getenv('FRONTEND_URL')}/auth/?error=2fa_required&userId={user.id}")
                return response

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            user.status = "online"
            user.save()

            url = os.getenv('FRONTEND_URL') + '/profile/me'
            response = redirect(url)
            cookie_settings = {
                "httponly": False,
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
            print('error', e)
            error_query = urlencode({'error': str(e)})
            return redirect(f"{os.getenv('FRONTEND_URL')}?{error_query}")
        

class LogoutView(APIView):
    def post(self, request):
        try:
            # update user status to offline
            if request.user and request.user.is_authenticated:
                user = request.user
                user.status = "offline"
                user.save()

            # Get refresh token from cookie
            refresh_token = request.COOKIES.get("refreshToken")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # Create response and clear cookies
            response = Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie("accessToken")
            response.delete_cookie("refreshToken")

            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refreshToken')
            if not refresh_token:
                return Response({"error": "No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)

            response = Response()
            cookie_settings = {
                "httponly": False,
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
            response.data = {
                'data': 'Token refreshed successfully',
                'accessToken': str(access_token)
            }

            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(APIView):
    def get(self, request):
        return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)
