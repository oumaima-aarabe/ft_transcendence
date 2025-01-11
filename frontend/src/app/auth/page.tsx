// import { useState } from "react"
import { RegisterForm } from "../../components/register-form"

export default function RegisterPage() {
    // const [login, setLogin] = useState<boolean>(true)
    return (
        <div className="h-screen w-screen justify-center flex items-center">
            <div className="shadow-xl p-4 text-black rounded-xl">
                <h1>Register</h1>
                <RegisterForm/>
            </div>
            {/* {login ? <div></div> : <div></div>} */}
        </div>
    )
}