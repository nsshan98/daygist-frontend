"use client";

import { useState, useCallback, useEffect } from "react";
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
import { useUploadImage } from "@/features/home/hooks/upload-query";
import { SellerImage } from "@/types/seller.types";
import { Upload, Building, User, CreditCard, Image, X } from "lucide-react";

const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra",
  "Brahmanbaria", "Chandpur", "Chittagong", "Chuadanga", "Comilla",
  "Cox's Bazar", "Dhaka", "Dinajpur", "Faridganj", "Feni", "Gaibandha",
  "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokati",
  "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
  "Sylhet", "Tangail", "Thakurgaon"
];

interface ImageFiles {
  logo: File | null;
  banner: File | null;
  nidFront: File | null;
  nidBack: File | null;
}

export function SellerApplicationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { applySellerMutation } = useApplySeller();
  const { uploadImageMutation } = useUploadImage();
  const [globalError, setGlobalError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<ImageFiles>({
    logo: null,
    banner: null,
    nidFront: null,
    nidBack: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<SellerApplicationSchemaType>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      shopName: "",
      phone: "",
      address: "",
      district: "",
      businessType: "individual",
      acceptedTerms: false,
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

  const logoPreview = imageFiles.logo ? URL.createObjectURL(imageFiles.logo) : null;
  const bannerPreview = imageFiles.banner ? URL.createObjectURL(imageFiles.banner) : null;
  const nidFrontPreview = imageFiles.nidFront ? URL.createObjectURL(imageFiles.nidFront) : null;
  const nidBackPreview = imageFiles.nidBack ? URL.createObjectURL(imageFiles.nidBack) : null;

  useEffect(() => {
    return () => {
      if (imageFiles.logo) URL.revokeObjectURL(URL.createObjectURL(imageFiles.logo));
      if (imageFiles.banner) URL.revokeObjectURL(URL.createObjectURL(imageFiles.banner));
      if (imageFiles.nidFront) URL.revokeObjectURL(URL.createObjectURL(imageFiles.nidFront));
      if (imageFiles.nidBack) URL.revokeObjectURL(URL.createObjectURL(imageFiles.nidBack));
    };
  }, [imageFiles]);

  const handleFileSelect = useCallback(
    (key: keyof ImageFiles, acceptType?: string) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = acceptType || "image/*";

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setImageFiles((prev) => ({ ...prev, [key]: file }));
        }
      };

      input.click();
    },
    []
  );

  const handleRemoveFile = useCallback((key: keyof ImageFiles) => {
    setImageFiles((prev) => ({ ...prev, [key]: null }));
  }, []);

  const handleBusinessTypeChange = useCallback(
    (value: "individual" | "business") => {
      form.setValue("businessType", value);

      if (value === "business") {
        form.setValue("nidNumber", "");
        setImageFiles((prev) => ({ ...prev, nidFront: null, nidBack: null }));
      } else {
        form.setValue("tradeLicense", "");
      }
    },
    [form]
  );

  const uploadFile = async (file: File): Promise<SellerImage> => {
    const result = await uploadImageMutation.mutateAsync(file);
    return {
      key: result.key,
      url: result.url,
      provider: result.provider,
    };
  };

  const onSubmit = async (data: SellerApplicationSchemaType) => {
    setGlobalError("");
    setIsUploading(true);

    try {
      const uploadPromises: Promise<{ key: string; image: SellerImage }>[] = [];

      if (imageFiles.logo) {
        uploadPromises.push(
          uploadFile(imageFiles.logo).then((image) => ({ key: "logo", image }))
        );
      }
      if (imageFiles.banner) {
        uploadPromises.push(
          uploadFile(imageFiles.banner).then((image) => ({ key: "banner", image }))
        );
      }
      if (imageFiles.nidFront) {
        uploadPromises.push(
          uploadFile(imageFiles.nidFront).then((image) => ({ key: "nidFront", image }))
        );
      }
      if (imageFiles.nidBack) {
        uploadPromises.push(
          uploadFile(imageFiles.nidBack).then((image) => ({ key: "nidBack", image }))
        );
      }

      const uploadResults = await Promise.all(uploadPromises);

      const uploadedImages: Record<string, SellerImage> = {};
      for (const result of uploadResults) {
        uploadedImages[result.key] = result.image;
      }

      const payload: SellerApplicationSchemaType = {
        ...data,
        logo: uploadedImages["logo"] || data.logo,
        banner: uploadedImages["banner"] || data.banner,
        nidFrontImage: uploadedImages["nidFront"] || data.nidFrontImage,
        nidBackImage: uploadedImages["nidBack"] || data.nidBackImage,
      };

      await applySellerMutation.mutateAsync(payload);

      form.reset();
      setImageFiles({ logo: null, banner: null, nidFront: null, nidBack: null });
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Seller application error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setGlobalError(
        err.response?.data?.message || "Failed to submit seller application"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderImageUpload = ({
    preview,
    fileKey,
    label,
    alt,
  }: {
    preview: string | null;
    fileKey: keyof ImageFiles;
    label: string;
    alt: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemoveFile(fileKey)}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full h-32 border-dashed hover:border-primary hover:bg-primary/5 p-2"
        onClick={() => handleFileSelect(fileKey, "image/*")}
      >
        <div className="w-full h-full flex items-center justify-center">
          {preview ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={alt}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Click to upload
              </span>
            </div>
          )}
        </div>
      </Button>
    </div>
  );

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

            {isUploading && (
              <div className="p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Uploading images and submitting application...
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BANGLADESH_DISTRICTS.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={handleBusinessTypeChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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

                <FormField
                  control={form.control}
                  name="nidFrontImage"
                  render={() => (
                    <FormItem>
                      {renderImageUpload({
                        preview: nidFrontPreview,
                        fileKey: "nidFront",
                        label: "NID Front *",
                        alt: "NID Front",
                      })}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nidBackImage"
                  render={() => (
                    <FormItem>
                      {renderImageUpload({
                        preview: nidBackPreview,
                        fileKey: "nidBack",
                        label: "NID Back *",
                        alt: "NID Back",
                      })}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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

              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    {renderImageUpload({
                      preview: logoPreview,
                      fileKey: "logo",
                      label: "Shop Logo",
                      alt: "Shop Logo",
                    })}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner"
                render={() => (
                  <FormItem>
                    {renderImageUpload({
                      preview: bannerPreview,
                      fileKey: "banner",
                      label: "Shop Banner",
                      alt: "Shop Banner",
                    })}
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
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || applySellerMutation.isPending || isUploading}
              >
                {isSubmitting || applySellerMutation.isPending || isUploading ? (
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
