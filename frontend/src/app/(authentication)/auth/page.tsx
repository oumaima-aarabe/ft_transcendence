'use client';
import { useState, Dispatch, SetStateAction } from "react"
import Image from "next/image";
import { RegisterForm } from "@/app/(authentication)/components/register-form";
import LoginForm from "@/app/(authentication)/components/login-form";


export interface LoginFormProps {
  setLogin: Dispatch<SetStateAction<boolean>>;
}

export default function RegisterPage() {
  const [login, setLogin] = useState<boolean>(true)
  return (
    <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px]">
      <Image src="/logo.svg" alt="logo" width={265} height={170} />
      {login === true ? <LoginForm setLogin={setLogin} /> : <RegisterForm setLogin={setLogin} />}
    </div>
  );
}
