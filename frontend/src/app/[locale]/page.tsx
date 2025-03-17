"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";


export default function LandingPage() {
  const router = useRouter();

  return(
    <div className="min-h-screen relative">
    <div className="relative z-10 flex flex-col items-center justify-center h-screen">
    <div className="mb-8">
        <Image 
          src="/assets/images/logo.svg" 
          alt="logo" 
          width={265} 
          height={170}
          priority />
      </div>

      <h1 className="text-4xl text-white font-bold mb-4 drop-shadow-md">
        PongArcadia Awaits!
      </h1>
      <p className="text-lg text-white text-center mb-8 max-w-xl drop-shadow-sm">
        Immerse yourself in the ultimate arcade experience. Ready to test your reflexes and become the champion?
      </p>

      <Button
        onClick={() => router.push("/auth")}
        className="relative bg-[#40CFB7] hover:bg-[#EEE5BE] text-[#c75b37] border text-xl px-8 py-4 rounded-full shadow-lg overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-[#751d03] via-[#f18662] to-[#40CFB7] opacity-25 animate-pulse"></span>
        <span className="relative z-10">Start Play</span>
      </Button>
    </div>
  </div>
  )
}