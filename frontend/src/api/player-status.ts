import { sendRequest } from '@/lib/axios';

interface GameStatusResponse {
  active_game: boolean;
  game_id?: string;
  player1?: string;
  player2?: string;
  status?: string;
  in_memory?: boolean;
}

export async function checkPlayerGameStatus(): Promise<GameStatusResponse> {
  try {
    const response = await sendRequest('get', '/pong_game/player-status/');
    return response.data;
  } catch (error) {
    console.error('Error checking player status:', error);
    // Return a safe default if request fails
    return { active_game: false };
  }
}