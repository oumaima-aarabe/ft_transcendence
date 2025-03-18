"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { UseUser } from "@/api/get-user";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Header() {
  const { data: myUserData } = UseUser();
  const t = useTranslations("header");
  const tc = useTranslations("common");
  const statusT = useTranslations("header.status");

  return (
    <div className="h-20 backdrop-blur-sm flex items-center justify-between px-6 py-2">
      <Image
        src="/assets/images/logo.svg"
        alt="PongArcadia"
        width={120}
        height={32}
        className="w-[120px] lg:w-[150px] my-auto"
        priority
      />
      <div className="relative border-white/20">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={15}
        />
        <Input
          className="w-[320px] lg:w-[400px] h-11 lg:h-12 pl-10 bg-black/20 border-white/20 text-white text-xs lg:text-sm rounded-full"
          placeholder={t("search.placeholder")}
        />
      </div>
      <div className="flex items-center gap-6 lg:gap-9">
        <NotificationsDropdown />
        <div className="flex items-center h-11 lg:h-12 px-1 pr-5 gap-2 lg:gap-2 bg-stone-900 border border-white/20 rounded-full">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarImage src={myUserData?.avatar} />
            <AvatarFallback>
              <img src="https://iili.io/2D8ByIj.png" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-xs lg:text-sm text-white">
              {myUserData
                ? `${myUserData.first_name} ${myUserData.last_name}`
                : tc("loading")}
            </h2>
            <p className="text-[10px] text-xs lg:text-xs text-[#808080]">
              {statusT(myUserData?.status || "offline")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
