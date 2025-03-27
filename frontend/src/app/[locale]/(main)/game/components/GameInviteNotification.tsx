"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { acceptGameInvite, declineGameInvite } from '@/api/game-invite-api';
import { Gamepad2, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameInviteNotificationProps {
  id: string;
  senderUsername: string;
  senderAvatar?: string;
  invitationCode: string;
  onAction?: (action: 'accept' | 'decline') => void;
}

const GameInviteNotification: React.FC<GameInviteNotificationProps> = ({
  id,
  senderUsername,
  senderAvatar = "https://iili.io/2D8ByIj.png",
  invitationCode,
  onAction,
}) => {
  const [isLoading, setIsLoading] = useState<'accept' | 'decline' | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (isDismissed) {
    return null; // Don't render if dismissed
  }

  const handleAccept = async () => {
    try {
      setIsLoading('accept');
      const response = await acceptGameInvite(invitationCode);
      
      if (response && response.game_id) {
        toast({
          title: "Invitation accepted!",
          description: "Joining game...",
          variant: "default",
        });

        // Notify parent component
        if (onAction) onAction('accept');
        
        // Mark as dismissed
        setIsDismissed(true);
        
        // Navigate to the game with gameId parameter
        // The locale part will be handled by the routing system
        router.push(`/game/remote?gameId=${response.game_id}`);
      } else {
        toast({
          title: "Error accepting invitation",
          description: "Could not join the game",
          variant: "destructive",
        });
        setIsLoading(null);
        // Mark as dismissed to remove the notification
        setIsDismissed(true);
      }
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error?.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
      setIsLoading(null);
      // Mark as dismissed to remove the notification even if there's an error
      setIsDismissed(true);
    }
  };

  const handleDecline = async () => {
    try {
      setIsLoading('decline');
      await declineGameInvite(invitationCode);
      
      toast({
        title: "Invitation declined",
        variant: "default",
      });
      
      // Notify parent component
      if (onAction) onAction('decline');
      
      // Mark as dismissed
      setIsDismissed(true);
    } catch (error: any) {
      toast({
        title: "Error declining invitation",
        description: error?.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
      setIsLoading(null);
      // Mark as dismissed to remove the notification even if there's an error
      setIsDismissed(true);
    }
  };

  return (
    <Card className="p-4 bg-black bg-opacity-80 border border-gray-800 shadow-lg rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <div className="bg-[#D05F3B] p-2 rounded-full">
          <Gamepad2 className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-medium">Game Invitation</h4>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">{senderUsername}</span> invited you to play Pong
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAccept}
            disabled={isLoading !== null}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 h-8 rounded-lg text-white"
          >
            {isLoading === 'accept' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            onClick={handleDecline}
            disabled={isLoading !== null}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 h-8 rounded-lg text-white"
          >
            {isLoading === 'decline' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameInviteNotification;