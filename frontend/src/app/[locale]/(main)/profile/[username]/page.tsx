import Cover from "@/app/[locale]/(main)/profile/components/cover";
import Friendchat from "../components/friendchat";
import { User } from "@/types/user";
import { fetcher } from "@/lib/fetcher";

// ISR configuration - revalidate every 60 seconds
export const revalidate = 60;

// Control how ungenerated paths are handled
export const dynamicParams = true;

// Generate static paths at build time
export async function generateStaticParams() {
  try {
    const users = await fetcher.get('/api/users/all-users');
    return users.data.map((user: User) => ({
      username: String(user.username),
    }));
  } catch (error) {
    console.error('Error fetching users for static paths:', error);
    return [];
  }
}

// Page component with proper params typing
export default async function DashboardPage({ params }: { params: { username: string } }) {
  try {
    const { username } = params;
    const user_id = username
    const user = await fetcher.get(`/api/users/profile/${user_id}`);
    
    return (
      <div className="h-full w-full justify-center flex-col flex items-center space-y-[40px] text-white">
        <div className="w-[100%] h-[100%] border border-yellow-300 space-y-8">
          <Cover user={user.data} />
          <div className="border-6 border-green-200 w-[100%] h-[70%] flex space-x-4">
            <div className="border border-emerald-600 w-[70%] h-[100%] flex flex-col space-y-4">
              <div className="border border-white h-[48%] w-[100%]">
                dashboard
              </div>
              <div className="border border-s-red-500 h-[50%] w-[100%]">
                match-history
              </div>
            </div>
            <div className="border border-red-600 w-[30%] h-[100%]">
              friends
              <Friendchat />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return <div>Error loading profile</div>;
  }
}