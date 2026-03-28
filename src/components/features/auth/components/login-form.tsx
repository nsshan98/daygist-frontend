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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/zod/auth-schema";
import Link from "next/link";
import AuthPageTestimonial from "./authpage-testimonial";

import { signIn } from "@/lib/auth";
import { Spinner } from "@/components/atoms/spinner";

const LoginForm = () => {
  const loginForm = useForm<LoginSchemaType>({
    defaultValues: {
      phone_or_email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const { isSubmitting } = loginForm.formState;

  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string>("");

  const onSubmit = async (data: LoginSchemaType) => {
    setGlobalError("");
    const formData = new FormData();
    formData.append("phone_or_email", data.phone_or_email);
    formData.append("password", data.password);

    const result = await signIn(undefined, formData);

    console.log(result);

    if (result?.error) {
      if (result.error.phone_or_email) {
        loginForm.setError("phone_or_email", { message: result.error.phone_or_email[0] });
      }
      if (result.error.password) {
        loginForm.setError("password", { message: result.error.password[0] });
      }
    }
    if (result?.message) {
      setGlobalError(result.message);
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
            <h1 className="text-3xl font-bold mb-2">Sign in with 14 days free trial</h1>
            <p>Empower your experience, sign up for a free account today</p>
          </div>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-6">
                {globalError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {globalError}
                  </div>
                )}
                <FormField
                  control={loginForm.control}
                  name="phone_or_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Email.."
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
                          type={showPassword ? "text" : "password"}
                          {...field}
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
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={isSubmitting}
                  type="button"
                  variant={"link"}
                  href="/auth/forget-password"
                  className="underline dark:text-white"
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-6"
              >
                {isSubmitting ? (
                  <>
                    Logging in...
                    <Spinner />
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don’t have account?{" "}
                <Button href="/auth/sign-up" variant={'link'} disabled={isSubmitting} className="p-0 dark:text-white">
                  Sign up
                </Button>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
