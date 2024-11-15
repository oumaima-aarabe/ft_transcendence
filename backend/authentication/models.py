from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.http import HttpResponse
from rest_framework import status


class UserManager(BaseUserManager):
    def create_user(self, email, username, password):
        print('check1')
        if not username:
            return HttpResponse('username not set', status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return HttpResponse('email not set', status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return HttpResponse('password not set', status=status.HTTP_400_BAD_REQUEST)
        print('check2')

        try:
            print('qbl: ', self)
            self.model.objects.get(email=email)
            print('ba3d')
            return HttpResponse("email already in use", status=status.HTTP_401_UNAUTHORIZED)
        except self.model.DoesNotExist:
            try:
                self.model.objects.get(username=username)
                return HttpResponse("username already in use", status=status.HTTP_401_UNAUTHORIZED)
            except self.model.DoesNotExist:
                email = self.normalize_email(email)
                user = self.model(email=email, username=username, **extra_fields)
                user.set_password(password)
                user.save()
                return HttpResponse("created successfully", status=status.HTTP_201_CREATED)


class User(AbstractBaseUser):

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    password = models.CharField()
    # avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    # tfa = models.JSONField(_("TFA"), encoder=, decoder=)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'username']

    objects = UserManager()

    def __str__(self):
        return self.username
