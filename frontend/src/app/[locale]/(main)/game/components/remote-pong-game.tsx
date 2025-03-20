import React, { useEffect, useRef, useState } from "react";
import { EnhancedGameState, GameDifficulty, GameTheme, KeyStates } from "../types/game";
import GameConnection from "@/lib/gameWebsocket";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RemotePongRenderer from "./remote-pong-renderer";
import { Button } from "@/components/ui/button";

// Constants (should match server values)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 8;
const POINTS_TO_WIN_MATCH = 5;
const MATCHES_TO_WIN_GAME = 3;

// Connection timeout in milliseconds (10 seconds)
const CONNECTION_TIMEOUT = 10000;

// Smoothing and prediction settings
const PADDLE_INTERPOLATION_SPEED = 0.1; // Lower = smoother but slower
const MAX_PADDLE_DIVERGENCE = 25; // Maximum allowed difference between local and server paddle positions
const BALL_EXTRAPOLATION_FACTOR = 1.05; // Slightly predict ahead of current trajectory
const SERVER_UPDATE_BUFFER_SIZE = 3; // Number of server updates to buffer for smoothing
const MIN_INTERPOLATION_SPEED = 0.05; // Minimum interpolation speed for high latency
const MAX_INTERPOLATION_SPEED = 0.2; // Maximum interpolation speed for low latency

// Initial game state
const createInitialGameState = (): EnhancedGameState => ({
  ball: {
    x: BASE_WIDTH / 2,
    y: BASE_HEIGHT / 2,
    dx: 0,
    dy: 0,
    speed: 0,
    radius: BALL_RADIUS,
  },
  leftPaddle: {
    x: 20,
    y: BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    score: 0,
  },
  rightPaddle: {
    x: BASE_WIDTH - 20 - PADDLE_WIDTH,
    y: BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    score: 0,
  },
  matchWins: {
    player1: 0,
    player2: 0,
  },
  currentMatch: 1,
  gameStatus: "waiting",
  winner: null,
});

// Type for server updates buffer
interface ServerUpdate {
  state: any;
  timestamp: number;
}

interface RemotePongGameProps {
  gameId: string;
  userName: string;
  player1Name: string;
  player2Name: string;
  player1Avatar?: string;
  player2Avatar?: string;
  theme: GameTheme;
  difficulty: GameDifficulty;
  onBackToSetup: () => void;
  onConnectionError?: (error: string) => void;
}

