'use client'

import { fetcher } from "@/lib/fetcher"
import { Friend } from "@/types/friends"
import { useQuery } from "@tanstack/react-query"


export function UseBlocked(){
    const getBlocked = async () => {
        try{
            const response = await fetcher.get<Friend[]>('/api/friends/blocked/')
            return response.data
        }
        catch(error){
            return []
        }
    }

    const blocked = useQuery({
        queryKey: ['blocked'],
        queryFn: getBlocked,
        retry: false
    })
    return blocked
}