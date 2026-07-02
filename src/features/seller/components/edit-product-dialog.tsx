"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Switch } from "@/components/atoms/switch";
import { Badge } from "@/components/atoms/badge";
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
import { Upload, X, Loader2 } from "lucide-react";
import { useUpdateSellerProduct } from "../hooks/seller-query";
import { useUploadImage } from "@/features/home/hooks/upload-query";
import { MediaImage } from "@/features/profile/components/media-image";
import { editProductSchema, EditProductSchemaType } from "@/schema/product-schema";
import { Product, ProductImage } from "@/types/product.types";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const [images, setImages] = useState<ProductImage[]>(product.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateProductMutation } = useUpdateSellerProduct();
  const { uploadImageMutation } = useUploadImage();

  const form = useForm<EditProductSchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editProductSchema) as any,
    defaultValues: {
      title: product.title,
      description: product.description || "",
      price: product.price,
      discountPercent: product.discountPercent,
      stock: product.stock,
      status: product.status as EditProductSchemaType["status"],
      brand: product.brand || "",
      location: product.location || "",
      country: product.country || "",
    },
  });

  const price = form.watch("price") || product.price;
  const discountPercent = form.watch("discountPercent") || product.discountPercent;
  const finalPrice = Math.round(price - (price * discountPercent) / 100);

  useEffect(() => {
    if (open) {
      form.reset({
        title: product.title,
        description: product.description || "",
        price: product.price,
        discountPercent: product.discountPercent,
        stock: product.stock,
        status: product.status as EditProductSchemaType["status"],
        brand: product.brand || "",
        location: product.location || "",
        country: product.country || "",
      });
      setImages(product.images || []);
    }
  }, [open, product, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length && images.length + i < 5; i++) {
        const result = await uploadImageMutation.mutateAsync(files[i]);
        if (result.ok) {
          setImages((prev) => [
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
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EditProductSchemaType) => {
    const changes: Record<string, unknown> = {};

    if (data.title !== product.title) changes.title = data.title;
    if (data.description !== (product.description || "")) changes.description = data.description;
    if (data.price !== product.price) changes.price = data.price;
    if (data.discountPercent !== product.discountPercent) changes.discountPercent = data.discountPercent;
    if (data.stock !== product.stock) changes.stock = data.stock;
    if (data.status !== product.status) changes.status = data.status;
    if (data.brand !== (product.brand || "")) changes.brand = data.brand;
    if (data.location !== (product.location || "")) changes.location = data.location;
    if (JSON.stringify(images) !== JSON.stringify(product.images)) {
      changes.images = images;
      changes.thumbnail = images[0] || null;
    }

    if (Object.keys(changes).length === 0) {
      onOpenChange(false);
      return;
    }

    updateProductMutation.mutate(
      { id: product._id, data: changes as EditProductSchemaType },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update your product listing. Only changed fields will be saved.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (&#x09F3;)</FormLabel>
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
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Final Price:</span>
              <span className="font-bold text-primary">&#x09F3;{finalPrice.toLocaleString()}</span>
              {discountPercent > 0 && <Badge variant="secondary">-{discountPercent}%</Badge>}
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Images ({images.length}/5)</FormLabel>
                {images.length < 5 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 mr-1" />
                      )}
                      Add
                    </Button>
                  </>
                )}
              </div>

              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, index) => (
                    <div key={img.key} className="relative w-16 h-16 rounded-md overflow-hidden bg-muted group">
                      <MediaImage
                        mediaKey={img.key}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-0.5 left-0.5 text-[10px] px-1">Thumb</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
