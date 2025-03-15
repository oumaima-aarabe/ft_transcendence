"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Matchmaking from '../components/matchmaking';
import RemotePongGame from '../components/remote-pong-game';
import { UseUser } from "@/api/get-user";


// Game flow state type
type RemoteGameFlowState = 'matchmaking' | 'playing';

export default function RemoteGamePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = UseUser();
  const [flowState, setFlowState] = useState<RemoteGameFlowState>('matchmaking');
  const [gameData, setGameData] = useState<{
    gameId: string;
    playerNumber: number;
    opponent: any;
  } | null>(null);

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center"
          //  style={{
          //    backgroundImage: "url('/assets/images/water-game.png')",
          //    backgroundSize: 'cover',
          //    backgroundPosition: 'center',
          //  }}
        >
        <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin"></div>
      </div>
    );
  }

  // Handle error state
  if (isError || !user) {
    router.push('/login');
    return null;
  }

  return (
    <div
      className="w-full h-screen overflow-hidden flex items-center justify-center"
      // style={{
      //   backgroundImage: "url('/assets/images/water-game.png')",
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      // }}
    >
      <div className="w-full max-w-6xl px-4 relative">
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
                  userId={user.id.toString()}
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
                  userId={user.id.toString()}
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