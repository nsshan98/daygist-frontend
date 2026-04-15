"use client";

import { useState, useRef, useCallback } from "react";

import { ReelCard } from "./reel-card";
import { useGetGeneralVideos, useGetReelsVideos } from "../hooks/reels-query";
import { FeedPostData } from "@/types";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";

export function ReelsFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"reels" | "general">("reels");
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <p className="text-white text-sm">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <p className="text-lg mb-2">No videos available</p>
        <p className="text-sm text-white/60">Try switching tabs or check back later</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Tabs - Always visible at top, aligned with video width */}
      <div className="flex justify-center py-4 bg-black z-50">
        <div className="w-full max-w-md px-4">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as "reels" | "general");
            setCurrentIndex(0);
          }} className="w-full">
            <TabsList className="bg-black/60 backdrop-blur-md border border-white/20 w-full">
              <TabsTrigger 
                value="reels" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex-1"
              >
                Reels
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex-1"
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
