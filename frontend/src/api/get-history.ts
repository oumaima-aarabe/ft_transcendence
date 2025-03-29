"use client";

import { fetcher } from "@/lib/fetcher";
import { MatchResult } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

// export function UseHistory(userId: string | undefined) {
//   const getHistory = async () => {
//     try {
//       if (!userId) {
//         throw new Error("User not authenticated");
//       }
//       const response = await fetcher.get<MatchResult[]>(
//         `/api/pong_game/games/history/${userId}/`
//       );
//       if (!response.data) {
//         throw new Error("No data received");
//       }
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching match history:", error);
//       return [];
//     }
//   };

//   return useQuery({
//     queryKey: ["history", userId],
//     queryFn: getHistory,
//     retry: 1,
//     staleTime: 30000, // Consider data fresh for 30 seconds
//     enabled: !!userId, // Only run the query if we have a user ID
//   });
// }

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
      console.error("Error fetching other user's match history:", error);
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

