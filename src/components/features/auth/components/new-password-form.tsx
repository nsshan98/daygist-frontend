"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Eye, EyeOff, CheckCircle2, CircleX } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordOtpSchemaType, newPasswordSchema } from "@/zod/auth-schema";
import AuthPageTestimonial from "./authpage-testimonial";
import { useSetNewPassword } from "../hooks/auth-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/atoms/spinner";
import { useEffect } from "react";
import Link from "next/link";

interface PasswordCriteria {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  length: boolean;
}

const NewPasswordForm = () => {
  const router = useRouter();
  const { setNewPasswordMutation } = useSetNewPassword();

  const loginForm = useForm<NewPasswordOtpSchemaType>({
    defaultValues: {
      password: {
        newPassword: "",
        confirmPassword: "",
      },
    },
    resolver: zodResolver(newPasswordSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [criteria, setCriteria] = useState<PasswordCriteria>({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });

  const checkPasswordCriteria = (password: string) => {
    setCriteria({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 8,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    checkPasswordCriteria(value);
  };

  const allCriteriaMacthed = Object.values(criteria).every((v) => v === true);

  // Optional: Check if we have the tokens, if not, maybe redirect?
  // allowing it for now, validation happens on submit

  const onSubmit = async (data: NewPasswordOtpSchemaType) => {
    const user_id = localStorage.getItem('resetPasswordUserId');
    const token_id = localStorage.getItem('resetPasswordTokenId');

    if (!user_id || !token_id) {
      toast.error("Session expired or invalid. Please try the forgot password process again.");
      router.push("/auth/forget-password");
      return;
    }

    const payload = {
      user_id,
      token_id,
      password: data.password.newPassword,
    };

    try {
      await setNewPasswordMutation.mutateAsync(payload);
      toast.success("Password updated successfully! Please login with your new password.");

      // Clean up
      localStorage.removeItem('resetPasswordUserId');
      localStorage.removeItem('resetPasswordTokenId');

      router.push("/auth/login");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error updating password. Please try again."
        );
      }
    }
  };

  return (
    <div className="flex min-h-svh">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-blue-700 text-white flex-col p-8 relative overflow-hidden">
        {/* Decorative dots pattern */}
        <div className="absolute top-0 right-0 opacity-10">
          <div className="grid grid-cols-4 gap-4">
            {Array(16)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
              ))}
          </div>
        </div>

        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 mb-10">
            <p className="font-baumans text-3xl text-center bg-[#2445CE] text-white rounded-2xl p-2 w-12 h-12">
              P
            </p>
            <p className="font-baumans text-3xl uppercase">Protocol </p>
          </div>
        </Link>
        {/* Main Content */}
        <div className="relative z-10 flex-1">
          <h1 className="text-5xl font-bold mb-8 leading-tight">
            Start your remarkable journey with us!
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Our cold email automation helps you send personalized cold emails at
            scale with high email deliverability.
          </p>
        </div>

        {/* Testimonials */}
        <div className="relative z-10 space-y-4">
          <AuthPageTestimonial />
        </div>
      </div>
      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">New Password</h1>
            <p>Enter your new password</p>
          </div>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-6">
                <FormField
                  control={loginForm.control}
                  name="password.newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter New Passwords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handlePasswordChange(e);
                          }}
                          endIcon={
                            showPassword ? (
                              <EyeOff
                                size={15}
                                onClick={() => setShowPassword(!showPassword)}
                              />
                            ) : (
                              <Eye
                                size={15}
                                onClick={() => setShowPassword(!showPassword)}
                              />
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password.confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conform New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            loginForm.trigger("password.confirmPassword");
                          }}
                          endIcon={
                            showConfirmPassword ? (
                              <EyeOff
                                size={15}
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              />
                            ) : (
                              <Eye
                                size={15}
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              />
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Criteria */}
              <div className="space-y-2 mt-4 py-4 rounded-lg">
                <div className="flex items-center gap-2">
                  {criteria.lowercase ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <CircleX size={16} className="text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${criteria.special
                      ? "text-green-500 font-medium"
                      : "text-red-400 font-medium"
                      }`}
                  >
                    One lowercase character
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {criteria.uppercase ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <CircleX size={16} className="text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${criteria.special
                      ? "text-green-500 font-medium"
                      : "text-red-400 font-medium"
                      }`}
                  >
                    One uppercase character
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {criteria.length ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <CircleX size={16} className="text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${criteria.special
                      ? "text-green-500 font-medium"
                      : "text-red-400 font-medium"
                      }`}
                  >
                    8 characters minimum
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {criteria.number ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <CircleX size={16} className="text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${criteria.special
                      ? "text-green-500 font-medium"
                      : "text-red-400 font-medium"
                      }`}
                  >
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {criteria.special ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <CircleX size={16} className="text-red-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${criteria.special
                      ? "text-green-500 font-medium"
                      : "text-red-400 font-medium"
                      }`}
                  >
                    One special character
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!allCriteriaMacthed || loginForm.formState.isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-6"
              >
                {loginForm.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    Updating... <Spinner />
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordForm;
