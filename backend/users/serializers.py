from rest_framework import serializers
from authentication.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name',
            'last_name', 'avatar', 'status', 'last_activity',
            'experience', 'is_anonymized', 'cover'
        ]
        read_only_fields = [
            'id', 'status', 'last_activity',
            'experience', 'is_anonymized'
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
