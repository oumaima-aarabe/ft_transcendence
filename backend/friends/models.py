# Create your models here.
from django.db import models
from django.conf import settings


class Friend(models.Model):
    # Friend request states
    FRIEND_STATE_CHOICES = [
        ('none', 'None'),
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('blocked', 'Blocked'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_friends'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friend_of'
    )
    state = models.CharField(
        max_length=10,
        choices=FRIEND_STATE_CHOICES,
        default='none'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure that there can't be duplicate friendships
        unique_together = ['sender', 'recipient']
        # Order by creation date
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username} ({self.state})"
