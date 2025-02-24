from rest_framework import serializers
from .models import Conversation, Message
from users.serializers import UserSerializer
from authentication.models import User
from django.db import models

class ConversationSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True
    )
    other_participant = serializers.SerializerMethodField()
    unseen_messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 
            'participant_ids',
            'other_participant',
            'latest_message_text',
            'latest_message_created_at',
            'unseen_messages'
        ]
        read_only_fields = ['latest_message_text', 'latest_message_created_at']
    
    def get_unseen_messages(self, obj):
        user = self.context['request'].user
        return Message.objects.filter(
            conversation=obj,
            seen=False
        ).exclude(sender=user).count()
    
    def get_other_participant(self, obj):
        user = self.context['request'].user
        other = obj.get_other_participant(user)
        return UserSerializer(other).data if other else None

    def validate_participant_ids(self, value):
        if len(value) != 2:
            raise serializers.ValidationError("Exactly 2 participants are required")
        user = self.context['request'].user
        if user.id not in value:
            raise serializers.ValidationError("Current user must be one of the participants")
        return value

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids')
        
        # Check if a conversation with exactly these participants already exists
        existing_conversation = Conversation.objects.annotate(num_participants=models.Count('participants')).filter(
            num_participants=2,
            participants__in=participant_ids
        ).distinct()
        
        if existing_conversation.exists():
            return existing_conversation.first()
        
        # Create new conversation
        conversation = Conversation.objects.create()
        participants = User.objects.filter(id__in=participant_ids)
        if participants.count() != 2:
            conversation.delete()
            raise serializers.ValidationError("Both participants must exist")
            
        conversation.participants.set(participants)
        return conversation


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'message', 'created_at', 'seen']
        read_only_fields = ['created_at', 'seen']

    def validate_message(self, value):
        if len(value) > 500:
            value = value[:500]
        return value
