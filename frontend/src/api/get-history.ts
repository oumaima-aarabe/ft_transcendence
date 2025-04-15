"use client";

import { fetcher } from "@/lib/fetcher";
import { MatchResult } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

export function UseHistory(playerId: number) {
  const getHistory = async () => {
    try {
      if (!playerId)
        throw new Error("User not authenticated");
      const response = await fetcher.get<MatchResult[]>(
        `/api/pong_game/games/history/${playerId}/`
      );
      if (!response.data) {
        throw new Error("No data received");
      }
      return response.data;
    } catch (error) {
      return [];
    }
  };

  return useQuery({
    queryKey: ["history", playerId],
    queryFn: getHistory,
    retry: 1,
    staleTime: 30000,
    enabled: !!playerId && playerId !== 0, // Only run the query if we have a valid playerId
  });
}

