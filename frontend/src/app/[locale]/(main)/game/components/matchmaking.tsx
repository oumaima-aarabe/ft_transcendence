import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Flame, Waves, Settings, Clock, User } from 'lucide-react';
import GamePreferencesModal from './game-preferences-modal';
import { GameTheme, GameDifficulty } from '../types/game';
import Link from 'next/link';
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { UseUser } from "@/api/get-user";
import { getUserPreferences, updateUserPreferences } from '@/api/preferences';
import { 
  initMatchmakingSocket,
  getMatchmakingSocket, 
  disconnectMatchmakingSocket,
  sendMatchmakingMessage 
} from '@/lib/matchmakingWebsocket';
import { useTranslations } from 'next-intl';

interface MatchmakingProps {
  userId: string;
  onGameFound: (gameId: string, player1: string, player2: string, gameUrl: string) => void;
  onBack: () => void;
}

const Matchmaking: React.FC<MatchmakingProps> = ({ userId, onGameFound, onBack }) => {
  const t = useTranslations('Game');
  const [status, setStatus] = useState<'idle' | 'searching' | 'connecting'>('idle');
  const [message, setMessage] = useState(t('readyToFindOpponent'));
  const [searchTime, setSearchTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_SEARCH_TIME = 60;
  
  const [gameTheme, setGameTheme] = useState<GameTheme>('water');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('medium');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const { data: userData, isLoading } = UseUser();

  useEffect(() => {
    if (!userData) return;

    const fetchPreferences = async () => {
        try {
          const data = await getUserPreferences();
          console.log('Loaded user preferences:', data);
          setGameTheme(data.theme);
          setGameDifficulty(data.difficulty);
        } catch (error) {
          console.error('Error fetching preferences, using defaults:', error);
        } finally {
          setPreferencesLoaded(true);
        }
      };

    fetchPreferences();
  }, [userData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (status === 'searching') {
      const TIMEOUT_DURATION = 60000;
      
      const timeoutId = setTimeout(() => {
        if (status === 'searching') {
          console.log('Matchmaking timed out after 1 minute');
          setMessage(t('searchTimedOut'));
          
          // Cancel the search
          cancelMatchmaking();
          
          // Show timeout message for a moment before resetting to idle
          setTimeout(() => {
            setStatus('idle');
            setMessage(t('readyToFindOpponent'));
          }, 3000);
        }
      }, TIMEOUT_DURATION);
      
      // Clear timeout on cleanup or status change
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [status, t]);

  // Set up WebSocket connection and message handlers
  useEffect(() => {
    // Don't connect until preferences are loaded
    if (isLoading || !userData || !preferencesLoaded) return;

    console.log('Setting up matchmaking connection for user:', userData.username);
    
    // Initialize WebSocket connection
    const socket = initMatchmakingSocket();
    
    if (!socket) {
      console.error('Failed to initialize matchmaking socket');
      setMessage(t('connectionError'));
      return;
    }
    
    // Set up message handler
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received matchmaking message:', data);
        
        switch (data.type) {
          case 'connection_established':
            setConnectionState('connected');
            setMessage(t('connectedToMatchmaking'));
            break;
            
          case 'queue_status':
            if (data.status.status === 'in_queue') {
              setStatus('searching');
              setMessage(t('searchingForOpponent', { position: data.status.position || 1 }));
              
              // Start the timer if not already running
              if (!timerRef.current) {
                setSearchTime(0);
                timerRef.current = setInterval(() => {
                  setSearchTime(prev => prev + 1);
                }, 1000);
              }
            } else if (data.status.status === 'left_queue') {
              setStatus('idle');
              setMessage(t('readyToFindOpponent'));
              setIsAnimating(false);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setSearchTime(0);
              }
            } else if (data.status.status === 'timeout') {
              // Handle the timeout message from the server
              setStatus('idle');
              setMessage(data.status.message || t('searchTimedOut'));
              setIsAnimating(false);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setSearchTime(0);
              }
            }
            break;
            
          case 'match_found':
              console.log('Match found event received! Game ID:', data.game_id);
              
              setStatus('connecting');
              setMessage(t('opponentFoundConnecting'));
              
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              // Extract game ID and opponent info
              const gameId = data.game_id;
              const player1 = data.player1;
              const player2 = data.player2;
              const gameUrl = data.game_url;
              
              // delay before navigation to make sure both clients are ready
              setTimeout(() => {
                console.log('Transitioning to game after delay, Game ID:', gameId);
                // Notify parent component about game creation
                onGameFound(gameId, player1, player2, gameUrl);
              }, 1000); // 1 second delay
              
              break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    // Set up connection handlers
    const handleOpen = () => {
      console.log('Matchmaking WebSocket connection established');
      setConnectionState('connected');
    };
    
    const handleClose = (event: CloseEvent) => {
      console.log('Matchmaking WebSocket connection closed', event);
      setConnectionState('disconnected');
      setStatus('idle');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    
    const handleError = (error: Event) => {
      console.error('Matchmaking WebSocket error:', error);
      setConnectionState('error');
      setMessage(t('connectionError'));
    };
    
    // Attach event handlers
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);
    
    // If socket is already open, set state accordingly
    if (socket.readyState === WebSocket.OPEN) {
      setConnectionState('connected');
    }
    
    // Clean up on unmount
    return () => {
      console.log('Matchmaking component unmounting, cleaning up resources');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Important: Only disconnect if component is unmounting
      console.log('Disconnecting matchmaking socket during cleanup');
      disconnectMatchmakingSocket();
    };
  }, [isLoading, userData, preferencesLoaded, onGameFound, t]);

    const startMatchmaking = async () => {
      const socket = getMatchmakingSocket();
        
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket not ready, current state:', socket?.readyState);
        setMessage(t('connectionNotReady'));
        
        // Try to reconnect
        initMatchmakingSocket();
        
        // Wait a moment and check again
        setTimeout(() => {
          const reconnectedSocket = getMatchmakingSocket();
          if (reconnectedSocket && reconnectedSocket.readyState === WebSocket.OPEN) {
            console.log('Connection reestablished, sending join request');
            sendMatchmakingMessage('join_queue', { difficulty: gameDifficulty });
            setIsAnimating(true);
            setStatus('searching');
          } else {
            setMessage(t('unableToConnect'));
          }
        }, 1000);
        
        return;
      }
      
      // Socket is ready, send the message with server preferences
      console.log('Sending join_queue message with difficulty:', gameDifficulty);
      sendMatchmakingMessage('join_queue', { difficulty: gameDifficulty });
      setIsAnimating(true);
      setStatus('searching');
    };

  const cancelMatchmaking = () => {
    const socket = getMatchmakingSocket();
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready for cancellation');
      setStatus('idle');
      setMessage(t('readyToFindOpponent'));
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setSearchTime(0);
      }
      return;
    }
    
    // Socket is ready, send cancellation message
    console.log('Sending leave_queue message');
    sendMatchmakingMessage('leave_queue');
  };
  
  const handlePreferencesUpdate = async (theme: GameTheme, difficulty: GameDifficulty) => {
    // Update preferences locally
    setGameTheme(theme);
    setGameDifficulty(difficulty);
    setPreferencesOpen(false);
    
    // Save preferences to server
    try {
        await updateUserPreferences({ theme, difficulty });
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
  };

    // Show loading state while fetching user data or preferences
    if (isLoading || !preferencesLoaded) {
      return (
        <div className="w-full max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-xl overflow-hidden relative">
        {/* Mixed theme border effect */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left side - fire theme border */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 border-l-2 border-t-2 border-b-2 rounded-l-xl border-[#D05F3B]" 
               style={{ boxShadow: 'inset 0 0 15px rgba(208,95,59,0.6), 0 0 15px rgba(208,95,59,0.6)' }}/>
          {/* Right side - water theme border */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 border-r-2 border-t-2 border-b-2 rounded-r-xl border-[#40CFB7]"
               style={{ boxShadow: 'inset 0 0 15px rgba(64,207,183,0.6), 0 0 15px rgba(64,207,183,0.6)' }}/>
        </div>
        
        <div className="p-8 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-4 tracking-wider font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-[#D05F3B] to-[#40CFB7]" 
                style={{
                  textShadow: '0 0 10px rgba(208,95,59,0.5), 0 0 20px rgba(64,207,183,0.5)',
                }}>
              {t('matchmaking').toUpperCase()}
            </h1>
            
            <p className="text-gray-300 max-w-2xl mx-auto">
              {t('matchmakingDescription')}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Preferences card */}
            <div className="w-full max-w-md bg-black bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">{t('gamePreferences')}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Theme */}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">{t('theme')}</span>
                  <div className="flex items-center">
                    {gameTheme === 'fire' ? (
                      <div className="flex items-center text-[#D05F3B]">
                        <Flame className="mr-2" />
                        <span className="font-medium">{t('fireTheme')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-[#40CFB7]">
                        <Waves className="mr-2" />
                        <span className="font-medium">{t('waterTheme')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Difficulty */}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">{t('selectDifficulty')}</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      gameDifficulty === 'easy' ? 'text-green-500' : 
                      gameDifficulty === 'medium' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {t(gameDifficulty)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status display area */}
            <div className="text-center mb-6">
              <p className="text-white text-xl mb-2">{message}</p>
              
              {status === 'searching' && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-gray-300 mb-2">
                    <Clock size={18} className="mr-2" />
                    <p>{t('timeElapsed')}: {formatTime(searchTime)}</p>
                  </div>
                  
                  {/* Add remaining time indicator */}
                  <div className="w-full max-w-md mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{t('searching')}...</span>
                      <span>{t('secondsRemaining', { seconds: MAX_SEARCH_TIME - searchTime })}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-[#D05F3B] to-[#40CFB7] h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(searchTime / MAX_SEARCH_TIME) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* User count and search visualization */}
                  <div className="w-full max-w-md flex items-center justify-between px-10 mb-8">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 p-3 rounded-full bg-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.7)]">
                        <User size={24} className="text-white" />
                      </div>
                      <span className="text-[#D05F3B]">{t('you')}</span>
                    </div>
                    
                    {/* Animated search waves */}
                    <div className="relative h-2 w-40 flex items-center justify-center">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute h-1 bg-gradient-to-r from-[#D05F3B] to-[#40CFB7] rounded-full"
                          style={{ width: '100%', opacity: 0.7 - (i * 0.2) }}
                          animate={{
                            opacity: [0.7 - (i * 0.2), 0],
                            width: ['40%', '100%'],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-col items-center opacity-60">
                      <div className="mb-2 p-3 rounded-full bg-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.7)]">
                        <User size={24} className="text-white" />
                      </div>
                      <span className="text-[#40CFB7]">{t('opponent')}</span>
                    </div>
                  </div>
                  
                  {/* Animated "Searching" text */}
                  <div className="mt-4 flex items-center">
                    <span className="text-white text-xl mr-2">{t('searching')}</span>
                    <motion.span 
                      className="inline-block text-white text-xl"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ...
                    </motion.span>
                  </div>
                </div>
              )}
              
              {status === 'connecting' && (
                <div className="flex flex-col items-center mt-4">
                  <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-[#40CFB7] animate-spin mb-4"></div>
                  <p className="text-white">{t('connectingToGame')}</p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-6 mt-8">
              {status === 'idle' ? (
                <>
                  <div className="flex top-8 left-8 z-50 gap-10">
                    <div className="bg-transparent border-2 border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)] px-6 h-10 flex items-center justify-center rounded-xl hover:bg-[#40CFB7] hover:text-white transition-colors">
                        <Link className='flex items-center justify-center gap-3' href={`/game`}>
                        <FaLongArrowAltLeft size={14} /> {t('backToMenu')}
                        </Link>

                    </div>
                  <Button
                    onClick={startMatchmaking}
                    className="bg-transparent border-2 border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(64,207,183,0.5)] px-6  h-10 flex items-center justify-center rounded-xl hover:bg-[#D05F3B] hover:text-white transition-colors"
                  >
                    {t('findOpponent')} <FaLongArrowAltRight size={14} />
                  </Button>
                </div>
                  
                </>
              ) : (
                <Button
                  onClick={cancelMatchmaking}
                  className="bg-[#D05F3B] text-white px-10 py-3 rounded-xl hover:bg-opacity-90 transition-colors"
                  style={{
                    boxShadow: '0 0 15px rgba(208,95,59,0.5)',
                  }}
                >
                  {t('cancelSearch')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Preferences Modal */}
      {preferencesOpen && (
        <GamePreferencesModal
          isOpen={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
          onSave={handlePreferencesUpdate}
          initialTheme={gameTheme}
          initialDifficulty={gameDifficulty}
        />
      )}
    </div>
  );
};

export default Matchmaking;