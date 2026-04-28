"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Spinner } from "@/components/atoms/spinner";
import {
  applyMonetizationSchema,
  ApplyMonetizationSchemaType,
} from "@/zod/monetization-schema";
import { useApplyMonetization } from "../hooks/monetization-query";

interface ApplyMonetizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyMonetizationDialog({
  open,
  onOpenChange,
}: ApplyMonetizationDialogProps) {
  const { applyMonetizationMutation } = useApplyMonetization();
  const [globalError, setGlobalError] = useState<string>("");

  const form = useForm<ApplyMonetizationSchemaType>({
    resolver: zodResolver(applyMonetizationSchema),
    defaultValues: {
      reason: "",
      paymentMethod: undefined,
      paymentDetails: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ApplyMonetizationSchemaType) => {
    setGlobalError("");

    try {
      await applyMonetizationMutation.mutateAsync(data);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Apply monetization error:", error);
      setGlobalError(
        error.response?.data?.message || "Failed to submit application"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Apply for Monetization</DialogTitle>
          <DialogDescription>
            Fill out the form below to apply for the monetization program. We'll
            review your application and get back to you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {globalError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {globalError}
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join the monetization program?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your content and why you'd be a great fit for monetization..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Details</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        form.watch("paymentMethod") === "bank"
                          ? "Enter your bank account number"
                          : form.watch("paymentMethod") === "paypal"
                          ? "Enter your PayPal email"
                          : form.watch("paymentMethod") === "stripe"
                          ? "Enter your Stripe account ID"
                          : "Enter payment details"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || applyMonetizationMutation.isPending}
              >
                {isSubmitting || applyMonetizationMutation.isPending ? (
                  <>
                    Submitting...
                    <Spinner />
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
