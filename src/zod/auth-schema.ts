import { z } from "zod";


export type FormState =
  | {
    error?: {
      name?: string[];
      phone_or_email?: string[];
      password?: string[];
    };
    message?: string;
  }
  | undefined;

export const loginSchema = z.object({
  phone_or_email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  full_name: z.string().min(1, "Full Name is required"),
  email: z.email(),
  phone_number: z.string().min(1, "Phone Number is required"),
  organization_name: z.string().min(1, "Organization Name is required"),
  password: z
    .object({
      newPassword: z.string().min(8, "Password Must Be 8 Characters Long"),
      confirmPassword: z.string().min(8, "Password Must Be 8 Characters Long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Password Not Matched",
      path: ["confirmPassword"],
    }),
});

export const verifyUserOtpSchema = z.object({
  otp: z.string().min(4, "OTP is required"),
});

export const forgetPasswordSchema = z.object({
  email_or_phone: z.email(),
});

export const forgetPasswordOtpSchema = z.object({
  otp: z.string().min(4, "OTP is required"),
});

export const newPasswordSchema = z.object({
  password: z
    .object({
      newPassword: z.string().min(8, "Password Must Be 8 Characters Long"),
      confirmPassword: z.string().min(8, "Password Must Be 8 Characters Long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Password Not Matched",
      path: ["confirmPassword"],
    }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type SignupSchemaType = z.infer<typeof signupSchema>;
export type VerifyUserOtpSchemaType = z.infer<typeof verifyUserOtpSchema>;
export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
export type ForgetPasswordOtpSchemaType = z.infer<
  typeof forgetPasswordOtpSchema
>;
export type NewPasswordOtpSchemaType = z.infer<typeof newPasswordSchema>;
