from django.db import models

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128) 
    state = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    level = models.IntegerField(default=1)
    two_factor_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.username
