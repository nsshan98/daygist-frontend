"use client";

import { useState } from "react";
import {
  FeedPost,
  CreatePost,
  Suggestions,
  Sidebar,
} from "@/components/features/home";
import { Card, CardContent } from "@/components/atoms/card";

interface PostUser {
  name: string;
  username: string;
  avatar: string;
}

interface Post {
  id: number;
  user: PostUser;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
}

// Mock data for demonstration
const mockStories = [
  { id: 1, user: "Your Story", image: "/placeholder-user.jpg", isUser: true },
  { id: 2, user: "john_doe", image: "/placeholder-user-1.jpg", hasNew: true },
  { id: 3, user: "jane_smith", image: "/placeholder-user-2.jpg", hasNew: true },
  { id: 4, user: "tech_guru", image: "/placeholder-user-3.jpg", hasNew: false },
  { id: 5, user: "travel_bug", image: "/placeholder-user-4.jpg", hasNew: true },
  { id: 6, user: "foodie_life", image: "/placeholder-user-5.jpg", hasNew: false },
];

const mockSuggestions = [
  { id: 1, name: "Emily Rodriguez", username: "emily_r", avatar: "/placeholder-user-4.jpg", mutual: "3 mutual friends" },
  { id: 2, name: "Alex Thompson", username: "alex_t", avatar: "/placeholder-user-5.jpg", mutual: "5 mutual friends" },
  { id: 3, name: "Creative Studio", username: "creative_studio", avatar: "/placeholder-user-6.jpg", mutual: "Trending" },
];

const mockPosts = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      username: "sarah_j",
      avatar: "/placeholder-user-1.jpg",
    },
    time: "2h ago",
    content: "Just finished an amazing hike through the mountains! The view was absolutely breathtaking. 🏔️✨ #Nature #Hiking #Adventure",
    image: "/placeholder-post-1.jpg",
    likes: 234,
    comments: 45,
    shares: 12,
    liked: false,
    saved: false,
  },
  {
    id: 2,
    user: {
      name: "Tech Daily",
      username: "techdaily",
      avatar: "/placeholder-user-2.jpg",
    },
    time: "4h ago",
    content: "The future of AI is here! Check out these groundbreaking developments that are changing how we interact with technology. What's your take on this? 🤖💡",
    image: "/placeholder-post-2.jpg",
    likes: 892,
    comments: 156,
    shares: 89,
    liked: true,
    saved: true,
  },
  {
    id: 3,
    user: {
      name: "Marcus Chen",
      username: "marcus_c",
      avatar: "/placeholder-user-3.jpg",
    },
    time: "6h ago",
    content: "Sunday brunch vibes 🥞☕ Nothing beats a lazy morning with good food and great company!",
    image: "/placeholder-post-3.jpg",
    likes: 567,
    comments: 78,
    shares: 23,
    liked: false,
    saved: false,
  },
];



export default function Home() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const handleCreatePost = (content: string) => {
    const newPost = {
      id: Date.now(),
      user: {
        name: "You",
        username: "your_profile",
        avatar: "/placeholder-user.jpg",
      },
      time: "Just now",
      content,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      saved: false,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Sidebar - Navigation (Hidden on mobile) */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-8 space-y-6">
              <Sidebar />
            </div>
          </div>

          {/* Center Feed */}
          <div className="xl:col-span-6 col-span-1">

            {/* Create Post */}
            <div className="mb-8">
              <CreatePost onPost={handleCreatePost} />
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <FeedPost
                  key={post.id}
                  {...post}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Suggestions (Hidden on mobile/tablet) */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-8 space-y-6">
              <Suggestions suggestions={mockSuggestions} />

              <Card className="border-none shadow-lg">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Help</a>
                    <a href="#" className="hover:underline">Press</a>
                    <a href="#" className="hover:underline">API</a>
                    <a href="#" className="hover:underline">Jobs</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    © 2025 Protocol, Inc.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
