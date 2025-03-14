// remote-pong-game.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Waves, Trophy } from 'lucide-react';

interface RemoteGameProps {
  userId: string;
  gameId: string;
  playerNumber: number;
  opponent: {
    id: string;
    username: string;
    avatar: string;
  };
  onExit: () => void;
}

interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
  };
  paddles: {
    player1: {
      x: number;
      y: number;
      width: number;
      height: number;
      score: number;
    };
    player2: {
      x: number;
      y: number;
      width: number;
      height: number;
      score: number;
    };
  };
}

// Fixed game dimensions (base dimensions)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;

const RemotePongGame: React.FC<RemoteGameProps> = ({
  userId,
  gameId,
  playerNumber,
  opponent,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStatus, setGameStatus] = useState<'connecting' | 'waiting' | 'ready' | 'playing' | 'paused' | 'over'>('connecting');
  const [message, setMessage] = useState('Connecting to game...');
  const [winner, setWinner] = useState<number | null>(null);
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  
  // Scaling state
  const [scale, setScale] = useState<number>(1);
  const [canvasWidth, setCanvasWidth] = useState<number>(BASE_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(BASE_HEIGHT);
  
  // Animation for score changes
  const [scoreAnimation, setScoreAnimation] = useState({
    player1: false,
    player2: false,
  });
  
  // Get player names
  const player1Name = playerNumber === 1 ? 'You' : opponent.username;
  const player2Name = playerNumber === 2 ? 'You' : opponent.username;
  
  // Get player avatars
  const player1Avatar = playerNumber === 1 ? '/assets/images/player-avatar.png' : opponent.avatar;
  const player2Avatar = playerNumber === 2 ? '/assets/images/player-avatar.png' : opponent.avatar;
  
  // Theme - using water theme for remote games
  const theme = 'water';
  const themeProps = {
    color: '#40CFB7',
    glowColor: 'rgba(64, 207, 183, 0.8)',
    borderRadius: '20px',
    ballColor: '#40CFB7',
    paddleColor: '#40CFB7',
    lineColor: '#40CFB7',
    shadowBlur: 25,
    textColor: '#40CFB7',
    // background: "url('/assets/images/water-game.png')",
  };

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
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    // Connect to WebSocket when component mounts
    socketRef.current = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/pong/${userId}/`);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setGameStatus('waiting');
      setMessage('Waiting for opponent to be ready...');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      switch (data.type) {
        case 'connection_established':
          // Send game_ready message to indicate we're ready
          if (socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: 'game_ready',
              game_id: gameId
            }));
          }
          break;
          
        case 'game_started':
          setGameStatus('playing');
          setMessage('Game started!');
          break;
          
        case 'game_state_update':
          setGameState(prevState => {
            // If this is the first update, trigger animations
            if (!prevState) {
              return data;
            }
            
            // Check if scores changed and trigger animations
            if (data.paddles.player1.score > prevState.paddles.player1.score) {
              setScoreAnimation(prev => ({ ...prev, player1: true }));
              setTimeout(() => setScoreAnimation(prev => ({ ...prev, player1: false })), 1000);
            }
            if (data.paddles.player2.score > prevState.paddles.player2.score) {
              setScoreAnimation(prev => ({ ...prev, player2: true }));
              setTimeout(() => setScoreAnimation(prev => ({ ...prev, player2: false })), 1000);
            }
            
            return data;
          });
          break;
          
        case 'point_scored':
          // Animation is handled in the game_state_update case
          break;
          
        case 'game_over':
          setGameStatus('over');
          setWinner(data.winner);
          setMessage(`Game over! ${data.winner === playerNumber ? 'You won!' : 'You lost!'}`);
          break;
          
        case 'opponent_disconnected':
          setGameStatus('over');
          setWinner(playerNumber); // If opponent disconnects, you win
          setMessage('Your opponent disconnected. You win!');
          break;
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      if (gameStatus !== 'over') {
        setMessage('Connection to game server lost');
        setGameStatus('over');
      }
    };

    // Set up key press handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        setKeysPressed(prev => ({ ...prev, [e.key]: true }));
        
        // Send paddle movement to server
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          let direction = '';
          
          if (playerNumber === 1) {
            if (e.key === 'w') direction = 'up';
            if (e.key === 's') direction = 'down';
          } else {
            if (e.key === 'ArrowUp') direction = 'up';
            if (e.key === 'ArrowDown') direction = 'down';
          }
          
          if (direction) {
            socketRef.current.send(JSON.stringify({
              type: 'paddle_move',
              direction
            }));
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setKeysPressed(prev => ({ ...prev, [e.key]: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [userId, gameId, playerNumber, gameStatus]);

  // Set up canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Render function to draw the game state
    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      // Fill with black background
      context.fillStyle = 'black';
      context.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      
      // Draw game board if we have game state
      if (gameState) {
        // Draw table border with glow
        context.save();
        context.strokeStyle = themeProps.color;
        context.lineWidth = 4;
        // Draw the border path
        context.beginPath();
        context.roundRect(2, 2, BASE_WIDTH - 4, BASE_HEIGHT - 4, 20);
        // Create glow effect
        context.shadowColor = themeProps.color;
        context.shadowBlur = 20;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.stroke();
        context.restore();
    
        // Draw center line
        context.save();
        context.strokeStyle = themeProps.color;
        context.lineWidth = 2;
        context.shadowColor = themeProps.color;
        context.shadowBlur = 10;
        context.beginPath();
        context.moveTo(BASE_WIDTH / 2, 0);
        context.lineTo(BASE_WIDTH / 2, BASE_HEIGHT);
        context.stroke();
        context.restore();
        
        // Draw paddles with rounded ends
        context.save();
        context.fillStyle = themeProps.color;
        context.shadowColor = themeProps.color;
        context.shadowBlur = 10;
        
        // Left paddle
        const { player1, player2 } = gameState.paddles;
        context.beginPath();
        context.roundRect(player1.x, player1.y, player1.width, player1.height, 10);
        context.fill();
        
        // Right paddle
        context.beginPath();
        context.roundRect(player2.x, player2.y, player2.width, player2.height, 10);
        context.fill();
        context.restore();
        
        // Draw ball
        context.save();
        context.fillStyle = themeProps.color;
        context.shadowColor = themeProps.color;
        context.shadowBlur = 15;
        context.beginPath();
        context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      
      // Draw game status overlays
      if (gameStatus === 'connecting' || gameStatus === 'waiting') {
        drawWaitingScreen(context);
      } else if (gameStatus === 'over') {
        drawGameOverScreen(context);
      }
      
      // Continue animation loop
      requestIdRef.current = requestAnimationFrame(render);
    };
    
    // Start rendering loop
    requestIdRef.current = requestAnimationFrame(render);
    
    // Cleanup
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [gameState, gameStatus, winner, themeProps]);

  // Helper function to draw waiting screen
  const drawWaitingScreen = (ctx: CanvasRenderingContext2D) => {
    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Waiting text
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Controls reminder
    ctx.font = '18px Arial';
    ctx.shadowBlur = 5;
    if (playerNumber === 1) {
      ctx.fillText('You control with W/S keys', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
    } else {
      ctx.fillText('You control with Arrow Up/Down keys', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
    }
    ctx.restore();
  };

  // Helper function to draw game over screen
  const drawGameOverScreen = (ctx: CanvasRenderingContext2D) => {
    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Game over text
    ctx.fillStyle = themeProps.color;
    ctx.shadowColor = themeProps.color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
    // Winner text
    ctx.font = 'bold 32px Arial';
    if (winner === playerNumber) {
      ctx.fillText('You Won!', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    } else if (winner) {
      ctx.fillText('You Lost!', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    } else {
      ctx.fillText('Game Ended', BASE_WIDTH / 2, BASE_HEIGHT / 2);
    }
    
    // Final score if game state exists
    if (gameState) {
      ctx.font = '24px Arial';
      ctx.fillText(
        `Final Score: ${gameState.paddles.player1.score} - ${gameState.paddles.player2.score}`,
        BASE_WIDTH / 2,
        BASE_HEIGHT / 2 + 50
      );
    }
    
    ctx.restore();
  };

  // Render match win streaks with enhanced visuals
  const renderMatchWinIcon = (isActive: boolean) => {
    return (
      <div className={`relative ${isActive ? 'opacity-100' : 'opacity-30'}`}>
        <Waves
          size={24}
          className={`${
            isActive
              ? 'text-teal-400 drop-shadow-[0_0_5px_rgba(64,207,183,0.8)]'
              : 'text-gray-500'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Game info */}
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-[#40CFB7]" style={{ textShadow: '0 0 10px rgba(64,207,183,0.5)' }}>
          {gameStatus === 'over' ? 'Game Ended' : 'Remote Game'}
        </h2>
        <p className="text-center text-gray-300">
          {gameStatus === 'playing' ? 'Game in progress' : message}
        </p>
      </div>

      {/* Control buttons */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <Button
          onClick={onExit}
          className="bg-transparent border-2 border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)] px-6 py-2"
        >
          {gameStatus === 'over' ? 'Back to Menu' : 'Forfeit Game'}
        </Button>
      </div>

      {/* Game container */}
      <div className="relative w-full max-w-[800px]" ref={containerRef}>
        {/* Score display */}
        <div
          className="mb-3 p-4 rounded-xl flex items-center justify-between bg-black/80 border-[#40CFB7] border-2"
          style={{ boxShadow: '0 0 15px rgba(64,207,183,0.6)' }}
        >
          {/* Player 1 */}
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#40CFB7]">
              <img
                src={player1Avatar}
                alt={player1Name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-teal-200">
                {player1Name} {playerNumber === 1 && '(You)'}
              </span>
              <span
                className={`text-3xl font-bold transition-all duration-300 text-[#40CFB7] ${
                  scoreAnimation.player1 ? 'scale-150 animate-pulse' : ''
                }`}
              >
                {gameState?.paddles.player1.score || 0}
              </span>
            </div>
          </div>

          {/* Center section */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 border border-white/20">
              <span className="text-white font-bold">VS</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              First to 5 points
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="font-bold text-lg text-teal-200">
                {player2Name} {playerNumber === 2 && '(You)'}
              </span>
              <span
                className={`text-3xl font-bold transition-all duration-300 text-[#40CFB7] ${
                  scoreAnimation.player2 ? 'scale-150 animate-pulse' : ''
                }`}
              >
                {gameState?.paddles.player2.score || 0}
              </span>
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#40CFB7]">
              <img
                src={player2Avatar}
                alt={player2Name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Game board */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            border: '4px solid #40CFB7',
            boxShadow: '0 0 20px #40CFB7, inset 0 0 10px rgba(64, 207, 183, 0.5)',
            background: 'black',
            margin: '0 auto',
            borderRadius: '30px',
          }}
        >
          <canvas
            ref={canvasRef}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          />
        </div>

        {/* Game controls help */}
        <div className="mt-4 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
            {playerNumber === 1 ? (
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">W</kbd>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">S</kbd>
                <span>- Move your paddle</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↑</kbd>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↓</kbd>
                <span>- Move your paddle</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemotePongGame;