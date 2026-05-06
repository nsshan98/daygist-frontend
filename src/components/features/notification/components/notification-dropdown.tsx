"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { useGetNotifications, useMarkAllSeen, useMarkNotificationSeen } from "../hooks/notification-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import type { Notification } from "@/types";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notificationsQuery } = useGetNotifications();
  const { markAllSeenMutation } = useMarkAllSeen();
  const { markNotificationSeenMutation } = useMarkNotificationSeen();
  const router = useRouter();

  const notifications = notificationsQuery.data?.items || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationSeenMutation.mutate(notification._id);
    }
    if (notification.data?.postId) {
      const url = `/posts/${notification.data.postId}`;
      if (notification.data?.commentId) {
        router.push(`${url}?commentId=${notification.data.commentId}`);
      } else {
        router.push(url);
      }
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-card">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] mt-2 rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 font-semibold text-lg">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full px-3"
            onClick={() => markAllSeenMutation.mutate()}
            disabled={markAllSeenMutation.isPending || unreadCount === 0}
          >
            {markAllSeenMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Mark all seen
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                )}
              </button>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        {/* <div className="px-4 py-3">
          <Button variant="ghost" className="w-full justify-center rounded-xl hover:bg-accent">
            See all notifications
          </Button>
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
