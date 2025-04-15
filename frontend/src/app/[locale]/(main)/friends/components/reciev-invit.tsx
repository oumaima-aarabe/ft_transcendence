"use client";

import React from "react";
import { UseInvitation } from "@/api/get-Invitation";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ReceivedInvitations() {
  const { data: invitation } = UseInvitation();
  const router = useRouter();
  const t = useTranslations('friends');
  
  const handleNavigateToProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  if (!invitation || invitation?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full w-full p-6 text-center">
        <div className="bg-[#2D2A2A]/40 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center max-w-md">
          <h3 className="text-2xl font-medium text-white mb-2">
            {t('noInvitations')}
          </h3>
          <p className="text-white/70 mb-4">{t('emptyInvitationsList')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="white h-full w-full space-y-8 flex justify-center flex-col items-center">
      <div className="overflow-auto scrollbar-hide h-[90%] w-full md:w-[85%]">
        {invitation.map((item) => (
          <div
            key={item.username}
            onClick={() => handleNavigateToProfile(item.username)}
            className="relative flex flex-col sm:flex-row items-center p-2 sm:p-4 mb-3 rounded-lg bg-black"
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
              <div className="flex flex-row justify-center sm:justify-start text-white space-x-1">
                <h2 className="text-sm sm:text-base">{item.first_name}</h2>
                <h3 className="text-sm sm:text-base">{item.last_name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
