import React from 'react'

export default function Loading() {
    return (
    <div className="flex items-center justify-center h-screen">
        <div className="relative h-10 w-1.5 text-[#40CFB7] animate-paddles">
            <div className="absolute left-0 right-0 top-[15px] mx-auto h-3 w-3 rounded-full bg-[#f18662] animate-ballbounce"></div>
        </div>
    </div>
    )
}