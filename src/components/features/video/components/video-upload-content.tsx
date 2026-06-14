"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { AlertCircle, Upload, Play, Eye, Heart, MessageCircle, DollarSign, Search, X } from "lucide-react";
import { useGetMonetizationStatus } from "@/components/features/monetization";
import { UploadLongVideoDialog } from "./upload-long-video-dialog";
import { useGetUserVideos, useSearchVideos } from "../hooks/video-query";
import { useSignedMedia } from "@/components/features/profile";
import type { MonetizationData, UserVideo } from "@/types";

function VideoUploadSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function NotApprovedState({ data }: { data: MonetizationData }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Long Video Upload</h1>
        <p className="text-muted-foreground">
          Upload long-form video content to your profile
        </p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            Monetization Required
          </CardTitle>
          <CardDescription>
            You need an approved monetization application to upload long videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium capitalize">Current Status: {data.user.monetizationStatus}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VideoThumbnail({ video }: { video: UserVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { useSignedUrl } = useSignedMedia();
  const media = video.medias[0];
  const thumbnailKey = media?.thumbnailKey;
  const { data: signedThumbnailUrl } = useSignedUrl(thumbnailKey || null);
  const { data: signedVideoUrl } = useSignedUrl(media?.key || null);
  const thumbnailSrc = signedThumbnailUrl || media?.thumbnailUrl || media?.url;
  const videoSrc = signedVideoUrl || media?.url;

  return (
    <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden group">
      {isPlaying ? (
        <video
          src={videoSrc}
          className="w-full h-full object-cover"
          controls
          autoPlay
          onPause={() => {}}
          onEnded={() => setIsPlaying(false)}
        />
      ) : (
        <>
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={video.text || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={videoSrc}
              className="w-full h-full object-cover"
              preload="metadata"
            />
          )}
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Play className="h-10 w-10 text-white fill-white" />
          </button>
        </>
      )}
    </div>
  );
}

function VideoCard({ video, showAuthor = false }: { video: UserVideo; showAuthor?: boolean }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow p-0">
      <VideoThumbnail video={video} />
      <CardContent className="p-4 space-y-2">
        {showAuthor && video.author && (
          <p className="text-xs text-muted-foreground">
            {video.author.name}
          </p>
        )}
        <h2 className="font-semibold text-lg line-clamp-1">
          {video.text || "Untitled Video"}
        </h2>
        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {video.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {video.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {video.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            {video.earn}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {video.privacy}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {video.category}
          </span>
          {video.subCategory && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
              {video.subCategory}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovedState({ data }: { data: MonetizationData }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { userVideosQuery } = useGetUserVideos();
  const { searchVideosQuery } = useSearchVideos(debouncedQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSearching = debouncedQuery.length > 0;
  const searchResults = searchVideosQuery.data?.items ?? [];
  const videos = userVideosQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const hasNextPage = userVideosQuery.hasNextPage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
          <p className="text-muted-foreground">
            Manage your long-form video content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9 w-64"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            {searchVideosQuery.isLoading
              ? "Searching..."
              : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${debouncedQuery}"`}
          </h2>
          {searchVideosQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm">
                No videos match &ldquo;{debouncedQuery}&rdquo;. Try a different search term.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((video) => (
                <VideoCard key={video._id} video={video} showAuthor />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* My Videos Grid */
        <>
          {userVideosQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden p-0">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <Card className="p-12 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No videos yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Upload your first long-form video to get started
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => userVideosQuery.fetchNextPage()}
                    disabled={userVideosQuery.isFetchingNextPage}
                  >
                    {userVideosQuery.isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <UploadLongVideoDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
}

export function VideoUploadContent() {
  const { monetizationQuery } = useGetMonetizationStatus();

  if (monetizationQuery.isLoading) {
    return <VideoUploadSkeleton />;
  }

  if (monetizationQuery.isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              Error Loading Monetization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to load monetization data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = monetizationQuery.data?.data;

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto py-4">
      {data.user.monetizationStatus === "approved" ? (
        <ApprovedState data={data} />
      ) : (
        <NotApprovedState data={data} />
      )}
    </div>
  );
}
