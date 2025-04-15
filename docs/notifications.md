# Notifications System Guide

## Frontend Usage

### Using the Notifications Context

The application provides a `useNotificationsContext` hook that gives components access to notification functionality. This is the primary way to interact with notifications in the frontend.

```tsx
const { 
  notifications,        // Array of all notifications
  loading,             // Boolean indicating if notifications are being loaded
  clearNotification,   // Function to delete a notification
  refreshNotifications // Function to manually refresh notifications
} = useNotificationsContext();
```

#### Available Properties and Methods

- **notifications**: An array of notification objects with the following structure:
  ```typescript
  type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;     // Optional additional data
    read: boolean;
    timestamp: string;
  }
  ```

- **loading**: A boolean that indicates whether notifications are currently being fetched from the backend.

- **clearNotification(id: string)**: Function to delete a specific notification by its ID. This removes it both from the local state and the backend database.

- **refreshNotifications()**: Function to manually fetch the latest notifications from the backend. Useful when you want to ensure the notification list is up-to-date.

#### Additional Context Properties

The context also provides these additional properties and methods not shown in the example:

- **unreadCount**: Number of unread notifications
- **connected**: Boolean indicating if the WebSocket connection is active
- **markAsRead(id: string)**: Mark a single notification as read
- **markAllAsRead()**: Mark all notifications as read
- **clearAllNotifications()**: Clear all notifications from the local state

### Implementation Example

```tsx
import { useNotificationsContext } from '@/providers/NotificationsProvider';

function NotificationsList() {
  const { notifications, loading, clearNotification, refreshNotifications } = useNotificationsContext();

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <button onClick={refreshNotifications}>Refresh</button>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li key={notification.id}>
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span>{new Date(notification.timestamp).toLocaleString()}</span>
              <button onClick={() => clearNotification(notification.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Backend Implementation

### Sending Notifications

The backend provides a utility function to send notifications to users:

```python
from users.utils import send_notification

# Example: Send a notification to a user
send_notification(
    username="recipient_username",
    notification_type="friend_request",
    message="User xyz sent you a friend request",
    data={"sender_id": 123}  # Optional additional data
)
```

The `send_notification` function:
1. Creates a notification payload
2. Uses Django Channels to send the notification to the user's WebSocket group
3. The notification is automatically saved to the database by the WebSocket consumer

### Example: Sending a Notification from a View

```python
from users.utils import send_notification

def accept_friend_request(request, request_id):
    # Process friend request acceptance
    # ...
    
    # Send notification to the requester
    send_notification(
        username=friend_request.sender.username,
        notification_type="friend_accepted",
        message=f"{request.user.username} accepted your friend request",
        data={"user_id": request.user.id}
    )
    
    return Response({"status": "accepted"})
```