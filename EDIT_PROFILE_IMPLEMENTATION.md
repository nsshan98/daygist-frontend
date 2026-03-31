# Edit Profile Implementation Guide

## Overview
Complete implementation of the edit profile functionality with support for updating user profile information, avatar, and cover photo.

## API Endpoints Used

### 1. Get User Profile
```http
GET /users/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Implementation:** `useGetUserProfile()` hook in `profile-query.ts`

---

### 2. Update Profile
```http
PATCH /users/me
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "Rakib Hasan Updated",
  "bio": "Software Developer",
  "about": "Passionate about coding",
  "birthDate": "1995-05-15",
  "relationship": "SINGLE",
  "address": {
    "fullAddress": "Khulna, Bangladesh",
    "city": "Khulna",
    "state": "Khulna Division",
    "country": "Bangladesh",
    "zip": "9100"
  },
  "contact": {
    "phone": "+8801712345678",
    "email": "rakib@gmail.com",
    "website": "https://rakib.dev",
    "facebook": "https://facebook.com/rakib",
    "instagram": "https://instagram.com/rakib",
    "linkedin": "https://linkedin.com/in/rakib"
  },
  "education": [
    {
      "school": "Khulna University",
      "degree": "BSc in CSE",
      "field": "Computer Science",
      "startYear": "2019",
      "endYear": "2023"
    }
  ]
}
```

**Implementation:** `useUpdateProfile()` hook in `profile-query.ts`

---

### 3. Upload Avatar
```http
POST /users/me/avatar
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN
```

**Form Data:**
- `file` = image file

**JavaScript Implementation:**
```typescript
const formData = new FormData();
formData.append("file", fileObject);

axiosClient.post("/users/me/avatar", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

**Implementation:** `useUploadAvatar()` hook in `profile-query.ts`

---

### 4. Upload Cover Photo
```http
POST /users/me/cover
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN
```

**Form Data:**
- `file` = image file

**JavaScript Implementation:**
```typescript
const formData = new FormData();
formData.append("file", fileObject);

axiosClient.post("/users/me/cover", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

**Implementation:** `useUploadCover()` hook in `profile-query.ts`

---

## File Structure

```
src/
├── components/
│   └── features/
│       └── profile/
│           ├── edit-profile-dialog.tsx    # Main edit dialog component
│           ├── profile-header.tsx         # Profile header with avatar/cover upload
│           ├── profile-info.tsx           # Profile information display
│           └── hooks/
│               └── profile-query.ts       # React Query hooks for API calls
└── zod/
    └── profile-schema.ts                  # Validation schemas
```

---

## Features Implemented

### 1. Edit Profile Dialog (`edit-profile-dialog.tsx`)

#### Basic Information Section
- ✅ Name (required, min 2 characters)
- ✅ Username (required, min 3 characters)
- ✅ Bio (optional, max 500 characters)
- ✅ About (optional, max 1000 characters)

#### Personal Details Section
- ✅ Birth Date (date picker)
- ✅ Relationship Status (dropdown: Single, In a relationship, Married, Divorced, Widowed)

#### Location Section
- ✅ City
- ✅ State
- ✅ Country
- ✅ Full Address
- ✅ ZIP Code

#### Contact Information Section
- ✅ Phone (with validation)
- ✅ Email (with email validation)
- ✅ Website (URL validation)
- ✅ Facebook (URL validation)
- ✅ Instagram (URL validation)
- ✅ LinkedIn (URL validation)

#### Education Section
- ✅ Dynamic list of education entries
- ✅ Add/Remove education items
- ✅ Each entry includes:
  - School/University (required)
  - Degree (optional)
  - Field of Study (optional)
  - Start Year (optional)
  - End Year (optional)

### 2. Profile Header (`profile-header.tsx`)

#### Avatar Upload
- ✅ Click camera icon on avatar to upload
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Loading state during upload
- ✅ Success/Error toast notifications
- ✅ Automatic profile refresh after upload

#### Cover Photo Upload
- ✅ "Change Cover" button
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Loading state during upload
- ✅ Success/Error toast notifications
- ✅ Automatic profile refresh after upload

### 3. Profile Info Display (`profile-info.tsx`)

All fields are always visible with "N/A" placeholders when data is missing:
- ✅ Account Type (Role)
- ✅ About (Bio & About sections)
- ✅ Personal Information (Birth Date, Age, Relationship Status)
- ✅ Location (Full Address, City/State/Country)
- ✅ Contact Information (Phone, Email, Website, Social Media)
- ✅ Education (List or "No education information" message)

### 4. React Query Hooks (`profile-query.ts`)

#### `useGetUserProfile()`
- Fetches current user profile from `/users/me`
- Cached for 10 minutes
- Auto-retry disabled

#### `useUpdateProfile()`
- PATCH request to `/users/me`
- Auto-invalidates and refetches profile on success
- Handles partial updates (only sends changed fields)

#### `useUploadAvatar()`
- POST request to `/users/me/avatar`
- Handles multipart/form-data
- Auto-invalidates and refetches profile on success

#### `useUploadCover()`
- POST request to `/users/me/cover`
- Handles multipart/form-data
- Auto-invalidates and refetches profile on success

---

## Validation Schema (`profile-schema.ts`)

```typescript
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
  about: z.string().max(1000, "About cannot exceed 1000 characters").optional().nullable(),
  birthDate: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  relationship: z.enum(["SINGLE", "IN_RELATIONSHIP", "MARRIED", "DIVORCED", "WIDOWED"]).optional().nullable(),
  address: z.object({
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
  }).optional(),
  contact: z.object({
    phone: z.string().optional().nullable(),
    email: z.email().optional().nullable(),
    website: z.string().url().optional().nullable(),
    facebook: z.string().url().optional().nullable(),
    instagram: z.string().url().optional().nullable(),
    linkedin: z.string().url().optional().nullable(),
  }).optional(),
  education: z.array(z.object({
    school: z.string().min(1, "School name is required"),
    degree: z.string().optional().nullable(),
    field: z.string().optional().nullable(),
    startYear: z.string().optional().nullable(),
    endYear: z.string().optional().nullable(),
  })).optional(),
});
```

---

## Usage Example

### Opening Edit Dialog
```typescript
import { useState } from "react";
import { EditProfileDialog } from "@/components/features/profile";

