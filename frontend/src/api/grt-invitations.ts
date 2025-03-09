'use client'

import { fetcher } from "@/lib/fetcher"
import { Friend } from "@/types/friends"
import { useQuery } from "@tanstack/react-query"


export function UseInvitation(){
    const getInvitation = async () => {
        try{
            const response = await fetcher.get<Friend>('/api/friends/invitations')
            console.log(response.data)
            return response.data
        }
        catch(error){
            console.log(error)
            return null
        }
    }

    //
    const invitation = useQuery({
        queryKey: ['invitation'],
        queryFn: getInvitation,
        retry: false
    })
    return invitation
}