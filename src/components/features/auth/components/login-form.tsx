"use client";

import type React from "react";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/zod/auth-schema";
import Link from "next/link";
import Image from "next/image";

import { signIn, googleSignIn } from "@/lib/auth";
import { Spinner } from "@/components/atoms/spinner";

const LoginForm = () => {
  const router = useRouter();
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);

  const handleGoogleCredential = useCallback(async (response: { credential?: string }) => {
    console.log("Google credential response:", response);
    
    if (!response.credential) {
      setGlobalError("Google sign-in failed. No credentials received. Please try again.");
      setIsGoogleLoading(false);
      return;
    }

    setGlobalError("");

    try {
      const result = await googleSignIn(response.credential);
      if (result?.error) {
        setGlobalError(result.error);
        setIsGoogleLoading(false);
      }
      // Success - will redirect via googleSignIn function
      // The redirect will throw NEXT_REDIRECT which is handled below
    } catch (error: any) {
      // Check if this is a Next.js redirect error (expected behavior)
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a successful sign-in - Next.js is redirecting
        // Don't log as error, don't show message, just let the redirect happen
        console.log("✓ Google sign-in successful - redirecting to home...");
        return;
      }
      
      // This is a real error
      console.error("Google sign-in error:", error);
      setGlobalError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google Client ID not found in environment variables");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google GSI script loaded successfully");
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        console.log("Google accounts initialized with client ID:", clientId.substring(0, 20) + "...");
        
        // Render the Google Sign-In button programmatically
        const googleButtonContainer = document.getElementById('google-button-container');
        if (googleButtonContainer) {
          window.google.accounts.id.renderButton(
            googleButtonContainer,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
            }
          );
          // Google script loaded successfully, hide fallback
          setShowGoogleFallback(false);
        }
      } else {
        console.error("Google accounts object not available after script load");
        // Google object not available, show fallback
        setShowGoogleFallback(true);
      }
    };
    script.onerror = () => {
      console.error("Failed to load Google GSI script");
      // Script failed to load, show fallback
      setShowGoogleFallback(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleCredential]);

  const handleGoogleSignIn = () => {
    // This function is now kept for compatibility but the actual button
    // is rendered by Google's library in the useEffect above
    console.log("Google sign-in initiated");
  };

  const onSubmit = async (data: LoginSchemaType) => {
    setGlobalError("");
    const formData = new FormData();
    formData.append("phone_or_email", data.phone_or_email);
    formData.append("password", data.password);

    try {
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
    } catch (error: any) {
      // Check if this is a Next.js redirect error (expected behavior)
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a successful login - Next.js is redirecting
        console.log("✓ Login successful - redirecting to home...");
        return;
      }
      
      // Real error
      console.error("Login error:", error);
      setGlobalError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-muted flex-col items-center justify-center py-14 px-10 overflow-hidden">
        {/* Subtle radial glow behind illustration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Illustration + caption */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/login-illustration.png"
              alt="Social media illustration"
              width={500}
              height={500}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <div className="space-y-3 max-w-md">
            <h2 className="text-4xl font-bold text-foreground">
              Share your daily gists
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect with friends, share moments, and discover what's happening in your circle — every single day.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm space-y-4">

          {/* App brand */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <span className="font-baumans text-sm text-foreground tracking-tight">
                DayGist
              </span>
            </Link>
          </div>

          {/* Heading */}
          <p className="text-muted-foreground text-4xl text-center">
            Welcome to DayGist
          </p>

          <p className="text-muted-foreground text-xl text-center">
            Sign In to your Account
          </p>

          {/* Form */}
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {globalError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {globalError}
                </div>
              )}

              {/* Email / Phone */}
              {/* <FormField
                control={loginForm.control}
                name="phone_or_email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs text-muted-foreground font-normal">
                      Username or Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. david@example.com"
                        type="text"
                        className="border-0 border-b border-border rounded-none px-0 h-9 shadow-none focus-visible:ring-0 focus-visible:border-primary bg-transparent text-foreground placeholder:text-muted-foreground/50 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* Password */}
              {/* <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs text-muted-foreground font-normal">
                        Password
                      </FormLabel>
                      <Button
                        disabled={isSubmitting}
                        type="button"
                        variant="link"
                        href="/auth/forget-password"
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-normal"
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="border-0 border-b border-border rounded-none px-0 h-9 shadow-none focus-visible:ring-0 focus-visible:border-primary bg-transparent text-foreground placeholder:text-muted-foreground/50 transition-colors"
                        {...field}
                        endIcon={
                          showPassword ? (
                            <EyeOff
                              size={16}
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            />
                          ) : (
                            <Eye
                              size={16}
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            />
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* Sign in */}
              {/* <Button
                type="submit"
                disabled={isSubmitting}
                className="w-auto mx-auto flex px-10 h-11 bg-foreground hover:bg-foreground/85 text-background font-medium rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    Signing in...
                    <Spinner />
                  </>
                ) : (
                  "Sign in"
                )}
              </Button> */}

              {/* Divider */}
              {/* <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="flex-1 h-px bg-border" />
              </div> */}

              {/* Google sign-in */}
              <div id="google-button-container" className="w-full flex items-center justify-center">
                {/* Google button will be rendered here by the library */}
              </div>
              
              {/* Fallback button if Google script fails to load */}
              {showGoogleFallback && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <Spinner />
                  ) : (
                    /* Google "G" icon using SVG */
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
                      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
                      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
                      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
                    </svg>
                  )}
                  {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
                </button>
              )}

              {/* Register link */}
              {/* <p className="text-center text-sm text-muted-foreground">
                New to DayGist?{" "}
                <Button
                  href="/auth/sign-up"
                  variant="link"
                  disabled={isSubmitting}
                  className="p-0 h-auto text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Create Account
                </Button>
              </p> */}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
