// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import { Trophy, Waves, Flame, Shield } from "lucide-react";
// import { GameDifficulty, GameTheme, KeyStates } from "../types/game";
// import GameConnection from "@/lib/gameWebsocket";

// // Fixed game dimensions (base dimensions)
// const BASE_WIDTH = 800;
// const BASE_HEIGHT = 500;
// const PADDLE_WIDTH = 18;
// const PADDLE_HEIGHT = 100;
// const BALL_RADIUS = 10;
// const POINTS_TO_WIN_MATCH = 5;
// const MATCHES_TO_WIN_GAME = 3;

// // Theme-specific properties
// const themeProperties = {
//   fire: {
//     color: "#D05F3B",
//     glowColor: "rgba(208, 95, 59, 0.8)",
//     borderRadius: "20px",
//     ballColor: "#D05F3B",
//     paddleColor: "#D05F3B",
//     lineColor: "#D05F3B",
//     shadowBlur: 25,
//     textColor: "#D05F3B",
//     background: "url('/assets/images/fire-game.png')",
//   },
//   water: {
//     color: "#40CFB7",
//     glowColor: "rgba(64, 207, 183, 0.8)",
//     borderRadius: "20px",
//     ballColor: "#40CFB7",
//     paddleColor: "#40CFB7",
//     lineColor: "#40CFB7",
//     shadowBlur: 25,
//     textColor: "#40CFB7",
//     background: "url('/assets/images/water-game.png')",
//   },
// };

// // Component props
// interface RemotePongGameProps {
//   gameId: string;
//   userId: string;
//   player1Name: string;
//   player2Name: string;
//   theme: GameTheme;
//   difficulty: GameDifficulty;
//   onBackToSetup: () => void;
//   player1Avatar?: string;
//   player2Avatar?: string;
// }

// const RemotePongGame: React.FC<RemotePongGameProps> = ({
//   gameId,
//   userId,
//   player1Name,
//   player2Name,
//   theme,
//   difficulty,
//   onBackToSetup,
//   player1Avatar = "https://iili.io/2D8ByIj.png",
//   player2Avatar = "https://iili.io/2D8ByIj.png",
// }) => {
//   // Canvas and refs
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const gameConnectionRef = useRef<GameConnection | null>(null);
//   const requestIdRef = useRef<number | null>(null);
  
//   // Game state from server
//   const [gameState, setGameState] = useState<any>(null);
//   const [playerNumber, setPlayerNumber] = useState<number | null>(null);
//   const [connected, setConnected] = useState<boolean>(false);
  
//   // UI state
//   const [uiState, setUiState] = useState({
//     gameStatus: "waiting" as "waiting" | "menu" | "playing" | "paused" | "matchOver" | "gameOver",
//     matchWins: { player1: 0, player2: 0 },
//     currentMatch: 1,
//   });
  
//   // Scaling state for responsive canvas
//   const [scale, setScale] = useState<number>(1);
//   const [canvasWidth, setCanvasWidth] = useState<number>(BASE_WIDTH);
//   const [canvasHeight, setCanvasHeight] = useState<number>(BASE_HEIGHT);
  
//   // Keyboard controls state
//   const [keysPressed, setKeysPressed] = useState<KeyStates>({});
//   const keysPressedRef = useRef<KeyStates>({});
  
//   // Animation for score changes
//   const [scoreAnimation, setScoreAnimation] = useState({
//     player1: false,
//     player2: false,
//   });
  
//   // Connection status display
//   const [connectionMessage, setConnectionMessage] = useState("Connecting to game server...");
  
//   // Get the access token from cookies
//   const getAccessToken = () => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; accessToken=`);
//     if (parts.length === 2) return parts.pop()?.split(';').shift();
//     return "";
//   };
  
//   // Sync key press state to ref
//   useEffect(() => {
//     keysPressedRef.current = keysPressed;
//   }, [keysPressed]);
  
//   // Set up game connection
//   useEffect(() => {
//     if (!gameId) return;
    
//     const token = getAccessToken();
//     if (!token) {
//       console.error('No access token found');
//       setConnectionMessage("Authentication error. Please log in again.");
//       return;
//     }
    
//     // Handle game state updates
//     const handleGameState = (state: any) => {
//       // Create a deep copy to ensure we detect state changes
//       const stateCopy = JSON.parse(JSON.stringify(state));
      
