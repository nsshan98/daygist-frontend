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
import { Spinner } from "@/components/atoms/spinner";
import {
  applyMonetizationSchema,
  ApplyMonetizationSchemaType,
} from "@/schema/monetization-schema";
import { useApplyMonetization } from "../hooks/monetization-query";
import { Camera, Upload } from "lucide-react";

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
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);

  const form = useForm<ApplyMonetizationSchemaType>({
    resolver: zodResolver(applyMonetizationSchema),
    defaultValues: {
      country: "",
      city: "",
      area: "",
      postalCode: "",
      nidFront: undefined,
      nidBack: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const handleImageUpload = (
    field: { onChange: (file: File) => void },
    setPreview: (url: string) => void
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        field.onChange(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
      }
    };
    
    input.click();
  };

  const onSubmit = async (data: ApplyMonetizationSchemaType) => {
    setGlobalError("");

    try {
      await applyMonetizationMutation.mutateAsync({
        fullAddress: {
          country: data.country,
          city: data.city,
          area: data.area,
          postalCode: data.postalCode,
        },
        nidFront: data.nidFront,
        nidBack: data.nidBack,
      });
      
      // Clean up previews
      if (frontImagePreview) URL.revokeObjectURL(frontImagePreview);
      if (backImagePreview) URL.revokeObjectURL(backImagePreview);
      
      form.reset();
      setFrontImagePreview(null);
      setBackImagePreview(null);
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
      <DialogContent 
        className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Apply for Monetization</DialogTitle>
          <DialogDescription>
            Fill out the form below and upload your NID (National ID) images to apply for the monetization program.
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

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Address Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Area Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* NID Images Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">NID Images</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Front Image */}
                <FormField
                  control={form.control}
                  name="nidFront"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Front</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() =>
                              handleImageUpload(field, setFrontImagePreview)
                            }
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {frontImagePreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img
                                    src={frontImagePreview}
                                    alt="NID Front"
                                    className="max-w-full max-h-full object-contain rounded"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Upload Front
                                  </span>
                                </div>
                              )}
                            </div>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Back Image */}
                <FormField
                  control={form.control}
                  name="nidBack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Back</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() =>
                              handleImageUpload(field, setBackImagePreview)
                            }
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {backImagePreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img
                                    src={backImagePreview}
                                    alt="NID Back"
                                    className="max-w-full max-h-full object-contain rounded"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Upload Back
                                  </span>
                                </div>
                              )}
                            </div>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
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
