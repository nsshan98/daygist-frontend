"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Slider } from "@/components/atoms/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Crop, RotateCcw, ZoomIn, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ImageAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onConfirm: (file: File, adjustments?: ImageAdjustments) => void;
  type: "cover" | "avatar";
}

interface ImageAdjustments {
  zoom: number;
  rotation: number;
  offsetY: number;
  offsetX: number;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const COVER_MAX_HEIGHT = 400; // Max height for cover image in px
const AVATAR_SIZE = 400; // Avatar is square

export function ImageAdjustmentDialog({ 
  open, 
  onOpenChange, 
  imageFile, 
  onConfirm,
  type 
}: ImageAdjustmentDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: 1,
    rotation: 0,
    offsetY: 0,
    offsetX: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image preview when file changes
  useEffect(() => {
    if (!imageFile || !open) return;

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      toast.error(`Image size should be less than 2MB. Current size: ${(imageFile.size / (1024 * 1024)).toFixed(2)}MB`);
      onOpenChange(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        
        // Auto-adjust if image height is too large for cover
        if (type === "cover" && img.height > COVER_MAX_HEIGHT) {
          const aspectRatio = img.width / img.height;
          const newHeight = COVER_MAX_HEIGHT;
          const newWidth = Math.round(newHeight * aspectRatio);
          
          toast.info(`Image will be resized to fit cover dimensions (${newWidth}x${newHeight})`);
        }
      };
      img.src = e.target?.result as string;
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(imageFile);

    // Reset adjustments
    setAdjustments({ zoom: 1, rotation: 0, offsetY: 0, offsetX: 0 });
  }, [imageFile, open, type]);

  const handleReset = () => {
    setAdjustments({ zoom: 1, rotation: 0, offsetY: 0, offsetX: 0 });
  };

  const handleConfirm = async () => {
    if (!imageFile || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Load the image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      // Set canvas dimensions based on type
      if (type === "avatar") {
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
      } else {
        // For cover, maintain aspect ratio but limit height
        const aspectRatio = img.width / img.height;
        canvas.height = Math.min(img.height, COVER_MAX_HEIGHT);
        canvas.width = Math.round(canvas.height * aspectRatio);
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((adjustments.rotation * Math.PI) / 180);

      // Apply zoom
      ctx.scale(adjustments.zoom, adjustments.zoom);

      // Calculate source rectangle to maintain aspect ratio
      let sx, sy, sWidth, sHeight;
      
      if (type === "avatar") {
        // For avatar, fit the image into a square while maintaining aspect ratio
        const minDim = Math.min(img.width, img.height);
        sWidth = minDim;
        sHeight = minDim;
        sx = (img.width - minDim) / 2 + adjustments.offsetX;
        sy = (img.height - minDim) / 2 + adjustments.offsetY;
      } else {
        // For cover, use full image with offsets
        sx = adjustments.offsetX;
        sy = adjustments.offsetY;
        sWidth = img.width;
        sHeight = img.height;
      }

      // Draw image centered with proper aspect ratio handling
      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        -sWidth / 2,
        -sHeight / 2,
        sWidth,
        sHeight
      );

      // Restore context
      ctx.restore();

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Failed to process image");
            setIsProcessing(false);
            return;
          }

          // Create new file from blob
          const processedFile = new File([blob], imageFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          // Check final file size
          if (processedFile.size > MAX_FILE_SIZE) {
            toast.error(`Processed image is still too large (${(processedFile.size / (1024 * 1024)).toFixed(2)}MB). Please use a smaller image.`);
            setIsProcessing(false);
            return;
          }

          onConfirm(processedFile, adjustments);
          onOpenChange(false);
          toast.success(`${type === "cover" ? "Cover" : "Profile"} photo updated successfully!`);
        },
        "image/jpeg",
        0.9 // Quality
      );
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPreviewUrl("");
    setAdjustments({ zoom: 1, rotation: 0, offsetY: 0, offsetX: 0 });
  };

