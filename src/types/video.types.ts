// ===============================|| VIDEO TYPES ||============================== //
// All video-related types: models, API requests, and API responses

// ===============================|| VIDEO API PAYLOADS ||============================== //

export interface UploadLongVideoPayload {
  video: File;
  thumbnail?: File;
  title?: string;
  description?: string;
  subCategory?: string;
}

// ===============================|| VIDEO API RESPONSES ||============================== //

export interface UploadLongVideoResponse {
  ok: boolean;
  message: string;
  data?: unknown;
}
