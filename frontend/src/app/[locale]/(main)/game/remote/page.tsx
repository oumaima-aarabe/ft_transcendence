"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Matchmaking from '../components/matchmaking';
import RemotePongGame from '../components/remote-pong-game';
import { Button } from '@/components/ui/button';

// Game flow state type
type RemoteGameFlowState = 'matchmaking' | 'playing';

export default function RemoteGamePage() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<RemoteGameFlowState>('matchmaking');
  const [gameData, setGameData] = useState<{
    gameId: string;
    playerNumber: number;
    opponent: any;
  } | null>(null);
  
  // For demonstration, we'll use the user's ID from localStorage
  // In a real app, you'd get this from your auth context
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // In a real app, get this from your auth context
    const storedUserId = localStorage.getItem('userId') || '1'; 
    setUserId(storedUserId);
  }, []);
  
  const handleGameFound = (gameId: string, playerNumber: number, opponent: any) => {
    setGameData({ gameId, playerNumber, opponent });
    setFlowState('playing');
  };
  
  const handleBackToOptions = () => {
    router.push('/game'); // Go back to main game options
  };
  
  const handleExitGame = () => {
    if (flowState === 'playing') {
      setFlowState('matchmaking');
      setGameData(null);
    } else {
      handleBackToOptions();
    }
  };
  
  return (
    <div 
      className="w-full h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: "url('/assets/images/game-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        
      <div className="w-full max-w-6xl px-4 relative">        
        {/* Header with back button */}
        {/* Main content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {flowState === 'matchmaking' && (
              <motion.div
                key="matchmaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Matchmaking 
                  userId={userId}
                  onGameFound={handleGameFound}
                  onBack={handleBackToOptions}
                />
              </motion.div>
            )}
            
            {flowState === 'playing' && gameData && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="z-30 relative"
              >
                <RemotePongGame
                  userId={userId}
                  gameId={gameData.gameId}
                  playerNumber={gameData.playerNumber}
                  opponent={gameData.opponent}
                  onExit={handleExitGame}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}