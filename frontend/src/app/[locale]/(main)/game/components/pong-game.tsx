import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Flame, Waves, Trophy } from "lucide-react";
import { GameDifficulty, GameTheme, KeyStates } from "../types/game";
import { useTranslations } from "next-intl";

//Game State interface
interface EnhancedGameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    speed: number;
    radius: number;
  };
  leftPaddle: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    score: number;
  };
  rightPaddle: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    score: number;
  };
  matchWins: {
    player1: number;
    player2: number;
  };
  currentMatch: number;
  gameStatus: "menu" | "playing" | "paused" | "matchOver" | "gameOver";
  winner: "player1" | "player2" | null;
}

// Define component props
interface PongGameProps {
  player1Name: string;
  player2Name: string;
  theme: GameTheme;
  difficulty: GameDifficulty;
  onBackToSetup: () => void;
  player1Avatar?: string;
  player2Avatar?: string;
  onGameComplete?: (player1Score: number, player2Score: number) => void;
  isTournamentMode?: boolean;
}

// Fixed game dimensions (base dimensions)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 10;
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

// Difficulty settings
const difficultySettings = {
  easy: {
    ballSpeed: 4,
    incrementMultiplier: 0.03,
    maxBallSpeed: 7,
  },
  medium: {
    ballSpeed: 5,
    incrementMultiplier: 0.05,
    maxBallSpeed: 8,
  },
  hard: {
    ballSpeed: 7,
    incrementMultiplier: 0.1,
    maxBallSpeed: 11,
  },
};

