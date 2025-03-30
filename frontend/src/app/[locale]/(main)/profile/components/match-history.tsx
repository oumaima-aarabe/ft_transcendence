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
import { UseHistory } from "@/api/get-history";
import { useTranslations } from 'next-intl';

interface MatchHistoryProps {
  userId?: number;
}

export default function MatchHistory({ userId }: MatchHistoryProps) {
  const t = useTranslations('dashboard.matchHistory');
  const { data: matchHistory, isLoading, error } = UseHistory(userId || 0);
  const latestMatch = matchHistory?.[0];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40CFB7]"></div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        {t('errorLoading')}
      </div>
    );
  }

  if (!matchHistory || matchHistory.length === 0 || !latestMatch) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        {t('noMatches')}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Dialog>
          <DialogTrigger className="text-[#40CFB7] underline text-sm hover:text-[#35b09c]">
            {t('showAll')}
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden bg-black">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold mb-4 text-white overflow-auto">
                {t('fullHistory')}
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
                      <span className="text-gray-400">{t('versus')}</span>
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
            <span className="text-gray-400 text-6xl">{t('versus')}</span>
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
