import { z } from "zod";

export const uploadLongVideoSchema = z.object({
  video: z.instanceof(File, { message: "Video file is required" }),
  thumbnail: z.instanceof(File).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  subCategory: z.string().optional(),
});

export type UploadLongVideoSchemaType = z.infer<typeof uploadLongVideoSchema>;
