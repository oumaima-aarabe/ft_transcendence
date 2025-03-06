'use client'

import { fetcher } from "@/lib/fetcher"
import { User } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { getURL } from "next/dist/shared/lib/utils"


export function UseUser(){
    const getUser = async () => {
        try{
            const response = await fetcher.get<User>('/api/users/profile/me')
            console.log(response.data)
            return response.data
        }
        catch(error){
            console.log(error)
            return null
        }
    }

    //
    const user = useQuery({
        queryKey: ['me'],
        queryFn: getUser,
        //enabled: true //conditional usequery cases
    })
    return user
}

export function UseOtherUser(username: string){
    const getUser = async () => {
        try{
            const response = await fetcher.get<User>(`/api/users/profile/${username}`)
            return response.data
        }
        catch(error){
            return null
        }
    }

    return useQuery({
        queryKey: ['other-user',username],
        queryFn: getUser,
    })
}