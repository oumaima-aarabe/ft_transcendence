"use client";

import { fetcher } from "@/lib/fetcher";
import { MatchResult } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

export function UseHistory() {
  const getHistory = async () => {
    try {
      const response = await fetcher.get<MatchResult[]>("/api/games/history/");
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const history = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });
  return history;
}

export function UseOtherHistory(playerId: number) {
  const getHistory = async () => {
    try {
      const response = await fetcher.get<History[]>(
        `/games/history/${playerId}/`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  };

  return useQuery({
    queryKey: ["other-history", playerId],
    queryFn: getHistory,
  });
}

