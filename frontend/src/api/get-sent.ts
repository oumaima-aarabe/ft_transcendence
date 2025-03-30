'use client'

import { fetcher } from "@/lib/fetcher"
import { Friend } from "@/types/friends"
import { useQuery } from "@tanstack/react-query"


export function UseSent(){
    const getSent = async () => {
        try{
            const response = await fetcher.get<Friend[]>('/api/friends/requests/')
            return response.data
        }
        catch(error){
            return []
        }
    }

    const sent = useQuery({
        queryKey: ['Sent'],
        queryFn: getSent,
        retry: false
    })
    return sent
}