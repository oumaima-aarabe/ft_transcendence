"use client";

import { fetcher } from "@/lib/fetcher";
import { MatchResult, PlayerStatistics } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

export function UseStates(playerId: number | undefined) {
  const getStates = async () => {
    try {
      if (!playerId)
        throw new Error("User not authenticated");
      const response = await fetcher.get<PlayerStatistics>(
        `/api/pong_game/profile/${playerId}/`
      );
      if (!response.data) {
        throw new Error("No data received");
      }
      return response.data;
    } catch (error) {
      return null;
    }
  };

  return useQuery({
    queryKey: ["state", playerId],
    queryFn: getStates,
    retry: 1,
    staleTime: 30000,
    enabled: !!playerId && playerId !== 0, // Only run the query if we have a valid playerId
  });
}
