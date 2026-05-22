"use client";

import { useChatStore } from "../stores/chat-store";
import ChatWindow from "./chat-window";

const ChatWindowManager = () => {
  const { openWindows } = useChatStore();

  if (openWindows.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-4 pointer-events-none">
      <div className="flex items-end gap-4 pointer-events-auto">
        {openWindows.map((conversation) => (
          <ChatWindow key={conversation._id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowManager;
