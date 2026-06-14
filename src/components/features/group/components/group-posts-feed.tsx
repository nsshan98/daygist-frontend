"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Image, Video, Sparkles, Loader2 } from "lucide-react";
import { useGetGroupPosts } from "@/components/features/group/hooks/group-post-query";
import { CreateGroupPostDialog } from "@/components/features/group/components/create-group-post-dialog";
import { GroupPostCard } from "@/components/features/group/components/group-post-card";
import { useShowUserProfile } from "@/components/features/auth/hooks/auth-query";
import { useSignedMedia } from "@/components/features/profile/components/media-image";

interface GroupPostsFeedProps {
  groupId: string;
}

export function GroupPostsFeed({ groupId }: GroupPostsFeedProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { showUserProfileQuery } = useShowUserProfile();
  const { groupPostsQuery } = useGetGroupPosts(groupId);
  const { useSignedUrl } = useSignedMedia();
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = groupPostsQuery;
  
  const currentUser = showUserProfileQuery.data?.data;
  const { data: signedAvatarUrl } = useSignedUrl(currentUser?.avatar?.key || null);
  const avatarUrl = signedAvatarUrl || currentUser?.avatar?.url;
  
  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.items) || [];
  
  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Create Post Box */}
      <Card className="border-none shadow-2xl overflow-hidden backdrop-blur-sm bg-linear-to-br from-card/80 to-card/50">
        {/* Decorative border line */}
        <div className="h-1 w-full bg-linear-to-r from-primary via-secondary to-primary animate-linear" />
        
        <CardContent className="p-6">
          {/* User avatar and clickable input */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
              <AvatarImage src={avatarUrl} alt={currentUser?.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                {currentUser?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 text-left px-4 py-3 rounded-full border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-muted-foreground text-base"
            >
              What's happening in this group?
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 gap-2 hover:bg-muted/50"
            >
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Text</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 gap-2 hover:bg-muted/50"
            >
              <Image className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Photo</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 gap-2 hover:bg-muted/50"
            >
              <Video className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Video</span>
            </Button>
          </div>

          {/* Post button */}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full mt-4 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Post to Group
          </Button>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <CreateGroupPostDialog
        groupId={groupId}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      {/* Posts Feed */}
      <div className="space-y-6">
        {allPosts.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to share something!
              </p>
            </CardContent>
          </Card>
        ) : (
          allPosts.map((post) => (
            <GroupPostCard
              key={post._id}
              post={post}
              groupId={groupId}
              isAuthor={post.authorId?._id === currentUser?._id}
            />
          ))
        )}
        
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-10" />
        
        {/* No more posts message */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            You've seen all posts!
          </div>
        )}
      </div>
    </div>
  );
}
