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
          className="relative text-white hover:bg-white/10 rounded-full"
          onClick={handleDropdownOpen}
        >
          <Bell
            size={22}
            className="h-[22px] w-[22px] lg:h-[25px] lg:w-[25px]"
            color="grey"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-grey text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t('title')}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              {t('mark_all_read')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="py-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Loading notification...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              {t('no_notifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">
                    {notification.title || t(`types.${notification.type}`, { defaultValue: notification.type })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <span className="sr-only">{t('dismiss')}</span>
                    <span aria-hidden>×</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground mt-1">
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