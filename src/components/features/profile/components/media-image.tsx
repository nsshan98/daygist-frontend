"use client";

import { useMemo } from "react";
import { useGetSignedUrl } from "../hooks/profile-query";
import { Skeleton } from "@/components/atoms/skeleton";

interface MediaImageProps {
  mediaKey: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * MediaImage Component
 * 
 * A reusable component that displays media (images, videos) using signed URLs.
 * It fetches a presigned URL from the backend and displays the media.
 * 
 * @param mediaKey - The S3 key of the media (e.g., "images/1719999999999-photo.jpg")
 * @param alt - Alt text for the image
 * @param className - CSS classes for the image
 * @param fallback - Optional fallback content while loading or on error
 * @param onLoad - Callback when image loads successfully
 * @param onError - Callback when image fails to load
 */
export function MediaImage({
  mediaKey,
  alt,
  className = "",
  fallback,
  onLoad,
  onError,
}: MediaImageProps) {
  const { useSignedUrl } = useGetSignedUrl();

  // Helper to check if it's already a signed URL
  const isSignedUrl = useMemo(() => {
    if (!mediaKey) return false;
    return mediaKey.startsWith('http') && mediaKey.includes('?');
  }, [mediaKey]);

  // Helper to check if it's a key (not a full URL)
  const isKey = useMemo(() => {
    if (!mediaKey) return false;
    return !mediaKey.startsWith('http');
  }, [mediaKey]);

  // Only fetch signed URL if it's a key
  const keyForQuery = isKey ? mediaKey : null;
  const { data: signedUrlFromQuery, isLoading } = useSignedUrl(keyForQuery);

  // Determine final URL
  const signedUrl = useMemo(() => {
    if (!mediaKey) return null;
    if (isSignedUrl) return mediaKey;
    if (isKey) return signedUrlFromQuery || null;
    return mediaKey; // Regular URL
  }, [mediaKey, isSignedUrl, isKey, signedUrlFromQuery]);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  // Show fallback or skeleton while loading
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Skeleton className={className} />;
  }

  // Show fallback on error or if no mediaKey
  if (!signedUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

/**
 * useSignedMedia Hook
 * 
 * A hook for fetching signed URLs for media files.
 * Useful when you need the URL directly (e.g., for video sources, background images).
 * 
 * @returns Object with useSignedUrl hook and helper functions
 */
export function useSignedMedia() {
  const { useSignedUrl, prefetchSignedUrl, getCachedSignedUrl } = useGetSignedUrl();

  return {
    useSignedUrl,
    prefetchSignedUrl,
    getCachedSignedUrl,
  };
}
