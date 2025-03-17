from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(username, notification_type, message, data=None):
    """
    Send a notification to a user via WebSocket
    
    Args:
        username (str): The username of the recipient
        notification_type (str): The type of notification (e.g., 'friend_request', 'block')
        message (str): The notification message
        data (dict, optional): Additional data to include in the notification
    """
    channel_layer = get_channel_layer()
    
    # Create notification payload
    notification = {
        'type': notification_type,
        'message': message,
    }
    
    # Add additional data if provided
    if data:
        notification['data'] = data
    
    # Send notification to user's notification group
    async_to_sync(channel_layer.group_send)(
        f"notifications_{username}",
        {
            'type': 'notification',
            'notification': notification
        }
    ) 


# example usage
# send_notification('imane_1', 'friend_request', 'You have a new friend request', {'friend_request_id': 123})