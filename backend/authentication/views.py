from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer
from django.http import HttpResponse
from rest_framework import status
# from django.contrib.auth.models import User
# from rest_framework.response import Response

# Create your views here.


class signup_view(APIView):
    def post(self, request):
        data = request.data

        print('DATA: ', data)

        serializer = UserSerializer(data=data)
        print('SERIALIZER: ', serializer)
        serializer.create(data)
        if serializer.is_valid():
            print('is valid')
            serializer.save()
        else:
            print('yekh')
            return HttpResponse('ERROR', status=status.HTTP_400_BAD_REQUEST)

        return render(request, 'home.html')
