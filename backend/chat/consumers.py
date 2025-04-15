from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from authentication.models import User
from .models import Message
from asgiref.sync import sync_to_async
from django.utils import timezone
from .models import Conversation, Message
from django.db.models import Q
from friends.models import Friend


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):        
        self.room_group_name = None
        user_id = self.scope.get('user_id')
        
        if not user_id:
            await self.close()
            return
            
        try:
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except Exception as e:
            await self.close()
            return

        self.room_group_name = f"chat_{self.user.username}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.get_conversations()

        await self.accept()

    async def disconnect(self, close_code):
        if not self.room_group_name:
            return
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        self.conversations = None

    @sync_to_async
    def get_conversations(self):
        blocked_users = Friend.objects.filter(
            sender=self.user,
            state='blocked'
        ).values_list('recipient', flat=True)
        
        blocked_by = Friend.objects.filter(
            recipient=self.user,
            state='blocked'
        ).values_list('sender', flat=True)
        
        conversations = Conversation.objects.filter(participants=self.user)\
            .exclude(participants__in=blocked_users)\
            .exclude(participants__in=blocked_by)\
            .prefetch_related('participants')
        
        self.conversations = list(conversations)

    @sync_to_async
    def create_message(self, conversation, message_text):
        message_obj = Message.objects.create(conversation=conversation, sender=self.user, message=message_text)
        return message_obj

    @sync_to_async
    def update_latest_message(self, conversation, message_obj, message_text):
        conversation.latest_message_text = message_text
        conversation.latest_message_created_at = message_obj.created_at
        conversation.save()

    @sync_to_async
    def mark_messages_as_seen(self, conversation_id):
        Message.objects.filter(
            conversation_id=conversation_id,
            seen=False
        ).exclude(sender=self.user).update(seen=True)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data.get("event")

        if event == "create_conversation" or event == "update_conversations":
            await self.get_conversations()
            if event == "create_conversation":
                receiver = data.get("data").get("receiver")
                # Check if either user has blocked the other
                is_blocked = await database_sync_to_async(Friend.objects.filter)(
                    Q(sender=self.user, recipient__username=receiver, state='blocked') |
                    Q(sender__username=receiver, recipient=self.user, state='blocked')
                ).exists()
                
                if is_blocked:
                    return
                
                receiver_user = await database_sync_to_async(User.objects.get)(username=receiver)
                conversation = await database_sync_to_async(Conversation.objects.create)()
                await database_sync_to_async(conversation.participants.add)(self.user, receiver_user)
                await self.channel_layer.group_send(
                    f"chat_{receiver}",
                    {
                        "type": "update_conversations",
                    },
                )
        elif event == "mark_seen":
            conversation_id = data.get("data").get("conversation_id")
            if conversation_id:
                await self.mark_messages_as_seen(conversation_id)
                # Notify other participant about seen status
                conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
                participants = await database_sync_to_async(list)(conversation.participants.all())
                for participant in participants:
                    if participant != self.user:
                        await self.channel_layer.group_send(
                            f"chat_{participant.username}",
                            {
                                "type": "update_conversations",
                            },
                        )
        elif event == "remove_conversation":
            conversation_id = data.get("data").get("conversation_id")
            if conversation_id:
                conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
                if self.user in await database_sync_to_async(list)(conversation.participants.all()):
                    await database_sync_to_async(conversation.delete)()
                    # Notify other participants
                    participants = await database_sync_to_async(list)(conversation.participants.all())
                    for participant in participants:
                        if participant != self.user:
                            await self.channel_layer.group_send(
                                f"chat_{participant.username}",
                                {
                                    "type": "update_conversations",
                                },
                            )
        else:
            message_text = data.get("data").get("message")
            receiver = data.get("data").get("receiver")
            conversation_id = data.get("data").get("conversation_id")

            if message_text and len(message_text) > 500:
                message_text = message_text[:500]

            if message_text and conversation_id:
                conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
                participants = await database_sync_to_async(list)(conversation.participants.all())
                
                if self.user in participants:
                    message_obj = await self.create_message(conversation, message_text)
                    await self.update_latest_message(conversation, message_obj, message_text)

                    for participant in participants:
                        if participant != self.user:
                            await self.channel_layer.group_send(
                                f"chat_{participant.username}",
                                {
                                    "type": "chat_message",
                                    "message": message_text,
                                    "sender": self.user.username,
                                    "conversation": {
                                        "conversation_id": conversation.id,
                                        "participant": {
                                            "username": self.user.username,
                                            "first_name": self.user.first_name,
                                            "last_name": self.user.last_name,
                                            "avatar": self.user.avatar,
                                            "status": self.user.status
                                        },
                                        "latest_message": {
                                            "message": message_text,
                                            "created_at": timezone.now().isoformat(),
                                        },
                                    },
                                },
                            )

    async def chat_message(self, event):
        message = event["message"]
        sender = event.get("sender")
        conversation = event.get("conversation")

        await self.send(
            text_data=json.dumps(
                {
                    "event": "chat_message",
                    "message": message,
                    "sender": sender,
                    "conversation": conversation,
                }
            )
        )

    async def update_conversations(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "event": "update_conversations",
                }
            )
        )
        
    async def block_status_update(self, event):
        """
        Handle block status update notifications.
        This is called when a user blocks or unblocks the current user.
        """
        await self.send(
            text_data=json.dumps({
                "event": event["event"],
                "status": event["status"],
                "blocker": event["blocker"]
            })
        )