const PongGame: React.FC<PongGameProps> = ({
  player1Name,
  player2Name,
  theme,
  difficulty,
  onBackToSetup,
  player1Avatar = "https://iili.io/2D8ByIj.png",
  player2Avatar = "https://iili.io/2D8ByIj.png",
  onGameComplete,
  isTournamentMode = false,
}) => {
  const t = useTranslations('localGame');
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const gameStateRef = useRef<EnhancedGameState>({
    ball: {
      x: BASE_WIDTH / 2,
      y: BASE_HEIGHT / 2,
      dx: difficultySettings[difficulty].ballSpeed,
      dy: difficultySettings[difficulty].ballSpeed * 0.5,
      speed: difficultySettings[difficulty].ballSpeed,
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
    gameStatus: "menu",
    winner: null,
  });

  // Scaling state
  const [scale, setScale] = useState<number>(1);
  const [canvasWidth, setCanvasWidth] = useState<number>(BASE_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(BASE_HEIGHT);

  // UI State
  const [uiState, setUiState] = useState({
    gameStatus: "menu" as
      | "menu"
      | "playing"
      | "paused"
      | "matchOver"
      | "gameOver",
    matchWins: { player1: 0, player2: 0 },
    currentMatch: 1,
  });

  // Keyboard controls state
  const [keysPressed, setKeysPressed] = useState<KeyStates>({});
  const keysPressedRef = useRef<KeyStates>({});

  // Animation for score changes
  const [scoreAnimation, setScoreAnimation] = useState({
    player1: false,
    player2: false,
  });

  // Sync key press state to ref
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);

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

  // Reset game for a new match
  const resetForNewMatch = () => {
    gameStateRef.current = {
      ...gameStateRef.current,
      ball: {
        x: BASE_WIDTH / 2,
        y: BASE_HEIGHT / 2,
        dx: difficultySettings[difficulty].ballSpeed,
        dy: difficultySettings[difficulty].ballSpeed * 0.5,
        speed: difficultySettings[difficulty].ballSpeed,
        radius: BALL_RADIUS,
      },
      leftPaddle: {
        ...gameStateRef.current.leftPaddle,
        y: BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        score: 0,
      },
      rightPaddle: {
        ...gameStateRef.current.rightPaddle,
        y: BASE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        score: 0,
      },
      currentMatch: gameStateRef.current.currentMatch + 1,
      gameStatus: "menu",
      winner: null,
    };

    setUiState({
      gameStatus: "menu",
      matchWins: gameStateRef.current.matchWins,
      currentMatch: gameStateRef.current.currentMatch,
    });
  };

  // Handle full game restart
  const handleRestartGame = () => {
    // If there's a game complete callback, call it with final scores
    if (onGameComplete && gameStateRef.current.gameStatus === "gameOver") {
      onGameComplete(
        gameStateRef.current.matchWins.player1,
        gameStateRef.current.matchWins.player2
      );
    }

    gameStateRef.current = {
      ball: {
        x: BASE_WIDTH / 2,
        y: BASE_HEIGHT / 2,
        dx: difficultySettings[difficulty].ballSpeed,
        dy: difficultySettings[difficulty].ballSpeed * 0.5,
        speed: difficultySettings[difficulty].ballSpeed,
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
      gameStatus: "menu",
      winner: null,
    };

    setUiState({
      gameStatus: "menu",
      matchWins: { player1: 0, player2: 0 },
      currentMatch: 1,
    });
  };

  // Canvas click handler
  const handleCanvasClick = () => {
    const currentStatus = gameStateRef.current.gameStatus;

    if (currentStatus === "gameOver") {
      handleRestartGame();
    } else if (currentStatus === "matchOver") {
      resetForNewMatch();
    } else if (currentStatus === "menu") {
      gameStateRef.current.gameStatus = "playing";
      setUiState((prev) => ({ ...prev, gameStatus: "playing" }));
    }
  };

  // Toggle pause state
  const togglePause = () => {
    const newStatus =
      gameStateRef.current.gameStatus === "playing"
        ? "paused"
        : gameStateRef.current.gameStatus === "paused"
        ? "playing"
        : gameStateRef.current.gameStatus;

    gameStateRef.current.gameStatus = newStatus;
    setUiState((prev) => ({ ...prev, gameStatus: newStatus }));
  };

  // Update game state based on inputs and physics
  const updateGameState = () => {
    const gameState = gameStateRef.current;
    const { ball, leftPaddle, rightPaddle } = gameState;
    const settings = difficultySettings[difficulty];
    const keys = keysPressedRef.current;

    // Update paddle positions based on key presses
    // Player 1: W/S keys
    if (keys["w"] && leftPaddle.y > 0) {
      leftPaddle.y = Math.max(0, leftPaddle.y - leftPaddle.speed);
    }
    if (keys["s"] && leftPaddle.y + leftPaddle.height < BASE_HEIGHT) {
      leftPaddle.y = Math.min(
        BASE_HEIGHT - leftPaddle.height,
        leftPaddle.y + leftPaddle.speed
      );
    }

    // Player 2: Arrow keys
    if (keys["ArrowUp"] && rightPaddle.y > 0) {
      rightPaddle.y = Math.max(0, rightPaddle.y - rightPaddle.speed);
    }
    if (keys["ArrowDown"] && rightPaddle.y + rightPaddle.height < BASE_HEIGHT) {
      rightPaddle.y = Math.min(
        BASE_HEIGHT - rightPaddle.height,
        rightPaddle.y + rightPaddle.speed
      );
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if ( ball.y + ball.radius >= BASE_HEIGHT) {
      if (ball.dy > 0){ball.dy = -ball.dy;}
    }
    if (ball.y - ball.radius <= 0){
        if (ball.dy < 0 ){ball.dy = -ball.dy;}
    }


    // Ball collision with left paddle
    if (
      ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
      ball.x - ball.radius > leftPaddle.x &&
      ball.y - ball.radius <= leftPaddle.y + leftPaddle.height &&
      ball.y + ball.radius >= leftPaddle.y &&
      ball.dx < 0
    ) {
      // Reverse x direction
      ball.dx = -ball.dx;

      // Adjust angle based on where ball hits paddle
      const hitPosition =
        (ball.y - (leftPaddle.y + leftPaddle.height / 2)) /
        (leftPaddle.height / 2);
      ball.dy = hitPosition * ball.speed;

      // Increase speed slightly after each hit
      ball.speed = Math.min(
        settings.maxBallSpeed,
        ball.speed * (1 + settings.incrementMultiplier)
      );
      ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Ball collision with right paddle
    if (
      ball.x + ball.radius >= rightPaddle.x &&
      ball.x + ball.radius < rightPaddle.x + rightPaddle.width &&
      ball.y - ball.radius <= rightPaddle.y + rightPaddle.height &&
      ball.y + ball.radius >= rightPaddle.y &&
      ball.dx > 0
    ) {
      // Reverse x direction
      ball.dx = -ball.dx;

      // Adjust angle based on where ball hits paddle
      const hitPosition =
        (ball.y - (rightPaddle.y + rightPaddle.height / 2)) /
        (rightPaddle.height / 2);    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= BASE_HEIGHT) {
          ball.dy = -ball.dy;
        }
      ball.dy = hitPosition * ball.speed;

      // Increase speed slightly after each hit
      ball.speed = Math.min(
        settings.maxBallSpeed,
        ball.speed * (1 + settings.incrementMultiplier)
      );
      ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Score points when ball passes a paddle
    if (ball.x + ball.radius < 0) {
      // Right player scores
      rightPaddle.score += 1;
      resetBall(ball, 1, settings.ballSpeed);

      // Trigger score animation
      setScoreAnimation((prev) => ({ ...prev, player2: true }));
      setTimeout(
        () => setScoreAnimation((prev) => ({ ...prev, player2: false })),
        1000
      );
    } else if (ball.x - ball.radius > BASE_WIDTH) {
      // Left player scores
      leftPaddle.score += 1;
      resetBall(ball, -1, settings.ballSpeed);

      // Trigger score animation
      setScoreAnimation((prev) => ({ ...prev, player1: true }));
      setTimeout(
        () => setScoreAnimation((prev) => ({ ...prev, player1: false })),
        1000
      );
    }

    // Check match win condition
    if (leftPaddle.score >= POINTS_TO_WIN_MATCH) {
      gameState.matchWins.player1 += 1;
      gameState.winner = "player1";

      // Check game win condition
      if (gameState.matchWins.player1 >= MATCHES_TO_WIN_GAME) {
        gameState.gameStatus = "gameOver";
      } else {
        gameState.gameStatus = "matchOver";
      }

      // Update UI state for rendering
      setUiState({
        gameStatus: gameState.gameStatus,
        matchWins: { ...gameState.matchWins },
        currentMatch: gameState.currentMatch,
      });
    } else if (rightPaddle.score >= POINTS_TO_WIN_MATCH) {
      gameState.matchWins.player2 += 1;
      gameState.winner = "player2";

      // Check game win condition
      if (gameState.matchWins.player2 >= MATCHES_TO_WIN_GAME) {
        gameState.gameStatus = "gameOver";
      } else {
        gameState.gameStatus = "matchOver";
      }

      // Update UI state for rendering
      setUiState({
        gameStatus: gameState.gameStatus,
        matchWins: { ...gameState.matchWins },
        currentMatch: gameState.currentMatch,
      });
    }
  };

  // Reset ball after scoring
  const resetBall = (
    ball: EnhancedGameState["ball"],
    direction: number,
    initialSpeed: number
  ) => {
    ball.x = BASE_WIDTH / 2;
    ball.y = BASE_HEIGHT / 2;
    ball.speed = initialSpeed;
    ball.dx = direction * initialSpeed;
    ball.dy = ((Math.random() * 2 - 1) * initialSpeed) / 2;
  };

  // Render the game - using your exact table styles
  const renderGame = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    const { ball, leftPaddle, rightPaddle, gameStatus, matchWins, winner } =
      gameStateRef.current;
    const { color, glowColor, borderRadius } = themeProps;

    // Clear entire canvas
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Fill with black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Draw table border with glow, exactly matching your reference images
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    // Draw the border path
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH - 4, BASE_HEIGHT - 4, 20);
    // Create glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();
    ctx.restore();

    // Draw center line
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(BASE_WIDTH / 2, 0);
    ctx.lineTo(BASE_WIDTH / 2, BASE_HEIGHT);
    ctx.stroke();
    ctx.restore();

    // Draw paddles - with rounded ends as in the reference
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Left paddle with rounded ends
    ctx.beginPath();
    ctx.roundRect(
      leftPaddle.x,
      leftPaddle.y,
      leftPaddle.width,
      leftPaddle.height,
      10
    );
    ctx.fill();

    // Right paddle with rounded ends
    ctx.beginPath();
    ctx.roundRect(
      rightPaddle.x,
      rightPaddle.y,
      rightPaddle.width,
      rightPaddle.height,
      10
    );
    ctx.fill();
    ctx.restore();

    // Draw ball
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw current match scores (not match wins) - small in bottom corners
    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.textAlign = "left";
    ctx.fillText(`${t('points')}: ${leftPaddle.score}`, 20, BASE_HEIGHT - 20);
    ctx.textAlign = "right";
    ctx.fillText(
      `${t('points')}: ${rightPaddle.score}`,
      BASE_WIDTH - 20,
      BASE_HEIGHT - 20
    );
    ctx.restore();

    // Draw game status overlays
    if (gameStatus === "menu") {
      drawMenuScreen(ctx, themeProps);
    } else if (gameStatus === "paused") {
      drawPauseScreen(ctx, themeProps);
    } else if (gameStatus === "matchOver") {
      drawMatchOverScreen(ctx, themeProps);
    } else if (gameStatus === "gameOver") {
      drawGameOverScreen(ctx, themeProps);
    }
  };

  // Draw menu screen
  const drawMenuScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    const { color } = themeProps;
    const { currentMatch } = gameStateRef.current;
    
    // Semi-transparent overlay with exact positioning and rounded corners
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Game title
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pong Arcadia', BASE_WIDTH / 2, BASE_HEIGHT / 3);
    
    // Match info
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${t('match')} ${currentMatch} ${t('of')} ${MATCHES_TO_WIN_GAME * 2 - 1}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 40);
    
    // Start instructions
    ctx.font = '24px Arial';
    ctx.fillText(t('clickOrPressAnyKeyToStart'), BASE_WIDTH / 2, BASE_HEIGHT / 2 + 10);
    
    // Controls
    ctx.shadowBlur = 5;
    ctx.font = '18px Arial';
    ctx.fillText(`${player1Name}: ${t('wSKeys')}`, BASE_WIDTH / 4, BASE_HEIGHT * 0.7);
    ctx.fillText(`${player2Name}: ${t('arrowUpDownKeys')}`, (BASE_WIDTH / 4) * 3, BASE_HEIGHT * 0.7);
    ctx.fillText(t('pressSpaceToPause'), BASE_WIDTH / 2, BASE_HEIGHT * 0.8);
    ctx.restore();
  };

  // Draw pause screen
  const drawPauseScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    const { color } = themeProps;
    
    // Semi-transparent overlay with exact positioning and rounded corners
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Pause text
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t('paused'), BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Resume instructions
    ctx.shadowBlur = 5;
    ctx.font = '20px Arial';
    ctx.fillText(t('pressSpaceToContinue'), BASE_WIDTH / 2, BASE_HEIGHT / 2 + 50);
    ctx.restore();
  };

  // Draw match over screen
  const drawMatchOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    const { color } = themeProps;
    const { winner, matchWins, currentMatch } = gameStateRef.current;
    
    // Semi-transparent overlay with exact positioning and rounded corners
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Winner text
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    if (winner === 'player1') {
      ctx.fillText(`${player1Name} ${t('winsMatch')} ${currentMatch}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    } else if (winner === 'player2') {
      ctx.fillText(`${player2Name} ${t('winsMatch')} ${currentMatch}!`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    }
    
    // Current match score
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${t('matchScore')}: ${matchWins.player1} - ${matchWins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Continue instructions
    ctx.shadowBlur = 5;
    ctx.font = '20px Arial';
    ctx.fillText(t('clickToContinueToNextMatch'), BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    ctx.restore();
  };

  // Draw game over screen
  const drawGameOverScreen = (ctx: CanvasRenderingContext2D, themeProps: any) => {
    const { color } = themeProps;
    const { winner, matchWins } = gameStateRef.current;
    
    // Semi-transparent overlay with exact positioning and rounded corners
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, BASE_WIDTH-4, BASE_HEIGHT-4, 20);
    ctx.fill();
    
    // Winner text
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    if (winner === 'player1') {
      ctx.fillText(`${player1Name} ${t('winsGame')}`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    } else if (winner === 'player2') {
      ctx.fillText(`${player2Name} ${t('winsGame')}`, BASE_WIDTH / 2, BASE_HEIGHT / 3);
    }
    
    // Final score
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${t('finalScore')}: ${matchWins.player1} - ${matchWins.player2}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    
    // Restart instructions
    ctx.shadowBlur = 5;
    ctx.font = '20px Arial';
    ctx.fillText(t('clickToPlayAgain'), BASE_WIDTH / 2, BASE_HEIGHT * 0.7);
    ctx.restore();
  };
  // Set up game canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Apply theme
    const themeProps = themeProperties[theme];

    // Handle key presses
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for game keys
      if (["w", "s", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }

      setKeysPressed((prev) => ({ ...prev, [e.key]: true }));

      // Start game on key press if on menu
      if (gameStateRef.current.gameStatus === "menu" && !e.repeat) {
        gameStateRef.current.gameStatus = "playing";
        setUiState((prev) => ({ ...prev, gameStatus: "playing" }));
      }

      // Pause/unpause on Space
      if (e.key === " " && !e.repeat) {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Game loop
    const gameLoop = (time: number) => {
      // Scale the canvas context to keep game physics the same regardless of canvas size
      context.setTransform(scale, 0, 0, scale, 0, 0);

      if (gameStateRef.current.gameStatus === "playing") {
        updateGameState();
      }

      renderGame(context, themeProps);
      requestIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    requestIdRef.current = requestAnimationFrame(gameLoop);

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [theme, difficulty, scale]); // Only re-run when these dependencies change

  // Render match win streaks with enhanced visuals
  const renderMatchWinStreaks = (playerNumber: 1 | 2, wins: number) => {
    const maxWins = MATCHES_TO_WIN_GAME;
    const streaks = [];

    for (let i = 0; i < maxWins; i++) {
      const isActive = i < wins;

      if (theme === "fire") {
        streaks.push(
          <div
            key={`p${playerNumber}-streak-${i}`}
            className={`relative ${isActive ? "opacity-100" : "opacity-30"}`}
          >
            <Flame
              size={24}
              className={`${
                isActive
                  ? "text-orange-500 drop-shadow-[0_0_5px_rgba(208,95,59,0.8)]"
                  : "text-gray-500"
              }`}
            />
          </div>
        );
      } else {
        streaks.push(
          <div
            key={`p${playerNumber}-streak-${i}`}
            className={`relative ${isActive ? "opacity-100" : "opacity-30"}`}
          >
            <Waves
              size={24}
              className={`${
                isActive
                  ? "text-teal-400 drop-shadow-[0_0_5px_rgba(64,207,183,0.8)]"
                  : "text-gray-500"
              }`}
            />
          </div>
        );
      }
    }

    return <div className="flex space-x-1">{streaks}</div>;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Control buttons */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <Button
          onClick={onBackToSetup}
          className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
            theme === "fire"
              ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
              : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
          }`}
          disabled={isTournamentMode}
        >
          {t('backToSetup')}
        </Button>

        <Button
          onClick={togglePause}
          className={`bg-transparent border-2 shadow-md text-lg px-6 py-2 ${
            theme === "fire"
              ? "border-[#D05F3B] text-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.5)]"
              : "border-[#40CFB7] text-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.5)]"
          }`}
          disabled={
            uiState.gameStatus === "menu" ||
            uiState.gameStatus === "matchOver" ||
            uiState.gameStatus === "gameOver"
          }
        >
          {uiState.gameStatus === "paused" ? t('resumeGame') : t('pauseGame')}
        </Button>
      </div>

      {/* Game container */}
      <div className="relative w-full max-w-[800px]" ref={containerRef}>
        {/* Score display */}
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
          {/* Player 1 */}
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
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-3xl font-bold transition-all duration-300 ${
                    theme === "fire" ? "text-[#D05F3B]" : "text-[#40CFB7]"
                  } ${scoreAnimation.player1 ? "scale-150 animate-pulse" : ""}`}
                >
                  {gameStateRef.current.leftPaddle.score}
                </span>
                <div className="flex flex-col items-start">
                  <div className="flex">
                    {renderMatchWinStreaks(1, uiState.matchWins.player1)}
                  </div>
                  {uiState.matchWins.player1 > 0 && (
                    <span
                      className={`text-xs ${
                        theme === "fire" ? "text-orange-300" : "text-teal-300"
                      }`}
                    >
                      {uiState.matchWins.player1}{" "}
                      {uiState.matchWins.player1 === 1 ? t('matchWon') : t('matchesWon')}{" "}
                      {t('won')}
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
               {t('match')} {uiState.currentMatch}
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 border border-white/20">
              <span className="text-white font-bold">VS</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {t('firstTo')} {POINTS_TO_WIN_MATCH} {t('points')}
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span
                className={`font-bold text-lg ${
                  theme === "water" ? "text-teal-200" : "text-blue-200"
                }`}
              >
                {player2Name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col items-end">
                  <div className="flex">
                    {renderMatchWinStreaks(2, uiState.matchWins.player2)}
                  </div>
                  {uiState.matchWins.player2 > 0 && (
                    <span
                      className={`text-xs ${
                        theme === "water" ? "text-teal-300" : "text-orange-300"
                      }`}
                    >
                      {uiState.matchWins.player2}{" "}
                      {uiState.matchWins.player2 === 1 ? t('matchWon') : t('matchesWon')}{" "}
                      {t('won')}
                    </span>
                  )}
                </div>
                <span
                  className={`text-3xl font-bold transition-all duration-300 ${
                    theme === "water" ? "text-[#40CFB7]" : "text-[#D05F3B]"
                  } ${scoreAnimation.player2 ? "scale-150 animate-pulse" : ""}`}
                >
                  {gameStateRef.current.rightPaddle.score}
                </span>
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                theme === "water" ? "border-[#40CFB7]" : "border-[#D05F3B]"
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

        {/* Game board */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            border:
              theme === "fire"
                ? "4px solid #D05F3B"
                : "4px solid #40CFB7",
            boxShadow:
              theme === "fire"
                ? "0 0 20px #D05F3B, inset 0 0 10px rgba(208, 95, 59, 0.5)"
                : "0 0 20px #40CFB7, inset 0 0 10px rgba(64, 207, 183, 0.5)",
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

        {/* Game info and controls help */}
        <div className="mt-4 flex flex-col items-center">
          <div
            className={`flex items-center justify-center gap-2 mb-2 ${
              theme === "fire" ? "text-orange-400" : "text-teal-400"
            }`}
          >
            <Trophy size={16} />
            <span className="font-medium">
              {t('firstToWin')} {MATCHES_TO_WIN_GAME} {t('matchesWinsGame')}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">W</kbd>
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">S</kbd>
              <span>- {player1Name}</span>
            </div>

            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↑</kbd>
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↓</kbd>
              <span>- {player2Name}</span>
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

export default PongGame;