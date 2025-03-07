"use client";

import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UseUser } from "@/api/get-user";
import { User } from "@/types/user";

export default function cover(props: { user: User }) {
  const { user } = props;

  const handleAddFriend = () => {
    // Implement add friend logic
  };

  const handleBlock = () => {
    // Implement block logic
  };
  return (
    <div className="relative w-full min-h-[30%] rounded-2xl bg-cover  backdrop-blur-sm bg-center flex flex-col justify-center items-center">
      <div className="absolute -z-10 inset-0 w-full h-full bg-black/70 rounded-2xl"></div>
      <div className="w-[50%] h-[70%]">
        <div className="flex justify-center items-center h-[75%]">
          <Avatar className="h-28 w-28">
            <AvatarImage
              src={user.avatar}
              alt="profile image"
              className="h-full w-full"
            />
            zinc
            <AvatarFallback>KA</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center items-center">{user.username}</div>
      </div>

      <div className=" w-[80%] h-[30%]">
        <div className="space-y-4">
          {user.level || "Level 0"}
          <Progress value={60} />
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => handleAddFriend()}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Friend
        </button>

        <button
          onClick={() => handleBlock()}
          className="px-4 py-2 bg-red-900/60 hover:bg-red-800/60 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          Block
        </button>
      </div>
    </div>
  );
}
