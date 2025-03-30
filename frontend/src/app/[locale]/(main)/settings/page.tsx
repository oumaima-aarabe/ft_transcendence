"use client";

import { useState } from 'react';
import { UserPen, Shield } from 'lucide-react';
import ProfileView from './components/ProfileView';
import AccountView from './components/AccountView';
import GameView from './components/GameView';
import { useTranslations } from "next-intl";

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const t = useTranslations('settings');

  return (
    <div className="relative h-full w-full max-w-[2000px] mx-auto">
      <div className="flex gap-1 p-3 w-full h-full bg-black/40 backdrop-blur-sm rounded-[20px]">
        {/* side bar */}
        <div className="w-1/4 bg-[#241715]/44 backdrop-blur-sm rounded-l-[20px] flex flex-col overflow-hidden min-w-[20rem] max-w-[25rem]">
          <div className="flex gap-0.1 p-3 w-full h-full bg-[#2D2A2A]/10 backdrop-blur-sm rounded-[30px]">
            <div className="flex flex-col w-full items-center">
              <div className="flex flex-col w-full py-10 items-center text-4xl text-white font-normal">
                <h1>{t('title')}</h1>
              </div>
              <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-10" />
              {/* button */}
              <button onClick={() => setActiveTab('Profile')} className={`relative flex w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-2 ${activeTab === 'Profile' ? "bg-[#A86F43]/30" : ""}`}>
                <UserPen className="w-7 h-7 mt-2 ml-1 mb-2" />
                <div className='absolute top-0 translate-y-[50%] flex justify-center items-center w-full'> {t('tabs.profile')} </div>
              </button>
              {/* button */}
              <button onClick={() => setActiveTab('Account')} className={`relative flex w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-2 ${activeTab === 'Account' ? "bg-[#A86F43]/30" : ""}`}>
                <Shield className="w-7 h-7 mt-2 ml-1 mb-2" />
                <div className='absolute top-0 translate-y-[50%] flex justify-center items-center w-full'> {t('tabs.account')} </div>
              </button>
              {/* button */}
              <button onClick={() => setActiveTab('Game')} className={`relative flex w-full text-white font-normal bg-[#2D2A2A]/30 border border-white/10 rounded-xl my-2 ${activeTab === 'Game' ? "bg-[#A86F43]/30" : ""}`}>
                <img src='/assets/icons/white-pong-64.svg' className="w-8 h-8 mt-2 ml-1 mb-2" alt="Pong Game Icon" />
                <div className='absolute top-0 translate-y-[50%] flex justify-center items-center w-full'> {t('tabs.game')} </div>
              </button>
            </div>
          </div>
        </div>
        {/* Main content */}
        <div className="flex flex-col w-full bg-[#241715]/44 backdrop-blur-sm overflow-hidden ml-0.5 rounded-r-[20px]">
          <div className=" flex items-center justify-center ">
            {/* Dynamic View Rendering */}
            {activeTab === 'Profile' && <ProfileView />}
            {activeTab === 'Account' && <AccountView />}
            {activeTab === 'Game' && <GameView />}
          </div>
        </div>
      </div>
    </div>
  );
}