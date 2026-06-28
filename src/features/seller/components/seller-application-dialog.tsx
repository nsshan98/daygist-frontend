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
import { Spinner } from "@/components/atoms/spinner";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  sellerApplicationSchema,
  SellerApplicationSchemaType,
} from "@/schema/seller-schema";
import { useApplySeller } from "../hooks/seller-query";
import { Camera, Upload, Building, User, MapPin, CreditCard, Image, FileText, CheckCircle } from "lucide-react";

export function SellerApplicationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { applySellerMutation } = useApplySeller();
  const [globalError, setGlobalError] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

  const form = useForm<SellerApplicationSchemaType & Partial<Pick<SellerApplicationSchemaType, 'nidNumber' | 'nidFrontImage' | 'nidBackImage' | 'tradeLicense' | 'logo' | 'banner'>>>( {
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      shopName: "",
      phone: "",
      address: "",
      district: "",
      businessType: "individual",
      acceptedTerms: true,
      nidNumber: "",
      nidFrontImage: undefined,
      nidBackImage: undefined,
      tradeLicense: "",
      logo: undefined,
      banner: undefined,
    },
  });

  const { isSubmitting } = form.formState;
  const businessType = form.watch("businessType");

  const handleImageUpload = (
    field: { onChange: (value: any) => void },
    setPreview: (url: string | null) => void,
    acceptType?: string
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptType || "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create mock object for image upload
        const mockObject = {
          key: `uploads/${Date.now()}-${file.name}`, // Mock key
          url: URL.createObjectURL(file), // Mock URL
          provider: "wasabi",
        };

        field.onChange(mockObject);
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
    };

    input.click();
  };

  const onSubmit = async (data: SellerApplicationSchemaType) => {
    setGlobalError("");

    try {
      await applySellerMutation.mutateAsync(data);

      // Clean up previews
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (nidFrontPreview) URL.revokeObjectURL(nidFrontPreview);
      if (nidBackPreview) URL.revokeObjectURL(nidBackPreview);

      form.reset();
      setLogoPreview(null);
      setBannerPreview(null);
      setNidFrontPreview(null);
      setNidBackPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Seller application error:", error);
      setGlobalError(
        error.response?.data?.message || "Failed to submit seller application"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Apply for Seller Account
          </DialogTitle>
          <DialogDescription>
            Fill out the form below and upload your business documents to apply for seller privileges on Daygist marketplace.
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

            {/* Basic Shop Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                Shop Information
              </h3>

              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your shop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="01712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Complete address" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dhaka" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Individual
                            </div>
                          </SelectItem>
                          <SelectItem value="business">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Business
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Business Type Specific Fields */}
            {businessType === "individual" && (
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Individual Seller KYC
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload your National ID (NID) for verification.
                </p>

                <FormField
                  control={form.control}
                  name="nidNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Front NID Image */}
                <FormField
                  control={form.control}
                  name="nidFrontImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Front *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() =>
                              handleImageUpload(
                                field,
                                setNidFrontPreview,
                                "image/*"
                              )
                            }
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {nidFrontPreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img
                                    src={nidFrontPreview}
                                    alt="NID Front"
                                    className="max-w-full max-h-full object-contain rounded"
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Upload Front (Back ID)
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

                {/* Back NID Image */}
                <FormField
                  control={form.control}
                  name="nidBackImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Back *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                            onClick={() =>
                              handleImageUpload(
                                field,
                                setNidBackPreview,
                                "image/*"
                              )
                            }
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              {nidBackPreview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img
                                    src={nidBackPreview}
                                    alt="NID Back"
                                    className="max-w-full max-h-full object-contain rounded"
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                    <CheckCircle className="h-4 w-4" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Upload Back (Front ID)
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
            )}

            {/* Business Type Specific Fields */}
            {businessType === "business" && (
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Business Seller KYC
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload your Trade License for business verification.
                </p>

                <FormField
                  control={form.control}
                  name="tradeLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade License *</FormLabel>
                      <FormControl>
                        <Input placeholder="TRADE-2024-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Visual Assets */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Image className="h-4 w-4" />
                Shop Visuals (Optional)
              </h3>

              {/* Logo */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                          onClick={() =>
                            handleImageUpload(field, setLogoPreview, "image/*")
                          }
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {logoPreview ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                  src={logoPreview}
                                  alt="Shop Logo"
                                  className="max-w-full max-h-full object-contain rounded"
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Logo
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

              {/* Banner */}
              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Banner</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
                          onClick={() =>
                            handleImageUpload(field, setBannerPreview, "image/*")
                          }
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {bannerPreview ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                  src={bannerPreview}
                                  alt="Shop Banner"
                                  className="max-w-full max-h-full object-contain rounded"
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Banner
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your shop and what you sell..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="acceptedTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to all the seller terms and conditions, including the verification process and marketplace rules.
                    </FormLabel>
                    <FormMessage />
                  </div>
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
                disabled={isSubmitting || applySellerMutation.isPending}
              >
                {isSubmitting || applySellerMutation.isPending ? (
                  <>
                    Submitting Application...
                    <Spinner />
                  </>
                ) : (
                  "Apply for Seller Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}