//       // Track if scores changed for animation
//       if (gameState) {
//         if (state.left_paddle.score > gameState.left_paddle.score) {
//           setScoreAnimation(prev => ({ ...prev, player1: true }));
//           setTimeout(() => setScoreAnimation(prev => ({ ...prev, player1: false })), 1000);
//         }
//         if (state.right_paddle.score > gameState.right_paddle.score) {
//           setScoreAnimation(prev => ({ ...prev, player2: true }));
//           setTimeout(() => setScoreAnimation(prev => ({ ...prev, player2: false })), 1000);
//         }
//       }
      
//       setGameState(stateCopy);
      
//       // Update UI state
//       setUiState({
//         gameStatus: state.game_status,
//         matchWins: state.match_wins,
//         currentMatch: state.current_match
//       });
//     };
    
//     // Handle game status changes
//     const handleStatusChange = (status: string, reason?: string) => {
//       console.log(`Game status changed to ${status}${reason ? `: ${reason}` : ''}`);
      
//       // If the game moved to menu state, handle as needed
//       if (status === 'menu' && uiState.gameStatus === 'waiting') {
//         setConnectionMessage("Both players connected. Click to start the game!");
//       }
//     };
    
//     // Handle connection changes
//     const handleConnectionChange = (isConnected: boolean) => {
//       setConnected(isConnected);
//       if (isConnected) {
//         setConnectionMessage("Connected to game server");
//       } else {
//         setConnectionMessage("Disconnected from game server. Attempting to reconnect...");
//       }
//     };
    
//     // Handle player number assignment
//     const handlePlayerNumber = (number: number) => {
//       setPlayerNumber(number);
//       setConnectionMessage(`You are Player ${number}: ${number === 1 ? player1Name : player2Name}`);
//     };
    
//     // Create game connection
//     const gameConnection = new GameConnection(
//       gameId,
//       token,
//       handleGameState,
//       handleStatusChange,
//       handleConnectionChange,
//       handlePlayerNumber
//     );
    
//     // Store reference and connect
//     gameConnectionRef.current = gameConnection;
//     gameConnection.connect();
    
//     // Cleanup on unmount
//     return () => {
//       if (gameConnectionRef.current) {
//         gameConnectionRef.current.disconnect();
//       }
      
//       if (requestIdRef.current) {
//         cancelAnimationFrame(requestIdRef.current);
//       }
//     };
//   }, [gameId, player1Name, player2Name, uiState.gameStatus]);
  
//   // Handle responsive scaling
//   useEffect(() => {
//     const handleResize = () => {
//       if (containerRef.current) {
//         const containerWidth = containerRef.current.clientWidth;
//         // Calculate scale while maintaining aspect ratio
//         const newScale = Math.min(1, containerWidth / BASE_WIDTH);
        
//         setScale(newScale);
//         setCanvasWidth(BASE_WIDTH * newScale);
//         setCanvasHeight(BASE_HEIGHT * newScale);
//       }
//     };
    
//     // Initial call
//     handleResize();
    
//     // Add resize listener
//     window.addEventListener("resize", handleResize);
    
//     // Cleanup
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);
  
//   // Handle keyboard input
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Prevent default actions for game keys
//       if (["w", "s", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
//         e.preventDefault();
//       }
      
//       setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
      
//       // Handle space for pause toggle
//       if (e.key === " " && !e.repeat && gameConnectionRef.current) {
//         gameConnectionRef.current.togglePause();
//       }
      
//       // Start game if in menu state
//       if (uiState.gameStatus === "menu" && !e.repeat && gameConnectionRef.current) {
//         gameConnectionRef.current.startGame();
//       }
//     };
    
//     const handleKeyUp = (e: KeyboardEvent) => {
//       setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
//     };
    
//     // Add event listeners
//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);
    
//     // Cleanup
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [uiState.gameStatus]);
  
//   // Handle canvas click
//   const handleCanvasClick = () => {
//     if (!gameConnectionRef.current) return;
    
//     const status = uiState.gameStatus;
    
//     if (status === "menu") {
//       gameConnectionRef.current.startGame();
//     } else if (status === "matchOver") {
//       gameConnectionRef.current.nextMatch();
//     } else if (status === "gameOver") {
//       gameConnectionRef.current.restartGame();
//     }
//   };
  
//   // Process keyboard input for paddle movement
//   useEffect(() => {
//     if (!connected || !gameState || !gameConnectionRef.current || !playerNumber) return;
    
