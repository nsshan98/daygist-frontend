"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";

interface CreatePostProps {
  onPost?: (content: string) => void;
}

export function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost?.(content);
    setContent("");
  };

  return (
    <Card className="border-none shadow-2xl overflow-hidden backdrop-blur-sm bg-linear-to-br from-card/80 to-card/50">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-linear-to-r from-primary via-secondary to-primary animate-linear" />
      
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-lg">
            <AvatarImage src="/placeholder-user.jpg" alt="Your profile" />
            <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20">You</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Input
                placeholder="What's on your mind, {user}?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-20 text-base border-none bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/30 rounded-2xl resize-none transition-all duration-300 hover:bg-muted/50"
              />
              {content && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    {content.length} chars
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                >
                  <span className="text-lg mr-1">📷</span>
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                >
                  <span className="text-lg mr-1">🎥</span>
                  <span className="hidden sm:inline">Video</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
                >
                  <span className="text-lg mr-1">😊</span>
                  <span className="hidden sm:inline">Feeling</span>
                </Button>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="gap-2 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:scale-100"
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
  );
}
