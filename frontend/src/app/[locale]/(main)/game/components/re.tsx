import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Waves, Flame } from "lucide-react";
import { GameDifficulty, GameTheme, KeyStates } from "../types/game";
import GameConnection from "@/lib/gameWebsocket";

// Fixed game dimensions (base dimensions)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_HEIGHT = 100;
const POINTS_TO_WIN_MATCH = 5;
const MATCHES_TO_WIN_GAME = 3;

// Theme-specific properties
const themeProperties = {
  fire: {
    color: "#D05F3B",
    glowColor: "rgba(208, 95, 59, 0.8)",
    borderRadius: "20px",
    ballColor: "#D05F3B",
    paddleColor: "#D05F3B",
    lineColor: "#D05F3B",
    shadowBlur: 25,
    textColor: "#D05F3B",
    background: "url('/assets/images/fire-game.png')",
  },
  water: {
    color: "#40CFB7",
    glowColor: "rgba(64, 207, 183, 0.8)",
    borderRadius: "20px",
    ballColor: "#40CFB7",
    paddleColor: "#40CFB7",
    lineColor: "#40CFB7",
    shadowBlur: 25,
    textColor: "#40CFB7",
    background: "url('/assets/images/water-game.png')",
  },
};

// Component props
interface RemotePongGameProps {
  gameId: string;
  userName: string;
  player1Name: string;
  player2Name: string;
  theme: GameTheme;
  difficulty: GameDifficulty;
  onBackToSetup: () => void;
  player1Avatar?: string;
  player2Avatar?: string;
}

