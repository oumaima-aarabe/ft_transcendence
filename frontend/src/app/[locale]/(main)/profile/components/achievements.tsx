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
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Victory",
    description: "Win your first game",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "2",
    title: "Perfect Game",
    description: "Win a game with score 3-0",
    icon: "⭐",                                             
    unlocked: false,
  },
  {
    id: "3",
    title: "Undefeated Champion",
    description: "Win 3 games without losing any match",
    icon: "👑",
    unlocked: false,
  },
];

export default function Achievements() {
  const latestAchievement = achievements[2];

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
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
            <div className="space-y-4 ">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    achievement.unlocked
                      ? "border-[#40CFB7] border bg-[#2D2A2A]"
                      : "border-gray-800 bg-[#2D2A2A] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 ">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400">{achievement.description}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        achievement.unlocked
                          ? "bg-[#40CFB7]/20 text-[#40CFB7]"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {achievement.unlocked ? "Completed" : "Locked"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 rounded-lg border border-[#40CFB7] ">
        <div className="flex items-center gap-3 p-4">
          <span className="text-7xl">{latestAchievement.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-xl">{latestAchievement.title}</h3>
            <p className="text-gray-400">{latestAchievement.description}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full${
              latestAchievement.unlocked
                ? "bg-[#40CFB7]/20 text-[#40CFB7]"
                : "bg-red text-gray-400"
            }`}
          >
            {latestAchievement.unlocked ? "Completed" : "Locked"}
          </div>
        </div>
      </div>
    </div>
  );
}
