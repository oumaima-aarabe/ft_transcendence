"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { Friend } from "@/types/friends";
import { UseFriend } from "@/api/get-friends";
import { useRouter } from "@/i18n/routing";

const friends = [
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "ka",
    avatar: "/assets/images/logo.svg",
  },
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "kaboussi",
    avatar: "/assets/images/logo.svg",
  },
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "kaboussi2",
    avatar: "/assets/images/logo.svg",
  },
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "kaboussi3",
    avatar: "/assets/images/logo.svg",
  },
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "ussi",
    avatar: "/assets/images/logo.svg",
  },
  {
    first_name: "kawtar ",
    last_name: "aboussi",
    username: "aboussi",
    avatar: "/assets/images/logo.svg",
  },
];

const FriendItem = ({ item }: { item: Friend }) => (
  <div className="relative flex items-center rounded-full bg-black">
    <img src={item.avatar} className="rounded-full object-cover size-20" />
    <div className="ml-4">
      <div>
        <h1 className="text-lg font-extralight">{item.username}</h1>
      </div>
      <div className="flex flex-row space-x-1">
        <h2>{item.first_name}</h2>
        <h3>{item.last_name}</h3>
      </div>
    </div>
    <Icon
      icon="token:chat"
      width="50"
      height="50"
      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white"
    />
  </div>
);

export default function Friendchat() {
  // const {data: friends} = UseFriend()
  const router = useRouter();

  if (!friends || friends?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full w-full p-6 text-center">
        <div className="bg-[#2D2A2A]/40 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center max-w-md">
          <h3 className="text-2xl font-medium text-white mb-2">No Friends</h3>
          <p className="text-white/70 mb-4">
            Your friends list is currently empty.
          </p>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full my-2" />
          <p className="text-white/50 text-sm mt-2">add friends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-4 flex flex-col justify-center items-center">
      <div className="h-[10%] w-full flex justify-between items-center">
        <p className="text-2xl font-bold">Friends</p>
        <span
          className="text-[#40CFB7] underline text-sm hover:text-[#35b09c] cursor-pointer"
          onClick={() => {
            router.push("/friends/");
          }}
        >
          show all friends
        </span>
      </div>

      <div className="scrollbar-hide h-[90%] w-full rounded-lg flex justify-center items-center flex-col pt-1">
        {friends.slice(0, 4).map((item) => (
          <div
            key={item.username}
            className="relative flex items-center p-4 mb-3 w-[98%] rounded-lg bg-black/30"
          >
            <img
              src={item.avatar}
              className="rounded-full object-cover size-14"
            />
            <div className="ml-4">
              <div>
                <h1 className="text-lg font-extralight">{item.username}</h1>
              </div>
              <div className="flex flex-row space-x-1">
                <h2>{item.first_name}</h2>
                <h3>{item.last_name}</h3>
              </div>
            </div>
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
              <Icon
                icon="game-icons:ping-pong-bat"
                width="40"
                height="40"
                className="text-[#40CFB7] cursor-pointer hover:text-[#35b09c]"
              />
              <Icon
                icon="token:chat"
                width="40"
                height="40"
                className="text-[#40CFB7] cursor-pointer hover:text-[#35b09c]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
