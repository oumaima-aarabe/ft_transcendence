from rest_framework import serializers
from authentication.models import User
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name',
            'last_name', 'avatar', 'status', 'last_activity',
            'experience', 'is_anonymized', 'cover', 'is_2fa_enabled'
        ]
        read_only_fields = [
            'id', 'status', 'last_activity',
            'experience', 'is_anonymized', 'is_2fa_enabled'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar', 'status', 'username', 'cover']
        read_only_fields = ['id', 'email']

    def validate_username(self, value):
        if "_" not in value:
            raise serializers.ValidationError("Username must contain an underscore.")
        return value

class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'sender_username', 'notification_type', 
                  'title', 'message', 'data', 'is_read', 'created_at']
        read_only_fields = ['created_at']
    
    def get_sender_username(self, obj):
        if obj.sender:
            return obj.sender.username
        return None
