import { z } from "zod";

// ===============================|| STORY SCHEMA ||============================== //

// Text Style Schema
export const storyTextStyleSchema = z.object({
  color: z.string(),
  fontSize: z.number(),
  align: z.enum(["left", "center", "right"]),
});

// Media Schema
export const storyMediaSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  provider: z.string(),
  key: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  durationSec: z.number().optional(),
});

// Create Text Story Schema
export const createTextStorySchema = z.object({
  type: z.literal("text"),
  privacy: z.enum(["followers", "friends", "only_me"]),
  text: z.string().min(1, "Text is required"),
  backgroundUrl: z.string().url().optional(),
  textStyle: storyTextStyleSchema.optional(),
  webLink: z.string().url().optional(),
});

// Create Image Story Schema
export const createImageStorySchema = z.object({
  type: z.literal("image"),
  privacy: z.enum(["followers", "friends", "only_me"]),
  media: storyMediaSchema,
});

// Create Video Story Schema
export const createVideoStorySchema = z.object({
  type: z.literal("video"),
  privacy: z.enum(["followers", "friends", "only_me"]),
  media: storyMediaSchema,
});

// Union Schema for Create Story
export const createStorySchema = z.discriminatedUnion("type", [
  createTextStorySchema,
  createImageStorySchema,
  createVideoStorySchema,
]);

// Type exports
export type StoryTextStyleSchemaType = z.infer<typeof storyTextStyleSchema>;
export type StoryMediaSchemaType = z.infer<typeof storyMediaSchema>;
export type CreateTextStorySchemaType = z.infer<typeof createTextStorySchema>;
export type CreateImageStorySchemaType = z.infer<typeof createImageStorySchema>;
export type CreateVideoStorySchemaType = z.infer<typeof createVideoStorySchema>;
export type CreateStorySchemaType = z.infer<typeof createStorySchema>;
