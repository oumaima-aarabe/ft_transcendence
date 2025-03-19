"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Matchmaking from '../components/matchmaking';
import RemotePongGame from '../components/remote-pong-game';
import { UseUser } from "@/api/get-user";
import { GameTheme, GameDifficulty } from '../types/game';

// Game flow state type
type RemoteGameFlowState = 'matchmaking' | 'playing';

export default function RemoteGamePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = UseUser();
  const [flowState, setFlowState] = useState<RemoteGameFlowState>('matchmaking');
  const [gameData, setGameData] = useState<{
    gameId: string;
    gameUrl: string;
    player1: string
    player2: string
  } | null>(null);
  
  // Default game settings
  const [theme, setTheme] = useState<GameTheme>('water');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');

  const handleGameFound = (gameId: string, player1: string, player2: string, gameUrl:string) => {
    console.log("Game found in page component:", gameId, player1, player2, gameUrl);
    setGameData({ gameId, gameUrl, player1, player2 });
    setTimeout(() => {
      setFlowState('playing');
      console.log("Transitioned to playing state");
    }, 0);
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
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin"></div>
      </div>
    );
  }

  // Handle error state
  if (isError || !user) {
    router.push('/auth');
    return null;
  }

  return (
    <div
      className="w-full h-screen overflow-hidden flex items-center justify-center"
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
                  gameId={gameData.gameId}
                  userName={user.username}
                  player1Name={gameData.player1}  // We'll let the server decide who is player 1 vs 2
                  player2Name={gameData.player2}
                  player1Avatar={user.avatar || "https://iili.io/2D8ByIj.png"}
                  player2Avatar={"https://iili.io/2D8ByIj.png"}
                  theme={theme}
                  difficulty={difficulty}
                  onBackToSetup={handleExitGame}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}