# Profile Component Parameters Guide

## ProfileHeader Component

### Props
```typescript
interface ProfileHeaderProps {
  profile: {
    // Required fields
    _id: string;
    name: string;
    username: string;
    avatar: { 
      url: string; 
      provider: string; 
    };
    cover: { 
      url: string | null; 
    };
    followerCount: number;
    followingCount: number;
    createdAt: string;
    
    // Optional fields (all display if available)
    bio?: string | null;
    age?: number | null;
    relationship?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
    };
    isMe?: boolean;        // Shows edit button
    isFollowing?: boolean; // For visitor view
  };
}
```

### Usage Example
```tsx
<ProfileHeader profile={userData} />
```

### Features Displayed
- ✅ Cover photo with upload (if isMe)
- ✅ Avatar with upload (if isMe)
- ✅ Name and username
- ✅ Bio text
- ✅ Following/Followers stats
- ✅ Location badge
- ✅ Join date
- ✅ Age (if available)
- ✅ Relationship status (if available)
- ✅ Edit Profile button (if isMe)
- ✅ Follow/Message buttons (if !isMe)

---

## ProfileInfo Component

### Props
```typescript
interface ProfileInfoProps {
  profile: {
    // Basic info
    bio?: string | null;
    about?: string | null;
    
    // Personal details
    birthDate?: string | null;
    age?: number | null;
    relationship?: string | null;
    
    // Address
    address?: {
      fullAddress?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      zip?: string | null;
    };
    
    // Contact
    contact?: {
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
    };
    
    // Education
    education?: Array<{
      school: string;
      degree?: string;
      field?: string;
      startYear?: string;
      endYear?: string;
    }>;
    
    // Metadata
    createdAt: string;
    role?: string;
  };
}
```

### Usage Example
```tsx
<ProfileInfo profile={userData} />
```

### Sections Displayed
1. **Role Badge** (if role exists)
   - Gradient background
   - Account type display
   
2. **About Section** (if bio or about exists)
   - Bio short description
   - About long description
   
3. **Personal Information** (if birthDate, age, or relationship)
   - Birth date
   - Age
   - Relationship status
   
4. **Location** (if address exists)
   - Full address
   - City, State, Country
   
5. **Contact Information** (if any contact fields exist)
   - Phone (clickable)
   - Email (clickable)
   - Website (clickable)
   - Facebook (clickable)
   - Instagram (clickable)
   - LinkedIn (clickable)
   
6. **Education** (if education array exists)
   - School name
   - Degree and field
   - Years attended

---

## ProfileTabs Component

### Props
```typescript
interface ProfileTabsProps {
  posts?: Post[];
  media?: MediaItem[];
  likedPosts?: Post[];
  savedPosts?: Post[];
}

interface Post {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
}

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  likes?: number;
  comments?: number;
}
```

### Usage Example
```tsx
<ProfileTabs 
  posts={userPosts}
  media={userMedia}
  likedPosts={likedPosts}
  savedPosts={savedPosts}
/>
```

### Tabs Available
1. **Posts Tab**
   - Shows user's posts
   - Empty state if no posts
   
2. **Media Tab**
   - 3-column grid layout
   - Photos and videos
   - Hover overlays with stats
   
3. **Likes Tab**
   - Posts user liked
   - Empty state if none
   
4. **Saved Tab**
   - Bookmarked posts
   - Empty state if none

---

## EditProfileDialog Component

### Props
```typescript
interface EditProfileDialogProps {
  profile: {
    name: string;
    username: string;
    bio?: string | null;
    about?: string | null;
    birthDate?: string | null;
    relationship?: string | null;
    address?: {
      city?: string | null;
      state?: string | null;
      country?: string | null;
    };
    contact?: {
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### Usage Example
```tsx
const [isOpen, setIsOpen] = useState(false);

<EditProfileDialog
  profile={userData}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

### Editable Fields
- ✅ Name (required, min 2 chars)
- ✅ Username (required, min 3 chars)
- ✅ Bio (max 500 chars)
- ✅ About (max 1000 chars)
- ✅ Birth Date (date picker)
- ✅ Relationship Status (dropdown)
- ✅ City, State, Country
- ✅ Phone, Email, Website
- ✅ Facebook, Instagram, LinkedIn URLs

### Validation Rules
- Name: Min 2 characters
- Username: Min 3 characters
- Bio: Max 500 characters
- About: Max 1000 characters
- Email: Valid email format
- Website/Social URLs: Valid URL format

---

## Complete Profile Page Layout

### Grid System
```
Desktop (≥1024px):
┌────────────────────────────────────────┐
│          12-column grid                │
├───────────────────────┬────────────────┤
│ ←──── 8 columns ────→ │ ←── 4 cols ─→ │
│                       │                │
│  Profile Header       │  Profile Info  │
│  (full width)         │  (sticky)      │
│                       │                │
│  Profile Tabs         │  • Role Badge  │
│  (full width)         │  • About       │
│                       │  • Personal    │
│  Posts Feed           │  • Location    │
│                       │  • Contact     │
│                       │  • Education   │
└───────────────────────┴────────────────┘

Mobile (<1024px):
┌─────────────────────┐
│   Single Column     │
├─────────────────────┤
│  Profile Header     │
├─────────────────────┤
│  Profile Tabs       │
├─────────────────────┤
│  Profile Info       │
│  (stacked cards)    │
└─────────────────────┘
```

---

## Data Fetching Pattern

### Server Component (page.tsx)
```typescript
// Fetches data server-side
const profile = await getProfileData();

// Passes to client components
<ProfileHeader profile={profile.data} />
<ProfileInfo profile={profile.data} />
```

### Client Components (hooks)
```typescript
// For client-side updates
const { showUserProfileQuery } = useGetUserProfile();
const { data, isLoading } = showUserProfileQuery;

// Mutations for updates
const { updateProfileMutation } = useUpdateProfile();
updateProfileMutation.mutate(data);
```

---

## Common Patterns

### Conditional Rendering
```tsx
{/* Show only to profile owner */}
{profile.isMe && <EditButton />}

{/* Show only if data exists */}
{profile.bio && <BioSection />}

{/* Show different buttons for owner vs visitor */}
{profile.isMe ? (
  <EditProfileButton />
) : (
  <FollowButton />
)}
```

### Null Safety
```tsx
// Always provide defaults
name={profile.name || ""}

// Optional chaining
address={profile.address?.city}

// Null coalescing
bio={profile.bio ?? "No bio"}
```

### Responsive Classes
```tsx
className="text-base sm:text-lg md:text-xl"
className="gap-2 sm:gap-4 lg:gap-6"
className="grid grid-cols-1 lg:grid-cols-3"
```

---

## Quick Reference

### Component Import Paths
```typescript
import { ProfileHeader } from "@/components/features/profile";
import { ProfileInfo } from "@/components/features/profile";
import { ProfileTabs } from "@/components/features/profile";
import { EditProfileDialog } from "@/components/features/profile";
import { ProfileSkeleton } from "@/components/features/profile";
```

### Hook Import Paths
```typescript
import { 
  useGetUserProfile, 
  useUpdateProfile,
  useUploadAvatar,
  useUploadCover 
} from "@/components/features/profile/hooks/profile-query";
```

### Type Import
```typescript
import type { UserProfile } from "@/components/features/profile";
```

---

**Last Updated**: March 31, 2026  
**Version**: 2.0.0
