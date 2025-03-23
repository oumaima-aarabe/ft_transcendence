import { useEffect, useRef, useState } from "react";
import PongGame, { EnhancedGameState, difficultySettings } from "./pong-game";
import { GameDifficulty, GameTheme, KeyStates } from "../types/game";
import { rest } from "lodash";

const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 8;
const POINTS_TO_WIN_MATCH = 5;
const MATCHES_TO_WIN_GAME = 3;

export const LocalPongGame = ({
  player1Name,
  player2Name,
  theme,
  difficulty,
  onBackToSetup,
} : {
  player1Name: string;
  player2Name: string;
  theme: GameTheme;
  difficulty: GameDifficulty;
  onBackToSetup: () => void;
}) => {
  const gameStateRef = useRef<EnhancedGameState>({
    ball: {
      x: BASE_WIDTH / 2,
      y: BASE_HEIGHT / 2,
      dx: difficultySettings[difficulty].ballSpeed,
      dy: difficultySettings[difficulty].ballSpeed * BASE_HEIGHT / BASE_WIDTH,
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
        (rightPaddle.height / 2);
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
  };

  // Reset ball after scoring

  // Render match win streaks with enhanced visuals


  return (
    <div className="local-pong-game">
      <PongGame
        BALL_RADIUS={BALL_RADIUS}
        BASE_HEIGHT={BASE_HEIGHT}
        BASE_WIDTH={BASE_WIDTH}
        PADDLE_HEIGHT={PADDLE_HEIGHT}
        PADDLE_SPEED={PADDLE_SPEED}
        PADDLE_WIDTH={PADDLE_WIDTH}
        POINTS_TO_WIN_MATCH={POINTS_TO_WIN_MATCH}
        MATCHES_TO_WIN_GAME={MATCHES_TO_WIN_GAME}
        gameStateRef={gameStateRef}
        updateGameState={updateGameState}
        setKeysPressed={setKeysPressed}
        scoreAnimation={scoreAnimation}
        player1Name={player1Name}
        player2Name={player2Name}
        theme={theme}
        onBackToSetup={onBackToSetup}
        difficulty={difficulty}
        />
    </div>
  );
};