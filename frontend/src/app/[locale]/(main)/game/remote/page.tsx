"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Matchmaking from '../components/matchmaking';
import RemotePongGame from '../components/remote-pong-game';
import { UseUser } from "@/api/get-user";
import { GameTheme, GameDifficulty } from '../types/game';
import GameBackground from '../components/game-background';
import { getUserPreferences } from '@/api/preferences';

// Game flow state type
type RemoteGameFlowState = 'loading' | 'error' | 'matchmaking' | 'connecting' | 'playing';

export default function RemoteGamePage() {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = UseUser();
  const [flowState, setFlowState] = useState<RemoteGameFlowState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();
  const [gameData, setGameData] = useState<{
    gameId: string;
    gameUrl: string;
    player1: string;
    player2: string;
    theme?: GameTheme;
    difficulty?: GameDifficulty;
  } | null>(null);
  
  // Default game settings - these will be overridden by server preferences
  const [theme, setTheme] = useState<GameTheme>('water');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  
  // Fetch user preferences
  useEffect(() => {
    if (isLoading || isError || !user) return;
    
    const fetchPreferences = async () => {
      try {
        const data = await getUserPreferences();
        console.log('Loaded user preferences:', data);
        setTheme(data.theme);
        setDifficulty(data.difficulty);
      } catch (error) {
        console.error('Error fetching preferences, using defaults:', error);
        // Default values will remain
      }
    };

    fetchPreferences();
  }, [isLoading, isError, user]);
  
  // Initialize states based on user data loading
  useEffect(() => {
    if (isLoading) {
      setFlowState('loading');
    } else if (isError) {
      setFlowState('error');
      setErrorMessage('Unable to load user data. Please try again later.');
      
      // Redirect to auth after delay
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (user) {
      setFlowState('matchmaking');
    }
  }, [isLoading, isError, user, router]);

  const handleGameFound = (gameId: string, player1: string, player2: string, gameUrl: string) => {
    try {
      // Update state to connecting during transition
      setFlowState('connecting');
      
      // Store game data with theme and difficulty preferences
      setGameData({ 
        gameId, 
        gameUrl, 
        player1, 
        player2,
        theme, 
        difficulty 
      });
      
      // Use a timeout to allow for a visual transition
      setTimeout(() => {
        setFlowState('playing');
      }, 500);
    } catch (err) {
      console.error("Error during game transition:", err);
      setFlowState('matchmaking');
    }
  };

  const handleBackToOptions = () => {
    router.push('/game'); // Go back to main game options
  };

  const handleExitGame = () => {
    setFlowState('matchmaking');
    setGameData(null);
  };
  
  const handleRetry = () => {
    if (flowState === 'error') {
      // Reset error state
      setErrorMessage('');
      
      // Try to return to matchmaking
      if (user) {
        setFlowState('matchmaking');
      } else {
        // If no user, reload the page
        window.location.reload();
      }
    }
  };

  // Handle connection errors in game
  const handleConnectionError = (error: string) => {
    setFlowState('matchmaking');
  };
  
  // Generate content based on current flow state
  const renderContent = () => {
    switch (flowState) {
      case 'loading':
        return (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 mb-4 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin"></div>
            <p className="text-white text-xl">Loading game services...</p>
          </motion.div>
        );
        
      case 'error':
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto p-8 bg-black bg-opacity-70 rounded-xl border border-red-500"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
              <p className="text-gray-300 mb-6">{errorMessage || 'Something went wrong. Please try again.'}</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-[#40CFB7] text-black px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToOptions}
                  className="bg-transparent border border-[#40CFB7] text-[#40CFB7] px-6 py-2 rounded-lg hover:bg-[#40CFB7] hover:bg-opacity-10 transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 'matchmaking':
        return (
          <motion.div
            key="matchmaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Matchmaking
              userId={user!.id.toString()}
              onGameFound={handleGameFound}
              onBack={handleBackToOptions}
            />
          </motion.div>
        );
        
      case 'connecting':
        return (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-center"
          >
            <div className="bg-black bg-opacity-80 backdrop-blur-sm p-10 rounded-xl border-2 border-[#40CFB7] shadow-[0_0_30px_rgba(64,207,183,0.6)]">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-6 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Connecting to Game</h2>
                <p className="text-gray-300 mb-2">Establishing connection with opponent...</p>
                <p className="text-sm text-[#40CFB7]">Game ID: {gameData?.gameId}</p>
              </div>
            </div>
          </motion.div>
        );
        
      case 'playing':
        return gameData ? (
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
              userName={user!.username}
              player1Name={gameData.player1}
              player2Name={gameData.player2}
              player1Avatar={user!.avatar || "https://iili.io/2D8ByIj.png"}
              player2Avatar={"https://iili.io/2D8ByIj.png"}
              theme={gameData.theme || theme}
              difficulty={gameData.difficulty || difficulty}
              onBackToSetup={handleExitGame}
              onConnectionError={handleConnectionError}
            />
          </motion.div>
        ) : (
          // Handle case where gameData is somehow null despite being in playing state
          <div className="text-center">
            <p className="text-red-500">Game data error. Please return to menu.</p>
            <button
              onClick={() => {
                setFlowState('matchmaking');
              }}
              className="mt-4 bg-[#40CFB7] text-black px-6 py-2 rounded-lg"
            >
              Return to Matchmaking
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-full max-w-6xl px-4 relative">
        <div className="relative z-10">
        {flowState === 'playing' && gameData && (
            <GameBackground 
              isPlaying={flowState === 'playing'} 
              theme={gameData.theme || theme}
            />
          )}
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}