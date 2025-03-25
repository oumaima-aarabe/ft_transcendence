let socket: WebSocket | null = null;

export const initSocket = () => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        const host = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${host}/ws/chat/`;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onerror = (error) => {
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