//     // Only process input when game is actually playing
//     if (uiState.gameStatus !== 'playing') return;
    
//     // Set up animation frame for handling input
//     const processInput = () => {
//       // Determine which keys to use based on player number
//       const upKey = playerNumber === 1 ? 'w' : 'ArrowUp';
//       const downKey = playerNumber === 1 ? 's' : 'ArrowDown';
      
//       // Get current paddle position
//       const paddleKey = playerNumber === 1 ? 'left_paddle' : 'right_paddle';
//       let paddleY = gameState[paddleKey].y;
//       const paddleSpeed = gameState[paddleKey].speed;
      
//       // Process movement
//       if (keysPressedRef.current[upKey] && paddleY > 0) {
//         paddleY = Math.max(0, paddleY - paddleSpeed);
//       }
//       if (keysPressedRef.current[downKey] && paddleY + PADDLE_HEIGHT < BASE_HEIGHT) {
//         paddleY = Math.min(BASE_HEIGHT - PADDLE_HEIGHT, paddleY + paddleSpeed);
//       }
      
//       // Only send update if position changed
//       if (paddleY !== gameState[paddleKey].y && gameConnectionRef.current) {
//         gameConnectionRef.current.sendPaddleMove(paddleY);
//       }
      
//       // Request next frame
//       requestIdRef.current = requestAnimationFrame(processInput);
//     };
    
//     // Start animation loop
//     requestIdRef.current = requestAnimationFrame(processInput);
    
//     // Cleanup
//     return () => {
//       if (requestIdRef.current) {
//         cancelAnimationFrame(requestIdRef.current);
//       }
//     };
//   }, [connected, gameState, playerNumber, uiState.gameStatus]);
  
//   // Render game on canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
    
//     const context = canvas.getContext('2d');
//     if (!context) return;
    
//     // Apply scaling to maintain aspect ratio
//     context.setTransform(scale, 0, 0, scale, 0, 0);
    
//     // Get theme properties
//     const themeProps = themeProperties[theme];
    
//     // Clear canvas
//     context.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
//     // Fill with black background
//     context.fillStyle = "black";
//     context.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
//     // If game state exists, render it
//     if (gameState) {
//       renderGame(context, themeProps);
//     } else {
//       // Draw connecting screen if no game state yet
//       drawConnectingScreen(context, themeProps);
//     }
    
//     // Request animation frame for next render
//     requestIdRef.current = requestAnimationFrame(() => {
//       if (canvasRef.current) {
//         renderGame(context, themeProps);
//       }
//     });
    
//     // Cleanup
//     return () => {
//       if (requestIdRef.current) {
//         cancelAnimationFrame(requestIdRef.current);
//       }
//     };
//   }, [gameState, scale, theme, connectionMessage, playerNumber]);
  
//   // Toggle pause
//   const togglePause = () => {
//     if (gameConnectionRef.current) {
//       gameConnectionRef.current.togglePause();
//     }
//   };
  
//   // Connecting screen when waiting for game state
//   const drawConnectingScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('CONNECTING', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
//     ctx.font = '24px Arial';
//     ctx.fillText(connectionMessage, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
//     // Draw loading animation
//     const time = Date.now() / 1000;
//     const numDots = 3;
//     const dotSize = 10;
//     const spacing = 20;
//     const centerX = BASE_WIDTH / 2;
//     const centerY = BASE_HEIGHT * 0.7;
    
//     for (let i = 0; i < numDots; i++) {
//       const x = centerX + (i - (numDots - 1) / 2) * spacing;
//       const y = centerY + Math.sin(time * 4 + i) * 10;
      
//       ctx.beginPath();
//       ctx.arc(x, y, dotSize, 0, Math.PI * 2);
//       ctx.fill();
//     }
    
//     ctx.restore();
//   };
  
//   // Render the game state
//   const renderGame = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     if (!gameState) return;
    
//     const { ball, left_paddle, right_paddle, game_status } = gameState;
    
//     // Clear canvas
//     ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
//     // Fill background
//     ctx.fillStyle = "black";
//     ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
//     // Draw table border with glow
//     ctx.save();
//     ctx.strokeStyle = themeProps.color;
//     ctx.lineWidth = 4;
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH - 4, BASE_HEIGHT - 4, 20);
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 20;
//     ctx.shadowOffsetX = 0;
//     ctx.shadowOffsetY = 0;
//     ctx.stroke();
//     ctx.restore();
    
