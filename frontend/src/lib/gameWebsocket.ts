import { GameState } from "@/app/[locale]/(main)/game/types/game";

type GameStateCallback = (state: any) => void;
type StatusChangeCallback = (status: string, reason?: string) => void;
type ConnectionChangeCallback = (connected: boolean) => void;
type PlayerNumberCallback = (playerNumber: number) => void;
type ForceDisconnectCallback = (reason: string) => void;

export default class GameConnection {
  private socket: WebSocket | null = null;
  private gameId: string;
  private token: string;
  private messageQueue: {type: string, data: any}[] = [];
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private currentPaddleY: number | null = null;
  private lastSentPaddleY: number | null = null;
  private paddleMoveQueued = false;
  private paddleMovementThreshold = 2; // Only send updates if moved by at least 2px
  private lastSendTime = 0;
  private minSendInterval = 33; // At most 30 updates per second (33ms)
  
  // Callback functions
  private onGameState: GameStateCallback;
  private onStatusChange: StatusChangeCallback;
  private onConnectionChange: ConnectionChangeCallback;
  private onPlayerNumber: PlayerNumberCallback;
  private onForceDisconnect: ForceDisconnectCallback;
  
  // Player information
  private playerNumber: number | null = null;


  constructor(
    gameId: string, 
    token: string, 
    onGameState: GameStateCallback,
    onStatusChange: StatusChangeCallback,
    onConnectionChange: ConnectionChangeCallback,
    onPlayerNumber: PlayerNumberCallback,
    onForceDisconnect: ForceDisconnectCallback
  ) {
    this.gameId = gameId;
    this.token = token;
    this.onGameState = onGameState;
    this.onStatusChange = onStatusChange;
    this.onConnectionChange = onConnectionChange;
    this.onPlayerNumber = onPlayerNumber;
    this.onForceDisconnect = onForceDisconnect;
  }

  connect() {
    // Only connect if not already connected
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Create WebSocket URL with game ID and authentication token
    const host = process.env.NEXT_PUBLIC_WS_URL ||'wss://localhost';
    const wsUrl = `${host}/ws/game/${this.gameId}/?token=${this.token}`;
    
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
      this.onConnectionChange(false);
    }
  }

  private handleOpen(event: Event) {
    this.onConnectionChange(true);
    
    // Process any queued messages
    this.processQueuedMessages();
    
    // Start the game loop for sending paddle positions
    this.startGameLoop();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connection_established':
          // Set player number when connection is established
          if (message.player_number !== undefined) {
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
          if (isOpponent && !message.connected) {
            // Opponent disconnected - we'll handle this via force_disconnect
          }
          break;
          
        case 'force_disconnect':
          // Handle force disconnect message
          this.onForceDisconnect(message.reason || 'Other player disconnected');
          this.disconnect();
          break;
          
        case 'game_completed':
          // Game has completed, handle the final state before disconnection
          this.onGameState(message.final_state);
          this.onStatusChange('gameOver', 'Game completed');
          
          // Disconnect after a short delay
          setTimeout(() => {
            this.disconnect();
          }, 1000);
          break;
      }
    } catch (error) {
      console.error('Error parsing game message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    this.onConnectionChange(false);
    this.socket = null;
    
    // Stop game loop
    this.stopGameLoop();
  }

  private handleError(error: Event) {
    console.error('Game WebSocket error:', error);
    this.onConnectionChange(false);
  }
  
  private processQueuedMessages() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.sendMessage(message.type, message.data);
        }
      }
    }
  }


  // Send paddle movement to server - but only send when there's an actual change
  sendPaddleMove(position: number) {
    // Round position to reduce jitter and unnecessary precision
    position = Math.round(position);

    
    if (position === this.currentPaddleY) {
      return;

    }
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;

    this.currentPaddleY = position;


    // Determine if we should queue an update
    const significantMove = !this.lastSentPaddleY || 
                          Math.abs(position - this.lastSentPaddleY) >= this.paddleMovementThreshold;
    
    const intervalElapsed = timeSinceLastSend >= this.minSendInterval;
    
    if (significantMove && intervalElapsed) {
      // Send immediately if both conditions are met
      this.sendMessage('paddle_move', { position });
      this.lastSentPaddleY = position;
      this.lastSendTime = now;
      this.paddleMoveQueued = false;
    } else if (significantMove) {
      // Queue for sending in next game loop iteration
      this.paddleMoveQueued = true;
    }
  }

  // Game loop to throttle paddle movement messages
  private startGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
    
    // Send paddle position updates at a maximum of 30 per second
    this.gameLoopInterval = setInterval(() => {
      const now = Date.now();
      if (this.paddleMoveQueued && this.currentPaddleY !== null && now - this.lastSendTime >= this.minSendInterval) {
        const sent = this.sendMessage('paddle_move', { position: this.currentPaddleY });
        if (sent) {
          this.lastSentPaddleY = this.currentPaddleY;
          this.lastSendTime = now;
          this.paddleMoveQueued = false;
        }
      }
    },  this.minSendInterval); // 33ms = 30 updates per second
  }
  
  private stopGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }
  
  private sendMessage(type: string, data: any = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        ...data
      };
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    }
    return false;
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

  disconnect() {
    this.stopGameLoop();
    
    if (this.socket) {
      try {
        this.socket.close(1000, "Disconnected by user");
      } catch (error) {
        console.error('Error closing socket:', error);
      }
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