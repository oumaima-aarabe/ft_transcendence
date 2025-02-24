from django.db import models
from authentication.models import User
from django.utils import timezone

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(default=timezone.now)
    latest_message_text = models.TextField(blank=True, null=True)
    latest_message_created_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ['-latest_message_created_at', '-created_at']

    def __str__(self):
        participant_names = ", ".join([user.username for user in self.participants.all()])
        return f"Conversation between {participant_names}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        related_name='messages',
        on_delete=models.CASCADE,
        db_index=True
    )
    sender = models.ForeignKey(
        User,
        related_name='sent_messages',
        on_delete=models.CASCADE,
        db_index=True
    )
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    seen = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update conversation's latest message
        self.conversation.latest_message_text = self.message
        self.conversation.latest_message_created_at = self.created_at
        self.conversation.save(update_fields=['latest_message_text', 'latest_message_created_at'])

    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at}"