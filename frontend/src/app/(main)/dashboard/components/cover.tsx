"use client"

import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"


const Cover = () => {

  const getUser = async () => {
    const response = await fetcher.get('/api/users/me')
    return response.data
  } 

  const { data: userData, isError, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: getUser,
  })

  if (isLoading) {
    return (
      <div className="w-full h-[20%] rounded-2xl bg-black flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full h-[20%] rounded-2xl bg-black flex justify-center items-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="border border-yellow w-full h-[20%] rounded-2xl bg-center bg-black flex flex-col justify-center items-center">
      <div className="border border-yellow-400 w-[50%] h-[70%]">
        <div className="flex justify-center items-center border h-[75%]">
          <Avatar className="border border-yellow-200 h-28 w-28">
            <AvatarImage src={userData?.avatar} />
            <AvatarFallback>
              {userData?.username}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center items-center">
          {userData?.username}
        </div>
      </div>

      <div className="border border-green-400 w-full h-[30%]">
        <div className="border border-white ml-10 font-re">
          {userData?.level || 'Level 5'}
        </div>
        <div className="div">
          <Progress value={userData?.progress || 50} />
        </div>
      </div>
    </div>
  )
}

export default Cover