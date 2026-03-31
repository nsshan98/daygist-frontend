# Profile Page Layout Guide

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║                    COVER PHOTO                             ║  │
│  ║              (Upload button for owner)                     ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│     ┌──────┐                                                     │
│     │      │  ┌──────────────────────────┐                      │
│     │AVATAR│  │  Name                    │                      │
│     │      │  │  @username               │                      │
│     └──────┘  │  Bio text here...        │                      │
│               │                           │                      │
│   [Edit]      │  Following  |  Followers  │                      │
│   [More]      │     150    |     300      │                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DESKTOP LAYOUT (3 Columns)                                      │
├──────────────────┬──────────────────────┬──────────────────────┤
│                  │                      │                      │
│  Left Sidebar    │   Main Content       │  Right Sidebar       │
│  (Navigation)    │                      │  (Profile Info)      │
│                  │   ┌────────────┐     │                      │
│  • Home          │   │  POST TABS │     │  ┌──────────────┐   │
│  • Explore       │   └────────────┘     │  │ About        │   │
│  • Notifications │                      │  ├──────────────┤   │
│  • Messages      │   ┌────────────┐     │  │ Personal     │   │
│  • Bookmarks     │   │   POST 1   │     │  │ Info         │   │
│  • Profile       │   └────────────┘     │  ├──────────────┤   │
│                  │                      │  │ Location     │   │
│  [Settings]      │   ┌────────────┐     │  ├──────────────┤   │
│  [Logout]        │   │   POST 2   │     │  │ Contact      │   │
│                  │   └────────────┘     │  ├──────────────┤   │
│                  │                      │  │ Education    │   │
│  #Trending       │   ┌────────────┐     │  └──────────────┘   │
│  Topics          │   │   POST 3   │     │                      │
│                  │   └────────────┘     │                      │
│                  │                      │                      │
├──────────────────┴──────────────────────┴──────────────────────┤
│                         FOOTER                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MOBILE LAYOUT (1 Column - Stacked)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║                    COVER PHOTO                             ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│     ┌──────┐                                                    │
│     │AVATAR│  Name                                             │
│     └──────┘  @username                                        │
│               Bio                                              │
│   [Edit]                                                       │
│               Following  |  Followers                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  POST TABS (Horizontal Scroll)                         │    │
│  │  [Posts] [Media] [Likes] [Saved]                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    POST 1                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    POST 2                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Profile Info Cards (Stacked)                         │    │
│  │  • About                                              │    │
│  │  • Personal Info                                      │    │
│  │  • Location                                           │    │
│  │  • Contact                                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### ProfileHeader Component
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              [Cover Photo Area]                           ║
║         Height: 48-80px (responsive)                      ║
║         Upload button (top-right, owner only)             ║
║                                                           ║
║    [Avatar]                                               ║
║   Size: 32-40px                                          ║
║   Overlaps cover                                         ║
║                                                           ║
║   Name (H1)                                               ║
║   @username                                               ║
║   Bio                                                     ║
║                                                           ║
║   [Action Buttons]                                        ║
║   • Edit Profile (owner)                                 ║
║   • Follow (visitors)                                    ║
║   • Message                                              ║
║   • Share                                                ║
║                                                           ║
║   Stats Bar                                               ║
║   Following | Followers                                   ║
║                                                           ║
║   Meta Information                                        ║
║   📅 Joined Date  📍 Location                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### ProfileTabs Component
```
┌─────────────────────────────────────────────────┐
│ [📄 Posts] [⊞ Media] [❤️ Likes] [🔖 Saved]     │
└─────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────┐
│  POSTS TAB CONTENT                              │
│  • Feed post components                         │
│  • Infinite scroll ready                        │
│  • Empty state if no posts                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  MEDIA TAB CONTENT                              │
│  • 3-column grid                                │
│  • Images & videos                              │
│  • Hover overlays with stats                    │
│  • Lightbox ready                               │
└─────────────────────────────────────────────────┘
```

