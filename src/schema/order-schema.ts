import { z } from "zod";

// ===============================|| ORDER SCHEMA ||============================== //

export const placeOrderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["Cash one delivery", "BKASH"]),
});

export type PlaceOrderSchemaType = z.infer<typeof placeOrderSchema>;
