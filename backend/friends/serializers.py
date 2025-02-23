from rest_framework import serializers
from .models import Friend
from authentication.serializers import UserSerializer


class FriendSerializer(serializers.ModelSerializer):
    friend_details = UserSerializer(source='recipient', read_only=True)

    class Meta:
        model = Friend
        fields = ['id', 'recipient', 'friend_details', 'state', 'created_at']
        read_only_fields = ['sender']
