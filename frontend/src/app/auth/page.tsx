// import { useState } from "react"
import Image from "next/image"
import { RegisterForm } from "../../components/register-form"
import LoginForm from "@/components/login-form"

export default function RegisterPage() {
    // const [login, setLogin] = useState<boolean>(true)
    return (
        <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px]">
            <Image src="/logo.svg" alt="logo" width={265} height={170}/>
            {/* <RegisterForm/> */}
            <LoginForm/> 
        </div>
    )
}