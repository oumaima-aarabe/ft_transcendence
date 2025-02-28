"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameOptions from './components/game-options';
import LocalGameSetup from './components/local-game-setup';
import PongGame from './components/pong-game';
import { GameTheme, GameDifficulty } from './types/game';

// Game flow state type
type GameFlowState = 'options' | 'setup' | 'playing';

export default function GamePage() {
  // Flow state management
  const [flowState, setFlowState] = useState<GameFlowState>('options');
  
  // Game configuration
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');
  const [gameTheme, setGameTheme] = useState<GameTheme>('fire');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('medium');

  // Handle game option selection
  const handleSelectGameMode = (mode: 'local' | 'invite' | 'matchmaking') => {
    if (mode === 'local') {
      setFlowState('setup');
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
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center py-8">
      <AnimatePresence mode="wait">
        {flowState === 'options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <GameOptions onSelectMode={handleSelectGameMode} />
          </motion.div>
        )}

        {flowState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
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
            className="w-full"
          >
            <PongGame
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
  );
}