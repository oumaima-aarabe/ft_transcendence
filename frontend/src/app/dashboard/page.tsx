import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px]">
      <div className="fixed top-1/2 left-0 transform -translate-y-1/2 w-[60px] bg-black/50 backdrop-blur-sm flex flex-col gap-8 py-6 rounded-r-[30px] justify-center items-center shadow-[7px_0_20px_rgba(255,102,0,0.5)]">
        side bar
      </div>
      <div className="flex flex-col items-center">
        <div className="colo">header</div>
        <div>name</div>
      </div>
    </div>
  );
}
                                                                                     