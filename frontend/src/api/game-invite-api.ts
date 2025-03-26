import { sendRequest } from '@/lib/axios';

/**
 * Send a game invitation to a user
 * @param username The username of the user to invite
 * @returns The response data with invitation details
 */
export const sendGameInvite = async (username: string) => {
  try {
    const response = await sendRequest('post', '/api/pong_game/invites/', { username });
    return response.data;
  } catch (error) {
    console.error('Error sending game invitation:', error);
    throw error;
  }
};

/**
 * Accept a game invitation
 * @param invitationCode The unique code of the invitation
 * @returns The response data with game details
 */
export const acceptGameInvite = async (invitationCode: string) => {
  try {
    const response = await sendRequest(
      'post', 
      `/api/pong_game/invites/${invitationCode}/`, 
      { action: 'accept' }
    );
    return response.data;
  } catch (error) {
    console.error('Error accepting game invitation:', error);
    throw error;
  }
};

/**
 * Decline a game invitation
 * @param invitationCode The unique code of the invitation
 * @returns The response data
 */
export const declineGameInvite = async (invitationCode: string) => {
  try {
    const response = await sendRequest(
      'post', 
      `/api/pong_game/invites/${invitationCode}/`, 
      { action: 'decline' }
    );
    return response.data;
  } catch (error) {
    console.error('Error declining game invitation:', error);
    throw error;
  }
};

/**
 * Get all pending game invitations for the current user
 * @returns The response data with invitation list
 */
export const getPendingGameInvites = async () => {
  try {
    const response = await sendRequest('get', '/api/pong_game/invites/');
    return response.data;
  } catch (error) {
    console.error('Error fetching game invitations:', error);
    throw error;
  }
};