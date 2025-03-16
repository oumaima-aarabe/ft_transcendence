import { useState, useEffect, useCallback } from 'react';

export type Notification = {
  id: string;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: string;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log("Initializing notifications consumer");
    // Create WebSocket connection
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/notifications/`);
    
    // Set up event listeners
    ws.onopen = () => {
      setConnected(true);
      console.log("Connected to notifications consumer");
    };
    
    ws.onclose = () => {
      setConnected(false);
      console.log("Disconnected from notifications consumer");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          const notification = data.notification;
          
          // Add unique ID and timestamp to notification
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: notification.type,
            message: notification.message,
            data: notification.data,
            read: false,
            timestamp: new Date().toISOString(),
          };
          
          setNotifications((prev) => [newNotification, ...prev]);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      console.log("Closing to clean up notifications consumer");
      ws.close();
    };
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);
  
  // Clear a notification
  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
}; 