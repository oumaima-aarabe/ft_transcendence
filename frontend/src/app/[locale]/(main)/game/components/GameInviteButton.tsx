"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { sendGameInvite } from '@/api/game-invite-api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gamepad2 } from 'lucide-react';

interface GameInviteButtonProps {
  username: string;
  avatarUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const GameInviteButton: React.FC<GameInviteButtonProps> = ({
  username,
  avatarUrl,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    try {
      setIsLoading(true);
      await sendGameInvite(username);
      
      toast({
        title: "Invitation sent!",
        description: `Game invitation sent to ${username}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Could not send invitation",
        description: error?.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button styles based on theme
  const buttonClasses = `
    ${className}
    ${variant === 'default' ? 'bg-[#D05F3B] hover:bg-[#C04F2B] text-white shadow-[0_0_15px_rgba(208,95,59,0.3)]' : ''}
    ${variant === 'outline' ? 'bg-transparent border border-[#D05F3B] text-[#D05F3B] hover:bg-[#D05F3B]/10' : ''}
    ${variant === 'ghost' ? 'bg-transparent hover:bg-[#D05F3B]/10 text-[#D05F3B]' : ''}
    ${size === 'sm' ? 'text-xs px-2 py-1' : ''}
    ${size === 'default' ? 'text-sm px-3 py-1.5' : ''}
    ${size === 'lg' ? 'text-base px-4 py-2' : ''}
    transition-all duration-300 rounded-lg flex items-center justify-center gap-2
  `;

  return (
    <Button 
      onClick={handleInvite} 
      disabled={isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Gamepad2 className="h-4 w-4" />
      )}
      Invite to Game
    </Button>
  );
};

export default GameInviteButton;