function MyComponent() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsEditDialogOpen(true)}>
        Edit Profile
      </Button>
      
      <EditProfileDialog
        profile={profileData}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
```

### Using Hooks Directly
```typescript
import { 
  useGetUserProfile, 
  useUpdateProfile, 
  useUploadAvatar, 
  useUploadCover 
} from "@/components/features/profile/hooks/profile-query";

function MyComponent() {
  const { showUserProfileQuery } = useGetUserProfile();
  const { updateProfileMutation } = useUpdateProfile();
  const { uploadAvatarMutation } = useUploadAvatar();
  const { uploadCoverMutation } = useUploadCover();
  
  // Access profile data
  const { data: profile, isLoading, error } = showUserProfileQuery;
  
  // Update profile
  updateProfileMutation.mutate({
    name: "Updated Name",
    bio: "New bio text"
  });
  
  // Upload avatar
  const formData = new FormData();
  formData.append("file", avatarFile);
  uploadAvatarMutation.mutate(formData);
  
  // Upload cover
  const coverFormData = new FormData();
  coverFormData.append("file", coverFile);
  uploadCoverMutation.mutate(coverFormData);
}
```

---

## Key Features

### Smart Update Detection
The edit dialog only sends changed fields to the API:
- Compares form values with original profile data
- Filters out unchanged fields
- Converts empty strings to `null`
- Prevents unnecessary API calls

### Form Validation
- Client-side validation using Zod schema
- Real-time error messages
- URL validation for social media links
- Email validation
- Character limits for bio/about

### User Experience
- Loading states during submissions
- Success/Error toast notifications
- Confirmation dialogs
- Cancel option
- Responsive design (mobile-friendly)
- Keyboard navigation support

### Data Handling
- Automatic JWT token injection via axios interceptor
- Token refresh on 401 errors
- Session management
- Automatic profile cache invalidation
- Optimistic UI updates

---

## Testing Checklist

- [ ] Edit basic information (name, username, bio, about)
- [ ] Update personal details (birth date, relationship status)
- [ ] Modify location information
- [ ] Add/edit/remove contact information
- [ ] Add multiple education entries
- [ ] Remove education entries
- [ ] Upload avatar image
- [ ] Upload cover photo
- [ ] Validate file types (images only)
- [ ] Validate file sizes (max 5MB)
- [ ] Test form validation errors
- [ ] Test success/error notifications
- [ ] Verify profile auto-refresh after updates
- [ ] Test with slow network connections
- [ ] Test responsive design on mobile

---

## Notes

1. **Authentication**: All endpoints require JWT token in Authorization header. The axios client automatically handles this.

2. **Token Refresh**: If a 401 error occurs, the client automatically attempts to refresh the token before retrying.

3. **Image Upload**: Both avatar and cover uploads accept image files only (validated by file type).

4. **Education Array**: The education field accepts an array that completely replaces the existing education data on update.

5. **Partial Updates**: The profile update endpoint accepts partial data - only include fields you want to change.

6. **Cache Strategy**: Profile data is cached for 10 minutes but invalidated immediately after any mutation to ensure fresh data.

---

## Troubleshooting

### Common Issues

**Issue**: Avatar/Cover upload fails
- **Solution**: Check file size (must be < 5MB) and file type (must be image)

**Issue**: Profile update doesn't save
- **Solution**: Check for validation errors in the form, ensure all required fields are filled

**Issue**: "No changes made" notification
- **Solution**: The system detected no differences between current and submitted data

**Issue**: Form won't submit
- **Solution**: Check browser console for validation errors or network issues

---

## Future Enhancements

- [ ] Add education institution autocomplete
- [ ] Support for multiple addresses
- [ ] Work experience section
- [ ] Skills/Interests section
- [ ] Profile visibility settings
- [ ] Profile completion percentage indicator
- [ ] Draft/Save for later functionality
- [ ] Undo last change feature
- [ ] Profile version history
