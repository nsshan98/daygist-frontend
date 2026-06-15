import { create } from "zustand";
import { TEXT_BACKGROUNDS } from "@/features/home/stores/create-post-store";

// Re-export TEXT_BACKGROUNDS for use in group components
export { TEXT_BACKGROUNDS };

export type GroupPostType = "text" | "image" | "video" | null;

export interface GroupPostTextStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  align: "left" | "center" | "right";
}

export interface CreateGroupPostState {
  // Modal state
  isOpen: boolean;
  
  // Post type
  postType: GroupPostType;
  
  // Text post fields
  textContent: string;
  textBackground: string | null;
  textStyle: GroupPostTextStyle;
  feeling: string | null;
  
  // Image post fields
  mediaFiles: File[];
  imageLayout: "single" | "grid2" | "grid3" | "carousel";
  
  // Video post fields
  videoFile: File | null;
  videoMode: "standard" | "reels" | null;
  videoCategory: string;
  videoSubCategory: string;
  mutedByDefault: boolean;
  loop: boolean;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
}

export interface CreateGroupPostActions {
  // Modal actions
  openModal: () => void;
  closeModal: () => void;
  
  // Post type actions
  setPostType: (type: GroupPostType) => void;
  
  // Text post actions
  setTextContent: (content: string) => void;
  setTextBackground: (background: string | null) => void;
  setTextStyle: (style: Partial<GroupPostTextStyle>) => void;
  setFeeling: (feeling: string | null) => void;
  
  // Image post actions
  addMediaFile: (file: File) => void;
  removeMediaFile: (index: number) => void;
  setImageLayout: (layout: "single" | "grid2" | "grid3" | "carousel") => void;
  clearMediaFiles: () => void;
  
  // Video post actions
  setVideoFile: (file: File | null) => void;
  setVideoMode: (mode: "standard" | "reels" | null) => void;
  setVideoCategory: (category: string) => void;
  setVideoSubCategory: (subCategory: string) => void;
  setMutedByDefault: (muted: boolean) => void;
  setLoop: (loop: boolean) => void;
  
  // Upload actions
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  
  // Reset
  resetStore: () => void;
}

const initialTextStyle: GroupPostTextStyle = {
  color: "#ffffff",
  fontSize: 24,
  fontWeight: "700",
  align: "center",
};

const initialState: CreateGroupPostState = {
  isOpen: false,
  postType: "text", // Default to text
  textContent: "",
  textBackground: null,
  textStyle: initialTextStyle,
  feeling: null,
  mediaFiles: [],
  imageLayout: "single",
  videoFile: null,
  videoMode: null,
  videoCategory: "general",
  videoSubCategory: "",
  mutedByDefault: false,
  loop: true,
  isUploading: false,
  uploadProgress: 0,
};

export const useCreateGroupPostStore = create<CreateGroupPostState & CreateGroupPostActions>((set) => ({
  ...initialState,
  
  // Modal actions
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  
  // Post type actions
  setPostType: (type) => set({ postType: type }),
  
  // Text post actions
  setTextContent: (content) => set({ textContent: content }),
  setTextBackground: (background) => set({ textBackground: background }),
  setTextStyle: (style) => set((state) => ({ 
    textStyle: { ...state.textStyle, ...style } 
  })),
  setFeeling: (feeling) => set({ feeling }),
  
  // Image post actions
  addMediaFile: (file) => set((state) => ({ 
    mediaFiles: [...state.mediaFiles, file] 
  })),
  removeMediaFile: (index) => set((state) => ({ 
    mediaFiles: state.mediaFiles.filter((_, i) => i !== index) 
  })),
  setImageLayout: (layout) => set({ imageLayout: layout }),
  clearMediaFiles: () => set({ mediaFiles: [] }),
  
  // Video post actions
  setVideoFile: (file) => set({ videoFile: file }),
  setVideoMode: (mode) => set({ videoMode: mode }),
  setVideoCategory: (category) => set({ videoCategory: category }),
  setVideoSubCategory: (subCategory) => set({ videoSubCategory: subCategory }),
  setMutedByDefault: (muted) => set({ mutedByDefault: muted }),
  setLoop: (loop) => set({ loop }),
  
  // Upload actions
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  // Reset
  resetStore: () => set(initialState),
}));
