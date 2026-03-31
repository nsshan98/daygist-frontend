# Profile Feature - Quick Start Guide

## 🚀 Getting Started

The profile feature is now fully integrated into your Next.js application. Here's how to use it.

## Accessing the Profile Page

### Navigation
1. Click on "Profile" in the left sidebar
2. Or navigate directly to `/profile`

### Route
```
/profile
```

## Features Overview

### For Profile Owner

#### View Your Profile
- See your complete profile information
- View your posts, media, likes, and saved content
- Check your follower/following counts

#### Edit Profile
1. Click "Edit Profile" button (top right of header)
2. Modify any fields in the dialog
3. Click "Save Changes"
4. See instant updates

#### Upload Avatar
1. Hover over your avatar
2. Click the camera icon
3. Select an image (max 5MB)
4. Wait for upload to complete

#### Upload Cover Photo
1. Click "Change Cover" button (top right of cover)
2. Select an image (max 5MB)
3. Wait for upload to complete

### For Visitors

#### View Others' Profiles
- See public profile information
- View their posts and media
- Check mutual connections (future feature)

#### Interact
- Follow button (to be implemented)
- Message button (to be implemented)
- Share profile (to be implemented)

## Customization Options

### Update Profile Information

You can update:
- ✅ Name
- ✅ Username
- ✅ Bio (short description)
- ✅ About (longer description)
- ✅ Birth Date
- ✅ Relationship Status
- ✅ Location (City, State, Country)
- ✅ Contact Info (Phone, Email, Website)
- ✅ Social Media Links (Facebook, Instagram, LinkedIn)
- ✅ Education History

### Privacy Settings (Future)
- Public/Private profile toggle
- Hide specific sections
- Control who sees what

## Technical Usage

### In Your Components

#### Get Current User Profile
```typescript
import { useGetUserProfile } from "@/components/features/profile";

function MyComponent() {
  const { showUserProfileQuery } = useGetUserProfile();
  const { data, isLoading, error } = showUserProfileQuery;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  const user = data.data;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <img src={user.avatar.url} alt={user.name} />
    </div>
  );
}
```

#### Update Profile Programmatically
```typescript
import { useUpdateProfile } from "@/components/features/profile";

function UpdateButton() {
  const { updateProfileMutation } = useUpdateProfile();

  const handleUpdate = () => {
    updateProfileMutation.mutate(
      { bio: "New bio text" },
      {
        onSuccess: () => console.log("Updated!"),
        onError: (err) => console.error(err),
      }
    );
  };

  return <button onClick={handleUpdate}>Update Bio</button>;
}
```

#### Upload Avatar Programmatically
```typescript
import { useUploadAvatar } from "@/components/features/profile";

function AvatarUpload() {
  const { uploadAvatarMutation } = useUploadAvatar();

  const handleFile = (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    
    uploadAvatarMutation.mutate(formData);
  };

  return <input type="file" onChange={(e) => handleFile(e.target.files![0])} />;
}
```

## Data Structure

### Profile Object
```typescript
interface UserProfile {
  _id: string;
  email: string;
  name: string;
  username: string;
  avatar: {
    url: string;
    provider: "google" | "wasabi";
  };
  cover: {
    url: string | null;
    provider: "wasabi";
  };
  bio?: string | null;
  about?: string | null;
  relationship?: string | null;
  followerCount: number;
  followingCount: number;
  address?: {
    city?: string | null;
    country?: string | null;
  };
  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };
  education?: Array<{
    school: string;
    degree?: string;
  }>;
  createdAt: string;
  isMe: boolean;
}
```

## Common Tasks

### Task 1: Display User Avatar
```tsx
<img 
  src={profile.avatar.url} 
  alt={profile.name}
  className="w-32 h-32 rounded-full"
/>
```

### Task 2: Display Cover Photo
```tsx
<div className="relative h-64">
  <img 
    src={profile.cover.url} 
    alt="Cover"
    className="w-full h-full object-cover"
  />
</div>
```

