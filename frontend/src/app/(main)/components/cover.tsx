import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const Cover = () => {
  return (
    <div
      className="border border-yellow w-full h-[20%] rounded-2xl  bg-center bg-black flex flex-col justify-center items-center"
      // style={{ backgroundImage: "url('/cover.svg')" }}
    >
      <div className="border border-yellow-400 w-[50%] h-[70%]">
        <div className="flex justify-center items-center border h-[75%]">
          <Avatar className="border border-yellow-200 h-28 w-28">
            <AvatarImage />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-center items-center">
          kawtar aboussi
        </div>
      </div>

      <div className="border border-green-400 w-full h-[30%]">
        <div className="border border-white ml-10 font-re"> level 5</div>
        <div className="div">
          <Progress value={50} />
        </div>
      </div>
    </div>
  );
}


export default Cover;