const RemotePongGame: React.FC<RemotePongGameProps> = ({
  gameId,
  userName,
  player1Name,
  player2Name,
  player1Avatar = "https://iili.io/2D8ByIj.png",
  player2Avatar = "https://iili.io/2D8ByIj.png",
  theme,
  difficulty,
  onBackToSetup,
  onConnectionError,
}) => {
  const { toast } = useToast();
  
  // Game state reference
  const gameStateRef = useRef(createInitialGameState());
  
  // Track last server update timestamp
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Track disconnection time for timeout handling
  const disconnectionTimeRef = useRef<number | null>(null);
  
  // Store opponent's paddle position for interpolation
  const opponentPaddleRef = useRef({
    current: null as number | null,
    target: null as number | null,
    lastUpdateTime: 0,
    velocity: 0 // Track velocity for better prediction
  });
  
  // Buffer for server updates to smooth out inconsistencies
  const serverUpdatesRef = useRef<ServerUpdate[]>([]);
  
  // Store previous ball positions for trails and prediction
  const previousBallPositionsRef = useRef<{x: number, y: number}[]>([]);
  
  // Track server/client clock difference for better synchronization
  const clockDifferenceRef = useRef<number>(0);
  
  // Connection state
  const [connectionState, setConnectionState] = useState({
    connected: false,
    connecting: true,
    playerNumber: null as number | null,
    ping: 0,
    reconnectAttempt: 0,
  });

  // WebSocket connection ref
  const connectionRef = useRef<GameConnection | null>(null);
  
  // Keyboard state for local paddle control
  const [keysPressed, setKeysPressed] = useState<KeyStates>({});
  const keysPressedRef = useRef<KeyStates>({});
  
  // Animation for score changes
  const [scoreAnimation, setScoreAnimation] = useState({
    player1: false,
    player2: false,
  });
  
  // Store server's version of game state for comparison
  const serverStateRef = useRef(createInitialGameState());
  
  // Frame counter for performance tracking
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(Date.now());
  const [fps, setFps] = useState<number>(0);
  
  // Visual smoothing settings
  const [visualSmoothingEnabled, setVisualSmoothingEnabled] = useState<boolean>(true);
  
  // Flag to indicate if we've had a recent score (used to reset prediction)
  const recentScoreRef = useRef<boolean>(false);
  
  // Adaptive interpolation speed based on ping
  const getInterpolationSpeed = () => {
    const basePing = connectionState.ping || 50; // Default to 50ms if ping is unknown
    
    // Calculate adaptive speed: faster for low ping, slower for high ping
    // Clamp between min and max values
    const adaptiveSpeed = Math.max(
      MIN_INTERPOLATION_SPEED,
      Math.min(
        MAX_INTERPOLATION_SPEED,
        PADDLE_INTERPOLATION_SPEED * (50 / Math.max(10, basePing))
      )
    );
    
    return adaptiveSpeed;
  };
  
  // Sync keys pressed to ref
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);
  
    // Get the access token from cookies
    const getAccessToken = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; accessToken=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return "";
    };

  // Setup WebSocket connection
  useEffect(() => {
    // Get authentication token
    const token = getAccessToken() || 'anonymous';
    
    // Initialize connection
    const gameConnection = new GameConnection(
      gameId,
      token,
      handleGameState,
      handleStatusChange,
      handleConnectionChange,
      handlePlayerNumber
    );
    
    connectionRef.current = gameConnection;
    gameConnection.connect();
    
    // Connection timeout check
    const connectionCheckInterval = setInterval(() => {
      // If disconnected, check timeout
      if (disconnectionTimeRef.current !== null) {
        const disconnectionDuration = Date.now() - disconnectionTimeRef.current;
        
        // If disconnected for too long, end the game
        if (disconnectionDuration > CONNECTION_TIMEOUT) {
          clearInterval(connectionCheckInterval);
          
          // Update connection state
          setConnectionState(prev => ({
            ...prev,
            connecting: false,
          }));
          
          // Notify parent component
          if (onConnectionError) {
            onConnectionError("Connection timed out. The game has ended.");
          }
          
          // Show toast
          toast({
            title: "Connection Lost",
            description: "Failed to reconnect within the time limit. The game has ended.",
            variant: "destructive",
          });
        }
      }
    }, 1000);
    
    // Setup FPS counter
    const fpsInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastFpsUpdateRef.current;
      if (elapsed > 1000) { // Update FPS every second
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(connectionCheckInterval);
      clearInterval(fpsInterval);
      
      if (connectionRef.current) {
        connectionRef.current.disconnect();
        connectionRef.current = null;
      }
    };
  }, [gameId, toast, onConnectionError]);
  
  // Handler for game state updates from server
  const handleGameState = (serverState: any) => {
    // Reset reconnection state if we're receiving updates
    disconnectionTimeRef.current = null;
    
    // Update server/client clock difference
    const serverTime = serverState.timestamp || Date.now();
    clockDifferenceRef.current = Date.now() - serverTime;
    
    // Add to server updates buffer
    serverUpdatesRef.current.push({
      state: serverState,
      timestamp: Date.now()
    });
    
    // Keep buffer at desired size
    if (serverUpdatesRef.current.length > SERVER_UPDATE_BUFFER_SIZE) {
      serverUpdatesRef.current.shift();
    }
    
    // Process the latest update immediately if this is the first one or after a score
    if (serverUpdatesRef.current.length === 1 || recentScoreRef.current) {
      processServerUpdate(serverState);
      recentScoreRef.current = false;
    } else {
      // Otherwise use buffered updates to smooth transitions
      processBufferedUpdates();
    }
    
    // Update last update timestamp
    lastUpdateTimeRef.current = Date.now();
  };
  
  // Process all buffered updates to get a smoothed state
  const processBufferedUpdates = () => {
    if (serverUpdatesRef.current.length === 0) return;
    
    // Get the latest update
    const latestUpdate = serverUpdatesRef.current[serverUpdatesRef.current.length - 1];
    
    // Process it
    processServerUpdate(latestUpdate.state);
  };
  
  // Process a single server update
  const processServerUpdate = (serverState: any) => {
    // Store server state for reference
    serverStateRef.current = {
      ball: {
        x: serverState.ball.x,
        y: serverState.ball.y,
        dx: serverState.ball.dx,
        dy: serverState.ball.dy,
        speed: serverState.ball.speed,
        radius: serverState.ball.radius || BALL_RADIUS,
      },
      leftPaddle: {
        x: serverState.left_paddle.x,
        y: serverState.left_paddle.y,
        width: serverState.left_paddle.width || PADDLE_WIDTH,
        height: serverState.left_paddle.height || PADDLE_HEIGHT,
        speed: serverState.left_paddle.speed || PADDLE_SPEED,
        score: serverState.left_paddle.score,
      },
      rightPaddle: {
        x: serverState.right_paddle.x,
        y: serverState.right_paddle.y,
        width: serverState.right_paddle.width || PADDLE_WIDTH,
        height: serverState.right_paddle.height || PADDLE_HEIGHT,
        speed: serverState.right_paddle.speed || PADDLE_SPEED,
        score: serverState.right_paddle.score,
      },
      matchWins: {
        player1: serverState.match_wins.player1,
        player2: serverState.match_wins.player2,
      },
      currentMatch: serverState.current_match,
      gameStatus: serverState.game_status,
      winner: serverState.winner,
    };
    
    // Check for score changes to trigger animations
    if (gameStateRef.current.leftPaddle.score !== serverState.left_paddle.score) {
      if (serverState.left_paddle.score > gameStateRef.current.leftPaddle.score) {
        setScoreAnimation(prev => ({ ...prev, player1: true }));
        setTimeout(() => setScoreAnimation(prev => ({ ...prev, player1: false })), 1000);
        recentScoreRef.current = true;
        
        // Reset ball prediction after scoring
        previousBallPositionsRef.current = [];
      }
    }
    
    if (gameStateRef.current.rightPaddle.score !== serverState.right_paddle.score) {
      if (serverState.right_paddle.score > gameStateRef.current.rightPaddle.score) {
        setScoreAnimation(prev => ({ ...prev, player2: true }));
        setTimeout(() => setScoreAnimation(prev => ({ ...prev, player2: false })), 1000);
        recentScoreRef.current = true;
        
        // Reset ball prediction after scoring
        previousBallPositionsRef.current = [];
      }
    }
    
    // Determine which paddle you control and which is the opponent's
    const controlledPaddleKey = connectionState.playerNumber === 1 
      ? 'leftPaddle' 
      : (connectionState.playerNumber === 2 ? 'rightPaddle' : null);
      
    const opponentPaddleKey = connectionState.playerNumber === 1 
      ? 'rightPaddle' 
      : (connectionState.playerNumber === 2 ? 'leftPaddle' : null);
    
    // Store the current position of your paddle before updating
    const myCurrentPaddleY = 
      controlledPaddleKey && gameStateRef.current[controlledPaddleKey] 
        ? gameStateRef.current[controlledPaddleKey].y 
        : null;
    
    // Get server's version of your paddle position
    const serverPaddleY = connectionState.playerNumber === 1
      ? serverState.left_paddle.y
      : (connectionState.playerNumber === 2 ? serverState.right_paddle.y : null);
    
    // Check paddle divergence to decide whether to use local or server position
    let useLocalPaddleY = true;
    if (myCurrentPaddleY !== null && serverPaddleY !== null) {
      // If the difference is too large, snap to server position
      if (Math.abs(myCurrentPaddleY - serverPaddleY) > MAX_PADDLE_DIVERGENCE) {
        useLocalPaddleY = false; 
      }
    }
    
    // Update opponent paddle target for interpolation
    if (opponentPaddleKey) {
      const opponentY = connectionState.playerNumber === 1
        ? serverState.right_paddle.y
        : serverState.left_paddle.y;
      
      // Calculate opponent paddle velocity for better prediction
      const prevY = opponentPaddleRef.current.target || opponentY;
      const dy = opponentY - prevY;
      
      opponentPaddleRef.current = {
        current: opponentPaddleRef.current.target || opponentY,
        target: opponentY,
        lastUpdateTime: Date.now(),
        velocity: dy * 60 // Convert to units per second for consistent velocity calculation
      };
    }
    
    // Store previous ball position for trails and prediction refinement
    if (gameStateRef.current.ball) {
      previousBallPositionsRef.current.push({
        x: gameStateRef.current.ball.x, 
        y: gameStateRef.current.ball.y
      });
      
      // Keep the history limited to avoid memory issues
      if (previousBallPositionsRef.current.length > 10) {
        previousBallPositionsRef.current.shift();
      }
    }
    
    // Update game state with new ball data and controlled paddle position
    gameStateRef.current = {
      ball: {
        x: serverState.ball.x,
        y: serverState.ball.y,
        dx: serverState.ball.dx,
        dy: serverState.ball.dy,
        speed: serverState.ball.speed,
        radius: serverState.ball.radius || BALL_RADIUS,
      },
      leftPaddle: {
        x: serverState.left_paddle.x,
        // Only preserve your own paddle position if you're player 1
        y: (connectionState.playerNumber === 1 && myCurrentPaddleY !== null && useLocalPaddleY)
           ? myCurrentPaddleY  // Keep your own paddle position
           : serverState.left_paddle.y,  // Use server position for opponent
        width: serverState.left_paddle.width || PADDLE_WIDTH,
        height: serverState.left_paddle.height || PADDLE_HEIGHT,
        speed: serverState.left_paddle.speed || PADDLE_SPEED,
        score: serverState.left_paddle.score,
      },
      rightPaddle: {
        x: serverState.right_paddle.x,
        // Only preserve your own paddle position if you're player 2
        y: (connectionState.playerNumber === 2 && myCurrentPaddleY !== null && useLocalPaddleY)
           ? myCurrentPaddleY  // Keep your own paddle position
           : serverState.right_paddle.y,  // Use server position for opponent
        width: serverState.right_paddle.width || PADDLE_WIDTH,
        height: serverState.right_paddle.height || PADDLE_HEIGHT,
        speed: serverState.right_paddle.speed || PADDLE_SPEED,
        score: serverState.right_paddle.score,
      },
      matchWins: {
        player1: serverState.match_wins.player1,
        player2: serverState.match_wins.player2,
      },
      currentMatch: serverState.current_match,
      gameStatus: serverState.game_status,
      winner: serverState.winner,
    };
  };
  
  // Handle game status changes from server
  const handleStatusChange = (status: string, reason?: string) => {
    if (status === 'gameOver') {
      toast({
        title: "Game Over",
        description: `${gameStateRef.current.winner === 'player1' ? player1Name : player2Name} wins the game!`,
        variant: "default",
      });
    } else if (status === 'matchOver') {
      toast({
        title: "Match Over",
        description: `${gameStateRef.current.winner === 'player1' ? player1Name : player2Name} wins the match!`,
        variant: "default",
      });
    } else if (status === 'paused' && reason) {
      toast({
        title: "Game Paused",
        description: reason,
        variant: "default",
      });
    }
  };
  
  // Handle connection status changes
  const handleConnectionChange = (connected: boolean) => {
    setConnectionState(prev => ({ 
      ...prev, 
      connected,
      connecting: connected ? false : true,
      reconnectAttempt: connected ? 0 : prev.reconnectAttempt + 1
    }));
    
    if (connected) {
      // Reset disconnection timer
      disconnectionTimeRef.current = null;
      
      toast({
        title: "Connected",
        description: "Connected to game server",
        variant: "default",
      });
    } else {
      // Start disconnection timer
      disconnectionTimeRef.current = Date.now();
      
      toast({
        title: "Disconnected",
        description: "Lost connection to game server. Attempting to reconnect...",
        variant: "destructive",
      });
    }
  };
  
  // Handle player number assignment
  const handlePlayerNumber = (playerNumber: number) => {
    setConnectionState(prev => ({ ...prev, playerNumber }));
    
    toast({
      title: "Player Assignment",
      description: `You are Player ${playerNumber}`,
      variant: "default",
    });
  };
  
  // Update position of our paddle based on key presses
  const updatePaddlePosition = () => {
    // Determine which paddle we control
    const controlledPaddleKey = connectionState.playerNumber === 1 
      ? 'leftPaddle' 
      : (connectionState.playerNumber === 2 ? 'rightPaddle' : null);
    
    if (!controlledPaddleKey || !connectionRef.current?.isConnected()) return;
    
    const paddle = gameStateRef.current[controlledPaddleKey];
    const keys = keysPressedRef.current;
    
    let newY = paddle.y;
    
    // Handle paddle movement based on player number
    if (connectionState.playerNumber === 1) {
      // Player 1: W/S keys
      if (keys["w"] && paddle.y > 0) {
        newY = Math.max(0, paddle.y - paddle.speed);
      }
      if (keys["s"] && paddle.y + paddle.height < BASE_HEIGHT) {
        newY = Math.min(BASE_HEIGHT - paddle.height, paddle.y + paddle.speed);
      }
    } else if (connectionState.playerNumber === 2) {
      // Player 2: Arrow keys
      if (keys["ArrowUp"] && paddle.y > 0) {
        newY = Math.max(0, paddle.y - paddle.speed);
      }
      if (keys["ArrowDown"] && paddle.y + paddle.height < BASE_HEIGHT) {
        newY = Math.min(BASE_HEIGHT - paddle.height, paddle.y + paddle.speed);
      }
    }
    
    // Only update if position changed
    if (newY !== paddle.y) {
      // Update local state immediately for responsive feel
      gameStateRef.current[controlledPaddleKey].y = newY;
      
      // Send update to server
      connectionRef.current.sendPaddleMove(newY);
    }
  };
  
  // Smoothly interpolate opponent's paddle position
  const updateOpponentPaddle = () => {
    // Determine which paddle is the opponent's
    const opponentPaddleKey = connectionState.playerNumber === 1 
      ? 'rightPaddle' 
      : (connectionState.playerNumber === 2 ? 'leftPaddle' : null);
    
    if (!opponentPaddleKey || !opponentPaddleRef.current.target) return;
    
    const elapsed = (Date.now() - opponentPaddleRef.current.lastUpdateTime) / 1000;
    
    // Use adaptive interpolation speed based on ping
    const adaptiveSpeed = getInterpolationSpeed();
    const progress = Math.min(1, elapsed / adaptiveSpeed);
    
    const startY = opponentPaddleRef.current.current;
    const targetY = opponentPaddleRef.current.target;
    
    if (startY !== null && targetY !== null) {
      // Calculate new interpolated position
      const newY = startY + (targetY - startY) * progress;
      
      // Add velocity prediction for smoother movement
      const velocityPrediction = opponentPaddleRef.current.velocity * elapsed * 0.5;
      const predictedY = newY + velocityPrediction;
      
      // Clamp to valid range
      const finalY = Math.max(0, Math.min(BASE_HEIGHT - PADDLE_HEIGHT, predictedY));
      
      // Update the opponent's paddle position with interpolated value
      if (gameStateRef.current[opponentPaddleKey]) {
        gameStateRef.current[opponentPaddleKey].y = finalY;
      }
      
      // Update current value for next frame
      if (progress >= 1) {
        opponentPaddleRef.current.current = targetY;
      } else {
        opponentPaddleRef.current.current = newY;
      }
    }
  };
  
  // Enhanced ball movement prediction
  const predictBallMovement = () => {
    if (gameStateRef.current.gameStatus !== 'playing') return;
    
    const timeSinceUpdate = (Date.now() - lastUpdateTimeRef.current) / 1000; // seconds
    const ball = gameStateRef.current.ball;
    
    // Only predict if we have velocity data
    if (ball.dx === 0 && ball.dy === 0) return;
    
    // Use a slightly higher prediction factor for extrapolation
    const predictedX = ball.x + ball.dx * timeSinceUpdate * 60 * BALL_EXTRAPOLATION_FACTOR;
    const predictedY = ball.y + ball.dy * timeSinceUpdate * 60 * BALL_EXTRAPOLATION_FACTOR;
    
    // Store original positions for collision detection
    const originalX = ball.x;
    const originalY = ball.y;
    
    // Update ball position
    ball.x = predictedX;
    ball.y = predictedY;
    
    // Enhanced collision detection
    handleAdvancedBallCollisions(ball, originalX, originalY);
  };
  
  // Advanced collision detection for the ball
  const handleAdvancedBallCollisions = (ball: any, originalX: number, originalY: number) => {
    // Check for wall collisions (top/bottom)
    if (ball.y + ball.radius >= BASE_HEIGHT) {
      if (ball.dy > 0) {
        ball.dy = -ball.dy;
        // Add slight randomness to prevent looping patterns
        ball.dy += (Math.random() - 0.5) * 0.2;
      }
      // Correct position to avoid sticking to the wall
      ball.y = BASE_HEIGHT - ball.radius;
    }
    
    if (ball.y - ball.radius <= 0) {
      if (ball.dy < 0) {
        ball.dy = -ball.dy;
        // Add slight randomness to prevent looping patterns
        ball.dy += (Math.random() - 0.5) * 0.2;
      }
      // Correct position to avoid sticking to the wall
      ball.y = ball.radius;
    }
    
    // We don't predict paddle collisions here - they're handled by the server
    // But we do prevent the ball from going through paddles visually
    
    const leftPaddle = gameStateRef.current.leftPaddle;
    const rightPaddle = gameStateRef.current.rightPaddle;
    
    // Basic visual paddle collision correction (not affecting game logic)
    // This just prevents the ball from visually passing through a paddle
    
    // Left paddle visual collision
    if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        originalX - ball.radius >= leftPaddle.x + leftPaddle.width &&
        ball.y + ball.radius > leftPaddle.y &&
        ball.y - ball.radius < leftPaddle.y + leftPaddle.height) {
      // Just correct the visual position
      ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    }
    
    // Right paddle visual collision
    if (ball.x + ball.radius > rightPaddle.x &&
        originalX + ball.radius <= rightPaddle.x &&
        ball.y + ball.radius > rightPaddle.y &&
        ball.y - ball.radius < rightPaddle.y + rightPaddle.height) {
      // Just correct the visual position
      ball.x = rightPaddle.x - ball.radius;
    }
    
    // Detect if the ball has gone off-screen and reset its position
    // This is just for visual purposes, the actual scoring is handled by the server
    if (ball.x + ball.radius < 0 || ball.x - ball.radius > BASE_WIDTH) {
      // Don't reset here - wait for server to send the new position
      // This prevents visual glitches when scoring
      
      // Instead, slow down the prediction for smoother visualization
      ball.dx *= 0.5;
      ball.dy *= 0.5;
    }
  };
  
  // Update game state locally between server updates
  const updateGameState = () => {
    // Increment frame counter for FPS calculation
    frameCountRef.current++;
    
    // Only run updates if connected
    if (!connectionState.connected) return;
    
    // Update our paddle based on input
    updatePaddlePosition();
    
    // Update opponent's paddle with interpolation
    updateOpponentPaddle();
    
    // Predict ball movement between server updates
    if (visualSmoothingEnabled) {
      predictBallMovement();
    }
  };
  
  // Get ball trail positions for visual smoothing
  const getBallTrailPositions = () => {
    if (!visualSmoothingEnabled || previousBallPositionsRef.current.length === 0) {
      return [];
    }
    
    // Return the last few positions for the trail effect
    return previousBallPositionsRef.current.slice(-5);
  };
  
  // Setup keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (["w", "s", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
      
      // Toggle visual smoothing with 'v' key
      if (e.key === "v" && !e.repeat) {
        setVisualSmoothingEnabled(prev => !prev);
        toast({
          title: "Visual Smoothing",
          description: `${!visualSmoothingEnabled ? "Enabled" : "Disabled"}`,
          variant: "default",
        });
      }
      
      // Start game on key press if on menu
      if (gameStateRef.current.gameStatus === 'menu' && !e.repeat) {
        connectionRef.current?.startGame();
      }
      
      // Pause/unpause on Space
      if (e.key === " " && !e.repeat) {
        connectionRef.current?.togglePause();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [visualSmoothingEnabled, toast]);
  
  // Canvas click handler for game controls
  const handleCanvasClick = () => {
    if (!connectionRef.current) return;
    
    const currentStatus = gameStateRef.current.gameStatus;
    
    if (currentStatus === 'gameOver') {
      connectionRef.current.restartGame();
    } else if (currentStatus === 'matchOver') {
      connectionRef.current.nextMatch();
    } else if (currentStatus === 'menu') {
      connectionRef.current.startGame();
    }
  };
  
  // Handle manual reconnect attempt
  const handleManualReconnect = () => {
    if (connectionRef.current) {
      setConnectionState(prev => ({
        ...prev,
        connecting: true,
      }));
      
      toast({
        title: "Reconnecting",
        description: "Attempting to reconnect to the game server...",
        variant: "default",
      });
      
      connectionRef.current.connect();
    }
  };
  
  // Toggle visual smoothing
  const toggleVisualSmoothing = () => {
    setVisualSmoothingEnabled(prev => !prev);
    toast({
      title: "Visual Smoothing",
      description: `${!visualSmoothingEnabled ? "Enabled" : "Disabled"}`,
      variant: "default",
    });
  };
  
  // Render connection error overlay if needed
  const renderConnectionOverlay = () => {
    if (!connectionState.connected && !connectionState.connecting) {
      return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-black/90 border border-red-500 p-8 rounded-lg text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connection Lost</h2>
            <p className="text-gray-300 mb-6">
              We couldn't reconnect to the game server. The game has been terminated.
            </p>
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleManualReconnect}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={onBackToSetup}
                variant="outline"
                className="border-gray-700 text-gray-300"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (!connectionState.connected && connectionState.connecting) {
      return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-black/90 border border-yellow-500 p-8 rounded-lg text-center max-w-md">
            <div className="w-16 h-16 mb-4 mx-auto">
              <div className="w-full h-full rounded-full border-t-4 border-b-4 border-yellow-500 animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reconnecting...</h2>
            <p className="text-gray-300 mb-2">
              Attempting to reconnect to the game server.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Attempt {connectionState.reconnectAttempt} of 5. 
              Game will end after {Math.ceil((CONNECTION_TIMEOUT - (disconnectionTimeRef.current ? Date.now() - disconnectionTimeRef.current : 0)) / 1000)} seconds.
            </p>
            <Button
              onClick={onBackToSetup}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              Cancel and Return to Menu
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="relative w-full">
      {/* Connection status indicator */}
      <div className="mb-2 flex items-center justify-center gap-2">
        {connectionState.connected ? (
          <div className="flex items-center gap-2 bg-green-900/50 px-3 py-1 rounded-full text-green-400">
            <Wifi size={16} />
            <span>Connected</span>
            {connectionState.ping > 0 && (
              <span className="text-xs opacity-75">({connectionState.ping}ms)</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded-full text-red-400 animate-pulse">
            <WifiOff size={16} />
            <span>Disconnected</span>
          </div>
        )}
        
        {connectionState.playerNumber && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            connectionState.playerNumber === 1 
              ? 'bg-blue-900/50 text-blue-400' 
              : 'bg-red-900/50 text-red-400'
          }`}>
            <span>Player {connectionState.playerNumber}</span>
          </div>
        )}
      </div>
      
      {/* Game renderer */}
      <div className="relative">
        <RemotePongRenderer
          BASE_WIDTH={BASE_WIDTH}
          BASE_HEIGHT={BASE_HEIGHT}
          PADDLE_WIDTH={PADDLE_WIDTH}
          PADDLE_HEIGHT={PADDLE_HEIGHT}
          BALL_RADIUS={BALL_RADIUS}
          PADDLE_SPEED={PADDLE_SPEED}
          POINTS_TO_WIN_MATCH={POINTS_TO_WIN_MATCH}
          MATCHES_TO_WIN_GAME={MATCHES_TO_WIN_GAME}
          gameStateRef={gameStateRef}
          updateGameState={updateGameState}
          setKeysPressed={setKeysPressed}
          scoreAnimation={scoreAnimation}
          player1Name={player1Name}
          player2Name={player2Name}
          theme={theme}
          difficulty={difficulty}
          onBackToSetup={onBackToSetup}
          player1Avatar={player1Avatar}
          player2Avatar={player2Avatar}
          onCanvasClick={handleCanvasClick}
        />
        
        {/* Connection overlay */}
        {renderConnectionOverlay()}
      </div>
    </div>
  );
};

export default RemotePongGame;