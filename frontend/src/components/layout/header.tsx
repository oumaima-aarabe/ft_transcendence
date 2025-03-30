"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { UseUser } from "@/api/get-user";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useSearchUsers } from "@/api/get-user";
import { useState, useRef, useEffect } from "react";
import { User } from "@/types/user";
import { useRouter } from "@/i18n/routing";

// Custom debounce hook implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Header() {
  const { data: myUserData } = UseUser();
  const t = useTranslations("header");
  const tc = useTranslations("common");
  const statusT = useTranslations("header.status");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading } = useSearchUsers(debouncedQuery);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleUserSelect = (username: string) => {
    router.push(`/profile/${username}`);
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className="h-20 backdrop-blur-sm flex items-center justify-between px-6 py-2 relative z-[100]">
      <Image
        src="/assets/images/logo.svg"
        alt="PongArcadia"
        width={120}
        height={32}
        className="w-[120px] lg:w-[150px] my-auto"
        priority
      />
      <div className="relative border-white/20" ref={searchRef}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={15}
        />
        <Input
          className="w-[320px] lg:w-[400px] h-11 lg:h-12 pl-10 bg-black/20 border-white/20 text-white text-xs lg:text-sm rounded-full"
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => setShowResults(true)}
        />
        
        {/* Search Results Dropdown */}
        {showResults && ((searchResults && searchResults.length > 0) || isLoading) && (
          <div className="absolute mt-2 w-full bg-black/90 border border-white/20 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-pulse">{tc("loading")}</div>
              </div>
            ) : (
              <ul>
                {searchResults?.map((user: User) => (
                  <li 
                    key={user.id} 
                    className="p-3 hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => handleUserSelect(user.username)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        <img src="https://iili.io/2D8ByIj.png" alt={user.username} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.first_name} {user.last_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6 lg:gap-9">
        <NotificationsDropdown />
        <div className="flex items-center h-11 lg:h-12 px-1 pr-5 gap-2 lg:gap-2 bg-stone-900 border border-white/20 rounded-full">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
            <AvatarImage src={myUserData?.avatar} />
            <AvatarFallback>
              <img src="https://iili.io/2D8ByIj.png" alt="Default Avatar" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-xs lg:text-sm text-white">
              {myUserData
                ? `${myUserData.first_name} ${myUserData.last_name}`
                : tc("loading")}
            </h2>
            <p className="text-[10px] text-xs lg:text-xs text-[#808080]">
              {statusT(myUserData?.status || "offline")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
