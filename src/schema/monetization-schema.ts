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

// ===============================|| TRANSACTION SCHEMAS ||============================== //

const amountField = z.number({ message: "Amount is required" }).positive("Amount must be greater than 0");

export const ownTransferSchema = z.object({
  amount: amountField,
});

export type OwnTransferSchemaType = z.infer<typeof ownTransferSchema>;

export const otherTransferSchema = z.object({
  amount: amountField,
  targetUserId: z.string().min(1, "Target user is required"),
  reference: z.string().optional(),
});

export type OtherTransferSchemaType = z.infer<typeof otherTransferSchema>;

export const withdrawSchema = z.object({
  amount: amountField,
  method: z.enum(["bkash", "nagad", "bank"], { message: "Please select a payment method" }),
  accountNumber: z.string().min(1, "Account number is required"),
});

export type WithdrawSchemaType = z.infer<typeof withdrawSchema>;
