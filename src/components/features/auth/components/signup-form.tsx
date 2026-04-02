"use client";

import type React from "react";

import "react-phone-number-input/style.css";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Checkbox } from "@/components/atoms/checkbox";
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
import { signupSchema, SignupSchemaType } from "@/zod/auth-schema";
import Link from "next/link";
import AuthPageTestimonial from "./authpage-testimonial";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import { formatPhoneNumber } from 'react-phone-number-input'
import { useSignupUser } from "../hooks/auth-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/atoms/spinner";

interface PasswordCriteria {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  length: boolean;
}

const SignupForm = () => {
  const router = useRouter()
  const signupForm = useForm<SignupSchemaType>({
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      organization_name: "",
      password: {
        newPassword: "",
        confirmPassword: "",
      },
    },
    resolver: zodResolver(signupSchema),
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
  const [giveConsent, setGiveConsent] = useState(false);

  const checkPasswordCriteria = (password: string) => {
    setCriteria({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 8,
    });
  };

  const { isSubmitting } = signupForm.formState;
  const { signupUserMutation } = useSignupUser()

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // setFormData((prev) => ({ ...prev, password: value }));
    checkPasswordCriteria(value);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   // setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const allCriteriaMacthed = Object.values(criteria).every((v) => v === true);

  const onSubmit = async (data: SignupSchemaType) => {
    const payload = {
      full_name: data.full_name,
      phone_number: formatPhoneNumber(data.phone_number),
      email: data.email,
      organization_name: data.organization_name,
      password: data.password.newPassword,
    }
    await signupUserMutation.mutateAsync(payload, {
      onSuccess: (response) => {
        toast.success(response?.data?.message);
        localStorage.setItem('email', response?.data?.email)
        router.push("/auth/verify-user");
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
            "Error creating user. Please try again."
          );
        }
      },
    });
    console.log("Form submitted with data:", payload);
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
            <h1 className="text-3xl font-bold mb-2">Sign up with free trial</h1>
            <p>Empower your experience, sign up for a free account today</p>
          </div>

          <Form {...signupForm}>
            <form
              onSubmit={signupForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormField
                    control={signupForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your Full name.."
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={signupForm.control}
                    name="organization_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your Organization name.."
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={signupForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInputWithCountrySelect
                          placeholder="Enter phone number"
                          type="text"
                          defaultCountry="BD"
                          countries={["BD"]}
                          international={false}
                          limitMaxLength={true}
                          addInternationalOption={false}
                          countryCallingCodeEditable={false}
                          style={{
                            // border: "1px solid #E5E5E5",
                            paddingLeft: "10px",
                            paddingBlock: "6px",
                            width: "100%",
                            borderRadius: "8px",
                          }}
                          className="text-sm border focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] focus-within:outline-ring"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
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
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <FormField
                      control={signupForm.control}
                      name="password.newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
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
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  />
                                ) : (
                                  <Eye
                                    size={15}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
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
                </div>
                <div>
                  <FormField
                    control={signupForm.control}
                    name="password.confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="********"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              signupForm.trigger("password.confirmPassword");
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

              {/* Terms */}
              <div className="flex gap-2">
                <Checkbox
                  checked={giveConsent}
                  id="terms"
                  onCheckedChange={(value) => {
                    setGiveConsent(value as boolean);
                  }}
                />

                <p className="text-xs">
                  By registering for an account, you are consenting to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and confirming that you have reviewed and accepted the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Global Privacy Statement
                  </a>
                  .
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!allCriteriaMacthed || !giveConsent || isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-6"
              >
                {isSubmitting ? (
                  <>
                    Creating Account...
                    <Spinner />
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <Button href="/auth/login" variant={'link'} disabled={isSubmitting} className="p-0 dark:text-white">
                  Login
                </Button>
              </p>



            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
