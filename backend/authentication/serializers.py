from rest_framework import serializers
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'first_name', 'last_name', 'avatar', 'cover', 'status', 'last_activity', 'experience', 'level')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if len(value) < 4:
            raise serializers.ValidationError("Username must be at least 4 characters long")
        if len(value) > 10:
            raise serializers.ValidationError("Username cannot be longer than 10 characters")
        if '_' not in value:
            raise serializers.ValidationError("Username must contain an underscore (_)")
        return value

    def validate_email(self, value):
        if value.lower().endswith('@1337.ma'):
            raise serializers.ValidationError("Email address cannot have 1337.ma extension")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        if password is not None:
            user.set_password(password)
        user.save()
        return user
