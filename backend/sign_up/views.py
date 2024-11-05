from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password


class signup_view(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # create a new user

        User.objects.create(
            username=username,
            email=email,
            password=make_password(password)
        )

        return Response("user created successfully")
