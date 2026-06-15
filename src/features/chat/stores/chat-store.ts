import { create } from 'zustand';
import { Conversation } from '@/types';

interface ChatWindowState {
  openWindows: Conversation[];
  addWindow: (conversation: Conversation) => void;
  removeWindow: (conversationId: string) => void;
  minimizeWindow: (conversationId: string) => void;
  isMinimized: Record<string, boolean>;
}

export const useChatStore = create<ChatWindowState>((set) => ({
  openWindows: [],
  isMinimized: {},
  addWindow: (conversation) => set((state) => {
    // Check if window is already open
    if (state.openWindows.find(w => w._id === conversation._id)) {
      return {
        ...state,
        isMinimized: { ...state.isMinimized, [conversation._id]: false }
      };
    }
    // Limit to 3 windows for desktop, 1 for mobile (simplified for now)
    const newWindows = [...state.openWindows, conversation].slice(-3);
    return { 
      openWindows: newWindows,
      isMinimized: { ...state.isMinimized, [conversation._id]: false }
    };
  }),
  removeWindow: (conversationId) => set((state) => ({
    openWindows: state.openWindows.filter(w => w._id !== conversationId),
    isMinimized: { ...state.isMinimized, [conversationId]: false }
  })),
  minimizeWindow: (conversationId) => set((state) => ({
    isMinimized: { 
      ...state.isMinimized, 
      [conversationId]: !state.isMinimized[conversationId] 
    }
  })),
}));
