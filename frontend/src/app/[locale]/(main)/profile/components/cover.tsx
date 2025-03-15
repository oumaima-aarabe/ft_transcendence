"use client";

import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UseUser } from "@/api/get-user";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

export const getFriendShipStatus = async (username: string) => {
  try {
    const resp = await fetcher.get<Friend>(
      `/api/friends/status?username=${username}`
    );
    return resp.data;
  } catch (error) {
    return null;
  }
};

export default function Cover(props: { user: User; isOwner: boolean }) {
  const { user, isOwner } = props;
  const { data: me } = UseUser();
  const [friendShip, setFriendShip] = useState<Friend | null>(null);
  const router = useRouter()

  const updateFriendState = async ({url, username}: {url: string, username: string}) => {
    try {
      const response = await fetcher.post(url, {username});
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as any;
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  const friendMutation = useMutation({
    mutationFn: updateFriendState,
    onSuccess: (data) => {
      console.log('data: ', data)
      setFriendShip(data)
    },
    onError: (error) => {
      console.log("state not updated", error);
    }
  })

  useEffect(() => {
    if (!user?.username || !me?.username || isOwner) return;
  
    const fetchStatus = async () => {
      const status = await getFriendShipStatus(user.username);
      console.log('status: ', status)
      if (status) {
        setFriendShip(status);
      } else {
        setFriendShip({
          id: "",
          recipient: user.username,
          sender: me.username,
          state: FriendshipStatus.NONE,
        });
      }
    };

    fetchStatus();
  }, [user, me, isOwner]);

  const handleAddFriend = () => {
    friendMutation.mutate({url: '/api/friends/send-request/', username: user.username})
  };

  const handleRemoveFriend = () => {
    friendMutation.mutate({url: '/api/friends/remove-friend/', username: user.username})
  };

  const handleCancelRequest = () => {
    friendMutation.mutate({url: '/api/friends/cancel-request/', username: user.username})
  };

  const handleBlockUser = () => {
    friendMutation.mutate({url: '/api/friends/block/', username: user.username})
  };

  const handleUnBlockUser = () => {
    friendMutation.mutate({url: '/api/friends/unblock/', username: user.username})
  };

  const handleAcceptRequest = () => {
    friendMutation.mutate({url: '/api/friends/confirm-request/', username: user.username})
  };

  // if (!user) return null

  // Render buttons based on friendship status
  const renderFriendshipButton = () => {
    if (isOwner) return null

    if (!friendShip || friendShip.state === FriendshipStatus.BLOCKED) return null;

    // console.log('status: ', friendShip.state)
    // console.log('status type: ', typeof(friendShip.state))

    switch (friendShip.state) {
      case FriendshipStatus.NONE:
        return (
          <Button onClick={handleAddFriend} variant="default" disabled={friendMutation.isPending}>
            {friendMutation.isPending ? "Adding..." : "Add Friend"}
          </Button>
        );
      case FriendshipStatus.ACCEPTED:
        return (
          <Button onClick={handleRemoveFriend} variant="destructive" disabled={friendMutation.isPending}>
            {friendMutation.isPending ? "Removing..." : "Remove Friend"}
          </Button>
        );
      case FriendshipStatus.PENDING:
        if (friendShip.sender === me?.username) {
          return (
            <Button onClick={handleCancelRequest} variant="default" disabled={friendMutation.isPending}>
              {friendMutation.isPending ? "Cancelling..." : "Cancel Request"}
            </Button>
          );
        } else {
          return (
            <div className="flex gap-2">
              <Button onClick={handleAcceptRequest} variant="default" disabled={friendMutation.isPending}>
                {friendMutation.isPending ? "Accepting..." : "Accept Request"}
              </Button>
              <Button onClick={handleCancelRequest} variant="destructive" disabled={friendMutation.isPending}>
                {friendMutation.isPending ? "Deleting..." : "Delete Request"}
              </Button>
            </div>
          );
        }
      default:
        return null;
    }
  };

  const renderBlockButton = () => {
    if (!friendShip || isOwner)
      return null

    if (friendShip.state === FriendshipStatus.BLOCKED) {
      if (friendShip.sender === me?.username) {
        return (
          <Button onClick={handleUnBlockUser} variant="destructive" disabled={friendMutation.isPending}>
            {friendMutation.isPending ? "Unblocking..." : "Unblock User"}
          </Button>
        )
      }
      router.push('/en/profile/me')
      return null
    } else {
      return (
        <Button onClick={handleBlockUser} variant="destructive" disabled={friendMutation.isPending}>
          {friendMutation.isPending ? "Blocking..." : "Block User"}
        </Button>
      )
    }
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
            <AvatarFallback>{user.username?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center items-center">{user.username}</div>
        <>
          {renderFriendshipButton()}
          {renderBlockButton()}
        </>
      </div>

      <div className=" w-[80%] h-[30%]">
        <div className="space-y-4">
          {user.level || "Level 0"}
          <Progress value={60} />
        </div>
      </div>
    </div>
  );
}