let matchmakingSocket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;

export const initMatchmakingSocket = () => {
    if (!matchmakingSocket || matchmakingSocket.readyState === WebSocket.CLOSED) {
        // Get access token from cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };
        
        const token = getCookie('accessToken');
        if (!token) {
            console.error('No access token found');
            return null;
        }
        
        // Use relative URL to work in both development and production
        const host = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${host}/ws/matchmaking/`;
        
        console.log('Initializing matchmaking WebSocket connection to:', wsUrl);
        matchmakingSocket = new WebSocket(`${wsUrl}?token=${token}`);

        matchmakingSocket.onopen = () => {
            console.log('Matchmaking WebSocket connected');
            // Reset reconnect attempts on successful connection
            reconnectAttempts = 0;
        };

        matchmakingSocket.onerror = (error) => {
            console.error('Matchmaking WebSocket error:', error);
        };

        matchmakingSocket.onclose = (event) => {
            console.log('Matchmaking WebSocket disconnected', event.code, event.reason);
            
            // Only attempt reconnect if not manually closed (codes 1000/1001)
            if (event.code !== 1000 && event.code !== 1001) {
                attemptReconnect();
            } else {
                matchmakingSocket = null;
            }
        };
    }
    return matchmakingSocket;
};

const attemptReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log('Maximum reconnection attempts reached');
        matchmakingSocket = null;
        return;
    }
    
    // Calculate exponential backoff delay with jitter
    const delay = Math.min(
        BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts) + Math.random() * 1000,
        30000 // Cap at 30 seconds
    );
    
    console.log(`Attempting to reconnect in ${Math.round(delay)}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
    
    setTimeout(() => {
        reconnectAttempts++;
        initMatchmakingSocket();
    }, delay);
};

export const getMatchmakingSocket = () => matchmakingSocket;

export const disconnectMatchmakingSocket = () => {
    if (matchmakingSocket) {
        // Reset reconnect attempts when manually disconnecting
        reconnectAttempts = 0;
        matchmakingSocket.close(1000, "Manually disconnected");
        matchmakingSocket = null;
    }
};

export const sendMatchmakingMessage = (type: string, data: any = {}, maxRetries = 3) => {
    if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN) {
        const message = {
            type,
            ...data
        };
        console.log('Sending matchmaking message:', message);
        matchmakingSocket.send(JSON.stringify(message));
        return true;
    } else {
        console.warn('Matchmaking WebSocket is not connected');
        
        // Try to reconnect
        const socket = initMatchmakingSocket();
        
        // If we have retries left and socket exists, attempt to send after a delay
        if (maxRetries > 0 && socket) {
            setTimeout(() => {
                sendMatchmakingMessage(type, data, maxRetries - 1);
            }, 500);
            return false;
        }
        
        console.error('Failed to send message after retries');
        return false;
    }
};