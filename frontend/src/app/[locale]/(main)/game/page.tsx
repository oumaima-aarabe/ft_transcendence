"use client";

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameOptions from './components/game-options';
import LocalGameSetup from './components/local-game-setup';
import PongGame from './components/pong-game';
import GameBackground from './components/game-background';
import { GameTheme, GameDifficulty } from './types/game';
import { useRouter } from 'next/navigation';
import { LocalPongGame } from './components/local-pong-game';

// Game flow state type
type GameFlowState = 'options' | 'setup' | 'playing';

export default function GamePage() {
  // Flow state management
  const [flowState, setFlowState] = useState<GameFlowState>('options');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Game configuration
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');
  const [gameTheme, setGameTheme] = useState<GameTheme>('fire');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('medium');

  // Handle game option selection
  const handleSelectGameMode = (mode: 'local' | 'invite' | 'matchmaking') => {
    if (mode === 'local') {
      setFlowState('setup');
    } else if (mode === 'matchmaking') {
      // Navigation is handled in the GameOptions component
      // The router.push to '/game/remote' is already there
    } else {
      // For now, other modes are not implemented
      alert(`${mode} mode is not implemented yet`);
    }
  };

  // Handle game setup submission
  const handleStartGame = (
    p1Name: string, 
    p2Name: string, 
    theme: GameTheme, 
    difficulty: GameDifficulty
  ) => {
    setPlayer1Name(p1Name);
    setPlayer2Name(p2Name);
    setGameTheme(theme);
    setGameDifficulty(difficulty);
    setFlowState('playing');
  };

  // Return to options screen
  const handleBackToOptions = () => {
    setFlowState('options');
  };

  // Return to game setup
  const handleBackToSetup = () => {
    setFlowState('setup');
  };

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-6xl px-4 relative">
        {/* Game area that will contain the background when playing */}
        <div ref={gameAreaRef} className="relative">
          {/* Background for playing state - positioned relative to this container */}
          {flowState === 'playing' && (
            <GameBackground 
              isPlaying={flowState === 'playing'} 
              theme={gameTheme}
            />
          )}

          <AnimatePresence mode="wait">
            {flowState === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GameOptions onSelectMode={handleSelectGameMode} />
              </motion.div>
            )}

            {flowState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LocalGameSetup 
                  onStart={handleStartGame} 
                  onBack={handleBackToOptions}
                  initialP1Name={player1Name}
                  initialP2Name={player2Name}
                  initialTheme={gameTheme}
                  initialDifficulty={gameDifficulty}
                />
              </motion.div>
            )}

            {flowState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="z-30 relative"
              >
                <LocalPongGame
                  player1Name={player1Name}
                  player2Name={player2Name}
                  theme={gameTheme}
                  difficulty={gameDifficulty}
                  onBackToSetup={handleBackToSetup}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}