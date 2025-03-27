"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useNotificationsContext } from '@/providers/NotificationsProvider';

const AutoRedirectHandler: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { notifications, markAsRead, clearNotification } = useNotificationsContext();

  useEffect(() => {
    // Check for auto-redirect notifications
    const redirectNotification = notifications.find(
      notification => notification.type === 'game_redirect' && !notification.read
    );

    if (redirectNotification) {
      console.log('Found redirect notification:', redirectNotification);
      
      // Mark as read immediately to prevent duplicate redirects
      markAsRead(redirectNotification.id);
      clearNotification(redirectNotification.id);

      const { redirect_url, game_id } = redirectNotification.data || {};

      if (redirect_url) {
        // Show toast notification
        toast({
          title: "Game Starting",
          description: "Your game is ready to play. Redirecting now...",
          variant: "default",
        });

        // Redirect to the game page
        console.log(`Auto-redirecting to game: ${game_id} via ${redirect_url}`);
        setTimeout(() => {
          router.push(redirect_url);
        }, 500);
      }
    }
  }, [notifications, markAsRead, clearNotification, router, toast]);

  // This component doesn't render anything visible
  return null;
};

export default AutoRedirectHandler;