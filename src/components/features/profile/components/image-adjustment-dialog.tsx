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
const COVER_MAX_HEIGHT = 600; // Max height for cover image in px (increased from 400)
const COVER_MIN_WIDTH = 1200; // Minimum width for better display
const AVATAR_SIZE = 800; // Increased avatar size for better quality

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
        
        // NO AUTO-ADJUSTMENTS - User will manually adjust
        // Just load the full image as-is
        console.log('Image loaded successfully:', { 
          width: img.width, 
          height: img.height,
          type,
          previewUrl: e.target?.result as string 
        });
      };
      img.src = e.target?.result as string;
      setPreviewUrl(e.target?.result as string);
    };
    reader.onerror = (error) => {
      console.error('Failed to read image file:', error);
      toast.error('Failed to load image preview');
    };
    reader.readAsDataURL(imageFile);

    // Reset adjustments to zero - start with full image at 100%
    setAdjustments({ zoom: 1, rotation: 0, offsetY: 0, offsetX: 0 });
  }, [imageFile, open, type]);

  const handleReset = () => {
    setAdjustments({ zoom: 1, rotation: 0, offsetY: 0, offsetX: 0 });
  };

  const handleConfirm = async () => {
    if (!imageFile || !canvasRef.current) {
      console.error('Cannot confirm: missing image file or canvas reference', { 
        hasImage: !!imageFile, 
        hasCanvas: !!canvasRef.current 
      });
      toast.error("Failed to process image - please try again");
      return;
    }

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

      console.log('Starting canvas processing:', {
        type,
        imageSize: `${img.width}x${img.height}`,
        adjustments
      });

      // Set canvas dimensions based on type
      if (type === "avatar") {
        // Avatar: Square crop at high resolution
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        console.log('Avatar canvas set to:', AVATAR_SIZE, 'x', AVATAR_SIZE);
      } else {
        // Cover: FIXED wide rectangle with 3:1 aspect ratio
        // Canvas height matches the display height, width calculated from aspect ratio
        const outputHeight = COVER_MAX_HEIGHT; // 600px - standard height
        const outputWidth = Math.round(outputHeight * 3); // 1800px - 3:1 ratio
        
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        console.log('Cover canvas set to FIXED size:', canvas.width, 'x', canvas.height, '(3:1 ratio)');
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.log('Canvas cleared');

      // Save context state
      ctx.save();
      console.log('Context saved');

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      console.log('Context translated to center');

      // Apply rotation
      ctx.rotate((adjustments.rotation * Math.PI) / 180);
      console.log('Rotation applied:', adjustments.rotation);

      // Apply zoom
      ctx.scale(adjustments.zoom, adjustments.zoom);
      console.log('Zoom applied:', adjustments.zoom);

      // Calculate source rectangle to maintain aspect ratio and fit properly
      let sx, sy, sWidth, sHeight;
      
      if (type === "avatar") {
        // For avatar, we need to map the preview adjustments to the canvas
        // The preview shows a square crop area, and we need to extract exactly that
        
        // First, determine what portion of the original image is visible in the square frame
        const imgAspect = img.width / img.height;
        
        // Calculate the effective crop area based on zoom and position
        // When zoomed in, we're showing less of the image
        const effectiveWidth = img.width / adjustments.zoom;
        const effectiveHeight = img.height / adjustments.zoom;
        
        // Center point with user offsets applied
        const centerX = img.width / 2 + adjustments.offsetX * (img.width / Math.min(img.width, img.height));
        const centerY = img.height / 2 + adjustments.offsetY * (img.height / Math.min(img.width, img.height));
        
        // Take a square region from the image
        const minDim = Math.min(effectiveWidth, effectiveHeight);
        sWidth = minDim;
        sHeight = minDim;
        
        // Calculate top-left corner of crop region
        sx = centerX - minDim / 2;
        sy = centerY - minDim / 2;
        
        // Ensure we don't go outside image bounds
        sx = Math.max(0, Math.min(sx, img.width - minDim));
        sy = Math.max(0, Math.min(sy, img.height - minDim));
        
      } else {
        // For cover, use the full image with smart fitting
        // Calculate how to fit the image in the canvas while maintaining aspect ratio
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        
        console.log('Cover aspect calculations:', {
          canvasAspect,
          imgAspect,
          canvas: `${canvas.width}x${canvas.height}`,
          image: `${img.width}x${img.height}`
        });
        
        let scale;
        if (canvasAspect > imgAspect) {
          // Canvas is wider than image - fit to width
          scale = canvas.width / img.width;
          sWidth = img.width;
          sHeight = canvas.height / scale;
          sx = adjustments.offsetX;
          sy = (img.height - sHeight) / 2 + adjustments.offsetY;
          console.log('Fitting to WIDTH:', { scale, sWidth, sHeight, sx, sy });
        } else {
          // Image is wider than canvas - fit to height
          scale = canvas.height / img.height;
          sWidth = img.width / scale;
          sHeight = img.height;
          sx = (img.width - sWidth) / 2 + adjustments.offsetX;
          sy = adjustments.offsetY;
          console.log('Fitting to HEIGHT:', { scale, sWidth, sHeight, sx, sy });
        }
        
        console.log('About to drawImage on canvas');
        
        // Draw the calculated portion
        try {
          ctx.drawImage(
            img,
            sx,
            sy,
            sWidth,
            sHeight,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          );
          console.log('✓ drawImage succeeded for cover');
        } catch (drawError) {
          console.error('✗ drawImage failed:', drawError);
          throw new Error('Failed to draw image on canvas: ' + drawError);
        }
        
        // Restore context
        ctx.restore();
        console.log('Context restored for cover');
      }

      // Draw image centered with proper aspect ratio handling (for avatar)
      console.log('About to drawImage for avatar:', { sx, sy, sWidth, sHeight });
      
      try {
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
        console.log('✓ drawImage succeeded for avatar');
      } catch (drawError) {
        console.error('✗ drawImage failed:', drawError);
        throw new Error('Failed to draw image: ' + drawError);
      }

      // Restore context
      ctx.restore();
      console.log('Context restored for avatar');

      // Convert canvas to blob
      console.log('Converting canvas to blob...');
      
      canvas.toBlob(
        (blob) => {
          console.log('toBlob callback executed:', blob ? `Success! Size: ${(blob.size / 1024).toFixed(2)}KB` : 'Failed - blob is null');
          
          if (!blob) {
            console.error('Canvas toBlob returned null');
            toast.error("Failed to process image - canvas conversion failed");
            setIsProcessing(false);
            return;
          }

          // Create new file from blob
          const processedFile = new File([blob], imageFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          
          console.log('Created processed file:', {
            name: processedFile.name,
            size: `${(processedFile.size / 1024).toFixed(2)}KB`,
            type: processedFile.type
          });

          // Check final file size
          if (processedFile.size > MAX_FILE_SIZE) {
            toast.error(`Processed image is still too large (${(processedFile.size / (1024 * 1024)).toFixed(2)}MB). Please use a smaller image.`);
            setIsProcessing(false);
            return;
          }

          console.log('Image processed successfully, calling onConfirm:', {
            fileName: processedFile.name,
            fileSize: `${(processedFile.size / 1024).toFixed(2)}KB`,
            adjustments
          });

          onConfirm(processedFile, adjustments);
          onOpenChange(false);
          toast.success(`${type === "avatar" ? "Avatar" : "Cover"} photo updated successfully!`);
        },
        "image/jpeg",
        0.9 // Quality
      );
      
      console.log('toBlob called, waiting for callback...');
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
              <li><strong>Full image loaded</strong> - No automatic changes applied</li>
              <li><strong>Drag anywhere</strong> to position your image within the frame</li>
              <li><strong>Zoom in/out</strong> to focus on specific areas</li>
              {type === 'avatar' && (
                <>
                  <li>The <strong>clear circular area</strong> shows exactly what will be visible</li>
                  <li>The <strong>dimmed blurred background</strong> shows the full image context</li>
                  <li><strong>Output:</strong> 800×800px square (displayed as circle)</li>
                </>
              )}
              {type === 'cover' && (
                <>
                  <li><strong>Fixed frame size:</strong> 3:1 aspect ratio (wide banner format)</li>
                  <li><strong>Bright clear area</strong> shows your crop within the fixed frame</li>
                  <li><strong>Ring border</strong> shows the edges of your cover photo</li>
                  <li><strong>Output:</strong> ~1800×600px wide banner</li>
                  <li>Image will be cropped to fit the fixed frame - position to keep important parts visible</li>
                </>
              )}
              <li>Use sliders below for fine-tuning zoom, rotation, and precise positioning</li>
              <li><strong>You're in control</strong> - crop exactly how you want it</li>
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
                {/* Hidden canvas for processing - use absolute and visibility:hidden to ensure no layout impact */}
                <canvas 
                  ref={canvasRef} 
                  className="hidden" 
                  style={{ display: 'none', visibility: 'hidden', position: 'absolute' }} 
                />
                
                {/* Container for image with crop overlay - FIXED SIZE for cover, flexible for avatar */}
                <div 
                  className="relative transition-all duration-200"
                  style={{
                    width: type === 'avatar' ? '300px' : '100%',
                    height: type === 'avatar' ? '300px' : 'auto',
                    aspectRatio: type === 'cover' ? '3/1' : (type === 'avatar' ? '1/1' : 'auto'),
                    maxWidth: '100%',
                    maxHeight: '400px',
                    position: 'relative',
                    overflow: 'hidden'  // Clip anything outside the fixed area
                  }}
                >
                  {/* Background/Darkened Image Layer - Only for avatar to show context */}
                  {type === 'avatar' && (
                    <div
                      className="absolute inset-0 overflow-hidden rounded-lg"
                      style={{
                        borderRadius: type === 'avatar' ? '50%' : '8px',
                        opacity: 0.3,
                        zIndex: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Background"
                        className="w-full h-full object-cover blur-sm"
                        draggable={false}
                        style={{
                          display: 'block',
                          minWidth: '100%',
                          minHeight: '100%'
                        }}
                      />
                    </div>
                  )}

                  {/* Clear Crop Window - Shows what will be visible after adjustments */}
                  <div 
                    className={`overflow-hidden shadow-2xl ring-4 ring-primary ring-offset-2 ring-offset-background`}
                    style={{
                      borderRadius: type === 'avatar' ? '50%' : '8px',
                      width: '100%',
                      height: '100%',
                      position: type === 'avatar' ? 'absolute' : 'relative',
                      inset: type === 'avatar' ? '0' : 'auto',
                      zIndex: type === 'avatar' ? 10 : 'auto',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-200"
                      style={{
                        transform: `scale(${adjustments.zoom}) rotate(${adjustments.rotation}deg) translate(${adjustments.offsetX}px, ${adjustments.offsetY}px)`,
                        transformOrigin: 'center center',
                        pointerEvents: 'none',
                        display: 'block',
                        minWidth: '100%',
                        minHeight: '100%'
                      }}
                      loading="eager"
                      draggable={false}
                    />
                  </div>

                  {/* Corner Markers for better visibility */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top-left corner */}
                    <div 
                      className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg"
                      style={{ 
                        borderTopLeftRadius: type === 'avatar' ? '50%' : '0.5rem',
                      }}
                    />
                    {/* Top-right corner */}
                    <div 
                      className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg"
                      style={{ 
                        borderTopRightRadius: type === 'avatar' ? '50%' : '0.5rem',
                      }}
                    />
                    {/* Bottom-left corner */}
                    <div 
                      className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg"
                      style={{ 
                        borderBottomLeftRadius: type === 'avatar' ? '50%' : '0.5rem',
                      }}
                    />
                    {/* Bottom-right corner */}
                    <div 
                      className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg"
                      style={{ 
                        borderBottomRightRadius: type === 'avatar' ? '50%' : '0.5rem',
                      }}
                    />
                  </div>
                  
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
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Output:</span>
                      <span>~{COVER_MIN_WIDTH} × {COVER_MAX_HEIGHT}px (Wide format)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio:</span>
                      <span>3:1 (Width:Height)</span>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded p-2 text-xs">
                      <p className="font-medium mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        <li>Your full image is loaded without changes</li>
                        <li>You decide what part to keep by dragging and zooming</li>
                        <li>The clear window shows your crop area</li>
                        <li>Final output will be wide banner format (~1800×600px)</li>
                      </ul>
                    </div>
                  </>
                )}
                {type === "avatar" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output Size:</span>
                      <span>{AVATAR_SIZE} × {AVATAR_SIZE}px (Square)</span>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded p-2 text-xs">
                      <p className="font-medium mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        <li>Your full image is loaded without changes</li>
                        <li>You control the circular crop completely</li>
                        <li>Drag to position, zoom to frame</li>
                        <li>Final output will be 800×800px square</li>
                      </ul>
                    </div>
                  </>
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
