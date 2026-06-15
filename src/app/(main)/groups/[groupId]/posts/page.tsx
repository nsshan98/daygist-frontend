import { redirect } from "next/navigation";

export default async function GroupPostsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  // Redirect to main group page since posts are now integrated
  redirect(`/groups/${groupId}`);
}