### Task 3: Show Follower Count
```tsx
<div>
  <span className="font-bold">{profile.followerCount}</span>
  <span>Followers</span>
</div>
```

### Task 4: Format Join Date
```tsx
const joinDate = new Date(profile.createdAt);
const formatted = joinDate.toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric'
});
// Output: "March 2026"
```

### Task 5: Get Initials for Avatar Fallback
```tsx
const initials = profile.name
  .split(' ')
  .map(n => n[0])
  .join('')
  .toUpperCase()
  .slice(0, 2);
// "John Doe" → "JD"
```

## Troubleshooting

### Profile Not Loading
**Problem:** Profile shows error or doesn't load

**Solutions:**
1. Check if user is authenticated
2. Verify API endpoint `/users/me` is accessible
3. Check browser console for errors
4. Ensure token is valid

### Image Upload Failing
**Problem:** Avatar or cover won't upload

**Solutions:**
1. Check file size (must be < 5MB)
2. Verify file type (must be image/*)
3. Check network tab for API errors
4. Ensure backend supports uploads

### Profile Not Updating
**Problem:** Changes don't save

**Solutions:**
1. Check form validation errors
2. Verify all required fields are filled
3. Check API response for errors
4. Ensure mutation is being called

## Best Practices

### Performance
- ✅ Profile data is cached for 10 minutes
- ✅ Images should be optimized before upload
- ✅ Use skeleton loaders for better UX
- ✅ Lazy load heavy components

### User Experience
- ✅ Show loading states
- ✅ Provide clear error messages
- ✅ Give success feedback
- ✅ Validate forms in real-time

### Accessibility
- ✅ Use semantic HTML
- ✅ Add alt text to images
- ✅ Support keyboard navigation
- ✅ Include ARIA labels

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update profile fields |
| POST | `/users/avatar/upload` | Upload avatar |
| POST | `/users/cover/upload` | Upload cover photo |

### Response Format
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    // ... rest of profile
  }
}
```

## Integration Examples

### Add Profile Link to Navbar
```tsx
import Link from "next/link";

<Link href="/profile">
  <Avatar>
    <AvatarImage src={user.avatar.url} />
  </Avatar>
</Link>
```

### Show Profile Completion Progress
```tsx
const completion = calculateCompletion(profile);
// Bio: +10%, About: +10%, Avatar: +20%, etc.

<ProgressBar value={completion} />
```

### Conditional Rendering
```tsx
{profile.isMe ? (
  <EditProfileDialog />
) : (
  <FollowButton />
)}
```

## Tips & Tricks

### Optimize Images Before Upload
```typescript
const compressImage = async (file: File) => {
  // Use canvas or library to compress
  // Target: < 500KB for avatars
  // Target: < 1MB for covers
};
```

### Smart Defaults
```typescript
// Pre-fill form with existing data
defaultValues: {
  name: profile.name,
  bio: profile.bio || "",
  // ...
}
```

### Debounce Updates
```typescript
// Don't auto-save on every keystroke
// Wait for user to click save
// Or debounce by 1-2 seconds
```

## Support

For issues or questions:
1. Check documentation files
2. Review implementation code
3. Check browser console
4. Verify API responses

## Related Files

- **Components:** `src/components/features/profile/`
- **Hooks:** `src/components/features/profile/hooks/`
- **Schema:** `src/zod/profile-schema.ts`
- **Page:** `src/app/(home)/profile/page.tsx`

## Next Steps

1. ✅ Profile page is live
2. ✅ Test all features
3. ✅ Customize styling if needed
4. ⏭️ Add more social features
5. ⏭️ Implement analytics
6. ⏭️ Add privacy settings

---

**Status:** ✅ Production Ready  
**Last Updated:** March 31, 2026  
**Version:** 1.0.0
