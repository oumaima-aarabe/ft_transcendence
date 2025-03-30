import { useState, useEffect, useCallback, useRef } from 'react';
import { sendRequest } from '@/lib/axios';
import endpoints from '@/constants/endpoints';
import { Notification } from '@/types/notification';

// Global socket instance that persists across component remounts
let globalSocket: WebSocket | null = null;
let isSocketInitialized = false;

// Map backend notification to frontend notification format
const mapNotification = (notification: any): Notification => ({
  id: notification.id.toString(),
  type: notification.notification_type,
  title: notification.title || 'Notification',
  message: notification.message,
  data: notification.data,
  read: notification.is_read,
  timestamp: notification.created_at,
});

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(globalSocket);
  const [connected, setConnected] = useState(globalSocket !== null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  // Fetch notifications from the backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sendRequest('get', endpoints.notifications);
      const backendNotifications = response.data;
      
      // Map backend notifications to frontend format
      const mappedNotifications = backendNotifications.map(mapNotification);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket connection and fetch existing notifications
  useEffect(() => {
    // Fetch existing notifications
    fetchNotifications();

    // Only create a new socket if one doesn't already exist
    if (!isSocketInitialized) {
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
        // Reset the global socket when it's actually closed
        if (globalSocket === ws) {
          globalSocket = null;
          isSocketInitialized = false;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            const notification = data.notification;
            
            // Add unique ID and timestamp to notification if not provided
            const newNotification: Notification = {
              id: notification.id?.toString() || Date.now().toString(),
              type: notification.type || notification.notification_type,
              title: notification.title || 'Notification',
              message: notification.message,
              data: notification.data,
              read: false,
              timestamp: notification.created_at || new Date().toISOString(),
            };
            
            setNotifications((prev) => [newNotification, ...prev]);
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };
      
      // Store the socket reference both locally and globally
      socketRef.current = ws;
      globalSocket = ws;
      setSocket(ws);
      isSocketInitialized = true;
    } else {
      // Use the existing global socket
      socketRef.current = globalSocket;
      setSocket(globalSocket);
      if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
        setConnected(true);
      }
    }
    
    // Clean up on unmount
    return () => {
      // Only close the socket if the component using it is actually being unmounted
      // and not just due to a language change
      if (socketRef.current && !isSocketInitialized) {
        console.log("Closing to clean up notifications consumer");
        socketRef.current.close();
        globalSocket = null;
      }
    };
  }, [fetchNotifications]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await sendRequest('post', `${endpoints.markNotificationRead}${id}/`);
      
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await sendRequest('post', endpoints.markAllNotificationsRead);
      
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);
  
  // Clear a notification
  const clearNotification = useCallback(async (id: string) => {
    try {
      await sendRequest('delete', `${endpoints.deleteNotification}${id}/`);
      
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  // Get game invites
  const gameInvites = notifications.filter(
    (n) => n.type === 'game_invite' && !n.read
  );
  
  return {
    notifications,
    unreadCount,
    connected,
    loading,
    socket,
    gameInvites,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications: fetchNotifications,
  };
};