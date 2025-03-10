"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";

interface MatchResult {
  id: string;
  opponent: {
    username: string;
    avatar: string;
  };
  playerScore: number;
  opponentScore: number;
  date: string;
  gameMode: "Classic" | "Special";
  result: "win" | "loss";
}

const matchHistory: MatchResult[] = [
  {
    id: "1",
    opponent: {
      username: "player1",
      avatar: "/assets/images/logo.svg",
    },
    playerScore: 10,
    opponentScore: 8,
    date: "2024-03-06",
    gameMode: "Classic",
    result: "win",
  },
  {
    id: "2",
    opponent: {
      username: "player2",
      avatar: "/assets/images/logo.svg",
    },
    playerScore: 7,
    opponentScore: 10,
    date: "2024-03-05",
    gameMode: "Special",
    result: "loss",
  },
  // Add more matches as needed
];

export default function MatchHistory() {
  const latestMatch = matchHistory[0]; // Get the most recent match

  return (
    <div className="w-full h-full space-y-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold underline">Match History</h2>
        <Dialog>
          <DialogTrigger className="pt-4 pr-6 text-[#40CFB7] underline text-sm hover:text-[#35b09c]">
            Show all matches
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden bg-black">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold mb-4 text-white">
                Full Match History
              </DialogTitle>
              <DialogClose className="absolute right-0 top-0">
                <Icon
                  icon="material-symbols:close"
                  className="h-6 w-6 text-[#40CFB7] hover:text-[#35b09c]"
                />
              </DialogClose>
            </DialogHeader>
            <div className="overflow-y-auto pr-2 h-full scrollbar-thin scrollbar-thumb-[#40CFB7] scrollbar-track-transparent hover:scrollbar-thumb-[#35b09c]">
              <div className="space-y-4">
                {matchHistory.map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      match.result === "win"
                        ? "bg-green-950/30"
                        : "bg-red-950/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.opponent.avatar} />
                        <AvatarFallback>
                          {match.opponent.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">
                          {match.opponent.username}
                        </p>
                        <p className="text-sm text-gray-400">
                          {match.gameMode}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {match.playerScore} - {match.opponentScore}
                      </p>
                      <p className="text-sm text-gray-400">{match.date}</p>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full ${
                        match.result === "win"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {match.result.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* the last match */}
      <div
        className={`flex items-center justify-between p-4 rounded-full ${
          latestMatch.result === "win" ? "bg-green-950/30" : "bg-red-950/30"
        }`}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={latestMatch.opponent.avatar} />
            <AvatarFallback>{latestMatch.opponent.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{latestMatch.opponent.username}</p>
            <p className="text-sm text-gray-400">{latestMatch.gameMode}</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold">
            {latestMatch.playerScore} - {latestMatch.opponentScore}
          </p>
          <p className="text-sm text-gray-400">{latestMatch.date}</p>
        </div>

        <div
          className={`px-3 py-1 rounded-full ${
            latestMatch.result === "win"
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {latestMatch.result.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
