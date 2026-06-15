"use client";

import { useState, useRef, useEffect } from "react";
import { Square, Send, X, Loader2, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onStop: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export const VoiceRecorder = ({ onStop, onCancel, isUploading }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      // 1. Stop recorder first if it's still running
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      // 2. Then stop the stream tracks
      stopStream();
      // 3. Clean up preview URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      console.log("Stopping microphone stream tracks...");
      streamRef.current.getTracks().forEach(track => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/m4a" });
        setRecordedBlob(blob);
        
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = URL.createObjectURL(blob);
        
        stopStream();
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const handleSend = () => {
    if (recordedBlob) {
      onStop(recordedBlob, duration * 1000);
    }
  };

  const togglePreviewPlay = () => {
    if (audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
      } else {
        audioPreviewRef.current.play();
      }
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  const handlePreviewTimeUpdate = () => {
    if (audioPreviewRef.current) {
      setPreviewCurrentTime(audioPreviewRef.current.currentTime);
    }
  };

  const handlePreviewEnded = () => {
    setIsPlayingPreview(false);
    setPreviewCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const previewProgress = recordedBlob ? (previewCurrentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full animate-in slide-in-from-bottom-2 duration-200">
      {/* Cancel/Delete Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
        onClick={onCancel}
        disabled={isUploading}
      >
        {recordedBlob ? <Trash2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>
      
      <div className="flex-1 h-10 bg-primary rounded-full flex items-center justify-between px-3 text-primary-foreground relative overflow-hidden shadow-sm">
        {!recordedBlob ? (
          <>
            {/* Recording Mode */}
            <div className="absolute inset-0 bg-primary-foreground/10 animate-pulse" />
            
            <button 
              onClick={stopRecording}
              className="relative z-10 w-7 h-7 bg-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            >
              <Square className="h-3 w-3 text-primary fill-current" />
            </button>
            
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <div className="bg-primary-foreground text-primary px-3 py-0.5 rounded-full text-xs font-bold min-w-[50px] text-center shadow-sm">
                {formatTime(duration)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Mode */}
            <audio 
              ref={audioPreviewRef} 
              src={previewUrlRef.current || ""} 
              onTimeUpdate={handlePreviewTimeUpdate}
              onEnded={handlePreviewEnded}
              hidden
            />
            
            <button 
              onClick={togglePreviewPlay}
              className="relative z-10 w-7 h-7 bg-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            >
              {isPlayingPreview ? (
                <Pause className="h-3.5 w-3.5 text-primary fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 text-primary fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 mx-3 h-1 bg-primary-foreground/30 rounded-full relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-primary-foreground transition-all duration-100"
                style={{ width: `${Math.min(previewProgress, 100)}%` }}
              />
            </div>

            <div className="bg-primary-foreground text-primary px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              {formatTime(isPlayingPreview ? previewCurrentTime : duration)}
            </div>
          </>
        )}
      </div>

      {/* Send Button (only in preview mode) */}
      {recordedBlob && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-primary hover:bg-primary/10 shrink-0"
          onClick={handleSend}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 fill-current" />
          )}
        </Button>
      )}
    </div>
  );
};
