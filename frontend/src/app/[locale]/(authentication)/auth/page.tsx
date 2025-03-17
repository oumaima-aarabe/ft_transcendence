'use client';
import { useState, Dispatch, SetStateAction, useEffect } from "react"
import Image from "next/image";
import { RegisterForm } from "../components/register-form";
import LoginForm from "../components/login-form";
import TwoFactorVerification from "../components/2fa-verification";
import { useSearchParams } from "next/navigation";

export interface LoginFormProps {
  setLogin: Dispatch<SetStateAction<boolean>>;
}

export default function RegisterPage() {
  const [login, setLogin] = useState<boolean>(true);
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");
  const queryUserId = searchParams.get("userId");


  useEffect(() => {
    if (queryError === "2fa_required") {
      setShowTwoFactor(true);
    }
    // check if userId is a number
    if (queryUserId && !isNaN(Number(queryUserId))) {
      setUserId(queryUserId);
    }
  }, [queryError, userId]);
  
  return (
    <div className="min-h-screen justify-center flex flex-col items-center space-y-[40px]">
        <Image src="/assets/images/logo.svg" alt="logo" width={265} height={170} priority />
        {showTwoFactor ? (
          <TwoFactorVerification userId={userId} setShowTwoFactor={setShowTwoFactor} />
        ) : (
          login ? <LoginForm setLogin={setLogin} setShowTwoFactor={setShowTwoFactor} setUserId={setUserId} /> : <RegisterForm setLogin={setLogin} />
        )}
    </div>
  );
}
