import api, { sendRequest } from '@/lib/axios';
import { GameTheme, GameDifficulty } from '@/app/[locale]/(main)/game/types/game';

interface GameDetails {
  id: string;
  player1: {
    id: string;
    username: string;
    avatar?: string;
  };
  player2: {
    id: string;
    username: string;
    avatar?: string;
  };
  status: string;
  theme?: GameTheme;
  difficulty?: GameDifficulty;
  created_at: string;
}

// Fetch details for a specific game
export const getGameDetails = async (gameId: string): Promise<GameDetails> => {
  try {
    // Using the correct endpoint structure that matches your Django URLs
    const response = await sendRequest('get', `/pong_game/games/${gameId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
};

// Get the player's active game status
export const getPlayerGameStatus = async (): Promise<{
  active_game: boolean;
  game_id?: string;
  player1?: string;
  player2?: string;
  status?: string;
}> => {
  try {
    const response = await sendRequest('get', '/pong_game/player-status/');
    return response.data;
  } catch (error) {
    console.error('Error fetching player game status:', error);
    throw error;
  }
};