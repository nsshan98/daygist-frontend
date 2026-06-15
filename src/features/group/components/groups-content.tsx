"use client";

import { useState } from "react";
import { GroupList, CreateGroupDialog } from "@/features/group";
import { Sidebar } from "@/features/home";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Users2, Plus, Search } from "lucide-react";
import { Input } from "@/components/atoms/input";

export function GroupsContent() {
  const [activeTab, setActiveTab] = useState("for-you");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <div className="hidden lg:block lg:col-span-3">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground">
              Discover and connect with communities
            </p>
          </div>
          <CreateGroupDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            }
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups..."
            className="pl-10 pr-4 py-3 rounded-full border-2 bg-muted/50"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you" className="mt-6">
            <GroupList type="for-you" />
          </TabsContent>
          <TabsContent value="my-groups" className="mt-6">
            <GroupList type="my-groups" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block lg:col-span-3">
        <Card className="border-none shadow-2xl backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60 sticky top-24">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Users2 className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg">About Groups</h3>
                <p className="text-sm text-muted-foreground">
                  Join communities that match your interests
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  1
                </div>
                <p className="text-sm">Discover groups recommended for you</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  2
                </div>
                <p className="text-sm">Join public groups or request to join private ones</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  3
                </div>
                <p className="text-sm">Create your own group and build a community</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
