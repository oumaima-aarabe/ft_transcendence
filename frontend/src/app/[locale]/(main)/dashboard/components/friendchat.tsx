'use client'

import { UseUser } from '@/api/get-user'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'

const list = [
  {
    firstname : 'kawtar ',
    lastname : 'aboussi',
    username : 'kaboussi',
    avatar : '"/assets/images/logo.svg"'
  },
  {
    firstname : 'kawtar ',
    lastname : 'aboussi',
    username : 'kaboussi',
    avatar : '"/assets/images/logo.svg"'
  },
  {
    firstname : 'kawtar ',
    lastname : 'aboussi',
    username : 'kaboussi',
    avatar : '"/assets/images/logo.svg"'
  },
  {
    firstname : 'kawtar ',
    lastname : 'aboussi',
    username : 'kaboussi',
    avatar : '"/assets/images/logo.svg"'
  },
  {
    firstname : 'kawtar ',
    lastname : 'aboussi',
    username : 'kaboussi',
    avatar : '"/assets/images/logo.svg"'
  },

]

export default function Friendchat() {

  // const {data: myUserData} = UseUser()
  
  // if (!myUserData) return <></>;

  return (
    <div className='w-full h-full flex flex-col justify-center items-center bg-black/40 rounded-2xl'>
      <div className='w-[80%] h-[15%] border red flex justify-center items-center'>
        <p>
          you are friend with
        </p>
      </div>
      <div className="w-[80%] h-[65%] green flex justify-center flex-col items-center space-y-1">
        {list.map((item)=>(
          <div key={item.username} className="h-[18%] w-[80%] rounded-full bg-black/100 flex flex-row items-center">
            <div className='blue h-[80%] w-[25%]'>
              <div className='rounded-full size-16 border border-white'>
                {/* <Avatar>
                  <AvatarImage  alt='profile' className='w-full h-full'>
                    <AvatarFallback> :3 </AvatarFallback>
                  </AvatarImage>
                </Avatar> */}
                <img src={item.avatar} className="w-full h-full object-cover" alt="avatar" ></img>
              </div>
            </div>
            <div className='red h-[80%] w-[75%] flex justify-center flex-col items-start pl-4' >
              <div>
                {item.firstname}
                {item.lastname}
              </div>
              <div>
                {item.username}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='w-[80%] h-[10%] red flex justify-center items-center'>
        <button className='border text-black bg-[#40CFB7] border-[#40CFB7] w-min-[10%] h-min-[10%] lg:w-[50%] lg:h-[60%] rounded-2xl'>
          show more ...
        </button>
      </div>
    </div>
  )
}
