"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgetPasswordOtpSchema,
  ForgetPasswordOtpSchemaType,
} from "@/zod/auth-schema";
import AuthPageTestimonial from "./authpage-testimonial";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/atoms/input-otp";
import { useForgetPasswordOtp, useResendOtp } from "../hooks/auth-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/atoms/spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ForgetPasswordOtpForm = () => {
  const router = useRouter();
  const { forgetPasswordOtpMutation } = useForgetPasswordOtp();
  const { resendOtpMutation } = useResendOtp();

  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setUserEmail(email);
    } else {
      // If no email found, redirect back to forget password 
      // Or handle it gracefully. For now, assuming email exists.
    }

    // Check for existing timer
    const savedEndTime = localStorage.getItem('forgetPassResendOtpEndTime');
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000);

      if (remaining > 0) {
        setTimer(remaining);
        setIsTimerActive(true);
      } else {
        localStorage.removeItem('forgetPassResendOtpEndTime');
        setIsTimerActive(false);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            localStorage.removeItem('forgetPassResendOtpEndTime');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (!userEmail) return;

    try {
      await resendOtpMutation.mutateAsync({ email_or_phone: userEmail });
      toast.success("OTP Resent successfully");

      const duration = 180; // 3 minutes
      const endTime = Date.now() + duration * 1000;
      localStorage.setItem('forgetPassResendOtpEndTime', endTime.toString());
      setTimer(duration);
      setIsTimerActive(true);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to resend OTP");
      }
    }
  };

  const forgetPasswordOtpForm = useForm<ForgetPasswordOtpSchemaType>({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(forgetPasswordOtpSchema),
  });

  const onSubmit = async (data: ForgetPasswordOtpSchemaType) => {
    if (!userEmail) {
      toast.error("Email not found. Please try again.");
      return;
    }
    const payload = {
      email_or_phone: userEmail,
      otp: data.otp,
    };
    try {
      const response = await forgetPasswordOtpMutation.mutateAsync(payload);

      // Save user_id and token_id for the next step
      if (response?.data) {
        localStorage.setItem('resetPasswordUserId', response.data.user_id);
        localStorage.setItem('resetPasswordTokenId', response.data.token_id);
      }

      toast.success("OTP verified successfully");
      localStorage.removeItem("email");
      router.push("/auth/new-password");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error verifying OTP. Please try again."
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
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2">
              <ArrowLeft onClick={() => router.push('/auth/forget-password')} className="cursor-pointer" />
              <h1 className="text-3xl font-bold mb-2">Verify Your OTP</h1>
            </div>
            <p>Enter the OTP sent to your email</p>
          </div>

          <Form {...forgetPasswordOtpForm}>
            <form
              onSubmit={forgetPasswordOtpForm.handleSubmit(onSubmit)}
              className="space-y-4 max-w-fit mx-auto"
            >
              <div className="flex flex-col items-end">
                <FormField
                  control={forgetPasswordOtpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Enter OTP *</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={4}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className="mt-4 mb-0" />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant={'link'}
                  className="mt-8 p-0 h-auto cursor-pointer dark:text-white"
                  onClick={handleResendOtp}
                  disabled={isTimerActive}
                >
                  {isTimerActive ? `Resend OTP in ${formatTime(timer)}` : "Resend OTP"}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={forgetPasswordOtpForm.formState.isSubmitting}
                className=" h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
              >
                {forgetPasswordOtpForm.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Verifying... <Spinner />
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

export default ForgetPasswordOtpForm;
