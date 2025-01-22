from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.shortcuts import redirect, HttpResponse
from django.utils.http import urlencode
from django.contrib.auth import authenticate, login
import datetime
import jwt
import os
import requests


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
        email = request.data['email']
        password = request.data['password']
        
        user = User.objects.filter(email=email).first()

        if user is None:
            raise AuthenticationFailed('User not found')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password')
        
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, 'secret', algorithm='HS256')
        
        response = Response()
        
        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'jwt': token
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

            user_email = user_data["email"]

            # create user with email
            user = User.objects.filter(email=user_email).first()
            if user is None:
                user = User.objects.create_user(
                    email=user_email, username=user_email
                )

            authenticated_user = authenticate(request, username=user_email)
            if authenticated_user is not None:
                login(request, authenticated_user)

                # create token
                payload = {
                    'id': authenticated_user.id,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
                    'iat': datetime.datetime.utcnow()
                }

                token = jwt.encode(payload, 'secret', algorithm='HS256')
        
                response = redirect(os.getenv("dashboard_url"))
        
                response.set_cookie(key='jwt', value=token, httponly=True)
                response.data = {
                    'jwt': token
                }
                return response
            else:
                return HttpResponse(
                    "Error authenticating user",
                    status=status.HTTP_401_UNAUTHORIZED
                )


class logout_view(APIView):
    def post(self, request):
        response = Response()
        response.delete.cookie('jwt')
        response.data = {
            'massage': 'success'
        }
        return response
