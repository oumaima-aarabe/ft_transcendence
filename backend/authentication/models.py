from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('invisible', 'Invisible'),
        ('donotdisturb', 'Do Not Disturb'),
        ('offline', 'Offline')
    ]

    email = models.EmailField(unique=True, max_length=200)
    username = models.CharField(max_length=30, unique=True)
    password = models.CharField(max_length=200)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    status = models.CharField(choices=STATUS_CHOICES, default=STATUS_CHOICES[3][0])
    last_activity = models.DateTimeField(auto_now=True)
    experience = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    avatar = models.URLField(default="https://iili.io/2D8ByIj.png", null=True, blank=True)
    cover = models.URLField(default="https://iili.io/2bE295P.png", null=True, blank=True)
    is_anonymized = models.BooleanField(default=False)
    # tfa = models.JSONField(_("TFA"), encoder=, decoder=)
    
    # 2FA fields
    is_2fa_enabled = models.BooleanField(default=False)
    tfa_secret = models.CharField(max_length=255, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        self.first_name = self.first_name.title()
        self.last_name = self.last_name.title()
        super().save(*args, **kwargs)

