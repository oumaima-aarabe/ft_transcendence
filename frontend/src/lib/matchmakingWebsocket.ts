let matchmakingSocket: WebSocket | null = null;

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
        
        // Use relative URL to work in both development and production
        const host = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${host}/ws/matchmaking/`;
        
        console.log('Initializing matchmaking WebSocket connection to:', wsUrl);
        matchmakingSocket = new WebSocket(`${wsUrl}?token=${token}`);

        matchmakingSocket.onopen = () => {
            console.log('Matchmaking WebSocket connected');
        };

        matchmakingSocket.onerror = (error) => {
            console.error('Matchmaking WebSocket error:', error);
        };

        matchmakingSocket.onclose = (event) => {
            console.log('Matchmaking WebSocket disconnected', event.code, event.reason);
            matchmakingSocket = null;
        };
    }
    return matchmakingSocket;
};

export const getMatchmakingSocket = () => matchmakingSocket;

export const disconnectMatchmakingSocket = () => {
    if (matchmakingSocket) {
        matchmakingSocket.close();
        matchmakingSocket = null;
    }
};

export const sendMatchmakingMessage = (type: string, data: any = {}) => {
    if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN) {
        const message = {
            type,
            ...data
        };
        console.log('Sending matchmaking message:', message);
        matchmakingSocket.send(JSON.stringify(message));
    } else {
        console.error('Matchmaking WebSocket is not connected');
        // Try to reconnect
        const socket = initMatchmakingSocket();
        // If connection succeeds, try again after a short delay
        if (socket) {
            setTimeout(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    sendMatchmakingMessage(type, data);
                }
            }, 500);
        }
    }
};