//     // Draw center line
//     ctx.save();
//     ctx.strokeStyle = themeProps.color;
//     ctx.lineWidth = 2;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 10;
//     ctx.beginPath();
//     ctx.setLineDash([15, 15]);
//     ctx.moveTo(BASE_WIDTH / 2, 0);
//     ctx.lineTo(BASE_WIDTH / 2, BASE_HEIGHT);
//     ctx.stroke();
//     ctx.restore();
    
//     // Draw paddles
//     ctx.save();
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 10;
    
//     // Left paddle
//     ctx.beginPath();
//     ctx.roundRect(
//       left_paddle.x,
//       left_paddle.y,
//       left_paddle.width,
//       left_paddle.height,
//       5
//     );
//     ctx.fill();
    
//     // Right paddle
//     ctx.beginPath();
//     ctx.roundRect(
//       right_paddle.x,
//       right_paddle.y,
//       right_paddle.width,
//       right_paddle.height,
//       5
//     );
//     ctx.fill();
//     ctx.restore();
    
//     // Draw ball
//     if (ball) {
//       ctx.save();
//       ctx.fillStyle = themeProps.color;
//       ctx.shadowColor = themeProps.color;
//       ctx.shadowBlur = 15;
//       ctx.beginPath();
//       ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.restore();
//     }
    
//     // Draw scores
//     ctx.save();
//     ctx.font = "bold 16px Arial";
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 5;
//     ctx.textAlign = "left";
//     ctx.fillText(`Points: ${left_paddle.score}`, 20, BASE_HEIGHT - 20);
//     ctx.textAlign = "right";
//     ctx.fillText(
//       `Points: ${right_paddle.score}`,
//       BASE_WIDTH - 20,
//       BASE_HEIGHT - 20
//     );
//     ctx.restore();
    
//     // Draw game status overlays
//     if (game_status === "menu") {
//       drawMenuScreen(ctx, themeProps);
//     } else if (game_status === "paused") {
//       drawPauseScreen(ctx, themeProps);
//     } else if (game_status === "matchOver") {
//       drawMatchOverScreen(ctx, themeProps);
//     } else if (game_status === "gameOver") {
//       drawGameOverScreen(ctx, themeProps);
//     } else if (game_status === "waiting") {
//       drawWaitingScreen(ctx, themeProps);
//     }
//   };
  
//   // Draw waiting screen (both players not yet connected)
//   const drawWaitingScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('WAITING FOR PLAYERS', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
//     ctx.font = '24px Arial';
//     ctx.fillText('Players connecting...', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
//     ctx.font = '18px Arial';
//     ctx.fillText(connectionMessage, BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    
//     ctx.restore();
//   };
  
//   // Draw menu screen
//   const drawMenuScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     if (!gameState) return;
    