const RemotePongGame: React.FC<RemotePongGameProps> = ({
  gameId,
  userName,
  player1Name,
  player2Name,
  theme,
  difficulty,
  onBackToSetup,
  player1Avatar = "https://iili.io/2D8ByIj.png",
  player2Avatar = "https://iili.io/2D8ByIj.png",
}) => {
  // Canvas and refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const gameConnectionRef = useRef<GameConnection | null>(null);
  const mountedRef = useRef<boolean>(true);
  
  // Game state - split into separate state variables for better reactivity
  const [gameState, setGameState] = useState<any>(null);
  const gameStateRef = useRef<any>(null); // Reference for immediate access
  const [gameStatus, setGameStatus] = useState<"waiting" | "menu" | "playing" | "paused" | "matchOver" | "gameOver">("waiting");
  const [matchWins, setMatchWins] = useState({ player1: 0, player2: 0 });
  const [currentMatch, setCurrentMatch] = useState(1);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  // UI state
  const [scoreAnimation, setScoreAnimation] = useState({
    player1: false,
    player2: false,
  });
  
  // Scaling state for responsive canvas
  const [scale, setScale] = useState<number>(1);
  const [canvasWidth, setCanvasWidth] = useState<number>(BASE_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(BASE_HEIGHT);
  
  // Keyboard controls state
  const [keysPressed, setKeysPressed] = useState<KeyStates>({});
  const keysPressedRef = useRef<KeyStates>({});
  
  // Connection status display
  const [connectionMessage, setConnectionMessage] = useState("Connecting to game server...");
  
  // Get the access token from cookies
  const getAccessToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; accessToken=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return "";
  };
  
  // Sync key press state to ref
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);

  // Set up game connection - only once when component mounts
  useEffect(() => {
    if (!gameId) {
      console.error("RemotePongGame: No gameId provided!");
      return;
    }

    console.log(`Attempting to connect to game ${gameId}...`);
    
    mountedRef.current = true;
    
    const token = getAccessToken();
    if (!token) {
      console.error('No access token found');
      setConnectionMessage("Authentication error. Please log in again.");
      return;
    }
    
    console.log(`Got token, creating game connection for game ${gameId}`);
    
    // Handle game state updates
    const handleGameState = (state: any) => {
      if (!mountedRef.current) return;
      
      // Validate the incoming state
      if (!state || typeof state !== 'object') {
        console.error("Received invalid game state:", state);
        return;
      }
      
      // Log state changes for debugging
      const oldStatus = gameStateRef.current?.game_status;
      const newStatus = state.game_status;
      
      if (oldStatus !== newStatus) {
        console.log(`Game status changing from ${oldStatus} to ${newStatus}`);
        // Update game status state immediately when it changes
        setGameStatus(newStatus);
      }
      
      // Update match info
      if (state.match_wins && state.current_match) {
        setMatchWins(state.match_wins);
        setCurrentMatch(state.current_match);
      }
      
      // Track if scores changed for animation
      if (gameStateRef.current) {
        if (state.left_paddle && gameStateRef.current.left_paddle && 
            state.left_paddle.score > gameStateRef.current.left_paddle.score) {
          setScoreAnimation(prev => ({ ...prev, player1: true }));
          setTimeout(() => {
            if (mountedRef.current) {
              setScoreAnimation(prev => ({ ...prev, player1: false }));
            }
          }, 1000);
        }
        if (state.right_paddle && gameStateRef.current.right_paddle && 
            state.right_paddle.score > gameStateRef.current.right_paddle.score) {
          setScoreAnimation(prev => ({ ...prev, player2: true }));
          setTimeout(() => {
            if (mountedRef.current) {
              setScoreAnimation(prev => ({ ...prev, player2: false }));
            }
          }, 1000);
        }
      }
      
      // Update the state ref first for immediate access
      gameStateRef.current = state;
      
      // Then update the React state
      setGameState(state);
    };
    
    // Handle game status changes
    const handleStatusChange = (status: string, reason?: string) => {
      console.log(`EXPLICIT STATUS CHANGE: Game status changed to ${status}${reason ? `: ${reason}` : ''}`);
      
      // Force the status update
      setGameStatus(status as "waiting" | "menu" | "playing" | "matchOver" | "gameOver");
      
      // Handle specific status changes
      if (status === 'menu' && gameStatus === 'waiting') {
        setConnectionMessage("Both players connected. Click to start the game!");
      } else if (status === 'playing') {
        setConnectionMessage("Game in progress");
      } else if (status === 'matchOver') {
        setConnectionMessage("Match complete! Click to continue.");
      } else if (status === 'gameOver') {
        setConnectionMessage("Game over! Click to play again.");
      }
    };
    
    // Handle connection changes
    const handleConnectionChange = (isConnected: boolean) => {
      if (!mountedRef.current) return;
      
      setConnected(isConnected);
      if (isConnected) {
        setConnectionMessage("Connected to game server");
      } else {
        setConnectionMessage("Disconnected from game server. Attempting to reconnect...");
      }
    };
    
    // Handle player number assignment
    const handlePlayerNumber = (number: number) => {
      if (!mountedRef.current) return;
      
      console.log(`You are Player ${number} (${number === 1 ? player1Name : player2Name})`);
      setPlayerNumber(number);
      setConnectionMessage(`You are Player ${number}: ${number === 1 ? player1Name : player2Name}`);
    };
    
    // Create game connection
    console.log("Creating new game connection");
    const gameConnection = new GameConnection(
      gameId,
      token,
      handleGameState,
      handleStatusChange,
      handleConnectionChange,
      handlePlayerNumber
    );
    
    // Store reference and connect
    gameConnectionRef.current = gameConnection;
    gameConnection.connect();
    
    // Cleanup on unmount
    return () => {
      console.log("Cleaning up game connection");
      mountedRef.current = false;
      
      if (gameConnectionRef.current) {
        gameConnectionRef.current.disconnect();
        gameConnectionRef.current = null;
      }
      
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [gameId, player1Name, player2Name]); // Include gameStatus for correct message updates //bring me here
  
  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Calculate scale while maintaining aspect ratio
        const newScale = Math.min(1, containerWidth / BASE_WIDTH);
        
        setScale(newScale);
        setCanvasWidth(BASE_WIDTH * newScale);
        setCanvasHeight(BASE_HEIGHT * newScale);
      }
    };
    
    // Initial call
    handleResize();
    
    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for game keys
      if (["w", "s", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
      
      setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
      
      
      // Start game if in menu state
      if (gameStatus === "menu" && !e.repeat && gameConnectionRef.current) {
        console.log("Key pressed in menu state, starting game...");
        gameConnectionRef.current.startGame();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };
    
    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStatus]);
  
  // Handle canvas click
  const handleCanvasClick = () => {
    if (!gameConnectionRef.current) return;
    
    console.log("Canvas clicked. Current gameStatus:", gameStatus);
    
    if (gameStatus === "menu") {
      console.log("Starting game...");
      gameConnectionRef.current.startGame();
    } else if (gameStatus === "matchOver") {
      console.log("Moving to next match...");
      gameConnectionRef.current.nextMatch();
    } else if (gameStatus === "gameOver") {
      console.log("Restarting game...");
      gameConnectionRef.current.restartGame();
    } else {
      console.log("Click registered but no action taken for current state:", gameStatus);
    }
  };
  
  // Process keyboard input for paddle movement
  useEffect(() => {
    if (!connected || !gameState || !gameConnectionRef.current || playerNumber === null) {
      return;
    }
    
    // Only process input when game is actually playing
    if (gameStatus !== 'playing') {
      return;
    }
    
    // Start animation loop for paddle movement
    let lastPaddleY: number | null = null;
    
    const processInput = () => {
      if (!gameState || playerNumber === null) return;
      
      // Determine which keys to use based on player number
      const upKey = playerNumber === 1 ? 'w' : 'ArrowUp';
      const downKey = playerNumber === 1 ? 's' : 'ArrowDown';
      
      // Get current paddle position
      const paddleKey = playerNumber === 1 ? 'left_paddle' : 'right_paddle';
      let paddleY = gameState[paddleKey].y;
      const paddleSpeed = gameState[paddleKey].speed;
      
      // Process movement
      let moved = false;
      
      if (keysPressedRef.current[upKey] && paddleY > 0) {
        paddleY = Math.max(0, paddleY - paddleSpeed);
        moved = true;
      }
      
      if (keysPressedRef.current[downKey] && paddleY + PADDLE_HEIGHT < BASE_HEIGHT) {
        paddleY = Math.min(BASE_HEIGHT - PADDLE_HEIGHT, paddleY + paddleSpeed);
        moved = true;
      }
    
      // Only send update if position changed
      if (moved) {
        lastPaddleY = paddleY;
        gameConnectionRef!.current!.sendPaddleMove(paddleY);
      }
      
      requestIdRef.current = requestAnimationFrame(processInput);
    };
    
    // Start processing input
    requestIdRef.current = requestAnimationFrame(processInput);
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [connected, playerNumber, gameStatus, gameState]);
  
  // Render game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    console.log("Canvas render effect triggered. Game status:", gameStatus);
    
    // Apply scaling to maintain aspect ratio
    context.setTransform(scale, 0, 0, scale, 0, 0);
    
    // Get theme properties
    const themeProps = themeProperties[theme];
    
    // Render game based on state
    const renderFrame = () => {
      // Clear canvas
      context.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      // Fill with black background
      context.fillStyle = "black";
      context.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      // If game state exists, render it
      if (gameState) {
        // Use our single status source
        renderGame(context, themeProps);
      } else {
        // Draw connecting screen if no game state yet
        drawConnectingScreen(context, themeProps);
      }
      
      // Request next frame
      requestIdRef.current = requestAnimationFrame(renderFrame);
    };
    
    // Start rendering (call only once)
    requestIdRef.current = requestAnimationFrame(renderFrame);
    
    // Cleanup
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [gameState, scale, gameStatus]);
  
  // Toggle pause
  const togglePause = () => {
    if (gameConnectionRef.current) {
      gameConnectionRef.current.togglePause();
    }
  };
  
  // Connecting screen when waiting for game state
  const drawConnectingScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONNECTING', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
    ctx.font = '24px Arial';
    ctx.fillText(connectionMessage, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Draw loading animation
    const time = Date.now() / 1000;
    const numDots = 3;
    const dotSize = 10;
    const spacing = 20;
    const centerX = BASE_WIDTH / 2;
    const centerY = BASE_HEIGHT * 0.7;
    
    for (let i = 0; i < numDots; i++) {
      const x = centerX + (i - (numDots - 1) / 2) * spacing;
      const y = centerY + Math.sin(time * 4 + i) * 10;
      
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // Render the game state
  const renderGame = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    if (!gameState) return;
    
    const { ball, left_paddle, right_paddle } = gameState;
    
    // Clear canvas
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
    // Fill background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
    // Draw table border with glow
    ctx.save();
    ctx.strokeStyle = themeProps.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH - 4, BASE_HEIGHT - 4, 20);
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();
    ctx.restore();
    
    // Draw center line
    ctx.save();
    ctx.strokeStyle = themeProps.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.setLineDash([15, 15]);
    ctx.moveTo(BASE_WIDTH / 2, 0);
    ctx.lineTo(BASE_WIDTH / 2, BASE_HEIGHT);
    ctx.stroke();
    ctx.restore();
    
    // Draw paddles
    ctx.save();
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 10;
    
    // Left paddle
    ctx.beginPath();
    ctx.roundRect(
      left_paddle.x,
      left_paddle.y,
      left_paddle.width,
      left_paddle.height,
      5
    );
    ctx.fill();
    
    // Right paddle
    ctx.beginPath();
    ctx.roundRect(
      right_paddle.x,
      right_paddle.y,
      right_paddle.width,
      right_paddle.height,
      5
    );
    ctx.fill();
    ctx.restore();
    
    // Draw ball
    if (ball) {
      ctx.save();
      ctx.fillStyle = themeProps.color;
      ctx.shadowColor = themeProps.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw scores
    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 5;
    ctx.textAlign = "left";
    ctx.fillText(`Points: ${left_paddle.score}`, 20, BASE_HEIGHT - 20);
    ctx.textAlign = "right";
    ctx.fillText(
      `Points: ${right_paddle.score}`,
      BASE_WIDTH - 20,
      BASE_HEIGHT - 20
    );
    ctx.restore();
    
    // Log game status before drawing overlays
    console.log("Drawing game with status:", gameStatus);
    
    // Draw game status overlays using component state instead of gameState
    if (gameStatus === "menu") {
      drawMenuScreen(ctx, themeProps);
    } else if (gameStatus === "paused") {
      drawPauseScreen(ctx, themeProps);
    } else if (gameStatus === "matchOver") {
      drawMatchOverScreen(ctx, themeProps);
    } else if (gameStatus === "gameOver") {
      drawGameOverScreen(ctx, themeProps);
    } else if (gameStatus === "waiting") {
      drawWaitingScreen(ctx, themeProps);
    }
  };
  
  // Draw waiting screen (both players not yet connected)
  const drawWaitingScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WAITING FOR PLAYERS', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
    ctx.font = '24px Arial';
    ctx.fillText('Players connecting...', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText(connectionMessage, BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    
    ctx.restore();
  };
  
  // Draw menu screen
  const drawMenuScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    if (!gameState) return;
    console.log("Drawing menu screen");
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PONG ARCADIA', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`MATCH ${currentMatch} OF 5`, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText('Click or press any key to start', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 10);
    
    // Player instructions based on assigned player number
    ctx.shadowBlur = 5;
    ctx.font = '18px Arial';

    // Display the correct controls based on player number
    ctx.fillText(`You (${player1Name == userName ? player1Name : player2Name}): W/S keys`, BASE_WIDTH / 4, BASE_HEIGHT * 0.7);
    ctx.fillText(`Opponent (${player1Name == userName ? player2Name : player1Name}): Arrow Up/Down`, (BASE_WIDTH / 4) * 3, BASE_HEIGHT * 0.7);

    
    ctx.fillText('Press Space to pause', BASE_WIDTH / 2, BASE_HEIGHT * 0.8);
    ctx.restore();
  };
  
  // Draw pause screen
  const drawPauseScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Check if both players are connected
    if (gameState && (!gameState.players.player1.connected || !gameState.players.player2.connected)) {
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Waiting for opponent to reconnect...', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
    } else {
      ctx.shadowBlur = 5;
      ctx.font = '20px Arial';
      ctx.fillText('Press Space to continue', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 50);
    }
    
    ctx.restore();
  };
  
  // Draw match over screen
  const drawMatchOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    if (!gameState) return;
    
    const { winner } = gameState;
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    if (winner === 'player1') {
      ctx.fillText(`${player1Name} WINS MATCH ${currentMatch}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    } else if (winner === 'player2') {
      ctx.fillText(`${player2Name} WINS MATCH ${currentMatch}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    }
    
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`MATCH SCORE: ${matchWins.player1} - ${matchWins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    ctx.shadowBlur = 5;
    ctx.font = '20px Arial';
    ctx.fillText('Click to continue to next match', BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    ctx.restore();
  };
  
  // Draw game over screen
  const drawGameOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    if (!gameState) return;
    
    const { winner } = gameState;
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    if (winner === 'player1') {
      ctx.fillText(`${player1Name} WINS THE GAME!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    } else if (winner === 'player2') {
      ctx.fillText(`${player2Name} WINS THE GAME!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    }
    
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`FINAL SCORE: ${matchWins.player1} - ${matchWins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    ctx.shadowBlur = 5;
    ctx.font = '20px Arial';
    ctx.fillText('Click to play again', BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    ctx.restore();
  };
  
  // Render match win streaks with enhanced visuals
  // Render match win streaks with enhanced visuals
const renderMatchWinStreaks = (playerNumber: 1 | 2, wins: number) => {
  const maxWins = MATCHES_TO_WIN_GAME;
  const streaks = [];
  const IconComponent = theme === 'fire' ? Flame : Waves;

  for (let i = 0; i < maxWins; i++) {
    const isActive = i < wins;
    
    streaks.push(
      <div
        key={`p${playerNumber}-streak-${i}`}
        className={`relative ${isActive ? "opacity-100" : "opacity-30"}`}
      >
        <IconComponent
          size={24}
          className={`${
            isActive
              ? theme === 'fire' 
                ? "text-orange-500 drop-shadow-[0_0_5px_rgba(208,95,59,0.8)]" 
                : "text-teal-400 drop-shadow-[0_0_5px_rgba(64,207,183,0.8)]"
              : "text-gray-500"
          }`}
        />
      </div>
    );
  }

  return <div className="flex space-x-1">{streaks}</div>;
};


// Complete component UI
return (
  <div className="w-full flex flex-col items-center justify-center">
    {/* Connection status banner */}
    {!connected && (
      <div className="w-full max-w-[800px] mb-4 p-3 bg-red-500/80 text-white rounded-md text-center">
        Connection to game server lost. Attempting to reconnect...
      </div>
    )}
    
    {/* Control buttons */}
    <div className="mb-6 flex flex-wrap gap-4 justify-center">
      <Button
        onClick={onBackToSetup}
        className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
          theme === "fire"
            ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
            : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
        }`}
      >
        Back to Setup
      </Button>

      <Button
        onClick={togglePause}
        className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
          theme === "fire"
            ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
            : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
        }`}
        disabled={
          !gameState || 
          gameStatus === "menu" ||
          gameStatus === "matchOver" ||
          gameStatus === "gameOver" ||
          gameStatus === "waiting"
        }
      >
        {gameStatus === "paused" ? "Resume Game" : "Pause Game"}
      </Button>
    </div>

    {/* Game container */}
    <div className="relative w-full max-w-[800px]" ref={containerRef}>
      {/* Score display */}
      {gameState && (
        <div
          className={`mb-3 p-4 rounded-xl flex items-center justify-between ${
            theme === "fire"
              ? "bg-black/80 border-[#D05F3B]"
              : "bg-black/80 border-[#40CFB7]"
          } border-2`}
          style={{
            boxShadow:
              theme === "fire"
                ? "0 0 15px rgba(208,95,59,0.6)"
                : "0 0 15px rgba(64,207,183,0.6)",
          }}
        >
          {/* Player 1 - Left Side */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                theme === "fire" ? "border-[#D05F3B]" : "border-[#40CFB7]"
              }`}
            >
              <img
                src={player1Avatar}
                alt={player1Name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-lg ${
                  theme === "fire" ? "text-orange-200" : "text-teal-200"
                }`}
              >
                {player1Name}
                {player1Name === userName ? <span className="ml-2 text-xs bg-white/20 rounded px-1 py-0.5">You</span> : null}
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-3xl font-bold transition-all duration-300 ${
                    theme === "fire" ? "text-[#D05F3B]" : "text-[#40CFB7]"
                  } ${scoreAnimation.player1 ? "scale-150 animate-pulse" : ""}`}
                >
                  {gameState.left_paddle.score}
                </span>
                <div className="flex flex-col items-start">
                  <div className="flex">
                    {renderMatchWinStreaks(1, matchWins.player1)}
                  </div>
                  {matchWins.player1 > 0 && (
                    <span
                      className={`text-xs ${
                        theme === "fire" ? "text-orange-300" : "text-teal-300"
                      }`}
                    >
                      {matchWins.player1}{" "}
                      {matchWins.player1 === 1 ? "match" : "matches"}{" "}
                      won
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center section */}
          <div className="flex flex-col items-center">
            <div
              className={`text-xl font-bold mb-1 ${
                theme === "fire" ? "text-[#D05F3B]" : "text-[#40CFB7]"
              }`}
            >
              MATCH {currentMatch}
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 border border-white/20">
              <span className="text-white font-bold">VS</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              First to {POINTS_TO_WIN_MATCH} points
            </div>
          </div>

          {/* Player 2 - Right Side */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span
                className={`font-bold text-lg ${
                  theme === "fire" ? "text-orange-200" : "text-teal-200"
                }`}
              >
                {player2Name}
                {player2Name === userName ? <span className="ml-2 text-xs bg-white/20 rounded px-1 py-0.5">You</span> : null}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col items-end">
                  <div className="flex">
                    {renderMatchWinStreaks(2, matchWins.player2)}
                  </div>
                  {matchWins.player2 > 0 && (
                    <span
                      className={`text-xs ${
                        theme === "fire" ? "text-orange-300" : "text-teal-300"
                      }`}
                    >
                      {matchWins.player2}{" "}
                      {matchWins.player2 === 1 ? "match" : "matches"}{" "}
                      won
                    </span>
                  )}
                </div>
                <span
                  className={`text-3xl font-bold transition-all duration-300 ${
                    theme === "fire" ? "text-[#D05F3B]" : "text-[#40CFB7]"
                  } ${scoreAnimation.player2 ? "scale-150 animate-pulse" : ""}`}
                >
                  {gameState.right_paddle.score}
                </span>
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                theme === "fire" ? "border-[#D05F3B]" : "border-[#40CFB7]"
              }`}
            >
              <img
                src={player2Avatar}
                alt={player2Name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game board */}
      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          border:
            theme === "fire" ? "4px solid #D05F3B" : "4px solid #40CFB7",
          boxShadow:
            theme === "fire"
              ? "0 0 30px rgba(208,95,59,0.6)"
              : "0 0 30px rgba(64,207,183,0.6)",
          background: "black",
          margin: "0 auto",
          borderRadius: "30px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          onClick={handleCanvasClick}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        />
      </div>

      {/* Connection status */}
      {gameState && gameState.players && (
        <div className="mt-3 flex justify-between w-full">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              gameState.players.player1.connected ? "bg-green-500" : "bg-red-500"
            }`}></div>
            <span className="text-sm text-gray-300">{player1Name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-300">{player2Name}</span>
            <div className={`w-3 h-3 rounded-full ml-2 ${
              gameState.players.player2.connected ? "bg-green-500" : "bg-red-500"
            }`}></div>
          </div>
        </div>
      )}

      {/* Game info and controls help */}
      <div className="mt-4 flex flex-col items-center">
        <div
          className={`flex items-center justify-center gap-2 mb-2 ${
            theme === "fire" ? "text-orange-400" : "text-teal-400"
          }`}
        >
          <Trophy size={16} />
          <span className="font-medium">
            First to win {MATCHES_TO_WIN_GAME} matches wins the game!
          </span>
        </div>

        {/* Control instructions based on player number */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">W</kbd>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">S</kbd>
            <span className="text-white">- Player 1</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↑</kbd>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↓</kbd>
            <span>- Player 2</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Space</kbd>
            <span>- Pause</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default RemotePongGame;