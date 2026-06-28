import { z } from "zod";

// ====================================|| SELLER STATUS ENUMS ||=================================== //

export const sellerStatusEnum = z.enum(["pending", "approved", "rejected"]);
export type SellerStatus = z.infer<typeof sellerStatusEnum>;

// ====================================|| IMAGE SCHEMA ||=================================== //

export const imageSchema = z.object({
  key: z.string().min(1, "Image key is required"),
  url: z.string().url("Must be a valid URL"),
  provider: z.string().optional(),
});

// Geographic location schema - matches existing patterns
export const locationSchema = z.object({
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  district: z.string().optional(),
  houseNumber: z.string().optional(),
  road: z.string().optional(),
}).optional();

// Seller profile schema - complete seller profile including status
export const sellerProfileSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().optional(),
  city: z.string().optional(),
  district: z.string().min(1, "District is required"),
  houseNumber: z.string().optional(),
  road: z.string().optional(),
  businessType: z.enum(["individual", "business"]).default("individual"),
  nidNumber: z.string().optional(),
  nidFrontImage: imageSchema.optional(),
  nidBackImage: imageSchema.optional(),
  tradeLicense: z.string().optional(),
  logo: imageSchema.optional(),
  banner: imageSchema.optional(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, "You must accept seller terms & conditions"),
  status: sellerStatusEnum.default("pending"),
  reason: z.string().optional(),
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SellerProfileSchemaType = z.infer<typeof sellerProfileSchema>;

// ====================================|| SELLER DASHBOARD STATS ||=================================== //

export const sellerStatsSchema = z.object({
  productCount: z.number().default(0),
  completedOrdersCount: z.number().default(0),
  pendingOrdersCount: z.number().default(0),
  walletBalance: z.number().default(0),
});

export type SellerStatsSchemaType = z.infer<typeof sellerStatsSchema>;

// ====================================|| SELLER ME RESPONSE ||=================================== //

export const sellerMeResponseSchema = z.object({
  success: z.literal(true),
  data: z.union([sellerProfileSchema, z.null()]).nullable(),
  status: sellerStatsSchema,
  message: z.string().optional(),
});

export type SellerMeResponseSchemaType = z.infer<typeof sellerMeResponseSchema>;

// ====================================|| SELLER APPLICATION SCHEMA ||=================================== //

// Seller application schema - based on requirements
export const sellerApplicationSchema = z.object({
  // Basic seller info - always required
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{11}$/, "Phone number must be 11 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  district: z.string().min(1, "District is required"),

  // Geographic information
  country: z.string().optional(),
  city: z.string().optional(),
  houseNumber: z.string().optional(),
  road: z.string().optional(),

  // Business type - defaults to "individual"
  businessType: z.enum(["individual", "business"]).refine(val => val !== undefined, "Business type is required"),

  // Conditional KYC fields based on business type
  nidNumber: z.string().optional(),
  nidFrontImage: imageSchema.optional(),
  nidBackImage: imageSchema.optional(),
  tradeLicense: z.string().optional(),

  // Visual assets - optional
  logo: imageSchema.optional(),
  banner: imageSchema.optional(),

  // Description - optional
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),

  // Terms acceptance - must be true
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept seller terms & conditions",
  })
});

export type SellerApplicationSchemaType = z.infer<typeof sellerApplicationSchema>;