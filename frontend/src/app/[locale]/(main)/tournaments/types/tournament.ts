// Define game types locally to avoid import issues
export type GameTheme = 'fire' | 'water';
export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface TournamentPlayer {
  id: number;
  name: string;
  avatar: string;
  color: GameTheme;
}

export interface TournamentMatch {
  id: number;
  round: number;
  player1: TournamentPlayer;
  player2: TournamentPlayer;
  winner: TournamentPlayer | null;
  isComplete: boolean;
}

export interface TournamentState {
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  currentMatchIndex: number;
  winner: TournamentPlayer | null;
  isComplete: boolean;
  difficulty: GameDifficulty;
}

export type TournamentStage = 'create' | 'tournament' | 'complete';

export type TournamentRound = 'semifinals' | 'final'; 