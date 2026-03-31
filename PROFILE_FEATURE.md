# Profile Feature Documentation

## Overview
Complete user profile feature for the social media platform with `/users/me` API endpoint integration.

## Features Implemented

### 1. Profile Components

#### ProfileHeader (`src/components/features/profile/profile-header.tsx`)
- Cover photo display with upload functionality
- Avatar display with upload functionality  
- User statistics (followers, following)
- Edit profile button
- Action buttons (message, follow, share)
- Location display
- Join date display

#### ProfileInfo (`src/components/features/profile/profile-info.tsx`)
- About section (bio, about text)
- Personal information (birth date, age, relationship status)
- Location & address details
- Contact information (phone, email, website, social media links)
- Education history

#### ProfileTabs (`src/components/features/profile/profile-tabs.tsx`)
- Posts tab - User's posts feed
- Media tab - Photos and videos grid
- Likes tab - Liked posts
- Saved tab - Saved/bookmarked posts
- Empty states for each tab

#### EditProfileDialog (`src/components/features/profile/edit-profile-dialog.tsx`)
- Complete profile editing form
- Validation using Zod schema
- Real-time error feedback
- Success/error toast notifications
- Only submits changed fields

#### ProfileSkeleton (`src/components/features/profile/profile-skeleton.tsx`)
- Loading skeleton for profile page
- Matches actual layout structure
- Smooth loading experience

### 2. Custom Hooks

#### useGetUserProfile
- Fetches user profile from `/users/me`
- Query key: `["user-profile"]`
- Stale time: 10 minutes
- No retry on failure

#### useUpdateProfile
- Updates user profile via PATCH `/users/me`
- Automatically invalidates and refetches profile cache
- Supports partial updates

#### useUploadAvatar
- Uploads avatar image via POST `/users/avatar/upload`
- FormData with multipart/form-data
- Validates file type and size (5MB max)
- Shows upload progress

#### useUploadCover
- Uploads cover photo via POST `/users/cover/upload`
- FormData with multipart/form-data
- Validates file type and size (5MB max)
- Shows upload progress

### 3. Validation Schema

#### Profile Schema (`src/zod/profile-schema.ts`)
```typescript
{
  name?: string;
  username?: string;
  bio?: string | null;
  about?: string | null;
  birthDate?: string | null;
  relationship?: "SINGLE" | "IN_RELATIONSHIP" | "MARRIED" | "DIVORCED" | "WIDOWED" | null;
  address?: {
    fullAddress?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zip?: string | null;
  };
  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
    startYear?: string;
    endYear?: string;
  }>;
}
```

## File Structure

```
src/
├── app/(home)/profile/
│   └── page.tsx                    # Main profile page route
├── components/features/profile/
│   ├── hooks/
│   │   └── profile-query.ts        # React Query hooks
│   ├── index.ts                    # Component exports
│   ├── profile-header.tsx          # Header with cover/avatar
│   ├── profile-info.tsx            # Sidebar info cards
│   ├── profile-tabs.tsx            # Posts/Media/Likes/Saved tabs
│   ├── edit-profile-dialog.tsx     # Edit profile form
│   └── profile-skeleton.tsx        # Loading skeleton
└── zod/
    └── profile-schema.ts           # Validation schemas
```

## API Endpoints

### GET /users/me
Fetches current user profile data.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "69caabae696e63b75542499b",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": {
      "url": "https://...",
      "provider": "google"
    },
    "cover": {
      "url": "https://...",
      "provider": "wasabi"
    },
    "username": "username_1234",
    "bio": "Bio text",
    "about": "About text",
    "relationship": "SINGLE",
    "followerCount": 100,
    "followingCount": 50,
    "address": {
      "city": "City",
      "country": "Country"
    },
    "contact": {
      "phone": "+1234567890",
      "email": "email@example.com",
      "website": "https://example.com"
    },
    "education": [],
    "createdAt": "2026-03-30T16:58:22.466Z",
    "isMe": true
  }
}
```

### PATCH /users/me
Updates user profile fields. Accepts partial updates.

**Request Body:**
```json
{
  "name": "New Name",
  "bio": "Updated bio",
  "address": {
    "city": "New City"
  }
}
```

### POST /users/avatar/upload
Uploads profile avatar.

**Request:** FormData with `avatar` file field
**Response:** Updated user data

### POST /users/cover/upload
Uploads cover photo.

**Request:** FormData with `cover` file field
**Response:** Updated user data

## Usage Examples

### Displaying Profile
```tsx
import { useGetUserProfile } from "@/components/features/profile";

