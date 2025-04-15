"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { sendGameInvite } from '@/api/game-invite-api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gamepad2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GameInviteButtonProps {
  username: string;
  avatarUrl?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const GameInviteButton: React.FC<GameInviteButtonProps> = ({
  username,
  avatarUrl,
  className = '',
  disabled = false,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('notifications.gameInvite');

  const handleInvite = async () => {
    try {
      setIsLoading(true);
      await sendGameInvite(username);
      
      toast({
        title: t('invitationSent'),
        description: t('invitationSentTo', { username }),
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: t('couldNotSendInvitation'),
        description: error?.response?.data?.error || t('errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={disabled || isLoading}
      className={`relative w-full text-sm text-white bg-transparent border border-white/20 hover:border-white/30 hover:bg-white/10 hover:text-white rounded-full h-11 ${className}`}
      onClick={handleInvite}
    >
      <div className="absolute top-3 left-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Gamepad2 className="h-4 w-4" />
        )}
      </div>
      {children ? (
        children
      ) : (
        <span className="flex justify-center text-xs items-center h-full">
          {isLoading ? t('sending') : t('inviteToGame')}
        </span>
      )}
    </Button>
  );
};

export default GameInviteButton;