"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Card, CardContent } from "@/components/atoms/card";
import { 
  Grid3x3, 
  FileText, 
  Heart, 
  Bookmark,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { useSignedMedia } from "./media-image";
import { Skeleton } from "@/components/atoms/skeleton";

interface Post {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
}

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  key?: string; // Add key field for signed URL
  thumbnail?: string;
  thumbnailKey?: string; // Add thumbnail key for signed URL
  postId?: number;
  likes?: number;
  comments?: number;
}

interface ProfileTabsProps {
  posts?: Post[];
  media?: MediaItem[];
  likedPosts?: Post[];
  savedPosts?: Post[];
}

// Simple Post Card for Profile
function ProfilePostCard({ post }: { post: Post }) {
  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm">{post.user.name}</h4>
            <p className="text-xs text-muted-foreground">@{post.user.username} • {post.time}</p>
          </div>
        </div>
        <p className="text-sm mb-3">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="w-full rounded-lg mb-3" />
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {post.likes}
          </span>
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Media Item Component with Signed URL
function MediaGridItem({ item }: { item: MediaItem }) {
  const { useSignedUrl } = useSignedMedia();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Fetch signed URLs
  const { data: signedUrl } = useSignedUrl(item.key || null);
  const { data: signedThumbnailUrl } = useSignedUrl(item.thumbnailKey || null);
  
  // Determine final URLs
  const displayUrl = signedUrl || item.url;
  const thumbnailDisplayUrl = signedThumbnailUrl || item.thumbnail || item.url;

  return (
    <div 
      key={item.id} 
      className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
    >
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {item.type === 'image' ? (
        <img
          src={displayUrl}
          alt="Media"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <>
          <img
            src={thumbnailDisplayUrl}
            alt="Video thumbnail"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Video className="w-12 h-12 text-white" />
          </div>
        </>
      )}
      
      {/* Overlay with stats */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
        {(item.likes !== undefined) && (
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 fill-white" />
            {item.likes}
          </span>
        )}
        {(item.comments !== undefined) && (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            {item.comments}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProfileTabs({ 
  posts = [], 
  media = [],
  likedPosts = [],
  savedPosts = []
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");

  // Mock data for demonstration (replace with actual data fetching)
  const mockPosts: Post[] = posts.length > 0 ? posts : [];
  const mockMedia: MediaItem[] = media.length > 0 ? media : [];
  const mockLikedPosts: Post[] = likedPosts.length > 0 ? likedPosts : [];
  const mockSavedPosts: Post[] = savedPosts.length > 0 ? savedPosts : [];

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
              value="media"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <Heart className="w-4 h-4 mr-2" />
              Likes
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-4 transition-all"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>
        </CardContent>
      </Card>

      {/* Posts Tab */}
      <TabsContent value="posts" className="mt-6 space-y-6">
        {mockPosts.length > 0 ? (
          mockPosts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <EmptyState 
            icon={FileText} 
            title="No Posts Yet" 
            description="When you create posts, they'll appear here."
          />
        )}
      </TabsContent>

      {/* Media Tab */}
      <TabsContent value="media" className="mt-6">
        {mockMedia.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {mockMedia.map((item) => (
              <MediaGridItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Grid3x3} 
            title="No Media" 
            description="Photos and videos you've shared will appear here."
          />
        )}
      </TabsContent>

      {/* Likes Tab */}
      <TabsContent value="likes" className="mt-6 space-y-6">
        {mockLikedPosts.length > 0 ? (
          mockLikedPosts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <EmptyState 
            icon={Heart} 
            title="No Liked Posts" 
            description="Posts you like will appear here."
          />
        )}
      </TabsContent>

      {/* Saved Tab */}
      <TabsContent value="saved" className="mt-6 space-y-6">
        {mockSavedPosts.length > 0 ? (
          mockSavedPosts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <EmptyState 
            icon={Bookmark} 
            title="No Saved Posts" 
            description="Posts you save will appear here."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="py-12 px-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">{description}</p>
      </CardContent>
    </Card>
  );
}
