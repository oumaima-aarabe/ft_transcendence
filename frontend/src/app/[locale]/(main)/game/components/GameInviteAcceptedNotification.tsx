"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gamepad2, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface GameInviteAcceptedNotificationProps {
  id: string;
  acceptedBy: string;
  gameId: string;
  joinUrl?: string;
  onAction?: (action: 'join' | 'dismiss') => void;
}

const GameInviteAcceptedNotification: React.FC<GameInviteAcceptedNotificationProps> = ({
  id,
  acceptedBy,
  gameId,
  joinUrl,
  onAction,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('notifications.gameInvite');

  if (isDismissed) {
    return null; // Don't render if dismissed
  }

  const handleJoinGame = () => {
    // Mark as dismissed
    setIsDismissed(true);
    
    // Notify parent component
    if (onAction) onAction('join');
    
    // Navigate to the game
    const url = joinUrl || `/game/remote?gameId=${gameId}`;
    router.push(url);
    
    toast({
      title: t('joiningGame'),
      description: t('connectingToGame'),
      variant: "default",
    });
  };

  const handleDismiss = () => {
    // Mark as dismissed
    setIsDismissed(true);
    
    // Notify parent component
    if (onAction) onAction('dismiss');
  };
  console.log('we did it');

  return (
    <Card className="p-4 bg-black bg-opacity-80 border border-gray-800 shadow-lg rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-2 rounded-full">
          <Gamepad2 className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-medium">{t('invitationAccepted')}</h4>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">{acceptedBy}</span> {t('acceptedYourGame')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleJoinGame}
            className="bg-[#40CFB7] hover:bg-[#35B09B] px-3 py-1 h-8 rounded-lg text-black"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            {t('join')}
          </Button>
          
          <Button 
            onClick={handleDismiss}
            className="bg-transparent border border-gray-700 hover:bg-gray-800 px-3 py-1 h-8 rounded-lg text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameInviteAcceptedNotification;