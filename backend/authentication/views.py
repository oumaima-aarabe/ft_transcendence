from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer
from django.http import HttpResponse
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.response import Response

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
    
