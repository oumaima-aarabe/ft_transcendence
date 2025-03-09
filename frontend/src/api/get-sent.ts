'use client'

import { fetcher } from "@/lib/fetcher"
import { Friend } from "@/types/friends"
import { useQuery } from "@tanstack/react-query"


export function UseSent(){
    const getSent = async () => {
        try{
            const response = await fetcher.get<Friend>('/api/friends/Sent/')
            console.log(response.data)
            return response.data
        }
        catch(error){
            console.log(error)
            return null
        }
    }

    //
    const sent = useQuery({
        queryKey: ['Sent'],
        queryFn: getSent,
        retry: false
    })
    return sent
}