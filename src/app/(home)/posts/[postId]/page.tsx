import { PostDetailContent } from "@/components/features/post-detail/post-detail-content";

interface PostDetailPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { postId } = await params;
  return {
    title: `Post | Daygist`,
    description: "View post details",
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  return <PostDetailContent />;
}
