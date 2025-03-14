// Game theme options
export type GameTheme = 'fire' | 'water';

// Game difficulty levels
export type GameDifficulty = 'easy' | 'medium' | 'hard';



// Game status
export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver';

// Ball object type
export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  radius: number;
}

// Paddle object type
export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  score: number;
}

// Game state interface
export interface GameState {
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  gameStatus: GameStatus;
  winner: 'player1' | 'player2' | null;
  matchWins: {
    player1: number;
    player2: number;
  }
  currentMatch: number;
}

// Theme configuration
export interface ThemeConfig {
  backgroundColor: string;
  glowColor: string;
  paddleColor: string;
  ballColor: string;
  lineColor: string;
  scoreColor: string;
  textColor: string;
}

// Game difficulty settings
export interface DifficultySettings {
  ballSpeed: number;
  incrementMultiplier: number; // How much speed increases after paddle hits
  maxBallSpeed: number;
}

// Key states for paddle control
export interface KeyStates {
  [key: string]: boolean;
}


export type GameMode = "local" | "online" | "tournament";