"use client";

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameOptions from './components/game-options';
import LocalGameSetup from './components/local-game-setup';
import PongGame from './components/pong-game';
import GameBackground from './components/game-background';
import { GameTheme, GameDifficulty } from './types/game';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

type GameFlowState = 'options' | 'setup' | 'playing';

export default function GamePage() {
  const t = useTranslations('Game');
  const [flowState, setFlowState] = useState<GameFlowState>('options');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [player1Name, setPlayer1Name] = useState<string>(t('player1'));
  const [player2Name, setPlayer2Name] = useState<string>(t('player2'));
  const [gameTheme, setGameTheme] = useState<GameTheme>('fire');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('medium');

  const handleSelectGameMode = (mode: 'local' | 'invite' | 'matchmaking') => {
    if (mode === 'local') {
      setFlowState('setup');
    } else if (mode === 'matchmaking') {
    } else {
      alert(`${mode} mode is not implemented yet`);
    }
  };

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

  const handleBackToOptions = () => {
    setFlowState('options');
  };

  const handleBackToSetup = () => {
    setFlowState('setup');
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
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
                <PongGame
                  player1Name={player1Name}
                  player2Name={player2Name}
                  theme={gameTheme}
                  difficulty={gameDifficulty}
                  onBackToSetup={handleBackToSetup}
                  isTournamentMode={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}