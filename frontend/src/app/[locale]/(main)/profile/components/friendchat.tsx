"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
// import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
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
          <h3 className="text-2xl font-medium text-white mb-2">
            No Blocked Users
          </h3>
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
    <div className="h-full w-[88%] space-y-3 flex flex-col justify-center items-center ">
      <div className="flex h-[10%] w-full justify-center font-bold items-center">
        <p>3shrani</p>
      </div>

      <div className="overflow-auto scrollbar-hide h-[70%] w-full ">
        {friends.map((item) => (
          <div
            key={item.username}
            className="relative flex items-center p-4 mb-3  rounded-full bg-black"
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
            <Icon
              icon="token:chat"
              width="50"
              height="50"
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center h-[15%] w-full">
        <button
          onClick={() => {
            router.push("/friends/");
          }}
          className="border text-black p-3 border-[#40CFB7] bg-[#40CFB7] hover:bg-[#EEE5BE] shadow-shd lg:w-[50%] rounded-full transition-colors"
        >
          show more ...
        </button>
      </div>
    </div>
  );
}
