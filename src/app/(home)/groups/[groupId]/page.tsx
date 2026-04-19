import { GroupDetails, GroupContent } from "@/components/features/group";
import { Sidebar } from "@/components/features/home";
import { BackButton } from "@/components/molecules/back-button";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-4">
          {/* Back Button */}
          <BackButton href="/groups" />

          {/* Group Details */}
          <GroupDetails groupId={groupId} />

          {/* Tabs Section with Client Components */}
          <GroupContent groupId={groupId} />
        </div>
      </div>
    </div>
  );
}
