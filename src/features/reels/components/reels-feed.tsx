"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { ReelCard } from "./reel-card";
import { useGetGeneralVideos, useGetReelsVideos } from "../hooks/reels-query";
import { FeedPostData } from "@/types";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";

export function ReelsFeed() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"reels" | "general">((tabParam as "reels" | "general") || "reels");
  const containerRef = useRef<HTMLDivElement>(null);

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && (tabParam === "reels" || tabParam === "general")) {
      setActiveTab(tabParam as "reels" | "general");
      setCurrentIndex(0);
      
      // Scroll to top when tab changes
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [tabParam]);

  const { reelsQuery } = useGetReelsVideos();
  const { videosQuery: generalVideosQuery } = useGetGeneralVideos();
  
  // Use the appropriate query based on active tab
  const activeQuery = activeTab === "reels" ? reelsQuery : generalVideosQuery;
  
  const videos = activeQuery.data?.pages.flatMap((page: any) => page.items || []) || [];
  const hasNextPage = activeQuery.hasNextPage;
  const fetchNextPage = activeQuery.fetchNextPage;
  const isFetchingNextPage = activeQuery.isFetchingNextPage;
  const isLoading = activeQuery.isLoading;

  // Handle scroll to track current video index and load more
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;
    
    // Calculate current index
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
    }
    
    // Load more when near bottom
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, videos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navigate to next video
  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1 && containerRef.current) {
      const height = containerRef.current.clientHeight;
      containerRef.current.scrollTo({
        top: (currentIndex + 1) * height,
        behavior: 'smooth'
      });
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, videos.length]);

  // Navigate to previous video
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && containerRef.current) {
      const height = containerRef.current.clientHeight;
      containerRef.current.scrollTo({
        top: (currentIndex - 1) * height,
        behavior: 'smooth'
      });
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-background text-foreground">
        <p className="text-lg mb-2">No videos available</p>
        <p className="text-sm text-muted-foreground">Try switching tabs or check back later</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-background flex flex-col overflow-hidden">
      {/* Tabs - Always visible at top, aligned with video width */}
      <div className="flex justify-center py-4 bg-background z-50">
        <div className="w-full max-w-md px-4">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as "reels" | "general");
            setCurrentIndex(0);
          }} className="w-full">
            <TabsList className="bg-muted/60 backdrop-blur-md border border-border w-full">
              <TabsTrigger 
                value="reels" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-muted-foreground flex-1"
              >
                Reels
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-muted-foreground flex-1"
              >
                Videos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Videos Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide group"
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {videos.map((video: FeedPostData, index: number) => (
          <ReelCard
            key={video._id}
            reel={video}
            index={index}
            isActive={index === currentIndex}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={index < videos.length - 1}
            hasPrevious={index > 0}
          />
        ))}
        
        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div className="h-screen snap-start flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
