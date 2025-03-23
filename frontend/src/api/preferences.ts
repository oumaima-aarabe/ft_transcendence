import { sendRequest } from '@/lib/axios';

export interface UserPreferences {
  theme: 'fire' | 'water';
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await sendRequest('get', '/pong_game/preferences/');
    return response.data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    // Return default preferences if the request fails
    return {
      theme: 'water',
      difficulty: 'medium'
    };
  }
}

export async function updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  try {
    const response = await sendRequest('put', '/pong_game/preferences/', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}