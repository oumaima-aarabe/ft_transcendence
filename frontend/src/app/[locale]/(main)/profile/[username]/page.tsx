"use client";

import Cover from "@/app/[locale]/(main)/profile/components/cover";
import Friendchat from "../components/friendchat";
import { UseOtherUser, UseUser } from "@/api/get-user";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/[locale]/loading";
import Achievements from "../components/achievements";
import MatchHistory from "../components/match-history";
import Statistics from "../components/statistics";

export default function Page() {
  const [owner, setOwner] = useState<boolean>(false);
  const { username } = useParams();
  const { data: me, isLoading: meLoading } = UseUser();
  const {
    data: other,
    isLoading: otherLoading,
    error,
  } = UseOtherUser(username as string);

  useEffect(() => {
    if (!me || !other) return;
    if (me.username === other.username) setOwner(true);
  }, [me, other]);

  if (meLoading || otherLoading) {
    return <Loading />;
  }

  if (error || !other) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-6 backdrop-blur-sm bg-black/50 p-8 rounded-2xl max-w-lg">
          <div className="text-[#c75b37] text-8xl font-bold">404</div>
          <h1 className="text-3xl font-semibold text-white">User Not Found</h1>
          <p className="text-gray-400">
            The user you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#40CFB7] hover:bg-[#40CFB7]/80 text-white rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px] text-white">
      <div className="w-[100%] h-[100%]  space-y-8">
        <Cover user={other} isOwner={owner} />
        <div className=" w-[100%] xl:flex-row flex-col h-[70%] flex gap-4">
          <div className=" xl:w-[50%] w-full h-[100%] flex flex-col space-y-4">
            <div className="backdrop-blur-sm font-bold text-xl bg-black/50 rounded-2xl p-4 h-[48%] w-[100%] flex justify-center items-center">
              <Achievements userId={other?.id ? Number(other.id) : undefined}/>
            </div>

            <div className="backdrop-blur-sm bg-black/50 rounded-2xl text-xl font-bold p-4 h-[50%] w-[100%]">
              <MatchHistory userId={other?.id ? Number(other.id) : undefined} />
            </div>
          </div>

          <div className="xl:w-[50%] w-full h-[100%] flex flex-col space-y-4">
            <div className="w-[100%] h-[60%] backdrop-blur-sm bg-black/50 rounded-2xl p-4 flex justify-center items-center">
              <Statistics userId={other?.id ? Number(other.id) : undefined}/>
            </div>

            <div className=" text-xl w-[100%] backdrop-blur-sm bg-black/50 rounded-2xl h-[40%] p-4 flex justify-center items-center">
              <Friendchat />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
