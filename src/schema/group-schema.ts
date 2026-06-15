import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name cannot exceed 100 characters"),
  privacy: z.enum(["public", "private"]),
  about: z
    .string()
    .min(10, "About section must be at least 10 characters")
    .max(1000, "About section cannot exceed 1000 characters"),
  category: z.string().min(1, "Category is required"),
  location: z
    .object({
      country: z.string().optional().or(z.literal("")),
      city: z.string().optional().or(z.literal("")),
    })
    .optional(),
  rules: z.array(z.string()).optional(),
  memberApprovalRequired: z.boolean(),
  postApprovalRequired: z.boolean(),
  allowMemberInvites: z.boolean(),
});

export type CreateGroupSchemaType = z.infer<typeof createGroupSchema>;
