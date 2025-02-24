"use client";

import { User } from "@/app/[locale]/(main)/chat/types/chat";
import endpoints from "@/constants/endpoints";
import { sendRequest } from "@/lib/axios";
import { createContext, useEffect, useState } from "react";

type UserContextType = {
  myUserData: User | null;
  fetchMyUserData: () => Promise<void>;
};

export const UserContext = createContext<UserContextType>({
  myUserData: null,
  fetchMyUserData: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<{
    myUserData: User | null;
  }>({
    myUserData: null,
  });

  useEffect(() => {
    fetchMyUserData();
  }, []);

  const fetchMyUserData = async () => {
    try {
      const response = await sendRequest("GET", endpoints.users + "/profile/me");
      setState({
        ...state,
        myUserData: response.data,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <UserContext.Provider value={{ ...state, fetchMyUserData }}>
      {children}
    </UserContext.Provider>
  );
};
