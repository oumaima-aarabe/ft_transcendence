from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

# Create your views here.

# def signUp()
# class MyView(View):
#     def get(self, request):
#         return HttpResponse("get request")

#     def post(self, request):
#         return HttpResponse("post request")


class signup_view(APIView):
    def get(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # create a new user

        User.objects.create(
            username=username,
            email=email,
            password=make_password(password)
        )
        
        return render(request, 'home.html')

        # return Response("user created successfully")
    
    # redirect('signin')
    # if request.method == 'POST':
    #     return HttpResponse("this is a post request")
    # else
        # return HttpResponse("request not exist")

    

    
    
