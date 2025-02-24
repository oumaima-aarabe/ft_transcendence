"use client";

import { User } from "../types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StatusAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

export function StatusAvatar({ user, size = "md" }: StatusAvatarProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-24 w-24",
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.avatar} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <span
        className={`absolute top-0 left-0 w-3 h-3 rounded-full ${
          user.status === "online" ? "bg-[#4CB5AB]" : "bg-[#808080]"
        }`}
      />
    </div>
  );
}
