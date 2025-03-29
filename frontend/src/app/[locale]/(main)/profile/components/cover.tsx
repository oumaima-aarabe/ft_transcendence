"use client";

import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UseUser } from "@/api/get-user";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { useFriendMutation } from "@/hooks/useFriendMutation";
import { useNotificationsContext } from '@/providers/NotificationsProvider';
import { UseStates } from "@/api/get-player-states";

export enum FriendshipStatus {
  NONE = "none",
  PENDING = "pending",
  ACCEPTED = "accepted",
  BLOCKED = "blocked",
}

export type Friend = {
  id: string;
  sender: string;
  recipient: string;
  state: FriendshipStatus;
};

export const useFriendshipStatus = (username: string | undefined) => {
  return useQuery({
    queryKey: ["friendshipStatus", username],
    queryFn: async () => {
      if (!username) return null;
      try {
        const resp = await fetcher.get<Friend>(
          `/api/friends/status?username=${username}`
        );
        return resp.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!username,
  });
};

export default function Cover(props: { user: User; isOwner: boolean }) {
  const { user, isOwner } = props;
  const { data: statistics } = UseStates(user.id)
  const { data: me } = UseUser();
  const queryClient = useQueryClient();
  const { data: friendShip } = useFriendshipStatus(
    isOwner ? undefined : user?.username
  );
  const router = useRouter();
  const { socket } = useNotificationsContext();
  const friendMutation = useFriendMutation(user.username);

  const handleAddFriend = () => {
    friendMutation.mutate({
      url: "/api/friends/send-request/",
      username: user.username,
    });
  };

  const handleRemoveFriend = () => {
    friendMutation.mutate({
      url: "/api/friends/remove-friend/",
      username: user.username,
    });
  };

  const handleCancelRequest = () => {
    friendMutation.mutate({
      url: "/api/friends/cancel-request/",
      username: user.username,
    });
  };

  const handleBlockUser = () => {
    friendMutation.mutate({
      url: "/api/friends/block/",
      username: user.username,
    });
  };

  const handleUnBlockUser = () => {
    friendMutation.mutate({
      url: "/api/friends/unblock/",
      username: user.username,
    });
  };

  const handleAcceptRequest = () => {
    friendMutation.mutate({
      url: "/api/friends/confirm-request/",
      username: user.username,
    });
  };

  useEffect(() => {
    if (!socket || !user.username || !me) return;

    const handleFriendshipUpdate = () => {
      queryClient.invalidateQueries({
        queryKey: ["friendshipStatus", user.username],
      });
      queryClient.invalidateQueries({
        queryKey: ["friendshipStatus", me.username],
      });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle different types of friendship notifications
      switch (data.notification.type) {
        case "friend_request":
          handleFriendshipUpdate();
          break;

        case "friend_request_accepted":
          handleFriendshipUpdate();
          break;

        case "block":
          handleFriendshipUpdate();
          break;

        case "unblock":
          handleFriendshipUpdate();
          break;

        case "remove_friend":
          handleFriendshipUpdate();
          break;

        case "cancel_request":
          handleFriendshipUpdate();
          break;
      }
    };

    // Cleanup function
    return () => {
      socket.onmessage = null;
    };
  }, [socket, user.username, queryClient, me]);

  useEffect(() => {
    if (
      friendShip?.state === FriendshipStatus.BLOCKED &&
      friendShip.sender !== me?.username
    ) {
      router.push("/profile/me");
    }
  }, [friendShip, me?.username, router]);

  // if (!user) return null

  const renderFriendshipButton = () => {
    if (isOwner) return null;

    if (!friendShip || friendShip.state === FriendshipStatus.BLOCKED)
      return null;

    switch (friendShip.state) {
      case FriendshipStatus.NONE:
        return (
          <Button
            onClick={handleAddFriend}
            variant="default"
            disabled={friendMutation.isPending}
            className="bg-[#40CFB7] hover:bg-[#40CFB7]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
          >
            {friendMutation.isPending ? "Adding..." : "Add Friend"}
          </Button>
        );
      case FriendshipStatus.ACCEPTED:
        return (
          <Button
            onClick={handleRemoveFriend}
            variant="destructive"
            disabled={friendMutation.isPending}
            className="bg-[#c75b37] hover:bg-[#c75b37]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
          >
            {friendMutation.isPending ? "Removing..." : "Remove"}
          </Button>
        );
      case FriendshipStatus.PENDING:
        if (friendShip.sender === me?.username) {
          return (
            <Button
              onClick={handleCancelRequest}
              variant="default"
              disabled={friendMutation.isPending}
              className="bg-[#c75b37] hover:bg-[#c75b37]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
            >
              {friendMutation.isPending ? "Cancelling..." : "Cancel"}
            </Button>
          );
        } else {
          return (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                onClick={handleAcceptRequest}
                variant="default"
                disabled={friendMutation.isPending}
                className="bg-[#40CFB7] hover:bg-[#40CFB7]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
              >
                {friendMutation.isPending ? "Accepting..." : "Accept"}
              </Button>
              <Button
                onClick={handleCancelRequest}
                variant="destructive"
                disabled={friendMutation.isPending}
                className="bg-[#c75b37] hover:bg-[#c75b37]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
              >
                {friendMutation.isPending ? "Deleting..." : "Decline"}
              </Button>
            </div>
          );
        }
      default:
        return null;
    }
  };

  // Modify the renderBlockButton function
  const renderBlockButton = () => {
    if (!friendShip || isOwner) return null;

    if (friendShip.state === FriendshipStatus.BLOCKED) {
      if (friendShip.sender === me?.username) {
        return (
          <Button
            onClick={handleUnBlockUser}
            variant="destructive"
            disabled={friendMutation.isPending}
            className="bg-[#c75b37] hover:bg-[#c75b37]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
          >
            {friendMutation.isPending ? "Unblocking..." : "Unblock"}
          </Button>
        );
      }
      return null;
    } else {
      return (
        <Button
          onClick={handleBlockUser}
          variant="destructive"
          disabled={friendMutation.isPending}
          className="bg-[#c75b37] hover:bg-[#c75b37]/80 text-white px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-base"
        >
          {friendMutation.isPending ? "Blocking..." : "Block"}
        </Button>
      );
    }
  };

  return (
    <div className="relative w-full h-fit rounded-2xl bg-cover backdrop-blur-sm bg-center flex flex-col justify-center items-center">
      <div className="absolute -z-10 inset-0 w-full h-full bg-black/70 rounded-2xl"></div>
      <div className="w-full sm:w-[85%] md:w-[70%] flex flex-col items-center gap-3 py-4">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-[#40CFB7]">
            <AvatarImage
              src={user.avatar}
              alt="profile image"
              className="h-full w-full object-cover"
            />
            <AvatarFallback>
              {user.username?.substring(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
          <div className="text-lg sm:text-xl text-white font-medium mt-2">
            {user.username}
          </div>
        </div>

        {!isOwner && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2">
            {renderFriendshipButton()}
            {renderBlockButton()}
          </div>
        )}

        <div className="w-[90%] sm:w-[80%] space-y-1 mt-2">
          <div className="text-white/90 text-sm">Level {statistics ? statistics.level : "0"}</div>
          <Progress value={statistics ? statistics.experience % 1000 / 10 : 0} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}
