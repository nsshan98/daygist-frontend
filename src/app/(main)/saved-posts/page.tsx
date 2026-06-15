import { SavedPostsContent } from "@/features/saved-posts/saved-posts-content";

export const metadata = {
  title: "Saved Posts | Daygist",
  description: "View your saved posts",
};

export default function SavedPostsPage() {
  return <SavedPostsContent />;
}
