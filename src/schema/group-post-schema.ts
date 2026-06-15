import { z } from "zod";

// ===============================|| GROUP POST SCHEMA ||============================== //

// Text Style Schema
export const groupPostTextStyleSchema = z.object({
  color: z.string(),
  fontSize: z.number(),
  fontWeight: z.string(),
  align: z.string(),
});

// Image Schema
export const groupPostImageSchema = z.object({
  url: z.string().url(),
  provider: z.string(),
  key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Video Schema
export const groupPostVideoSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  provider: z.string(),
  key: z.string(),
  durationSec: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Create Text Post Schema
export const createGroupTextPostSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1, "Text is required"),
  backgroundUrl: z.string().url().optional(),
  textStyle: groupPostTextStyleSchema.optional(),
});

// Create Image Post Schema
export const createGroupImagePostSchema = z.object({
  type: z.literal("image"),
  caption: z.string().min(1, "Caption is required"),
  layout: z.string(),
  images: z.array(groupPostImageSchema).min(1, "At least one image is required"),
  subCategory: z.string().optional(),
});

// Create Video Post Schema
export const createGroupVideoPostSchema = z.object({
  type: z.literal("video"),
  caption: z.string().min(1, "Caption is required"),
  category: z.string(),
  subCategory: z.string().optional(),
  mutedByDefault: z.boolean(),
  loop: z.boolean(),
  video: groupPostVideoSchema,
});

// Union Schema for Create Group Post
export const createGroupPostSchema = z.discriminatedUnion("type", [
  createGroupTextPostSchema,
  createGroupImagePostSchema,
  createGroupVideoPostSchema,
]);

// Edit Group Post Schema
export const editGroupPostSchema = z.object({
  text: z.string().optional(),
  caption: z.string().optional(),
  backgroundUrl: z.string().url().optional(),
  textStyle: groupPostTextStyleSchema.optional(),
  images: z.array(groupPostImageSchema).optional(),
  layout: z.string().optional(),
  video: groupPostVideoSchema.optional(),
  mutedByDefault: z.boolean().optional(),
  loop: z.boolean().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
});

// Type exports
export type GroupPostTextStyleSchemaType = z.infer<typeof groupPostTextStyleSchema>;
export type GroupPostImageSchemaType = z.infer<typeof groupPostImageSchema>;
export type GroupPostVideoSchemaType = z.infer<typeof groupPostVideoSchema>;
export type CreateGroupTextPostSchemaType = z.infer<typeof createGroupTextPostSchema>;
export type CreateGroupImagePostSchemaType = z.infer<typeof createGroupImagePostSchema>;
export type CreateGroupVideoPostSchemaType = z.infer<typeof createGroupVideoPostSchema>;
export type CreateGroupPostSchemaType = z.infer<typeof createGroupPostSchema>;
export type EditGroupPostSchemaType = z.infer<typeof editGroupPostSchema>;
