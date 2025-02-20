import Cover from "@/app/(main)/dashboard/components/cover";
import Friendchat from "./components/friendchat";


export default function DashboardPage() {
  // const [login, setLogin] = useState<boolean>(true)
  return (
    <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px] text-white">
      <div className="w-[100%] h-[100%] border border-yellow-300 space-y-8">
          <Cover />
        <div className="border border-green-200 w-[100%] h-[70%] flex space-x-4">
          <div className="border border-emerald-600 w-[70%] h-[100%] flex flex-col space-y-4">
            <div className="border border-white h-[48%] w-[100%]">
              dashboard
            </div>
            <div className="border border-s-red-500 h-[50%] w-[100%]">
              match-history
            </div>
          </div>
          <div className="border border-red-600 w-[30%] h-[100%] ">
            friends
            <Friendchat/>
          </div>
        </div>
      </div>
    </div>
  );
}
