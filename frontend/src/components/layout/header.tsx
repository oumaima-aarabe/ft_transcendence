"use client";

import { useContext } from "react";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserContext } from "@/contexts/UserContext";
import { useTranslations } from "next-intl";

export function Header() {
  const { myUserData } = useContext(UserContext);
  const t = useTranslations();

  return (
    <div className="h-20 backdrop-blur-sm flex items-center justify-between px-6 py-2">
      <Image
        src="/assets/images/logo.svg"
        alt="PongArcadia"
        width={120}
        height={32}
        className="w-[120px] lg:w-[150px] my-auto"
      />
      <div className="relative border-white/20">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={15}
        />
        <Input
          className="w-[320px] lg:w-[400px] h-11 lg:h-12 pl-10 bg-black/20 border-white/20 text-white text-xs lg:text-sm rounded-full"
          placeholder={t('header.search.placeholder')}
        />
      </div>
      <div className="flex items-center gap-6 lg:gap-9">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10 rounded-full"
        >
          <Bell
            size={22}
            className="h-[22px] w-[22px] lg:h-[25px] lg:w-[25px]"
            color="grey"
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-grey text-xs rounded-full w-4 h-4 flex items-center justify-center">
            1
          </span>
        </Button>
        <div className="flex items-center h-11 lg:h-12 px-1 pr-5 gap-2 lg:gap-2 bg-stone-900 border border-white/20 rounded-full">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarImage src={myUserData?.avatar} />
            <AvatarFallback>
              <img src="https://freeimage.host/i/2D8ByIj" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-xs lg:text-sm text-white">
              {myUserData
                ? `${myUserData.first_name} ${myUserData.last_name}`
                : t('common.loading')}
            </h2>
            <p className="text-[10px] text-xs lg:text-xs text-[#808080]">
              {myUserData?.status || t('header.status.offline')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
