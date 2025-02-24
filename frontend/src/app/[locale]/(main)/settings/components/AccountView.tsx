import React, { useState } from "react";
import PasswordUpdate from "./PasswordUpdate";
import LanguageSelection from "./LanguageSelection";
import TwoFactorAuth from "./TwoFactorAuth";

const AccountView: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pt-10 lg:pt-20 w-2/3 lg:max-w-[50rem] text-white">
      <PasswordUpdate />
      <LanguageSelection />
      <TwoFactorAuth
        is2FAEnabled={is2FAEnabled}
        toggle2FA={() => setIs2FAEnabled(!is2FAEnabled)}
      />
    </div>
  );
};

export default AccountView;
