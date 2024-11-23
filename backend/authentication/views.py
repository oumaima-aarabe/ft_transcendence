from rest_framework.views import APIView
from .serializers import UserSerializer
from django.contrib.auth.models import User
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
            return response
            
        
        return Response({
            'message': 'success'})
