import { z } from "zod";

export const profileSchema = z.object({
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
    school: z.string(),
    degree: z.string().optional(),
    field: z.string().optional(),
    startYear: z.string().optional(),
    endYear: z.string().optional(),
  })).optional(),
});

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

export type ProfileSchemaType = z.infer<typeof profileSchema>;
export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
export type RelationshipStatus = z.infer<typeof profileSchema>["relationship"];