function MyComponent() {
  const { showUserProfileQuery } = useGetUserProfile();
  const { data: profile, isLoading, error } = showUserProfileQuery;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return <div>Hello, {profile.data.name}</div>;
}
```

### Updating Profile
```tsx
import { useUpdateProfile } from "@/components/features/profile";

function EditProfileForm() {
  const { updateProfileMutation } = useUpdateProfile();

  const handleSubmit = (data) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => console.log("Profile updated!"),
      onError: (error) => console.error("Error:", error),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Uploading Images
```tsx
import { useUploadAvatar } from "@/components/features/profile";

function AvatarUploader() {
  const { uploadAvatarMutation } = useUploadAvatar();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    uploadAvatarMutation.mutate(formData);
  };

  return <input type="file" onChange={handleFileChange} />;
}
```

## Design Features

### Responsive Layout
- Mobile-first design
- 3-column layout on desktop (sidebar, main content, info sidebar)
- Single column on mobile
- Sticky navigation and info cards

### Modern UI Elements
- Gradient backgrounds and borders
- Smooth animations and transitions
- Hover effects and micro-interactions
- Card-based layout with shadows
- Backdrop blur effects

### Image Upload
- Drag-and-drop ready
- File validation (type and size)
- Upload progress indicators
- Optimistic UI updates
- Camera icons for upload triggers

### Loading States
- Skeleton loaders for all components
- Matching actual content structure
- Smooth transitions

### Error Handling
- Toast notifications for errors
- User-friendly error messages
- Retry mechanisms
- Form validation feedback

## Integration Points

### Navigation
- Profile link added to sidebar
- Uses Next.js Link component
- Proper routing with `/profile`

### Authentication
- Uses existing auth context
- Token-based API requests
- Automatic token refresh
- Session management

### Existing Patterns
- Follows auth-query.ts pattern
- Same Zod validation approach
- Consistent error handling
- Matching design system

## Testing Checklist

- [ ] Profile loads correctly
- [ ] Cover photo displays properly
- [ ] Avatar displays properly
- [ ] Stats show correct counts
- [ ] Edit dialog opens/closes
- [ ] Form validation works
- [ ] Profile updates successfully
- [ ] Avatar upload works
- [ ] Cover upload works
- [ ] Tabs switch correctly
- [ ] Empty states display
- [ ] Loading skeleton shows
- [ ] Error states handled
- [ ] Mobile responsive
- [ ] Desktop layout works
- [ ] Navigation link functions

## Future Enhancements

1. **Profile Verification**
   - Verified badge display
   - Verification request flow

2. **Privacy Settings**
   - Public/private profile toggle
   - Hide specific sections

3. **Analytics**
   - Profile view count
   - Engagement metrics

4. **Customization**
   - Theme colors
   - Profile layout options

5. **Social Features**
   - Friend suggestions
   - Mutual connections
   - Activity feed

## Dependencies

All dependencies are already installed:
- @tanstack/react-query
- axios
- react-hook-form
- zod
- @hookform/resolvers
- lucide-react
- shadcn-ui components

## Notes

- All mutations automatically invalidate and refetch the user profile query
- Images are validated for type (image/*) and size (< 5MB)
- Empty strings are converted to null for optional fields
- Only changed fields are submitted to minimize API payload
- Profile data is cached for 10 minutes before becoming stale
