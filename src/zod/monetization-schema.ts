import { z } from "zod";

export const applyMonetizationSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  nidFront: z.instanceof(File, { message: "NID front image is required" }),
  nidBack: z.instanceof(File, { message: "NID back image is required" }),
});

export type ApplyMonetizationSchemaType = z.infer<typeof applyMonetizationSchema>;