//     const { current_match } = gameState;
    
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('PONG ARCADIA', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
//     ctx.font = 'bold 24px Arial';
//     ctx.fillText(`MATCH ${current_match} OF 5`, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 40);
    
//     ctx.font = '24px Arial';
//     ctx.fillText('Click or press any key to start', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 10);
    
//     ctx.shadowBlur = 5;
//     ctx.font = '18px Arial';
//     ctx.fillText(`${player1Name}: W/S keys`, BASE_WIDTH / 4, BASE_HEIGHT * 0.7);
//     ctx.fillText(`${player2Name}: Arrow Up/Down`, (BASE_WIDTH / 4) * 3, BASE_HEIGHT * 0.7);
//     ctx.fillText('Press Space to pause', BASE_WIDTH / 2, BASE_HEIGHT * 0.8);
//     ctx.restore();
//   };
  
//   // Draw pause screen
//   const drawPauseScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
//     ctx.fillText('PAUSED', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
//     // Check if both players are connected
//     if (gameState && (!gameState.players.player1.connected || !gameState.players.player2.connected)) {
//       ctx.font = 'bold 24px Arial';
//       ctx.fillText('Waiting for opponent to reconnect...', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
//     } else {
//       ctx.shadowBlur = 5;
//       ctx.font = '20px Arial';
//       ctx.fillText('Press Space to continue', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 50);
//     }
    
//     ctx.restore();
//   };
  
//   // Draw match over screen
//   const drawMatchOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     if (!gameState) return;
    
//     const { winner, match_wins, current_match } = gameState;
    
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
    
//     if (winner === 'player1') {
//       ctx.fillText(`${player1Name} WINS MATCH ${current_match}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
//     } else if (winner === 'player2') {
//       ctx.fillText(`${player2Name} WINS MATCH ${current_match}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
//     }
    
//     ctx.font = 'bold 36px Arial';
//     ctx.fillText(`MATCH SCORE: ${match_wins.player1} - ${match_wins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
//     ctx.shadowBlur = 5;
//     ctx.font = '20px Arial';
//     ctx.fillText('Click to continue to next match', BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
//     ctx.restore();
//   };
  
//   // Draw game over screen
//   const drawGameOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
//     if (!gameState) return;
    
//     const { winner, match_wins } = gameState;
    
//     ctx.save();
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//     ctx.beginPath();
//     ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
//     ctx.fill();
    
//     ctx.fillStyle = themeProps.color;
//     ctx.shadowColor = themeProps.color;
//     ctx.shadowBlur = 15;
//     ctx.font = 'bold 48px Arial';
//     ctx.textAlign = 'center';
    
//     if (winner === 'player1') {
//       ctx.fillText(`${player1Name} WINS THE GAME!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
//     } else if (winner === 'player2') {
//       ctx.fillText(`${player2Name} WINS THE GAME!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
//     }
    
//     ctx.font = 'bold 36px Arial';
//     ctx.fillText(`FINAL SCORE: ${match_wins.player1} - ${match_wins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
//     ctx.shadowBlur = 5;
//     ctx.font = '20px Arial';
//     ctx.fillText('Click to play again', BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
//     ctx.restore();
//   };
  
//   // Render match win streaks with enhanced visuals
//   const renderMatchWinStreaks = (playerNumber: 1 | 2, wins: number) => {
//     const maxWins = MATCHES_TO_WIN_GAME;
//     const streaks = [];
//     const IconComponent = theme === 'fire' ? Flame : Waves;

//     for (let i = 0; i < maxWins; i++) {
//       const isActive = i < wins;
      
//       streaks.push(
//         <div
//           key={`p${playerNumber}-streak-${i}`}
//           className={`relative ${isActive ? "opacity-100" : "opacity-30"}`}
//         >
//           <IconComponent
//             size={24}
//             className={`${
//               isActive
//                 ? theme === 'fire' 
//                   ? "text-orange-500 drop-shadow-[0_0_5px_rgba(208,95,59,0.8)]" 
//                   : "text-teal-400 drop-shadow-[0_0_5px_rgba(64,207,183,0.8)]"
//                 : "text-gray-500"
//             }`}
//           />
//         </div>
//       );
//     }

//     return <div className="flex space-x-1">{streaks}</div>;
//   };
  
//   // Complete component UI
//   return (
//     <div className="w-full flex flex-col items-center justify-center">
//       {/* Connection status banner */}
//       {!connected && (
//         <div className="w-full max-w-[800px] mb-4 p-3 bg-red-500/80 text-white rounded-md text-center">
//           Connection to game server lost. Attempting to reconnect...
//         </div>
//       )}
      
//       {/* Control buttons */}
//       <div className="mb-6 flex flex-wrap gap-4 justify-center">
//         <Button
//           onClick={onBackToSetup}
//           className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
//             theme === "fire"
//               ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
//               : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
//           }`}
//         >
//           Back to Setup
//         </Button>

//         <Button
//           onClick={togglePause}
//           className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
//             theme === "fire"
//               ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
//               : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
//           }`}
//           disabled={
//             !gameState || 
//             uiState.gameStatus === "menu" ||
//             uiState.gameStatus === "matchOver" ||
//             uiState.gameStatus === "gameOver" ||
//             uiState.gameStatus === "waiting"
//           }
//         >
//           {uiState.gameStatus === "paused" ? "Resume Game" : "Pause Game"}
//         </Button>
//       </div>

//       {/* Game container */}
//       <div className="relative w-full max-w-[800px]" ref={containerRef}>
//         {/* Score display */}
//         {gameState && (
//           <div
//             className={`mb-3 p-4 rounded-xl flex items-center justify-between ${
//               theme === "fire"
//                 ? "bg-black/80 border-[#D05F3B]"
//                 : "bg-black/80 border-[#40CFB7]"
//             } border-2`}
//             style={{
//               boxShadow:
//                 theme === "fire"
//                   ? "0 0 15px rgba(208,95,59,0.6)"
//                   : "0 0 15px rgba(64,207,183,0.6)",
//             }}
//           >
//             {/* Player 1 */}
//             <div className="flex