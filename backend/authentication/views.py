from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer

# Create your views here.


class signup_view(APIView):
    def get(self, request):
        data = request.data

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

        return render(request, 'home.html')
