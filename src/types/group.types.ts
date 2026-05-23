// ===============================|| GROUP TYPES ||============================== //
// All group-related types: models, API requests, and responses

// ===============================|| GROUP MODEL ||============================== //

export interface GroupCoverUrl {
  url: string;
  key: string;
  provider: string;
}

export interface GroupLocation {
  country: string;
  city: string;
}

export interface GroupCounts {
  members: number;
  posts: number;
}

export interface GroupApproval {
  memberApprovalRequired: boolean;
  postApprovalRequired: boolean;
}

export interface Group {
  _id: string;
  name: string;
  slug: string;
  privacy: "public" | "private";
  coverUrl: GroupCoverUrl;
  about: string;
  category: string;
  location: GroupLocation;
  rules: string[];
  approval: GroupApproval;
  counts: GroupCounts;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// For You Groups (with scoring)
export interface ForYouGroup extends Group {
  mutualCount: number;
  matchCountry: boolean;
  matchCity: boolean;
  score: number;
}

// My Groups (with membership info)
export interface MyGroupMembership {
  section: number;
  status: "active" | "pending" | "rejected";
  role: "owner" | "admin" | "member";
  membershipId: string | null;
  createdAt: string;
  _id: string;
  group: Group;
}

// Group Details (with my membership)
export interface GroupMyMembership {
  _id: string;
  status: "active" | "pending" | "rejected";
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface GroupDetails extends Group {
  isCreatedByMe: boolean;
  myMembership: GroupMyMembership | null;
}

// ===============================|| GROUP API RESPONSES ||============================== //

export interface ForYouGroupsResponse {
  success: boolean;
  items: ForYouGroup[];
  nextCursor: {
    score: number;
    createdAt: string;
    _id: string;
  } | null;
  debug: {
    myCountry: string;
    myCity: string;
    excludeCount: number;
  };
}

export interface MyGroupsResponse {
  success: boolean;
  items: MyGroupMembership[];
  nextCursor: {
    section: number;
    createdAt: string;
    _id: string;
  } | null;
}

export interface GroupDetailsResponse {
  success: boolean;
  group: GroupDetails;
}

export interface CreateGroupResponse {
  success: boolean;
  message: string;
  data: Group;
}

export interface JoinGroupResponse {
  success: boolean;
  message: string;
  data: {
    groupId: string;
    status: "active" | "pending";
  };
}

// ===============================|| GROUP API REQUESTS ||============================== //

export interface CreateGroupPayload {
  name: string;
  privacy: "public" | "private";
  about: string;
  coverUrl?: {
    key: string;
    url: string;
    provider: string;
  };
  category: string;
  location?: {
    country?: string;
    city?: string;
  };
  rules?: string[];
  memberApprovalRequired: boolean;
  postApprovalRequired: boolean;
  allowMemberInvites: boolean;
}