### ProfileInfo Component (Sidebar)
```
┌──────────────────────────────┐
│ ❤️ About                     │
├──────────────────────────────┤
│ Bio text...                  │
│ About text...                │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Personal Information         │
├──────────────────────────────┤
│ 📅 Born: Jan 1, 2000        │
│ 🎂 Age: 26 years old        │
│ 💕 Relationship: Single     │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 🏠 Location                  │
├──────────────────────────────┤
│ 📍 Full address              │
│ 📍 City, State, Country      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 📞 Contact Information       │
├──────────────────────────────┤
│ 📱 +1 234 567 8900          │
│ ✉️ email@example.com        │
│ 🌐 example.com              │
│ 📘 Facebook                 │
│ 📷 Instagram                │
│ 💼 LinkedIn                 │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 💼 Education                │
├──────────────────────────────┤
│ 🎓 University Name          │
│    Degree in Field          │
│    2018 - 2022              │
└──────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile (< 640px)
├─ Single column layout
├─ Stacked components
├─ Full-width cards
└─ Bottom navigation ready

Tablet (640px - 1024px)
├─ Two columns possible
├─ Side-by-side info
├─ Optimized spacing
└─ Flexible grid

Desktop (> 1024px)
├─ Three columns
│  ├─ Left: Navigation (fixed width)
│  ├─ Center: Main content (flexible)
│  └─ Right: Profile info (fixed width)
├─ Sticky sidebars
├─ Maximum width container
└─ Enhanced hover states
```

## Edit Profile Dialog

```
╔═══════════════════════════════════════════════════╗
║  Edit Profile                              [X]    ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  Basic Information                                ║
║  ┌──────────────────┬──────────────────┐         ║
║  │ Name             │ Username         │         ║
║  └──────────────────┴──────────────────┘         ║
║  ┌─────────────────────────────────────┐         ║
║  │ Bio (textarea)                      │         ║
║  └─────────────────────────────────────┘         ║
║  ┌─────────────────────────────────────┐         ║
║  │ About (textarea)                    │         ║
║  └─────────────────────────────────────┘         ║
║                                                   ║
║  Personal Details                                 ║
║  ┌──────────────────┬──────────────────┐         ║
║  │ Birth Date       │ Relationship     │         ║
║  └──────────────────┴──────────────────┘         ║
║                                                   ║
║  Location                                         ║
║  ┌──────────┬──────────┬──────────┐              ║
║  │ City     │ State    │ Country  │              ║
║  └──────────┴──────────┴──────────┘              ║
║                                                   ║
║  Contact Information                              ║
║  ┌──────────────────┬──────────────────┐         ║
║  │ Phone            │ Email            │         ║
║  └──────────────────┴──────────────────┘         ║
║  ┌──────────────────┬──────────────────┐         ║
║  │ Website          │ Facebook         │         ║
║  └──────────────────┴──────────────────┘         ║
║  ┌──────────────────┬──────────────────┐         ║
║  │ Instagram        │ LinkedIn         │         ║
║  └──────────────────┴──────────────────┘         ║
║                                                   ║
║           [Cancel]  [Save Changes]                ║
╚═══════════════════════════════════════════════════╝
```

## Loading Skeleton Flow

```
Page Load → Show ProfileSkeleton
    ↓
API Request (/users/me)
    ↓
Receive Data
    ↓
Smooth Transition
    ↓
Show Actual Content
```

## Interaction States

### Hover Effects
- Navigation items: Scale + background color
- Buttons: Scale + shadow
- Images: Scale + overlay
- Links: Color change + underline
- Cards: Shadow elevation

### Active States
- Current page: Highlighted background
- Liked posts: Filled heart icon
- Saved posts: Filled bookmark icon
- Uploading: Spinner + disabled state

### Focus States
- Input fields: Ring indicator
- Buttons: Ring indicator
- Links: Underline
- Dialog: Trap focus

## Animation Details

### Transitions
- Page transitions: Fade in (300ms)
- Tab switches: Fade + slide (200ms)
- Image uploads: Fade in (300ms)
- Modal open/close: Scale + fade (250ms)

### Micro-interactions
- Button clicks: Scale down (95%)
- Like animation: Heart scale + particles
- Follow button: Color transition
- Upload progress: Circular spinner

### Background Animations
- Gradient pulse: Slow animation
- Blob movement: Floating effect
- Shadow transitions: Smooth interpolation
