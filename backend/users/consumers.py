import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from authentication.models import User

class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # set user status to online
        await database_sync_to_async(User.objects.filter(id=self.scope.get('user_id')).update)(status='online')

        self.notification_group_name = None
        user_id = self.scope.get('user_id')
        
        if not user_id:
            await self.close()
            return
            
        try:
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except Exception as e:
            await self.close()
            return

        self.notification_group_name = f"notifications_{self.user.username}"
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave notification group
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
        await database_sync_to_async(User.objects.filter(id=self.user.id).update)(status='offline')
    
    async def receive(self, text_data):
        # We don't expect to receive messages from the client
        pass
    
    async def notification(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))