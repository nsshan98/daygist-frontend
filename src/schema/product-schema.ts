import { z } from "zod";

// ====================================|| PRODUCT IMAGE SCHEMA ||=================================== //

export const productImageSchema = z.object({
  key: z.string().min(1, "Image key is required"),
  url: z.string().url("Must be a valid URL"),
  provider: z.string().default("wasabi"),
  type: z.string().default("image"),
});

// ====================================|| PRODUCT VARIANT SCHEMA ||=================================== //

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  options: z.array(z.string().min(1)).min(1, "At least one option is required"),
});

// ====================================|| PRODUCT SHIPPING SCHEMA ||=================================== //

export const productShippingZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  districts: z.array(z.string()).default([]),
  fee: z.number().min(0, "Fee must be non-negative"),
  etaMinDays: z.number().min(0).default(1),
  etaMaxDays: z.number().min(0).default(3),
});

export const productShippingSchema = z.object({
  freeShipping: z.boolean().default(false),
  feeType: z.enum(["fixed", "by_zone"]).default("fixed"),
  fee: z.coerce.number().min(0).default(0),
  zones: z.array(productShippingZoneSchema).default([]),
  handlingTimeDays: z.coerce.number().min(0).default(1),
  codAvailable: z.boolean().default(false),
  returnable: z.boolean().default(false),
  warrantyText: z.string().default(""),
});

// ====================================|| CREATE PRODUCT SCHEMA ||=================================== //

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").default(""),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPercent: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
  stock: z.coerce.number().min(0, "Stock cannot be negative").default(0),
  status: z.enum(["draft", "active"]).default("draft"),
  categoryId: z.string().min(1, "Category is required"),
  categoryPath: z.array(z.string()).min(2, "Category path must have at least main and sub category"),
  brand: z.string().default(""),
  location: z.string().default(""),
  country: z.string().default(""),
  images: z.array(productImageSchema).max(5, "Maximum 5 images allowed").default([]),
  thumbnail: productImageSchema.optional(),
  variants: z.array(productVariantSchema).default([]),
  shopId: z.string().optional(),
  shipping: productShippingSchema.default({
    freeShipping: false,
    feeType: "fixed",
    fee: 0,
    zones: [],
    handlingTimeDays: 1,
    codAvailable: false,
    returnable: false,
    warrantyText: "",
  }),
});

export type CreateProductSchemaType = z.infer<typeof createProductSchema>;

// ====================================|| EDIT PRODUCT SCHEMA ||=================================== //

export const editProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters").optional(),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0").optional(),
  discountPercent: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative").optional(),
  status: z.enum(["draft", "active", "out_of_stock", "pending", "blocked"]).optional(),
  brand: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  images: z.array(productImageSchema).min(1, "At least 1 image is required").max(5, "Maximum 5 images allowed").optional(),
  thumbnail: productImageSchema.optional(),
  variants: z.array(productVariantSchema).optional(),
  shipping: productShippingSchema.optional(),
});

export type EditProductSchemaType = z.infer<typeof editProductSchema>;
