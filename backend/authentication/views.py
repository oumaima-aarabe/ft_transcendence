from rest_framework.views import APIView
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed 

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
        
        return Response({
            'message': 'success'})
