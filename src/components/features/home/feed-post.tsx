"use client";

import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";

interface PostUser {
  name: string;
  username: string;
  avatar: string;
}

interface FeedPostProps {
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
  onLike?: (postId: number) => void;
  onSave?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
}

export function FeedPost({
  id,
  user,
  time,
  content,
  image,
  likes,
  comments,
  shares,
  liked,
  saved,
  onLike,
  onSave,
  onComment,
  onShare,
}: FeedPostProps) {
  return (
    <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-2xl" />
      </div>

      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors duration-300">{user.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>@{user.username}</span>
                <span>•</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">{time}</span>
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary rounded-xl"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 relative">
        <p className="mb-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{content}</p>
        {image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary/50 shadow-inner group-hover:shadow-xl transition-shadow duration-500">
            <img
              src={image}
              alt="Post content"
              className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 relative">
        <div className="flex w-full flex-col gap-4">
          {/* Action Buttons - Enhanced with hover effects */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLike?.(id)}
                className={`group/like relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-110 ${liked ? 'text-red-500' : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'}`}
              >
                {/* Like animation background */}
                <div className="absolute inset-0 bg-red-500/10 scale-0 group-hover/like:scale-100 transition-transform duration-300 rounded-xl" />
                <Heart className={`h-5 w-5 relative z-10 transition-all duration-300 ${liked ? 'fill-current scale-110' : 'group-hover/like:scale-125'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onComment?.(id)}
                className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onShare?.(id)}
                className="rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave?.(id)}
              className={`rounded-xl transition-all duration-300 hover:scale-110 ${saved ? 'text-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
            >
              <Bookmark className={`h-5 w-5 transition-all duration-300 ${saved ? 'fill-current scale-110' : ''}`} />
            </Button>
          </div>

          {/* Stats - Enhanced styling */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-2 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <Heart className="w-3 h-3 fill-white text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 fill-white text-white" />
                </div>
              </div>
              <span className="font-medium hover:text-foreground transition-colors cursor-pointer">
                {likes.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="hover:text-foreground transition-colors cursor-pointer">{comments} comments</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">{shares} shares</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
