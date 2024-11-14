from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from rest_framework import status


class UserManager(BaseUserManager):
    def create_user(self, **extra_fields):
        print("EXTRA: ", extra_fields)
        if not extra_fields.get('username'):
            return HttpResponse('username not set')
        if not extra_fields.get('email'):
            return HttpResponse('email not set')
        if not extra_fields.get('password'):
            return HttpResponse('password not set')
        username = extra_fields.get('username')
        email = extra_fields.get('email')
        password = extra_fields.get('password')

        try:
            User.objects.get(email=email)
            return HttpResponse("email already in use", status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError:
            try:
                User.objects.get(username=username)
                raise ValueError("username already in use")
            except ValidationError:
                email = self.normalize_email(email)
                user = self.model(email=email, username=username, **extra_fields)
                user.set_password(password)
                user.save()
                return user


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
