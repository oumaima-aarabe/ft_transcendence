'use client';

import React, { useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationsContext } from '@/providers/NotificationsProvider';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    refreshNotifications 
  } = useNotificationsContext();
  const t = useTranslations('notifications');
  
  // Refresh notifications when the dropdown is opened
  const handleDropdownOpen = () => {
    refreshNotifications();
  };
  
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-black/30 rounded-full"
          onClick={handleDropdownOpen}
        >
          <Bell
            size={22}
            className="h-[22px] w-[22px] lg:h-[25px] lg:w-[25px]"
            color="#40CFB7"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D05F3B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_5px_rgba(208,95,59,0.7)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-black/60 backdrop-blur-sm border-white/10 rounded-xl shadow-[0_0_15px_rgba(64,207,183,0.3)] text-white" 
        align="end"
      >
        <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
          <span className="text-[#40CFB7] font-semibold">{t('title')}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#D05F3B] hover:text-[#D05F3B] hover:bg-black/40"
              onClick={markAllAsRead}
            >
              {t('mark_all_read')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="py-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#40CFB7]" />
              <p className="text-sm text-white/60 mt-2">
                {t('loading')}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-white/60">
              {t('no_notifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-4 border-b border-white/10 transition-colors",
                  "hover:bg-black/20 focus:bg-black/20 focus:text-white",
                  !notification.read ? 'bg-[#D05F3B]/10' : ''
                )}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex justify-between w-full">
                  <span className={`font-medium ${!notification.read ? 'text-[#D05F3B]' : 'text-white'}`}>
                    {notification.title || t(`types.${notification.type}`, { defaultValue: notification.type })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-white/60 hover:text-white hover:bg-black/20 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <span className="sr-only">{t('dismiss')}</span>
                    <span aria-hidden>×</span>
                  </Button>
                </div>
                <p className="text-sm text-white/70 mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-[#40CFB7]/80 mt-2">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 