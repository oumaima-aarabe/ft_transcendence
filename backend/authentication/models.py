from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError


class UserManager(BaseUserManager):
    def create_user(self, username, password, email, **extra_fields):
        if not username:
            raise ValueError('username not set')
        if not email:
            raise ValueError('email not set')
        if not password:
            raise ValueError('password not set')

        try:
            User.objects.get(email=email)
            raise ValueError("email already in use")
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
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    # tfa = models.JSONField(_("TFA"), encoder=, decoder=)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'username']

    objects = UserManager()

    def __str__(self):
        return self.username

# Create your models here.

# class User(models.Model):
#     username = models.CharField(max_length=10, unique=True)
#     email = models.EmailField(unique=True)
#     password = models.CharField(max_length=128) 
#     state = models.CharField(max_length=100)
#     avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
#     level = models.IntegerField(default=1)
#     two_factor_enabled = models.BooleanField(default=False)

#     def __str__(self):
#         return self.username
    

