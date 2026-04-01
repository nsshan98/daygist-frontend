# Image Upload with Preview and Adjustment

## Overview
Enhanced profile image upload functionality with preview, adjustment capabilities, and file size validation (2MB limit) for both cover and profile photos.

## Features Implemented

### 1. **Image Adjustment Dialog** (`image-adjustment-dialog.tsx`)
A comprehensive image adjustment tool that allows users to:

- **Preview**: See the image before uploading
- **Zoom**: Adjust zoom level from 50% to 300%
- **Rotate**: Rotate image in 15° increments, with quick -90°/+90° buttons
- **Vertical Position**: For cover photos, adjust vertical positioning (-200px to +200px)
- **Auto-resize**: Automatically resizes images that exceed maximum height
- **File Size Validation**: Enforces 2MB maximum file size

### 2. **Updated File Size Limit**
- Changed from **5MB** to **2MB** for both cover and profile photos
- Shows current file size in the dialog
- Validates before showing adjustment dialog

### 3. **Smart Image Handling**

#### Cover Photos
- Maximum height: **400px**
- Maintains aspect ratio
- Auto-resizes tall images
- Vertical position adjustment available

#### Profile Photos
- Output size: **400x400px** (square)
- Centered crop
- Zoom and rotation controls

## How It Works

### User Flow

1. **User clicks upload button** (camera icon or "Change Cover")
2. **File selection dialog opens**
3. **Validation checks**:
   - File type (images only)
   - File size (max 2MB)
   - Shows error if validation fails
4. **Adjustment dialog opens** if validation passes
   - Shows image preview
   - Provides adjustment controls
   - Displays file information
5. **User makes adjustments**
   - Zoom in/out
   - Rotate
   - Adjust vertical position (cover only)
   - Can reset to defaults
6. **User confirms adjustments**
   - Image is processed on canvas
   - Converted to JPEG with 90% quality
   - Final file size is validated
7. **Image is uploaded** to server
8. **Profile updates** automatically

### Technical Implementation

#### Canvas Processing
```typescript
// Create canvas with appropriate dimensions
if (type === "avatar") {
  canvas.width = 400;
  canvas.height = 400;
} else {
  // Cover: maintain aspect ratio, limit height
  const aspectRatio = img.width / img.height;
  canvas.height = Math.min(img.height, 400);
  canvas.width = Math.round(canvas.height * aspectRatio);
}

// Apply transformations
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate((rotation * Math.PI) / 180);
ctx.scale(zoom, zoom);
ctx.drawImage(img, -img.width / 2, -img.height / 2 + offsetY, img.width, img.height);
```

#### File Processing
```typescript
// Convert canvas to blob
canvas.toBlob(
  (blob) => {
    const processedFile = new File([blob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    
    // Validate final size
    if (processedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large");
      return;
    }
    
    // Upload to server
    uploadMutation.mutate(formData);
  },
  "image/jpeg",
  0.9 // Quality
);
```

## Components Modified

### 1. `profile-header.tsx`
- Added state for adjustment dialogs
- Added state for pending files
- Updated file handlers to show adjustment dialog first
- Created upload callbacks for adjusted images
- Integrated ImageAdjustmentDialog components

### 2. `image-adjustment-dialog.tsx` (New)
- Complete dialog UI for image adjustment
- Tabs for different adjustment options
- Live preview with transformations
- Canvas processing logic
- File size validation

### 3. `slider.tsx` (New)
- Radix UI slider component
- Used for zoom, rotation, and position controls

## UI/UX Improvements

### Visual Feedback
- ✅ Real-time preview of adjustments
- ✅ File size display
- ✅ Loading states during processing
- ✅ Success/error toast notifications
- ✅ Dimension information display

### User Controls
- ✅ Reset button to restore defaults
- ✅ Tabbed interface for organized controls
- ✅ Cancel option at any point
- ✅ Clear visual hierarchy

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- Focus management in dialogs

## File Structure

```
src/components/features/profile/
├── image-adjustment-dialog.tsx    # New: Image adjustment UI
├── profile-header.tsx              # Updated: Integration with dialogs
└── index.ts                        # Updated: Exports

src/components/atoms/
└── slider.tsx                      # New: Slider component
```

## Configuration Constants

```typescript
const MAX_FILE_SIZE = 2 * 1024 * 1024;     // 2MB
const COVER_MAX_HEIGHT = 400;               // pixels
const AVATAR_SIZE = 400;                    // 400x400 pixels
```

## Error Handling

### Validation Errors
- ❌ File type mismatch → "Please select an image file"
- ❌ File too large → Shows current size and 2MB limit
- ❌ Processing failure → "Failed to process image"
- ❌ Upload failure → Server error message

### Success Messages
- ✅ "Cover photo updated successfully!"
- ✅ "Profile picture updated successfully!"

## Browser Compatibility

The implementation uses standard web APIs:
- **Canvas API**: Widely supported in all modern browsers
- **FileReader API**: Standard in modern browsers
- **Blob/File APIs**: Universal support

Minimum browser versions:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance Considerations

1. **Client-side processing**: Reduces server load
2. **Efficient canvas usage**: Single-pass rendering
3. **Quality optimization**: 90% JPEG quality balances size and quality
4. **Lazy loading**: Dialogs only render when needed
5. **Cleanup**: Proper memory management with file input resets

## Future Enhancements

Potential improvements for future iterations:

- [ ] Crop tool with aspect ratio presets
- [ ] Filters and effects
- [ ] Undo/redo functionality
- [ ] Drag to reposition (instead of slider)
- [ ] Touch gestures for mobile
- [ ] Progressive image loading
- [ ] More format options (PNG, WebP)
- [ ] EXIF orientation handling

## Testing Checklist

- [x] Upload cover photo with adjustment
- [x] Upload profile photo with adjustment
- [x] File size validation (reject > 2MB)
- [x] File type validation (images only)
- [x] Zoom functionality
- [x] Rotation functionality
- [x] Vertical position adjustment (cover)
- [x] Reset adjustments
- [x] Cancel dialog
- [x] Success/error notifications
- [x] Mobile responsive design
- [x] Keyboard navigation

## Related Documentation

- [Edit Profile Implementation Guide](./EDIT_PROFILE_IMPLEMENTATION.md)
- [Profile Components Guide](./PROFILE_COMPONENTS_GUIDE.md)
