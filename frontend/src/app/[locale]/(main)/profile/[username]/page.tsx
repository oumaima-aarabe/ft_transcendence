"use client";

import Cover from "@/app/[locale]/(main)/profile/components/cover";
import Friendchat from "../components/friendchat";
import { UseOtherUser, UseUser } from "@/api/get-user";
import { useParams } from "next/navigation";
import Achievements from "../components/achievements";
import MatchHistory from "../components/match-history";
import { useEffect, useState } from "react";
import { User } from "@/types/user";

// import { User } from "lucide-react";

export default function Page() {
  const [user, setUser] = useState<User | undefined >(undefined)

  const { username } = useParams();

  const { data: me } = UseUser(username as string);
  const { data: other } = UseOtherUser(username as string);

  useEffect(() => {
   if (me) setUser(me)
    else setUser(other as User)
  },[me, other])



  if (!user) {
    return <div> loeading...</div>;
  }

  return (
    <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px] text-white">
      <div className="w-[100%] h-[100%]  space-y-8">
        <Cover user={user} />
        <div className=" w-[100%] xl:flex-row flex-col h-[70%] flex gap-4">
          <div className=" xl:w-[50%] w-full h-[100%] flex flex-col space-y-4">
            <div className="backdrop-blur-sm font-bold text-xl bg-black/50 rounded-2xl p-4 h-[48%] w-[100%]">
              {/* Achievement */}
              <Achievements/>
            </div>
            <div className="backdrop-blur-sm bg-black/50 rounded-2xl text-xl font-bold p-4 h-[50%] w-[100%]">
              {/* Match history  */}
              <MatchHistory/>
            </div>
          </div>
          <div className=" xl:w-[50%] text-xl w-[100%] backdrop-blur-sm bg-black/50 rounded-2xl h-[100%] p-4 ">
            <Friendchat />
          </div>
        </div>
      </div>
    </div>
  );
}
