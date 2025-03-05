"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Index(props : {function : (friends: string)=> void}) {

  return (
    <div className="w-full h-full flex flex-col justify-center items-center space-y-6">
      <div className=" w-[60%] h-[15%] border-b border-white flex items-center justify-center">
        <p className="text-white text-3xl">friendships</p>
      </div>
      <div className="w-[90%] h-[85%] pt-10 flex items-center justify-start flex-col space-y-2">
        <button
          className="border w-[98%] border-white  text-white p-4 rounded-full"
          onClick={()=>props.function("friends")}
        >
          Friends
        </button>
        <button
          className="border w-[98%] border-white text-white p-4 rounded-full"
          onClick={()=>props.function("sent")}
        >
          sent invitations
        </button>
        <button
          className="border w-[98%] border-white text-white p-4 rounded-full"
          onClick={()=>props.function("received")}
        >
          received invitations
        </button>
        <button
          className="border w-[98%] border-white text-white p-4 rounded-full"
          onClick={()=>props.function("blocked")}
        >
          Blocked users
        </button>
      </div>
    </div>
  );
}
