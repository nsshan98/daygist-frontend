"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// @ts-ignore
import { io, Socket } from "socket.io-client";
import { useGetUserProfile } from "@/components/features/profile/hooks/profile-query";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { showUserProfileQuery } = useGetUserProfile();
  const user = showUserProfileQuery.data?.data;

  useEffect(() => {
    if (!user?._id) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_CLIENT_BASE_URL || "http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      socketInstance.emit("join", { userId: user._id });
    });

    socketInstance.on("socket-joined", (data: { success: boolean; userId: string; socketId: string }) => {
      console.log("Socket joined successfully:", data);
    });

    socketInstance.on("online-users", (data: { users: string[] }) => {
      setOnlineUsers(data.users);
    });

    socketInstance.on("user-online", (data: { userId: string }) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, data.userId])));
    });

    socketInstance.on("user-offline", (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    socketInstance.on("check-user-online-result", (data: { userId: string; isOnline: boolean }) => {
      if (data.isOnline) {
        setOnlineUsers((prev) => Array.from(new Set([...prev, data.userId])));
      } else {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
