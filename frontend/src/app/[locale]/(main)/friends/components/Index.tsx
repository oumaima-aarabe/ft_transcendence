"use client";

import React from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Index(props: { function: (friends: string) => void }) {
  const t = useTranslations('friends.sections');
  
  return (
    <div className="w-full h-full bg-[#241715]/44 backdrop-blur-sm rounded-tl-lg rounded-bl-lg flex flex-col overflow-hidden">
      <div className="flex gap-0.1 p-2 sm:p-3 w-full h-full bg-[#2D2A2A]/10 backdrop-blur-sm rounded-[30px]">
        <div className="flex flex-col w-full items-center">
          <div className="flex flex-col w-full py-5 sm:py-10 items-center">
            <h1 className="text-2xl sm:text-4xl text-white font-normal">
              {t('title')}
            </h1>
          </div>
          <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-5 sm:mb-10" />

          <button
            onClick={() => props.function("friends")}
            className="relative flex w-[90%] sm:w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-1 sm:my-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-7 sm:h-7 mt-2 ml-1 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div className="absolute top-0 sm:top-1/2 translate-y-[40%] sm:-translate-y-1/2 flex justify-center items-center w-full text-xs sm:text-base">
              {t('friends')}
            </div>
          </button>

          <button
            onClick={() => props.function("sent")}
            className="relative flex w-[90%] sm:w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-1 sm:my-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-7 sm:h-7 mt-2 ml-1 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22 11 13 2 9 22 2z" />
            </svg>
            <div className="absolute top-0 sm:top-1/2 translate-y-[40%] sm:-translate-y-1/2 flex justify-center items-center w-full text-xs sm:text-base">
              {t('sentInvitations')}
            </div>
          </button>

          <button
            onClick={() => props.function("received")}
            className="relative flex w-[90%] sm:w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-1 sm:my-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-7 sm:h-7 mt-2 ml-1 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <div className="absolute top-0 sm:top-1/2 translate-y-[40%] sm:-translate-y-1/2 flex justify-center items-center w-full text-xs sm:text-base">
              {t('receivedInvitations')}
            </div>
          </button>

          <button
            onClick={() => props.function("blocked")}
            className="relative flex w-[90%] sm:w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-1 sm:my-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-7 sm:h-7 mt-2 ml-1 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <div className="absolute top-0 sm:top-1/2 translate-y-[40%] sm:-translate-y-1/2 flex justify-center items-center w-full text-xs sm:text-base">
              {t('blockedUsers')}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
