"use client"

import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStateContext } from "@/providers/state-context"


const Cover = () => {

  const stateContext = useStateContext();
  const userData = stateContext?.state.user

  if (!userData) return  <></>

  return (
    <div className="border border-yellow w-full h-[20%] rounded-2xl bg-center bg-black flex flex-col justify-center items-center">
      <div className="border border-yellow-400 w-[50%] h-[70%]">
        <div className="flex justify-center items-center border h-[75%]">
          <Avatar className="border border-yellow-200 h-20 w-20">
            <AvatarImage
              src={userData.avatar}
              alt="profile image" />
            <AvatarFallback>
              KA
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center items-center">
          {userData.username}
        </div>
      </div>

      <div className="border border-green-400 w-full h-[30%]">
        <div className="border border-white ml-10 font-re">
          {userData.level || 'Level 5'}
        </div>
      </div>
    </div>
  )
}

export default Cover