  // Mouse/Touch drag handlers for image positioning
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - adjustments.offsetX, y: clientY - adjustments.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setAdjustments({
      ...adjustments,
      offsetX: clientX - dragStart.x,
      offsetY: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Adjust {type === "cover" ? "Cover" : "Profile"} Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">How to adjust your image:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Drag</strong> the image to reposition it</li>
              <li>Use sliders below to fine-tune zoom, rotation, and position</li>
              <li>The {type === 'avatar' ? 'circular guide' : 'frame'} shows how your image will be cropped</li>
            </ul>
          </div>

          {/* File size info */}
          {imageFile && (
            <p className="text-sm text-muted-foreground">
              File size: {(imageFile.size / (1024 * 1024)).toFixed(2)}MB (Max: 2MB)
            </p>
          )}

          {/* Image Preview and Adjustment */}
          <div 
            className="relative bg-muted/30 rounded-lg p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {previewUrl ? (
              <>
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Live preview with proper containment */}
                <div 
                  className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-200"
                  style={{
                    maxWidth: type === 'avatar' ? '300px' : '100%',
                    maxHeight: '400px',
                    width: type === 'avatar' ? '300px' : 'auto',
                    height: type === 'avatar' ? '300px' : 'auto',
                    aspectRatio: type === 'avatar' ? '1/1' : 'auto',
                    borderRadius: type === 'avatar' ? '50%' : '8px',
                    boxShadow: type === 'avatar' 
                      ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${adjustments.zoom}) rotate(${adjustments.rotation}deg) translate(${adjustments.offsetX}px, ${adjustments.offsetY}px)`,
                      transformOrigin: 'center center',
                      borderRadius: type === 'avatar' ? '50%' : '0',
                      pointerEvents: 'none', // Prevent image from being draggable itself
                    }}
                    loading="eager"
                    draggable={false}
                  />
                  
                  {/* Overlay guide for avatar circular crop */}
                  {type === 'avatar' && (
                    <div 
                      className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-full pointer-events-none z-10"
                      style={{
                        clipPath: 'circle(50% at center)',
                      }}
                      aria-label="Circular crop guide for profile picture"
                    />
                  )}
                  
                  {/* Cover overlay hint */}
                  {type === 'cover' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Drag to position • Scroll to zoom
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Loading preview...</p>
              </div>
            )}
          </div>

          {/* Adjustment Controls */}
          <Tabs defaultValue="adjust" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adjust">
                <ZoomIn className="w-4 h-4 mr-2" />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="rotate">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate
              </TabsTrigger>
              <TabsTrigger value="crop">
                <Crop className="w-4 h-4 mr-2" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Zoom Level</label>
                  <span className="text-sm text-muted-foreground">{Math.round(adjustments.zoom * 100)}%</span>
                </div>
                <Slider
                  value={[adjustments.zoom]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={(value: number[]) => setAdjustments({ ...adjustments, zoom: value[0] })}
                />
                <p className="text-xs text-muted-foreground">Pinch or scroll to zoom (if supported), or use this slider</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Vertical Position</label>
                  <span className="text-sm text-muted-foreground">{adjustments.offsetY}px</span>
                </div>
                <Slider
                  value={[adjustments.offsetY]}
                  min={-200}
                  max={200}
                  step={5}
                  onValueChange={(value: number[]) => setAdjustments({ ...adjustments, offsetY: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Horizontal Position</label>
                  <span className="text-sm text-muted-foreground">{adjustments.offsetX}px</span>
                </div>
                <Slider
                  value={[adjustments.offsetX]}
                  min={-200}
                  max={200}
                  step={5}
                  onValueChange={(value: number[]) => setAdjustments({ ...adjustments, offsetX: value[0] })}
                />
              </div>
            </TabsContent>

            <TabsContent value="rotate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Rotation</label>
                  <span className="text-sm text-muted-foreground">{adjustments.rotation}°</span>
                </div>
                <Slider
                  value={[adjustments.rotation]}
                  min={-180}
                  max={180}
                  step={15}
                  onValueChange={(value: number[]) => setAdjustments({ ...adjustments, rotation: value[0] })}
                />
                <div className="flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAdjustments({ ...adjustments, rotation: adjustments.rotation - 90 })}
                  >
                    -90°
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAdjustments({ ...adjustments, rotation: adjustments.rotation + 90 })}
                  >
                    +90°
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crop" className="space-y-4 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Size:</span>
                  <span>{imageDimensions.width} × {imageDimensions.height}px</span>
                </div>
                {type === "cover" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Height:</span>
                    <span>{COVER_MAX_HEIGHT}px</span>
                  </div>
                )}
                {type === "avatar" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output Size:</span>
                    <span>{AVATAR_SIZE} × {AVATAR_SIZE}px</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max File Size:</span>
                  <span>2MB</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Reset Button */}
          <Button
            variant="secondary"
            onClick={handleReset}
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Adjustments
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !previewUrl}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
