from django.shortcuts import render
from django.http import HttpResponse 
from django.views import View
from django.contrib.auth.models import User

# Create your views here.

# def signUp()
# class MyView(View):
#     def get(self, request):
#         return HttpResponse("get request")

#     def post(self, request):
#         return HttpResponse("post request")

class signup_view(request):
    if request.method == 'GET':
        username = request.POST.get('username')
        email =request.POST.get('email')
        password =request.POST.get('password')

    # create a new user

    User.objects.create(
        username=username,
        email=email,
        password=make_password(password)
    )

    return redirect('signin')
    

    # if request.method == 'POST':
    #     return HttpResponse("this is a post request")
    # else
        # return HttpResponse("request not exist")

    

    
    
