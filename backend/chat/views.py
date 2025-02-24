from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from authentication.models import User
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    participant_id = request.data.get('participant_id')
    
    if not participant_id:
        return Response(
            {"error": "Participant ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get the participant
        participant = User.objects.get(id=participant_id)
        
        # Don't allow conversation with self
        if participant.id == request.user.id:
            return Response(
                {"error": "Cannot create conversation with yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if conversation already exists
        existing_conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=participant
        ).first()
        
        if existing_conversation:
            return Response({"id": existing_conversation.id})
        
        # Create new conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, participant)
        
        # Notify the other participant via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{participant.username}",
            {
                "type": "update_conversations",
            }
        )
        
        return Response({
            "id": conversation.id,
            "other_participant": {
                "id": participant.id,
                "username": participant.username,
                "first_name": participant.first_name,
                "last_name": participant.last_name,
                "avatar": participant.avatar,
                "status": participant.status,
            }
        })
        
    except User.DoesNotExist:
        return Response(
            {"error": "Participant not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    conversations = Conversation.objects.filter(
        participants=request.user
    ).prefetch_related('participants')
    
    conversation_data = []
    for conv in conversations:
        # Get the other participant
        other_participant = conv.participants.exclude(id=request.user.id).first()
        
        if other_participant:
            conversation_data.append({
                'id': conv.id,
                'other_participant': {
                    'id': other_participant.id,
                    'username': other_participant.username,
                    'first_name': other_participant.first_name,
                    'last_name': other_participant.last_name,
                    'avatar': other_participant.avatar,
                    'status': other_participant.status,
                },
                'latest_message_text': conv.latest_message_text,
                'latest_message_created_at': conv.latest_message_created_at or conv.created_at,
                'unseen_messages': conv.messages.filter(
                    sender=other_participant,
                    seen=False
                ).count(),
            })
    
    return Response(conversation_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request):
    conversation_id = request.GET.get('conversation_id')
    if not conversation_id:
        return Response(
            {"error": "conversation_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Check if user has access to this conversation
        conversation = Conversation.objects.filter(
            participants=request.user
        ).get(id=conversation_id)
        
        messages = conversation.messages.all().select_related('sender')
        messages_data = [{
            'id': msg.id,
            'message': msg.message,
            'created_at': msg.created_at,
            'sender': {
                'id': msg.sender.id,
                'username': msg.sender.username,
                'first_name': msg.sender.first_name,
                'last_name': msg.sender.last_name,
                'avatar': msg.sender.avatar,
            },
            'seen': msg.seen,
            'conversation': {'id': conversation.id},
        } for msg in messages]
        
        # Mark messages as seen if user is the recipient
        Message.objects.filter(
            conversation=conversation,
            sender__in=conversation.participants.exclude(id=request.user.id),
            seen=False
        ).update(seen=True)
        
        return Response({'messages': messages_data})
        
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('query', '').strip()
    if not query:
        return Response([])
        
    # Search for users by username, first_name, or last_name
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).exclude(
        id=request.user.id  # Exclude the current user
    # ).exclude(
    #     blocked_by=request.user  # Exclude users who blocked the current user
    # ).exclude(
    #     blocked_users=request.user  # Exclude users blocked by the current user
    )[:10]  # Limit to 10 results
    
    users_data = [{
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'avatar': user.avatar,
        'status': user.status,
    } for user in users]
    
    return Response(users_data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ConversationList(request):
    try:
        conversations = Conversation.objects.filter(
            participants=request.user
        ).prefetch_related('participants')
        
        serializer = ConversationSerializer(
            conversations, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def DeleteConversation(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
        participant = conversation.participants.exclude(id=request.user.id).first()

        # Notify other participant via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{participant.username}",
            {"type": "update_conversations"}
        )

        conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def MessageList(request):
    try:
        conversation_id = request.GET.get("conversation_id")
        if not conversation_id:
            return Response(
                {"error": "Conversation ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check conversation access
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants=request.user
        ).first()
        
        if not conversation:
            return Response(
                {"error": "Conversation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get messages with pagination
        offset = max(0, int(request.GET.get("offset", 0)))
        limit = 15
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).select_related("sender").order_by("-created_at")[offset:offset + limit]

        # Mark messages as seen
        Message.objects.filter(
            conversation_id=conversation_id,
            seen=False
        ).exclude(sender=request.user).update(seen=True)

        serializer = MessageSerializer(messages, many=True)
        return Response({
            "messages": serializer.data,
            "next_offset": offset + len(messages)
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response(
            {"error": "Invalid offset value"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
