"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { useSignedMedia } from "@/features/profile/components/media-image";
import { FeedMedia } from "@/types";

interface MediaPreviewProps {
  medias: FeedMedia[];
  text?: string;
  backgroundUrl?: string | null;
  textStyle?: {
    color: string;
    fontSize: number;
    fontWeight: string;
    align: string;
  } | null;
  layout?: string | null;
  mutedByDefault?: boolean;
  loop?: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function MediaPreview({
  medias,
  text,
  backgroundUrl,
  textStyle,
  layout,
  mutedByDefault = true,
  loop = true,
}: MediaPreviewProps) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(index, Math.max(medias.length - 1, 0));
  const current = medias[safeIndex];
  const hasMultiple = medias.length > 1;

  const resetTransform = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + medias.length) % medias.length);
    resetTransform();
  }, [medias.length, resetTransform]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % medias.length);
    resetTransform();
  }, [medias.length, resetTransform]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(z - ZOOM_STEP, MIN_ZOOM);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error", err);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, isFullscreen]);

  if (!medias || medias.length === 0) {
    return (
      <TextPanel
        text={text}
        backgroundUrl={backgroundUrl}
        textStyle={textStyle}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
    >
      <MediaSlide
        media={current}
        zoom={zoom}
        position={position}
        setPosition={setPosition}
        setIsDragging={setIsDragging}
        isDragging={isDragging}
        mutedByDefault={mutedByDefault}
        loop={loop}
        layout={layout}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      {/* Top counter + close fullscreen */}
      {hasMultiple && !isFullscreen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
          {safeIndex + 1} / {medias.length}
        </div>
      )}

      {/* Carousel nav */}
      {hasMultiple && (
        <>
          <Button
            size="icon"
            variant="ghost"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Zoom + fullscreen controls */}
      {current?.type === "image" && !isFullscreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1 backdrop-blur-sm">
          <Button
            size="icon"
            variant="ghost"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-white font-medium w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-white/30 mx-1" />
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {current?.type === "video" && !isFullscreen && (
        <div className="absolute bottom-4 right-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Dot indicators */}
      {hasMultiple && !isFullscreen && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-auto">
          {medias.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Exit fullscreen helper */}
      {isFullscreen && (
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white"
          title="Exit fullscreen"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function TextPanel({
  text,
  backgroundUrl,
  textStyle,
}: {
  text?: string;
  backgroundUrl?: string | null;
  textStyle?: MediaPreviewProps["textStyle"];
}) {
  if (backgroundUrl && textStyle) {
    return (
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-10">
          <p
            className="text-center leading-relaxed"
            style={{
              color: textStyle.color,
              fontSize: `${textStyle.fontSize}px`,
              fontWeight: textStyle.fontWeight as React.CSSProperties["fontWeight"],
              textAlign: textStyle.align as React.CSSProperties["textAlign"],
            }}
          >
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="min-h-full flex items-center justify-center p-10">
        <p className="text-2xl leading-relaxed text-foreground/90 whitespace-pre-wrap text-center max-w-2xl">
          {text}
        </p>
      </div>
    </div>
  );
}

function MediaSlide({
  media,
  zoom,
  position,
  setPosition,
  setIsDragging,
  isDragging,
  mutedByDefault,
  loop,
  layout,
  onZoomIn,
  onZoomOut,
}: {
  media: FeedMedia;
  zoom: number;
  position: { x: number; y: number };
  setPosition: (p: { x: number; y: number }) => void;
  setIsDragging: (v: boolean) => void;
  isDragging: boolean;
  mutedByDefault: boolean;
  loop: boolean;
  layout?: string | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  if (media.type === "video") {
    return (
      <VideoSlide
        media={media}
        mutedByDefault={mutedByDefault}
        loop={loop}
        layout={layout}
      />
    );
  }
  return (
    <ImageSlide
      media={media}
      zoom={zoom}
      position={position}
      setPosition={setPosition}
      setIsDragging={setIsDragging}
      isDragging={isDragging}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
    />
  );
}

function ImageSlide({
  media,
  zoom,
  position,
  setPosition,
  setIsDragging,
  isDragging,
  onZoomIn,
  onZoomOut,
}: {
  media: FeedMedia;
  zoom: number;
  position: { x: number; y: number };
  setPosition: (p: { x: number; y: number }) => void;
  setIsDragging: (v: boolean) => void;
  isDragging: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { useSignedUrl } = useSignedMedia();
  const { data: signedUrl } = useSignedUrl(media.key || null);
  const finalUrl = signedUrl || media.url;

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) onZoomIn();
    else onZoomOut();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({ x: position.x + e.movementX, y: position.y + e.movementY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        if (zoom === 1) {
          e.stopPropagation();
          onZoomIn();
        }
      }}
      style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
    >
      {!isLoaded && (
        <Skeleton className="absolute inset-0 m-auto w-1/2 h-1/2 bg-white/10" />
      )}
      <img
        src={finalUrl}
        alt="Post media"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      />
    </div>
  );
}

function VideoSlide({
  media,
  mutedByDefault,
  loop,
  layout,
}: {
  media: FeedMedia;
  mutedByDefault: boolean;
  loop: boolean;
  layout?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(mutedByDefault);
  const [isLoading, setIsLoading] = useState(true);
  const { useSignedUrl } = useSignedMedia();
  const { data: signedUrl } = useSignedUrl(media.key || null);
  const { data: signedThumb } = useSignedUrl(
    media.thumbnailUrl ? `${media.key}_thumb` : null
  );
  const finalUrl = signedUrl || media.url;
  const finalThumb = signedThumb || media.thumbnailUrl;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-black flex items-center justify-center ${
        layout === "single" ? "" : ""
      }`}
      onClick={togglePlay}
    >
      {isLoading && (
        <Loader2 className="absolute h-10 w-10 animate-spin text-white/60" />
      )}
      <video
        ref={videoRef}
        src={finalUrl}
        poster={finalThumb || undefined}
        muted={isMuted}
        loop={loop}
        playsInline
        controls={false}
        onLoadedData={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`max-h-full max-w-full ${isLoading ? "opacity-0" : "opacity-100"}`}
      />

      {!isPlaying && !isLoading && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute h-16 w-16 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <Play className="h-8 w-8 ml-1" />
        </Button>
      )}

      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Pause className="h-12 w-12 text-white/80" />
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="absolute bottom-4 left-4 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted((m) => !m);
        }}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
    </div>
  );
}
