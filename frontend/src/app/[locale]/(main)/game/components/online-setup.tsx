import React, { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Flame, Waves, Loader2 } from "lucide-react";
import { GameDifficulty, GameTheme } from "../types/game";
import axios from '@/lib/axios';
import { useTranslations } from 'next-intl';

interface OnlineGameSetupProps {
  onStartGame: (gameId: string, player1Name: string, player2Name: string) => void;
  userName: string;
  userId: number;
}

const OnlineGameSetup: React.FC<OnlineGameSetupProps> = ({ onStartGame, userName, userId }) => {
  const router = useRouter();
  const t = useTranslations('Game');
  const [theme, setTheme] = useState<GameTheme>("fire");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setIsLoading(true);
    setStatus(t('creatingGame'));
    
    try {
      const response = await axios.post('/api/games/create_game/', {
        theme,
        difficulty
      });
      
      if (response.data && response.data.game_id) {
        setStatus(t('waitingForOpponent'));
        
        // Start polling for opponent
        checkForOpponent(response.data.game_id);
      } else {
        setStatus(t('errorCreatingGame'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      setStatus(t('errorCreatingGame'));
      setIsLoading(false);
    }
  };

  const handleFindMatch = async () => {
    setIsLoading(true);
    setStatus(t('findingMatch'));
    
    try {
      const response = await axios.get(`/api/games/find_match/?theme=${theme}&difficulty=${difficulty}`);
      
      if (response.data && response.data.game_id) {
        if (response.data.status === 'joining') {
          // Joining an existing game
          joinGame(response.data.game_id);
        } else {
          // Created a new game, wait for opponent
          setStatus(t('waitingForOpponent'));
          checkForOpponent(response.data.game_id);
        }
      } else {
        setStatus(t('errorFindingMatch'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error finding match:", error);
      setStatus(t('errorFindingMatch'));
      setIsLoading(false);
    }
  };
  
  const joinGame = async (gameId: string) => {
    setStatus(t('joiningGame'));
    
    try {
      const response = await axios.post(`/api/games/${gameId}/join_game/`);
      
      if (response.data && response.data.status === 'joined') {
        // Get game details to determine player names
        const gameDetails = await axios.get(`/api/games/${gameId}/`);
        
        if (gameDetails.data) {
          const player1Name = gameDetails.data.player1_info?.username || t('player1');
          const player2Name = gameDetails.data.player2_info?.username || t('player2');
          
          // Start the game
          onStartGame(gameId, player1Name, player2Name);
        } else {
          setStatus(t('errorGettingGameDetails'));
          setIsLoading(false);
        }
      } else {
        setStatus(t('errorJoiningGame'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setStatus(t('errorJoiningGame'));
      setIsLoading(false);
    }
  };
  
  const checkForOpponent = async (gameId: string) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/games/${gameId}/`);
        
        if (response.data && response.data.player2) {
          // Opponent found
          clearInterval(checkInterval);
          
          const player1Name = response.data.player1_info?.username || t('player1');
          const player2Name = response.data.player2_info?.username || t('player2');
          
          // Start the game
          onStartGame(gameId, player1Name, player2Name);
        }
      } catch (error) {
        console.error("Error checking for opponent:", error);
        // Continue polling
      }
    }, 2000); // Check every 2 seconds
    
    // Clean up interval after 2 minutes (timeout)
    setTimeout(() => {
      clearInterval(checkInterval);
      if (isLoading) {
        setStatus(t('noOpponentFound'));
        setIsLoading(false);
      }
    }, 120000);
  };

  const handleCancel = () => {
    setIsLoading(false);
    setStatus(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white">{t('onlineGameSetup')}</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-black/50 p-10 rounded-xl border border-gray-800 w-full">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white text-xl">{status}</p>
          <Button 
            onClick={handleCancel}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {t('cancel')}
          </Button>
        </div>
      ) : (
        <>
          {/* Theme Selection */}
          <div className="mb-8 w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">{t('selectTheme')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  theme === "fire"
                    ? "ring-4 ring-[#D05F3B] shadow-[0_0_30px_rgba(208,95,59,0.5)]"
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => setTheme("fire")}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/assets/images/fire-game.jpeg"
                    alt={t('fireTheme')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span>{t('fireTheme')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  theme === "water"
                    ? "ring-4 ring-[#40CFB7] shadow-[0_0_30px_rgba(64,207,183,0.5)]"
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => setTheme("water")}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/assets/images/water-game.jpeg"
                    alt={t('waterTheme')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                      <Waves className="w-5 h-5 text-teal-400" />
                      <span>{t('waterTheme')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-10 w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">{t('selectDifficulty')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  className={`p-4 rounded-lg text-center font-semibold transition-all duration-300 ${
                    difficulty === diff
                      ? theme === "fire"
                        ? "bg-[#D05F3B] text-white shadow-[0_0_20px_rgba(208,95,59,0.5)]"
                        : "bg-[#40CFB7] text-white shadow-[0_0_20px_rgba(64,207,183,0.5)]"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setDifficulty(diff as GameDifficulty)}
                >
                  {t(diff)}
                </button>
              ))}
            </div>
          </div>

          {/* Start Game Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={handleCreateGame}
              className={`flex-1 text-lg py-6 ${
                theme === "fire"
                  ? "bg-[#D05F3B] hover:bg-[#C04F2B] text-white"
                  : "bg-[#40CFB7] hover:bg-[#30BFA7] text-white"
              }`}
            >
              {t('createGame')}
            </Button>
            
            <Button
              onClick={handleFindMatch}
              className={`flex-1 text-lg py-6 ${
                theme === "fire"
                  ? "bg-[#D05F3B] hover:bg-[#C04F2B] text-white"
                  : "bg-[#40CFB7] hover:bg-[#30BFA7] text-white"
              }`}
            >
              {t('quickMatch')}
            </Button>
          </div>
          
          <Button
            onClick={() => router.back()}
            className="mt-8 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {t('back')}
          </Button>
        </>
      )}
    </div>
  );
};

export default OnlineGameSetup;