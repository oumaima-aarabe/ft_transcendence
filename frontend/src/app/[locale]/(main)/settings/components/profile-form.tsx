"use Client";

import React, { useState, useEffect } from "react";
import { Option, CustomSelect } from "./CustomSelect";
import { sendRequest } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { QueryClient } from "@tanstack/react-query";

export default function ProfileForm({ formData, setFormData }: { formData: any, setFormData: any }) {
    const { toast } = useToast();
    const queryClient = new QueryClient()
    const settingsT = useTranslations('settings');
    const t = useTranslations('settings.profile');
    const statusT = useTranslations('header.status');
    const [selectedValue, setSelectedValue] = useState<string>(formData?.status || '');

    const statusOptions: Option[] = [
        { value: 'online', label: statusT('online'), src: '/assets/icons/online-icon.svg' },
        { value: 'invisible', label: statusT('invisible'), src: '/assets/icons/invisible-icon.svg' },
        { value: 'busy', label: statusT('busy'), src: '/assets/icons/lune-icon.svg' },
    ];

    useEffect(() => {
        setSelectedValue(formData?.status || '');
    }, [formData]);

    useEffect(() => {
        setFormData({ ...formData, status: selectedValue });
    }, [selectedValue]);

    const saveForm = () => {
        if (!formData.username.includes("_")) {
            toast({
                title: settingsT('username.error.underscore.title'),
                description: settingsT('username.error.underscore.description'),
            });
            return;
        }

        sendRequest("patch", "/users/update/", formData)
        .then(async (res: any) => {
            toast({
                title: t('success.title'),
                description: t('success.description'),
            });
            // I have changed this to refetch with react query
            // fetchMyUserData();
            await queryClient.refetchQueries({queryKey: 'me'})

        })
        .catch((err: any) => {
            toast({
                title: t('error.title'),
                description: t('error.description'),
            });
        });
    }

    return (
        <div className="flex flex-col gap-6 mt-10 w-full items-center justify-center">
            {/* First Name */}
            <div className="flex flex-col w-2/3">
                <label htmlFor="firstName" className="text-white text-sm mb-2">{t('first_name')}</label>
                <div className="relative">
                    <input
                        type="text"
                        id="firstName"
                        className="w-full h-11 pl-10 pr-3 py-2 bg-[#2D2A2A]/30 border border-white/20 focus:outline-none rounded-xl text-white text-sm"
                        placeholder={formData?.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                    <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <img src="/assets/icons/icon-user.svg" alt="User Icon" className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col w-2/3">
                <label htmlFor="lastName" className="text-white text-sm mb-2">{t('last_name')}</label>
                <div className="relative">
                    <input
                        type="text"
                        id="lastName"
                        className="w-full h-11 pl-10 pr-3 py-2 bg-[#2D2A2A]/30 border border-white/20 focus:outline-none rounded-xl text-white text-sm"
                        placeholder={formData?.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                    <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <img src="/assets/icons/icon-user.svg" alt="User Icon" className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Username */}
            <div className="flex flex-col w-2/3">
                <label htmlFor="username" className="text-white text-sm mb-2">{t('username')}</label>
                <div className="relative">
                    <input
                        type="text"
                        id="username"
                        className="w-full h-11 pl-10 pr-3 py-2 bg-[#2D2A2A]/30 border border-white/20 focus:outline-none rounded-xl text-white text-sm"
                        placeholder={formData?.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <img src="/assets/icons/icon-@.svg" alt="At Icon" className="h-5 w-5" />
                    </div>
                </div>
            </div>
            {/* Status */}
            <div className="flex flex-col w-full items-center justify-center">
                <CustomSelect
                    options={statusOptions}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                />
            </div>

            {/* Save Changes */}
            <button
                className="w-2/3 h-10 bg-[#D05F3B]/90 text-white mt-3 text-normal rounded-xl hover:bg-[#D05F3B]/70"
                onClick={() => saveForm()}
            >
                {t('save')}
            </button>
        </div>

    );
}
