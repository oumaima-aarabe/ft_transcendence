"use client";

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

const matchHistory: MatchResult[] = [
  {
    id: "1",
    player: {
      username: "you",
      avatar: "/assets/images/logo.svg",
    },
    opponent: {
      username: "player1",
      avatar: "/assets/images/logo.svg",
    },
    playerScore: 10,
    opponentScore: 8,
    date: "2024-03-06",
    result: "win",
  },
  {
    id: "2",
    player: {
      username: "you",
      avatar: "/assets/images/logo.svg",
    },
    opponent: {
      username: "player2",
      avatar: "/assets/images/logo.svg",
    },
    playerScore: 7,
    opponentScore: 10,
    date: "2024-03-05",
    result: "loss",
  },
  // Add more matches as needed
];

export default function MatchHistory() {
  const latestMatch = matchHistory[0];

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Match History</h2>
        <Dialog>
          <DialogTrigger className="text-[#40CFB7] underline text-sm hover:text-[#35b09c]">
            Show all matches
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden bg-black">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold mb-4 text-white overflow-auto">
                Full Match History
              </DialogTitle>
              <DialogClose className="absolute right-0 top-0">
                <Icon
                  icon="material-symbols:close"
                  className="h-6 w-6 text-[#40CFB7] hover:text-[#35b09c]"
                />
              </DialogClose>
            </DialogHeader>
            <div className="space-y-4">
              {matchHistory.map((match) => (
                <div
                  key={match.id}
                  className={`p-4 rounded-lg border ${
                    match.result === "win"
                      ? "border-[#40CFB7]"
                      : "border-[#c75b37]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Player Side */}
                    <div className="flex items-center gap-3">
                      <img
                        src={match.player.avatar}
                        className="rounded-full object-cover size-16"
                        alt={match.player.username}
                      />
                      <div>
                        <h3 className="text-lg font-extralight">
                          {match.player.username}
                        </h3>
                        <span
                          className={
                            match.result === "win"
                              ? "text-[#40CFB7] text-xl"
                              : "text-[#c75b37] text-xl"
                          }
                        >
                          {match.playerScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center mx-4">
                      <span className="text-gray-400">VS</span>
                    </div>

                    {/* Opponent Side */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h3 className="text-lg font-extralight">
                          {match.opponent.username}
                        </h3>
                        <span
                          className={
                            match.result === "loss"
                              ? "text-[#40CFB7] text-xl"
                              : "text-[#c75b37] text-xl"
                          }
                        >
                          {match.opponentScore}
                        </span>
                      </div>
                      <img
                        src={match.opponent.avatar}
                        className="rounded-full object-cover size-16"
                        alt={match.opponent.username}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Latest match*/}
      <div
        className={`p-4 rounded-lg border  ${
          latestMatch.result === "win"
            ? "border-[#40CFB7]"
            : "border-[#c75b37]"
        }`}
      >
        <div className="flex items-center justify-between p-5">
          {/* ana */}
          <div className="flex items-center gap-3">
            <img
              src={latestMatch.player.avatar}
              className="rounded-full object-cover size-16"
              alt={latestMatch.player.username}
            />
            <div>
              <h3 className="text-lg font-extralight">
                {latestMatch.player.username}
              </h3>
              <span
                className={
                  latestMatch.result === "win"
                    ? "text-[#40CFB7] text-xl"
                    : "text-[#c75b37] text-xl"
                }
              >
                {latestMatch.playerScore}
              </span>
            </div>
          </div>

          {/* vs */}
          <div className="flex flex-col items-center mx-4">
            <span className="text-gray-400 text-6xl">VS</span>
          </div>

          {/* li dedi*/}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="text-lg font-extralight">
                {latestMatch.opponent.username}
              </h3>
              <span
                className={
                  latestMatch.result === "loss"
                    ? "text-[#40CFB7] text-xl"
                    : "text-[#c75b37] text-xl"
                }
              >
                {latestMatch.opponentScore}
              </span>
            </div>
            <img
              src={latestMatch.opponent.avatar}
              className="rounded-full object-cover size-16"
              alt={latestMatch.opponent.username}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
