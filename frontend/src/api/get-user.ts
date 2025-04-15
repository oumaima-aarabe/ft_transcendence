"use client";

import { fetcher } from "@/lib/fetcher";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
export function UseUser() {
  const getUser = async () => {
    try {
      const response = await fetcher.get<User>("/api/users/profile/me");
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const user = useQuery({
    queryKey: ["me"],
    queryFn: getUser,
  });
  return user;
}

export function UseOtherUser(username: string) {
  const getUser = async () => {
    try {
      const response = await fetcher.get<User>(
        `/api/users/profile/${username}`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  };

  return useQuery({
    queryKey: ["other-user", username],
    queryFn: getUser,
  });
}

export function useSearchUsers(query: string) {
  const searchUsers = async () => {
    if (!query || query.trim() === '') return [];
    
    try {
      const response = await fetcher.get<User[]>(
        `/api/users/search/${query}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  return useQuery({
    queryKey: ["search-users", query],
    queryFn: searchUsers,
    enabled: !!query && query.trim() !== '',
    staleTime: 10000, // Results stay fresh for 10 seconds
  });
}
