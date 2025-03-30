"use client";

import { UseStates } from "@/api/get-player-states";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";

interface PropsAchievement {
  userId: number | undefined;
}

interface AchievementStatic {
  id: string;
  title: string;
  description: string;
  icon: string;
  key: 'first_win' | 'pure_win' | 'triple_win';
}

const achievements: AchievementStatic[] = [
  {
    id: "1",
    title: "First Victory",
    description: "Win your first game",
    icon: "🎮",
    key: "first_win",
  },
  {
    id: "2",
    title: "Perfect Game",
    description: "Win a game with score 3-0",
    icon: "⭐",
    key: "pure_win",
  },
  {
    id: "3",
    title: "Undefeated Champion",
    description: "Win 3 games in a row",
    icon: "👑",
    key: "triple_win",
  },
];

export default function Achievements({ userId }: PropsAchievement) {
  const { data: playerStats } = UseStates(userId);

  console.log("Achievements", playerStats);

  const latestAchievement = achievements[2];

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4 h-[10%]">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <Dialog>
          <DialogTrigger className="text-[#40CFB7] underline text-sm hover:text-[#35b09c]">
            Show all achievements
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden bg-black">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl text-white font-bold mb-4">
                All Achievements
              </DialogTitle>
              <DialogClose className="absolute right-0 top-0">
                <Icon
                  icon="material-symbols:close"
                  className="h-6 w-6 text-[#40CFB7] hover:text-[#35b09c]"
                />
              </DialogClose>
            </DialogHeader>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    playerStats && playerStats[achievement.key]
                      ? "border-[#40CFB7] border bg-[#2D2A2A]"
                      : "border-gray-800 bg-[#2D2A2A] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400">{achievement.description}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        playerStats && playerStats[achievement.key]
                          ? "bg-[#40CFB7]/20 text-[#40CFB7]"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {playerStats && playerStats[achievement.key] ? "Completed" : "Locked"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-[80%] rounded-lg border border-[#40CFB7] flex items-center">
        <div className="flex items-center gap-3 justify-between w-full p-4">
          <span className="text-7xl">{latestAchievement.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-xl">{latestAchievement.title}</h3>
            <p className="text-gray-400">{latestAchievement.description}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full  ${
              playerStats && playerStats[latestAchievement.key]
                ? "bg-[#40CFB7]/20 text-[#40CFB7]"
                : "bg-red text-gray-400"
            }`}
          >
            {playerStats && playerStats[latestAchievement.key] ? "Completed" : "Locked"}
          </div>
        </div>
      </div>
    </div>
  );
}
