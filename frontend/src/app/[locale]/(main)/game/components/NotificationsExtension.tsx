"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationsContext } from '@/providers/NotificationsProvider';
import GameInviteNotification from './GameInviteNotification';
import { acceptGameInvite, declineGameInvite } from '@/api/game-invite-api';
import { useToast } from '@/hooks/use-toast';

const NotificationsExtension: React.FC = () => {
  const { 
    notifications, 
    markAsRead, 
    clearNotification 
  } = useNotificationsContext();
  const router = useRouter();
  const { toast } = useToast();
  const [handledNotifications, setHandledNotifications] = useState<Set<string>>(new Set());

  // Find game invites
  const gameInvites = notifications.filter(
    notification => notification.type === 'game_invite' && 
                   !notification.read && 
                   !handledNotifications.has(notification.id)
  );

  // Handle invite actions
  const handleInviteAction = async (
    notificationId: string,
    invitationCode: string,
    action: 'accept' | 'decline'
  ) => {
    try {
      // Mark this notification as handled immediately to prevent duplicates
      setHandledNotifications(prev => new Set(prev).add(notificationId));
      
      // Mark the notification as read
      markAsRead(notificationId);
      
      // Attempt to clear it as well
      clearNotification(notificationId);
      
      // Don't wait for API response since we've already handled the UI part
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  // Create modal container for game invites if we have any
  if (gameInvites.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-w-md">
      {gameInvites.map(invite => {
        // Extract data from the invite
        const invitationCode = invite.data?.invitation_code;
        const senderUsername = invite.data?.sender_username || 'A player';
        const senderAvatar = invite.data?.sender_avatar;

        if (!invitationCode) return null;

        return (
          <GameInviteNotification
            key={invite.id}
            id={invite.id}
            senderUsername={senderUsername}
            senderAvatar={senderAvatar}
            invitationCode={invitationCode}
            onAction={(action) => {
              handleInviteAction(invite.id, invitationCode, action);
            }}
          />
        );
      })}
    </div>
  );
};

export default NotificationsExtension;