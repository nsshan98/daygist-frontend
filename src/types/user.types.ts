// ===============================|| USER TYPES ||============================== //
// All user-related types: models, API requests, and responses

export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: {
    url: string;
    key: string;
    provider: string;
  };
  cover?: {
    url: string | null;
    key: string | null;
  };
  bio?: string | null;
  about?: string | null;
  birthDate?: string | null;
  country?: string | null;
  relationship?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignedUrlResponse {
  ok: boolean;
  url: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string | null;
  about?: string | null;
  birthDate?: string | null;
  country?: string | null;
  relationship?: string | null;
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
}
