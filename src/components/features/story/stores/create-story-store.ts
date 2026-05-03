import { create } from "zustand";

export type StoryType = "text" | "image" | "video";
export type StoryPrivacy = "followers" | "friends" | "only_me";

export interface StoryTextStyle {
  color: string;
  fontSize: number;
  align: "left" | "center" | "right";
}

interface CreateStoryState {
  isOpen: boolean;
  storyType: StoryType | null;
  privacy: StoryPrivacy;
  text: string;
  backgroundUrl: string;
  textStyle: StoryTextStyle;
  webLink: string;
  mediaFile: File | null;
  isUploading: boolean;
}

interface CreateStoryActions {
  openModal: () => void;
  closeModal: () => void;
  setStoryType: (type: StoryType | null) => void;
  setPrivacy: (privacy: StoryPrivacy) => void;
  setText: (text: string) => void;
  setBackgroundUrl: (url: string) => void;
  setTextStyle: (style: Partial<StoryTextStyle>) => void;
  setWebLink: (link: string) => void;
  setMediaFile: (file: File | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  resetStore: () => void;
}

const initialState: CreateStoryState = {
  isOpen: false,
  storyType: null,
  privacy: "followers",
  text: "",
  backgroundUrl: "",
  textStyle: {
    color: "#ffffff",
    fontSize: 24,
    align: "center",
  },
  webLink: "",
  mediaFile: null,
  isUploading: false,
};

export const useCreateStoryStore = create<CreateStoryState & CreateStoryActions>((set) => ({
  ...initialState,

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setStoryType: (type) => set({ storyType: type }),
  setPrivacy: (privacy) => set({ privacy }),
  setText: (text) => set({ text }),
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  setTextStyle: (style) =>
    set((state) => ({ textStyle: { ...state.textStyle, ...style } })),
  setWebLink: (link) => set({ webLink: link }),
  setMediaFile: (file) => set({ mediaFile: file }),
  setIsUploading: (isUploading) => set({ isUploading }),
  resetStore: () => set(initialState),
}));
