// ===============================|| UPLOAD TYPES ||============================== //
// All upload-related types

export interface UploadResponse {
  ok: boolean;
  url: string;
  key: string;
  provider: string;
}
