"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { FeedMedia } from "@/types";

interface MediaViewerProps {
  media: FeedMedia;
  layout?: string | null;
}

export function MediaViewer({ media, layout }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { useSignedUrl } = useSignedMedia();

  // Fetch signed URL for media
  const { data: signedUrl, isLoading: isUrlLoading } = useSignedUrl(media.key);

  // Determine final URL - use signed URL if available, otherwise fallback to direct URL
  const finalUrl = signedUrl || media.url;

  // Handle loading state when URL changes
  useEffect(() => {
    if (finalUrl) {
      setIsLoading(true);
    }
  }, [finalUrl]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error: Error) => console.error('Error playing video:', error));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  // Pause video when comment dialog opens, resume when it closes
  useEffect(() => {
    const handlePause = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("feed:pause-videos", handlePause);
    return () => window.removeEventListener("feed:pause-videos", handlePause);
  }, []);

  // Handle video media
  if (media.type === "video") {
    return (
      <div className={`relative w-full bg-black ${layout === "single" ? "aspect-video" : "aspect-square"}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        
        <video
          ref={videoRef}
          src={finalUrl}
          className={`h-full w-full object-cover ${isLoading ? "invisible" : "visible"}`}
          muted={isMuted}
          loop
          playsInline
          controls={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={handleLoadedData}
          onClick={handlePlayPause}
        />
        
        {/* Video controls overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="pointer-events-auto">
              <Button
                size="icon"
                variant="secondary"
                className="h-16 w-16 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Mute toggle */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    );
  }

  // Handle image media
  if (media.type === "image") {
    return (
      <div className={`relative w-full overflow-hidden bg-secondary/50 ${layout === "single" ? "aspect-video" : "aspect-square"}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        
        <img
          src={finalUrl}
          alt="Post media"
          className={`h-full w-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out ${isLoading ? "invisible" : "visible"}`}
          onLoad={() => setIsLoading(false)}
        />
        
        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    );
  }

  return null;
}
