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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Victory",
    description: "Win your first game",
    icon: "🏆",
    rarity: "common",
    unlocked: true,
  },
  {
    id: "2",
    title: "Perfect Game",
    description: "Win a game without losing a point",
    icon: "⭐",
    rarity: "legendary",
    unlocked: false,
  },
  {
    id: "3",
    title: "Social Butterfly",
    description: "Add 10 friends",
    icon: "🦋",
    rarity: "rare",
    unlocked: false,
    progress: {
      current: 7,
      total: 10,
    },
  },
  {
    id: "4",
    title: "Win Streak",
    description: "Win 5 games in a row",
    icon: "🔥",
    rarity: "epic",
    unlocked: true,
  },
];

const rarityColors = {
  common: "bg-gray-500/20 text-gray-300",
  rare: "bg-blue-500/20 text-blue-300",
  epic: "bg-purple-500/20 text-purple-300",
  legendary: "bg-yellow-500/20 text-yellow-300",
};

export default function Achievements() {
  const latestAchievement = achievements[0]; // Get the first achievement to display

  return (
    <div className="w-full h-full p-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <Dialog>
          <div className="flex justify-center items-center h-[15%] w-full">
            <DialogTrigger className="text-[#40CFB7] underline text-sm hover:text-[#35b09c]">
              <button
                onClick={() => {
                  // router.push("/friends/");
                }}
                className="border text-black p-3 border-[#40CFB7] bg-[#40CFB7] hover:bg-[#EEE5BE] shadow-shd lg:w-[50%] rounded-full transition-colors"
              >
              show more ...
              </button>
            </DialogTrigger>
          </div>
          <DialogContent className="max-h-[80vh] overflow-hidden bg-[#2D2A2A]">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold mb-4">
                All Achievements
              </DialogTitle>
              <DialogClose className="absolute right-0 top-0">
                <Icon
                  icon="material-symbols:close"
                  className="h-6 w-6 text-[#40CFB7] hover:text-[#35b09c]"
                />
              </DialogClose>
            </DialogHeader>
            <div className="overflow-y-auto pr-2 h-full scrollbar-thin scrollbar-thumb-[#40CFB7] scrollbar-track-transparent hover:scrollbar-thumb-[#35b09c] red">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked
                        ? "border-[#40CFB7] bg-[#2D2A2A]"
                        : "border-gray-800 bg-[#2D2A2A] opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {achievement.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                          rarityColors[achievement.rarity]
                        }`}
                      >
                        {achievement.rarity}
                      </span>
                    </div>

                    {achievement.progress && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#40CFB7]"
                            style={{
                              width: `${
                                (achievement.progress.current /
                                  achievement.progress.total) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {achievement.progress.current}/
                          {achievement.progress.total}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show only latest achievement */}
      <div
        className={`p-4 rounded-full border ${
          latestAchievement.unlocked
            ? "border-[#40CFB7] bg-[#2D2A2A]"
            : "border-gray-800 bg-[#2D2A2A] opacity-60"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">
            {latestAchievement.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {latestAchievement.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {latestAchievement.description}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
              rarityColors[latestAchievement.rarity]
            }`}
          >
            {latestAchievement.rarity}
          </span>
        </div>

        {latestAchievement.progress && (
          <div className="mt-3">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#40CFB7]"
                style={{
                  width: `${
                    (latestAchievement.progress.current /
                      latestAchievement.progress.total) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {latestAchievement.progress.current}/
              {latestAchievement.progress.total}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
