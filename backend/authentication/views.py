from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
import datetime
import jwt , os
from django.shortcuts import redirect
from django.utils.http import urlencode


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
            "client_id": "u-s4t2ud-485157a1dedad716eefa2e43f388a9ff41988e266ce0a1db66e46b157c9508c7",
            "response_type": "code",
            "redirect_url": "http://localhost:8000/api/auth/42"
        }
        return redirect(f"{ft_auth_url}?{urlencode(params)}")
    #f format string 
    #secret:"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"


class logout_view(APIView):
    def post(self, request):
        response = Response()
        response.delete.cookie('jwt')
        response.data = {
            'massage': 'success'
        }
        return response
