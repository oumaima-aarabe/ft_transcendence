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
