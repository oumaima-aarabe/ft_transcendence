'use client';
import { useState, Dispatch, SetStateAction } from "react"
import Image from "next/image";
import { RegisterForm } from "../components/register-form";
import LoginForm from "../components/login-form";


export interface LoginFormProps {
  setLogin: Dispatch<SetStateAction<boolean>>;
}

export default function RegisterPage() {
  const [login, setLogin] = useState<boolean>(true)
  return (
    <div className="min-h-screen justify-center flex flex-col items-center space-y-[40px]">
        <Image src="/assets/images/logo.svg" alt="logo" width={265} height={170} priority />
        {login === true ? <LoginForm setLogin={setLogin} /> : <RegisterForm setLogin={setLogin} />}
    </div>
  );
}
