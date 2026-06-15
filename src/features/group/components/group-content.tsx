"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Card, CardContent } from "@/components/atoms/card";
import { FileText, Info, Users } from "lucide-react";
import { GroupPostsFeed } from "@/features/group/components/group-posts-feed";
import { GroupDetails } from "@/features/group";

interface GroupContentProps {
  groupId: string;
}

export function GroupContent({ groupId }: GroupContentProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <Card className="border-none shadow-lg sticky top-8 z-10">
        <CardContent className="p-0">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent gap-0">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <Info className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
          </TabsList>
        </CardContent>
      </Card>

      {/* Posts Tab */}
      <TabsContent value="posts" className="mt-6">
        <GroupPostsFeed groupId={groupId} />
      </TabsContent>

      {/* About Tab */}
      <TabsContent value="about" className="mt-6">
        <GroupDetails groupId={groupId} showOnlyAbout />
      </TabsContent>

      {/* Members Tab */}
      <TabsContent value="members" className="mt-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Group Members</h3>
            <p className="text-muted-foreground">Members list will be displayed here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
