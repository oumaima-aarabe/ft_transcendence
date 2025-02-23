'use client'

import { fetcher } from "@/lib/fetcher"
import { User } from "@/types/user"
import { useQuery } from "@tanstack/react-query"


export function UseUser(){
    const getUser = async () => {
        try{
            const response = await fetcher.get<User>('/api/users/me')
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