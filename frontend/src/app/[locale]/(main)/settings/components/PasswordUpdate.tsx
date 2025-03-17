'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { sendRequest } from '@/lib/axios';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PasswordUpdate = () => {
    const t = useTranslations('settings.password');
    const { toast } = useToast();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const updatePassword = () => {
        setIsLoading(true);
        sendRequest("post", "/users/update-password/", { old_password: oldPassword, new_password: newPassword })
        .then((res) => {
            console.log(res);
            toast({
                title: t('success.title'),
                description: t('success.description'),
            });
        })
        .catch((err) => {
            if (err.response.data.code === "old_incorrect") {
                toast({
                    title: t('error.incorrect_old.title'),
                    description: t('error.incorrect_old.description'),
                });
            } else if (err.response.data.code === "data_missing") {
                toast({
                    title: t('error.data_missing.title'),
                    description: t('error.data_missing.description'),
                });
            } else if (err.response.data.code === "intra_email") {
                toast({
                    title: t('error.intra_account.title'),
                    description: t('error.intra_account.description'),
                });
            } else {
                toast({
                    title: t('error.generic.title'),
                    description: t('error.generic.description'),
                });
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-normal">{t('title')}</h2>
            <div className="flex gap-7">
                <div className="relative gap-4">
                    <input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder={t('old_password')}
                        className="max-w-[18rem] h-10 px-12 bg-[#2D2A2A]/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#40CFB7]/50"
                    />
                    <Image src="/assets/icons/password_icon.svg" alt="Lock" width={11} height={11} className="absolute top-3 left-4" />
                    {showOldPassword ?
                        <Eye size={18} className="absolute top-3 right-3 text-gray-500 cursor-pointer" onClick={() => setShowOldPassword(!showOldPassword)}/> 
                    :
                        <EyeOff size={18} className="absolute top-3 right-3 text-gray-500 cursor-pointer" onClick={() => setShowOldPassword(!showOldPassword)}/>}
                </div>
                <div className="relative gap-4">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('new_password')}
                        className=" max-w-[18rem] h-10 px-12 bg-[#2D2A2A]/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#40CFB7]/50"
                    />
                    <Image src="/assets/icons/password_icon.svg" alt="Lock" width={11} height={11} className="absolute top-3 left-4" />
                    {showNewPassword ? 
                        <Eye size={18} className="absolute top-3 right-3 text-gray-500 cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}/>
                    :
                        <EyeOff size={18} className="absolute top-3 right-3 text-gray-500 cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}/>}  
                </div>
            </div>
            <button
                onClick={updatePassword}
                className="self-start px-5 py-2 bg-[#D05F3B]/90 mt-2 hover:bg-[#D05F3B]/80 text-white text-sm text-center rounded-xl transition focus:outline-none"
                disabled={isLoading}
            >
                {isLoading ? t('updating') : t('update_button')}
            </button>
        </div>
    );
};

export default PasswordUpdate;
