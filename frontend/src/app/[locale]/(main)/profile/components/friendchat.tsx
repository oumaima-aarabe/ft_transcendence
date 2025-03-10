"use client";

import { UseUser } from "@/api/get-user";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const list = [
  {
    firstname: "kawtar ",
    lastname: "aboussi",
    username: "ka",
    avatar: "/assets/images/logo.svg",
  },
  {
    firstname: "kawtar ",
    lastname: "aboussi",
    username: "kaboussi",
    avatar: "/assets/images/logo.svg",
  },
  {
    firstname: "kawtar ",
    lastname: "aboussi",
    username: "ussi",
    avatar: "/assets/images/logo.svg",
  },
  {
    firstname: "kawtar ",
    lastname: "aboussi",
    username: "aboussi",
    avatar: "/assets/images/logo.svg",
  },
];

const fullFriendsList = [
  ...list,
  // Add more friends here
  {
    firstname: "John",
    lastname: "Doe",
    username: "johndoe",
    avatar: "/assets/images/logo.svg",
  },
  {
    firstname: "Jane",
    lastname: "Smith",
    username: "janesmith",
    avatar: "/assets/images/logo.svg",
  },
  // Add more as needed
];

const FriendItem = ({ item }: { item: (typeof list)[0] }) => (
  <div className="relative flex items-center p-4 mb-3 rounded-full bg-black">
    <img src={item.avatar} className="rounded-full object-cover size-20" />
    <div className="ml-4">
      <div>
        <h1 className="text-lg font-extralight">{item.username}</h1>
      </div>
      <div className="flex flex-row space-x-1">
        <h2>{item.firstname}</h2>
        <h3>{item.lastname}</h3>
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
  // const {data: myUserData} = UseUser()

  // if (!myUserData) return <></>;

  return (
    <div className="h-full w-full space-y-8 flex justify-center flex-col items-center">
      <div className="flex justify-center font-bold items-center">
        <p>3shrani</p>
      </div>

      <div className="overflow-auto scrollbar-hide h-full w-[85%]">
        {list.map((item) => (
          <FriendItem key={item.username} item={item} />
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button className="border text-black p-4 bg-[#40CFB7] border-[#40CFB7] lg:w-[50%] rounded-full hover:bg-[#35b09c] transition-colors">
            show more ...
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold mb-4">
              All Friends
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full pr-4">
            {fullFriendsList.map((item) => (
              <FriendItem key={item.username} item={item} />
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
