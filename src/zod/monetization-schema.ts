import { z } from "zod";

export const applyMonetizationSchema = z.object({
  reason: z.string().min(50, "Reason must be at least 50 characters").max(500, "Reason must be at most 500 characters"),
  paymentMethod: z.enum(["bank", "paypal", "stripe"]),
  paymentDetails: z.string().min(1, "Payment details are required").max(200, "Payment details must be at most 200 characters"),
});

export type ApplyMonetizationSchemaType = z.infer<typeof applyMonetizationSchema>;
