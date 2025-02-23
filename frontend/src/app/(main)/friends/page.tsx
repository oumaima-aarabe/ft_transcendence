
import React from 'react'
import Index from './components'

export default function page() {
    return (
    <div className='w-full h-full flex items-center justify-center'>
        <div className="border w-[100%] h-[95%] flex items-center justify-center border-white rounded-lg bg-black">
            <div className="flex justify-center items-center w-[99%] h-[99%] space-x-1 ">
                <div className="border-4 w-[30%] h-[100%] border-white rounded-tl-lg rounded-bl-lg">
                    <Index />
                </div>
                <div className="border-4 w-[70%] h-[100%] border-y-white rounded-tr-lg rounded-br-lg">
                    list
                </div>
            </div>
        </div>
    </div>
    )
}
