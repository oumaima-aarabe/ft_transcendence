export interface MatchResult {
    id: string;
    player: {
        username: string;
        avatar: string;
      };
      opponent: {
        username: string;
        avatar: string;
      };
      playerScore: number;
      opponentScore: number;
      date: string;
      result: "win" | "loss";
}

export interface PlayerStatistics {
  experience : number;
  level :number;
  matches_played :number;
  matches_won :number;
  matches_lost :number;
  
  first_win :boolean;
  pure_win :boolean;
  triple_win :boolean;
}
