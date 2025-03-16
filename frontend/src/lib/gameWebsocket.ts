import { GameState } from "@/app/[locale]/(main)/game/types/game";

type GameStateCallback = (state: any) => void;
type StatusChangeCallback = (status: string, reason?: string) => void;
type ConnectionChangeCallback = (connected: boolean) => void;
type PlayerNumberCallback = (playerNumber: number) => void;

export default class GameConnection {
  private socket: WebSocket | null = null;
  private gameId: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: {type: string, data: any}[] = [];
  
  // Callback functions
  private onGameState: GameStateCallback;
  private onStatusChange: StatusChangeCallback;
  private onConnectionChange: ConnectionChangeCallback;
  private onPlayerNumber: PlayerNumberCallback;
  
  // Player information
  private playerNumber: number | null = null;

  constructor(
    gameId: string, 
    token: string, 
    onGameState: GameStateCallback,
    onStatusChange: StatusChangeCallback,
    onConnectionChange: ConnectionChangeCallback,
    onPlayerNumber: PlayerNumberCallback
  ) {
    this.gameId = gameId;
    this.token = token;
    this.onGameState = onGameState;
    this.onStatusChange = onStatusChange;
    this.onConnectionChange = onConnectionChange;
    this.onPlayerNumber = onPlayerNumber;
  }

  connect() {
    // Close existing connection if any
    if (this.socket) {
      this.socket.close();
    }

    // Create WebSocket URL with game ID and authentication token
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    const wsUrl = `${protocol}//${host}/ws/game/${this.gameId}/?token=${this.token}`;
    
    console.log('Connecting to game server:', wsUrl);
    
    try {
      // Create new WebSocket connection
      this.socket = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.scheduleReconnection();
    }
  }

  private handleOpen(event: Event) {
    console.log('Connected to game server');
    this.reconnectAttempts = 0;
    this.onConnectionChange(true);
    
    // Process any queued messages
    this.processQueuedMessages();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received game message:', message.type);
      
      switch (message.type) {
        case 'connection_established':
          // Set player number when connection is established
          if (message.player_number) {
            this.playerNumber = message.player_number;
            this.onPlayerNumber(message.player_number);
          }
          break;
          
        case 'game_state':
          // Pass game state to callback function
          this.onGameState(message.state);
          break;
          
        case 'game_status_changed':
          // Handle game status changes
          this.onStatusChange(message.status, message.reason);
          break;
          
        case 'player_status':
          // Handle opponent connection/disconnection
          const isOpponent = this.playerNumber !== null && message.player !== this.playerNumber;
          if (isOpponent) {
            console.log(`Opponent ${message.connected ? 'connected' : 'disconnected'}`);
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing game message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log(`Game WebSocket closed: ${event.code} ${event.reason}`);
    this.onConnectionChange(false);
    this.socket = null;
    
    // Attempt to reconnect unless explicitly closed by user
    if (event.code !== 1000 && event.code !== 1001) {
      this.scheduleReconnection();
    }
  }

  private handleError(error: Event) {
    console.error('Game WebSocket error:', error);
  }
  
  private scheduleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;
      
      console.log(`Attempting to reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  
  private processQueuedMessages() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      console.log(`Processing ${this.messageQueue.length} queued messages`);
      
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.sendMessage(message.type, message.data);
        }
      }
    }
  }
  
  private sendMessage(type: string, data: any = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        ...data
      };
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Send paddle movement to server
  sendPaddleMove(position: number) {
    const sent = this.sendMessage('paddle_move', { position });
    if (!sent) {
      // Queue message if connection not ready
      this.messageQueue.push({ type: 'paddle_move', data: { position } });
    }
  }

  // Send game control messages
  startGame() {
    const sent = this.sendMessage('start_game');
    if (!sent) {
      this.messageQueue.push({ type: 'start_game', data: {} });
    }
  }

  togglePause() {
    const sent = this.sendMessage('toggle_pause');
    if (!sent) {
      this.messageQueue.push({ type: 'toggle_pause', data: {} });
    }
  }

  nextMatch() {
    const sent = this.sendMessage('next_match');
    if (!sent) {
      this.messageQueue.push({ type: 'next_match', data: {} });
    }
  }

  restartGame() {
    const sent = this.sendMessage('restart_game');
    if (!sent) {
      this.messageQueue.push({ type: 'restart_game', data: {} });
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, "Disconnected by user");
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  getPlayerNumber() {
    return this.playerNumber;
  }
}