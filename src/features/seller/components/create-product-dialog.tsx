"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Switch } from "@/components/atoms/switch";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Upload,
  X,
  Plus,
  Loader2,
  Image as ImageIcon,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCreateSellerProduct } from "../hooks/seller-query";
import { useUploadImage } from "@/features/home/hooks/upload-query";
import { MediaImage } from "@/features/profile/components/media-image";
import { createProductSchema, CreateProductSchemaType } from "@/schema/product-schema";
import { ProductImage, ProductVariant } from "@/types/product.types";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "basic" | "images" | "variants" | "shipping" | "review";

const STEPS: { key: Step; label: string; icon: typeof Package }[] = [
  { key: "basic", label: "Basic Info", icon: Package },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "variants", label: "Variants", icon: Package },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "review", label: "Review", icon: Package },
];

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const [step, setStep] = useState<Step>("basic");
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createProductMutation } = useCreateSellerProduct();
  const { uploadImageMutation } = useUploadImage();

  const form = useForm<CreateProductSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountPercent: 0,
      stock: 0,
      status: "draft",
      categoryId: "",
      categoryPath: [],
      brand: "",
      location: "",
      country: "",
      images: [],
      variants: [],
      shipping: {
        freeShipping: false,
        feeType: "fixed",
        fee: 0,
        zones: [],
        handlingTimeDays: 1,
        codAvailable: false,
        returnable: false,
        warrantyText: "",
      },
    },
  });

  const price = form.watch("price") || 0;
  const discountPercent = form.watch("discountPercent") || 0;
  const finalPrice = Math.round(price - (price * discountPercent) / 100);
  const freeShipping = form.watch("shipping.freeShipping");

  useEffect(() => {
    if (!open) {
      form.reset();
      setUploadedImages([]);
      setVariants([]);
      setStep("basic");
    }
  }, [open, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || uploadedImages.length >= 5) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length && uploadedImages.length + i < 5; i++) {
        const result = await uploadImageMutation.mutateAsync(files[i]);
        if (result.ok) {
          setUploadedImages((prev) => [
            ...prev,
            { key: result.key, url: result.url, provider: result.provider || "wasabi", type: "image" },
          ]);
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { name: "", options: [""] }]);
  };

  const updateVariant = (index: number, variant: ProductVariant) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? variant : v)));
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariantOption = (variantIndex: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, options: [...v.options, ""] } : v
      )
    );
  };

  const updateVariantOption = (variantIndex: number, optionIndex: number, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, options: v.options.map((opt, j) => (j === optionIndex ? value : opt)) }
          : v
      )
    );
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, options: v.options.filter((_, j) => j !== optionIndex) }
          : v
      )
    );
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const canGoNext = () => {
    if (step === "basic") {
      const title = form.getValues("title");
      const price = form.getValues("price");
      const categoryId = form.getValues("categoryId");
      return !!title && price > 0 && !!categoryId;
    }
    if (step === "images") return uploadedImages.length >= 1;
    return true;
  };

  const onSubmit = (data: CreateProductSchemaType) => {
    const payload = {
      ...data,
      images: uploadedImages,
      thumbnail: uploadedImages[0] || undefined,
      variants: variants.filter((v) => v.name && v.options.some((o) => o)),
    };
    createProductMutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Create a new product listing for your shop.</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = s.key === step;
            const isCompleted = i < stepIndex;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) setStep(s.key);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step: Basic Info */}
            {step === "basic" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Samsung Galaxy A14 128GB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your product..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (&#x09F3;) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {price > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Final Price:</span>
                    <span className="font-bold text-primary">&#x09F3;{finalPrice.toLocaleString()}</span>
                    {discountPercent > 0 && (
                      <Badge variant="secondary">-{discountPercent}%</Badge>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Path (comma-separated IDs) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. mainCatId,subCatId"
                          value={field.value.join(",")}
                          onChange={(e) => {
                            const path = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            field.onChange(path);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Samsung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dhaka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step: Images */}
            {step === "images" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Upload 1-5 images. First image becomes the thumbnail.
                  </p>
                  <span className="text-sm font-medium">{uploadedImages.length}/5</span>
                </div>

                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={img.key} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                        <MediaImage
                          mediaKey={img.key}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Thumbnail</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {uploadedImages.length < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploading ? "Uploading..." : "Upload Images"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step: Variants */}
            {step === "variants" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add optional variants like Color, Size, Storage, etc.
                </p>

                {variants.map((variant, vi) => (
                  <Card key={vi} className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Variant name (e.g. Color)"
                        value={variant.name}
                        onChange={(e) => updateVariant(vi, { ...variant, name: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(vi)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-1">
                          <Input
                            placeholder="Option"
                            value={opt}
                            onChange={(e) => updateVariantOption(vi, oi, e.target.value)}
                            className="w-28"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantOption(vi, oi)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addVariantOption(vi)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <Button type="button" variant="outline" className="w-full" onClick={addVariant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            )}

            {/* Step: Shipping */}
            {step === "shipping" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="shipping.freeShipping"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Free Shipping</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!freeShipping && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping.feeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="by_zone">By Zone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping.fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Fee (&#x09F3;)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="shipping.handlingTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handling Time (days)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipping.codAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Cash on Delivery</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping.returnable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Returnable</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shipping.warrantyText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1 year official warranty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step: Review */}
            {step === "review" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">{form.getValues("title") || "Untitled"}</h4>
                  <div className="flex items-center gap-2">
                    {discountPercent > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        &#x09F3;{price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-lg font-bold text-primary">
                      &#x09F3;{finalPrice.toLocaleString()}
                    </span>
                    {discountPercent > 0 && (
                      <Badge variant="secondary">-{discountPercent}%</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Stock: {form.getValues("stock")} &middot; Status: {form.getValues("status")}
                  </div>
                  {form.getValues("brand") && (
                    <div className="text-sm">Brand: {form.getValues("brand")}</div>
                  )}
                </div>

                {/* Images preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Images ({uploadedImages.length})</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {uploadedImages.map((img) => (
                        <div key={img.key} className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                          <MediaImage
                            mediaKey={img.key}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants preview */}
                {variants.filter((v) => v.name).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Variants</p>
                    <div className="flex flex-wrap gap-2">
                      {variants
                        .filter((v) => v.name)
                        .map((v, i) => (
                          <Badge key={i} variant="outline">
                            {v.name}: {v.options.filter(Boolean).join(", ")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Shipping preview */}
                <div className="text-sm text-muted-foreground">
                  {freeShipping ? "Free shipping" : `Shipping: &#x09F3;${form.getValues("shipping.fee")}`}
                </div>
              </div>
            )}

            {/* Navigation */}
            <DialogFooter className="flex-row justify-between sm:justify-between">
              <div>
                {stepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(STEPS[stepIndex - 1].key)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {step === "review" ? (
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 mr-2" />
                    )}
                    {form.getValues("status") === "active" ? "Publish" : "Save Draft"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setStep(STEPS[stepIndex + 1].key)}
                    disabled={!canGoNext()}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
