"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import { UserPlus, UserCheck } from "lucide-react";
import { useFollowUser } from "@/features/follow";

interface Suggestion {
  id: number;
  _id: string;
  name: string;
  username: string;
  avatar: string;
  mutual: string;
}

interface SuggestionsProps {
  suggestions: Suggestion[];
}

export function Suggestions({ suggestions }: SuggestionsProps) {
  const { followUserMutation } = useFollowUser();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleFollow = (userId: string) => {
    followUserMutation.mutate(userId, {
      onSuccess: () => {
        setFollowingIds((prev) => new Set(prev).add(userId));
      },
    });
  };

  return (
    <Card className="border-none shadow-2xl backdrop-blur-sm bg-linear-to-br from-card/90 to-card/60 overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1 w-full bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-linear-to-br from-primary to-secondary animate-pulse" />
          <h3 className="font-semibold text-lg">Who to follow</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const isFollowing = followingIds.has(suggestion._id);
          return (
            <div 
              key={suggestion.id} 
              className="group flex flex-col items-center justify-between rounded-2xl transition-all duration-300 hover:bg-muted/50 hover:shadow-md"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-md">
                  <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                  <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 font-semibold">
                    {suggestion.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">@{suggestion.username}</p>
                </div>
              </div>
              <Button
                variant={isFollowing ? "secondary" : "default"}
                size="sm"
                className={`rounded-xl font-medium transition-all duration-300 w-full mt-4 ${!isFollowing && 'hover:scale-105 hover:shadow-lg'}`}
                onClick={() => !isFollowing && handleFollow(suggestion._id)}
                disabled={isFollowing || followUserMutation.isPending}
              >
                {followUserMutation.isPending && !isFollowing ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button 
          variant="link" 
          className="w-full text-sm font-medium rounded-xl py-3 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
        >
          Show more suggestions
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
