import React, { useState, useEffect } from "react";
import PasswordUpdate from "./PasswordUpdate";
import LanguageSelection from "./LanguageSelection";
import TwoFactorAuth from "./TwoFactorAuth";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";

const AccountView: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch user profile data including 2FA status
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetcher.get('/api/users/profile/me/');
      return response.data;
    }
  });

  // Update 2FA status when user data is loaded
  useEffect(() => {
    if (userData && userData.is_2fa_enabled !== undefined) {
      setIs2FAEnabled(userData.is_2fa_enabled);
    }
  }, [userData]);

  const toggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pt-10 lg:pt-20 w-2/3 lg:max-w-[50rem] text-white">
      <PasswordUpdate />
      <LanguageSelection />
      <TwoFactorAuth
        is2FAEnabled={is2FAEnabled}
        toggle2FA={toggle2FA}
      />
    </div>
  );
};

export default AccountView;
