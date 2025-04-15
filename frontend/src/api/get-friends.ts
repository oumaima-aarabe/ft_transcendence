'use client'

import { fetcher } from "@/lib/fetcher"
import { Friend } from "@/types/friends"
import { useQuery } from "@tanstack/react-query"


export function UseFriend(){
    const getFriend = async () => {
        try{
            const response = await fetcher.get<Friend[]>('/api/friends/')
            return response.data
        }
        catch(error){
            return []
        }
    }

    const blocked = useQuery({
        queryKey: ['friend'],
        queryFn: getFriend,
        retry: false
    })
    return blocked
}