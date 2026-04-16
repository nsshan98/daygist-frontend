"use client";

import { useParams } from "next/navigation";
import { GroupDetails } from "@/components/features/group";
import { Sidebar } from "@/components/features/home";
import { BackButton } from "@/components/molecules/back-button";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;

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
        </div>
      </div>
    </div>
  );
}
