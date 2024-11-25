from rest_framework.views import APIView
from .serializers import UserSerializer
# from django.contrib.auth.models import User
from .models import User
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
import datetime
import jwt


# Create your views here.


class signup_view(APIView):
    def post(self, request):
        data = request.data

        print('DATA: ', data)

        userserializer = UserSerializer(data=data)
        # print('SERIALIZER: ', userSerializer)
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
                'exp': datetime.datetime.Utcnow() + datetime.timedelta(minutes=60),
                'iat': datetime.datetime.Utcnow()
            }
            
            token = jwt.encode(payload, 'secret', algorithm='HS256').decode('utf-8')
            
            response = Response()
            
            response.set_cookie(key='jwt', value=token, httponly=True)
            response.data = {
                'jwt': token
            }
            
        return Response
    

class user_view(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')
        
        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, 'secret', algorithm=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload[id]).first()
        serializer = UserSerializer(user)
        
        return Response(serializer.data)
