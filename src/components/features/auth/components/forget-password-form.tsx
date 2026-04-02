"use client";

import type React from "react";

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgetPasswordSchema,
  ForgetPasswordSchemaType,
} from "@/zod/auth-schema";
import AuthPageTestimonial from "./authpage-testimonial";
import { useForgetPassword } from "../hooks/auth-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/atoms/spinner";
import Link from "next/link";

const ForgetPasswordForm = () => {
  const router = useRouter();
  const { forgetPasswordMutation } = useForgetPassword();

  const forgetPasswordForm = useForm<ForgetPasswordSchemaType>({
    defaultValues: {
      email_or_phone: "",
    },
    resolver: zodResolver(forgetPasswordSchema),
  });

  const onSubmit = async (data: ForgetPasswordSchemaType) => {
    try {
      await forgetPasswordMutation.mutateAsync(data);
      toast.success("OTP sent successfully!");
      localStorage.setItem("email", data.email_or_phone);

      // Set initial timer for 1 minute (60 seconds) for the first time
      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem('forgetPassResendOtpEndTime', endTime.toString());

      router.push("/auth/forget-password/verify-otp");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error sending OTP. Please try again."
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
            <p className="font-baumans text-3xl uppercase">Daygist </p>
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
            <h1 className="text-3xl font-bold mb-2">Email Verification</h1>
            <p>Enter your email to reset your password</p>
          </div>

          <Form {...forgetPasswordForm}>
            <form
              onSubmit={forgetPasswordForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-6">
                <FormField
                  control={forgetPasswordForm.control}
                  name="email_or_phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Email.."
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={forgetPasswordForm.formState.isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-6"
              >
                {forgetPasswordForm.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    Sending... <Spinner />
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordForm;
