"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Card, CardContent } from "@/components/atoms/card";
import { FileText, Info, Users, UserPlus } from "lucide-react";
import { GroupPostsFeed } from "@/features/group/components/group-posts-feed";
import { GroupDetails } from "@/features/group";
import { GroupMembersList } from "@/features/group/components/group-members-list";
import { GroupJoinRequests } from "@/features/group/components/group-join-requests";
import { useGetGroupDetails } from "../hooks/group-query";

interface GroupContentProps {
  groupId: string;
}

export function GroupContent({ groupId }: GroupContentProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const { groupDetailsQuery } = useGetGroupDetails(groupId);

  const groupDetails = groupDetailsQuery.data?.group;
  const isMember = groupDetails?.myMembership?.status === "active";
  const isOwnerOrAdmin =
    groupDetails?.myMembership?.role === "owner" ||
    groupDetails?.myMembership?.role === "admin";
  const isPrivateGroup = groupDetails?.privacy === "private";

  // For private groups, only members can view posts and members tabs
  const canViewContent = !isPrivateGroup || isMember;

  const tabs = [
    ...(canViewContent ? [{ value: "posts", label: "Posts", icon: FileText }] : []),
    { value: "about", label: "About", icon: Info },
    ...(canViewContent ? [{ value: "members", label: "Members", icon: Users }] : []),
    ...(isOwnerOrAdmin ? [{ value: "join-requests", label: "Join Requests", icon: UserPlus }] : []),
  ] as const;

  // Reset to about tab if current tab is hidden
  if (activeTab !== "about" && !tabs.find((t) => t.value === activeTab)) {
    setActiveTab("about");
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <Card className="border-none shadow-lg sticky top-8 z-10">
        <CardContent className="p-0">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardContent>
      </Card>

      {canViewContent && (
        <TabsContent value="posts" className="mt-6">
          <GroupPostsFeed groupId={groupId} />
        </TabsContent>
      )}

      <TabsContent value="about" className="mt-6">
        <GroupDetails groupId={groupId} showOnlyAbout />
      </TabsContent>

      {canViewContent && (
        <TabsContent value="members" className="mt-6">
          <GroupMembersList groupId={groupId} />
        </TabsContent>
      )}

      {isOwnerOrAdmin && (
        <TabsContent value="join-requests" className="mt-6">
          <GroupJoinRequests groupId={groupId} />
        </TabsContent>
      )}
    </Tabs>
  );
}
