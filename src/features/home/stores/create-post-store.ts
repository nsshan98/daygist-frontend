import { create } from "zustand";

export type PostType = "text" | "image" | "video" | null;
export type PrivacyType = "public" | "friends" | "private";
export type VideoModeType = "standard" | "reels" | null;

export interface TextStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  align: "left" | "center" | "right";
}

export interface CreatePostState {
  // Modal state
  isOpen: boolean;
  
  // Post type
  postType: PostType;
  
  // Common fields
  privacy: PrivacyType;
  caption: string;
  feeling: string | null;
  
  // Text post fields
  textContent: string;
  textBackground: string | null;
  textStyle: TextStyle;
  
  // Image post fields
  mediaFiles: File[];
  imageLayout: "single" | "grid2" | "grid3" | "carousel";
  
  // Video post fields
  videoFile: File | null;
  videoMode: VideoModeType;
  videoCategory: string;
  videoSubCategory: string;
  mutedByDefault: boolean;
  loop: boolean;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
}

export interface CreatePostActions {
  // Modal actions
  openModal: () => void;
  closeModal: () => void;
  
  // Post type actions
  setPostType: (type: PostType) => void;
  
  // Common actions
  setPrivacy: (privacy: PrivacyType) => void;
  setCaption: (caption: string) => void;
  setFeeling: (feeling: string | null) => void;
  
  // Text post actions
  setTextContent: (content: string) => void;
  setTextBackground: (background: string | null) => void;
  setTextStyle: (style: Partial<TextStyle>) => void;
  
  // Image post actions
  addMediaFile: (file: File) => void;
  removeMediaFile: (index: number) => void;
  setImageLayout: (layout: "single" | "grid2" | "grid3" | "carousel") => void;
  clearMediaFiles: () => void;
  
  // Video post actions
  setVideoFile: (file: File | null) => void;
  setVideoMode: (mode: VideoModeType) => void;
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

const initialTextStyle: TextStyle = {
  color: "#ffffff",
  fontSize: 24,
  fontWeight: "700",
  align: "center",
};

const initialState: CreatePostState = {
  isOpen: false,
  postType: "text", // Default to text
  privacy: "public",
  caption: "",
  feeling: null,
  textContent: "",
  textBackground: null,
  textStyle: initialTextStyle,
  mediaFiles: [],
  imageLayout: "single",
  videoFile: null,
  videoMode: null,
  videoCategory: "reels",
  videoSubCategory: "",
  mutedByDefault: false,
  loop: true,
  isUploading: false,
  uploadProgress: 0,
};

export const useCreatePostStore = create<CreatePostState & CreatePostActions>((set) => ({
  ...initialState,
  
  // Modal actions
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  
  // Post type actions
  setPostType: (type) => set({ postType: type }),
  
  // Common actions
  setPrivacy: (privacy) => set({ privacy }),
  setCaption: (caption) => set({ caption }),
  setFeeling: (feeling) => set({ feeling }),
  
  // Text post actions
  setTextContent: (content) => set({ textContent: content }),
  setTextBackground: (background) => set({ textBackground: background }),
  setTextStyle: (style) => set((state) => ({ 
    textStyle: { ...state.textStyle, ...style } 
  })),
  
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

// Background images for text posts (from picsum.photos)
export const TEXT_BACKGROUNDS = [
  { url: "https://picsum.photos/seed/gradient2/800/400", name: "Ocean" },
  { url: "https://picsum.photos/seed/gradient3/800/400", name: "Forest" },
  { url: "https://picsum.photos/seed/gradient4/800/400", name: "Mountain" },
  { url: "https://picsum.photos/seed/gradient7/800/400", name: "Abstract" },
  { url: "https://picsum.photos/seed/gradient8/800/400", name: "Warm" },
];
