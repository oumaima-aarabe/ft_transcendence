"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Trophy, MessageCircle, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { sendRequest } from "@/lib/axios";
import endpoints from "@/constants/endpoints";
import { Link, usePathname, useRouter } from "@/i18n/routing";
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Trophy, label: "Tournaments", href: "/tournaments" },
  { icon: "/assets/icons/icon-pong.svg", label: "Game", href: "/game" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await sendRequest("POST", endpoints.logout);
      router.push("/auth");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-1/2 left-0 transform -translate-y-1/2 w-[60px] bg-black/50 backdrop-blur-sm flex flex-col gap-8 py-6 rounded-r-[30px] justify-center items-center shadow-[7px_0_20px_rgba(255,102,0,0.5)]">
        {sidebarItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative p-2 rounded-full transition-all duration-100 hover:bg-[#D05F3B]/20",
              pathname === href
                ? "bg-[#D05F3B]/50 text-[#40CFB7] shadow-[0_0_5px_2px_rgba(255,102,0,0.5)]"
                : "text-[#40CFB7]"
            )}
            title={label}
          >
            {pathname === href && (
              <span className="absolute top-1/2 -translate-y-1/2 w-1 h-12 bg-[#fc4503] rounded-r-md -left-3"></span>
            )}
            {typeof Icon === "string" ? (
              <img src={Icon} alt={label} width={22} height={22} />
            ) : (
              <Icon size={22} />
            )}
          </Link>
        ))}
      </div>
      <Button
        className="fixed bottom-0 left-0 bg-black/50 backdrop-blur-sm mb-6 rounded-r-2xl rounded-l-none pl-4 hover:bg-[#D05F3B]/20"
        onClick={handleLogout}
      >
        <img
          src="/assets/icons/icon-logout.svg"
          alt="Logout"
          width={26}
          height={26}
        />
      </Button>
    </div>
  );
}
