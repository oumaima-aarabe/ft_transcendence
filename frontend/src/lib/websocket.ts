let socket: WebSocket | null = null;

export const initSocket = () => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        // Get access token from cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };
        
        const token = getCookie('accessToken');
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        socket = new WebSocket(`${wsUrl}/ws/chat/?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onerror = (error) => {
            // console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            socket = null;
        };
    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};

export const sendWebSocketMessage = (event: string, data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            event,
            data
        }));
    } else {
        console.error('WebSocket is not connected');
    }
};