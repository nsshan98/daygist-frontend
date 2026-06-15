"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { useCreatePostStore } from "../stores/create-post-store";
import { CreatePostDialog } from "./create-post-dialog";
import { useShowUserProfile } from "../../auth/hooks/auth-query";
import { useSignedMedia } from "../../profile";
import { ImageIcon, Video, Type } from "lucide-react";

export function CreatePost() {
  const { openModal, setPostType } = useCreatePostStore();
  const { showUserProfileQuery } = useShowUserProfile();
  const { useSignedUrl } = useSignedMedia();

  const user = showUserProfileQuery.data?.data;

  // Fetch signed URL for avatar
  const { data: signedAvatarUrl } = useSignedUrl(user?.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || user?.avatar?.url;

  const handleOpenModal = () => {
    openModal();
  };

  return (
    <>
      <Card className="border-none shadow-2xl overflow-hidden backdrop-blur-sm bg-linear-to-br from-card/80 to-card/50">
        {/* Decorative top border */}
        <div className="h-1 w-full bg-linear-to-r from-primary via-secondary to-primary animate-linear" />

        <CardContent className="p-6">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-lg">
              <AvatarImage src={avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              {/* Clickable input area */}
              <button
                onClick={() => handleOpenModal()}
                className="w-full text-left"
              >
                <div className="min-h-14 px-4 flex items-center text-base border-none bg-muted/30 hover:bg-muted/50 rounded-2xl transition-all duration-300 text-muted-foreground">
                  What&apos;s on your mind, {user?.name?.split(" ")[0] || "User"}?
                </div>
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal()}
                    className="hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300 rounded-xl gap-2"
                  >
                    <Type className="w-5 h-5" />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal()}
                    className="hover:bg-green-500/10 hover:text-green-500 transition-all duration-300 rounded-xl gap-2"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Photo</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal()}
                    className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 rounded-xl gap-2"
                  >
                    <Video className="w-5 h-5" />
                    <span className="hidden sm:inline">Reels</span>
                  </Button>
                </div>
                <Button
                  onClick={() => handleOpenModal()}
                  className="gap-2 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>Post</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <CreatePostDialog />
    </>
  );
}
