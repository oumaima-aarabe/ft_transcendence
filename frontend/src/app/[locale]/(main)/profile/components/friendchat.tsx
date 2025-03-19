"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { useRouter } from "@/i18n/routing";
import { UseUser } from "@/api/get-user";
import { UseFriend } from "@/api/get-friends";
import { useMutation } from "@tanstack/react-query";

export default function Friendchat() {
  const router = useRouter();
  const { data: me } = UseUser();
  const { data: friends } = UseFriend();

  const pathSegments = window.location.pathname.split("/");
  const profileUsername = pathSegments[pathSegments.length - 1];
  const isOwner = profileUsername === "me" || profileUsername === me?.username;

  const friendMutation = useMutation({
    mutationFn: async ({
      url,
      username,
    }: {
      url: string;
      username: string;
    }) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  const handleRemoveFriend = (username: string) => {
    friendMutation.mutate({
      url: "/api/friends/remove-friend/",
      username: username,
    });
  };

  // If not the owner's profile, show private message
  if (!isOwner) {
    return (
      <div className="flex flex-col justify-center items-center h-full w-full p-6 text-center">
        <div className="bg-[#2D2A2A]/40 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center max-w-md">
          <Icon
            icon="mdi:friends-lock"
            className="text-white/70 w-12 h-12 mb-3"
          />
          <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
            Private Friends List
          </h3>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full my-4" />
        </div>
      </div>
    );
  }

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

      <div className="scrollbar-hide h-[90%] w-full rounded-lg flex justify-start items-center flex-col pt-1">
        {friends.slice(0, 4).map((item) => (
          <div
            key={item.username}
            className="relative flex flex-col sm:flex-row items-center p-2 sm:p-4 mb-3 w-[98%] rounded-lg bg-black/30"
          >
            <img
              src={item.avatar}
              className="rounded-full object-cover w-16 h-16 sm:w-20 sm:h-20"
              alt={`${item.username}'s avatar`}
            />
            <div className="mt-2 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
              <div>
                <h1 className="text-base text-gray-300 sm:text-lg font-extralight">
                  {item.username}
                </h1>
              </div>
              <div className="flex flex-row justify-center sm:justify-start space-x-1 text-white">
                <h2 className="text-sm sm:text-base">{item.first_name}</h2>
                <h3 className="text-sm sm:text-base">{item.last_name}</h3>
              </div>
            </div>
            <div className="relative sm:absolute right-0 sm:right-5 mt-2 sm:mt-0 top-auto sm:top-1/2 transform sm:-translate-y-1/2 flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleRemoveFriend(item.username)}
                className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-[#c75b37]/20 text-[#c75b37] rounded-lg hover:bg-[#c75b37]/30 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// "use client";

// import { useNotifications } from '@/hooks/useNotifications';
// import { useQueryClient } from '@tanstack/react-query';
// import { useEffect } from 'react';

// export default function Friendchat() {
//   const { socket } = useNotifications();
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   useEffect(() => {
//     if (!socket) return;

//     const handleFriendUpdate = () => {
//       // Refetch friends list to update the UI
//       queryClient.invalidateQueries(['friends']);
//     };

//     socket.on('friend_request', handleFriendUpdate);
//     socket.on('friend_request_accepted', handleFriendUpdate);
//     socket.on('block_status_update', handleFriendUpdate);

//     return () => {
//       socket.off('friend_request', handleFriendUpdate);
//       socket.off('friend_request_accepted', handleFriendUpdate);
//       socket.off('block_status_update', handleFriendUpdate);
//     };
//   }, [socket, queryClient]);

//   if (!friends || friends?.length === 0) {
//     // ... your empty state JSX
//   }

//   return (
//     <div className="h-full w-full space-y-4 flex flex-col justify-center items-center">
//       {/* ... your existing JSX ... */}
//     </div>
//   );
// }
