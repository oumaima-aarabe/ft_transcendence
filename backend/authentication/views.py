from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer
from django.http import HttpResponse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.response import Response

# Create your views here.


class sign_up(APIView):
    def post(self, request):
        data = request.data
        userserializer = UserSerializer(data=data)
        userserializer.is_valid(raise_exception=True)
        userserializer.save()
        return Response(userserializer.data)

class signup_view(APIView):
    def post(self, request):
        data = request.data

        print('DATA: ', data)

        userSerializer = UserSerializer(data=data)
        # print('SERIALIZER: ', userSerializer)
        userSerializer.create(data) 
        if userSerializer.is_valid():
            # userSerializer.create(data)
            print('is valid')
            # userSerializer.save()
        else:
            return HttpResponse('ERROR', status=status.HTTP_400_BAD_REQUEST)

        return render(request, 'home.html')
