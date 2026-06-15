import type { FeedItem } from "@/types";

export interface CurrentUserLite {
  _id?: string;
  name: string;
  username?: string;
  avatar?: {
    url: string;
    key: string | null;
  } | null;
}

export interface PostModalProps {
  post: FeedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: CurrentUserLite | null;
}
