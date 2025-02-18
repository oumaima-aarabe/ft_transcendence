"use client"

import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import axios from "axios"

const Cover = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Assuming your API is running on the same domain
        // Replace 'me' with specific username if needed
        const response = await axios.get('http://localhost:8000/api/users/me', {
          withCredentials : true , headers: {Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM5ODk3MDU2LCJpYXQiOjE3Mzk4OTUyNTYsImp0aSI6IjMwODc2MThjOTJlZjRmOGFiNzk1NjliNTNmNzdmYzZmIiwidXNlcl9pZCI6MX0.R2s8o1-5M8PjZQxzPBxBW7IB-FB6NRB3UWlGDa2zy-8'}
        })
        console.log(response.data)
        setUserData(response.data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-[20%] rounded-2xl bg-black flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[20%] rounded-2xl bg-black flex justify-center items-center">
        <div className="text-red-500">Error: {error}</div>
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