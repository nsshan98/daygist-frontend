"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, CreateGroupSchemaType } from "@/schema/group-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useCreateGroup } from "../hooks/group-query";
import { useUploadImage } from "@/features/home";
import { MediaImage } from "@/features/profile";
import { ImagePlus, X, Loader2, Globe, Lock, Info } from "lucide-react";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  trigger?: React.ReactNode;
}

const CATEGORIES = [
  "Technology",
  "Education",
  "Entertainment",
  "Sports",
  "Health & Fitness",
  "Business",
  "Art & Design",
  "Music",
  "Travel",
  "Food & Cooking",
  "Gaming",
  "Science",
  "Other",
];

export function CreateGroupDialog({ trigger }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [rules, setRules] = useState<string[]>([""]);

  const { createGroupMutation } = useCreateGroup();
  const { uploadImageMutation } = useUploadImage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateGroupSchemaType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      privacy: "public",
      about: "",
      category: "",
      location: {
        country: "",
        city: "",
      },
      rules: [""],
      memberApprovalRequired: false,
      postApprovalRequired: false,
      allowMemberInvites: true,
    },
  });

  const privacy = watch("privacy");

  useEffect(() => {
    if (privacy === "private") {
      setValue("memberApprovalRequired", true);
    }
  }, [privacy, setValue]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const preview = URL.createObjectURL(file);
      setCoverPreview(preview);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    setValue("rules", newRules.filter((r) => r.trim() !== ""));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const onSubmit = async (data: CreateGroupSchemaType) => {
    try {
      let coverUrl;

      // Upload cover image if selected
      if (coverFile) {
        const uploadResult = await uploadImageMutation.mutateAsync(coverFile);
        coverUrl = {
          key: uploadResult.key,
          url: uploadResult.url,
          provider: uploadResult.provider,
        };
      }

      // Filter out empty rules
      const filteredRules = data.rules?.filter((r) => r.trim() !== "") || [];

      // Build location object only if country or city is provided
      const location = 
        (data.location?.country || data.location?.city)
          ? {
              country: data.location.country || undefined,
              city: data.location.city || undefined,
            }
          : undefined;

      const payload = {
        name: data.name,
        privacy: data.privacy,
        about: data.about,
        category: data.category,
        coverUrl,
        location,
        rules: filteredRules,
        memberApprovalRequired: data.memberApprovalRequired,
        postApprovalRequired: data.postApprovalRequired,
        allowMemberInvites: data.allowMemberInvites,
      };

      await createGroupMutation.mutateAsync(payload);
      setOpen(false);
      reset();
      setCoverFile(null);
      setCoverPreview(null);
      setRules([""]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Group</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a community around your interests and connect with like-minded people.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
        })} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-muted/20">
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <ImagePlus className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label>Privacy *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("privacy", "public")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  privacy === "public"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can see and join</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("privacy", "private")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  privacy === "private"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Lock className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Private</p>
                  <p className="text-xs text-muted-foreground">Only invited members</p>
                </div>
              </button>
            </div>
          </div>

          {/* Group Settings */}
          <div className="space-y-4 py-2">
            <Label className="text-base font-semibold">Group Settings</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="member-approval" className="cursor-pointer">Member Approval</Label>
                  {privacy === "private" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Member approval is always required for private groups
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  New members must be approved by an admin
                </p>
              </div>
              <Switch
                id="member-approval"
                checked={watch("memberApprovalRequired")}
                onCheckedChange={(checked) => setValue("memberApprovalRequired", checked)}
                disabled={privacy === "private"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="post-approval" className="cursor-pointer">Post Approval</Label>
                <p className="text-xs text-muted-foreground">
                  All posts must be approved by an admin
                </p>
              </div>
              <Switch
                id="post-approval"
                checked={watch("postApprovalRequired")}
                onCheckedChange={(checked) => setValue("postApprovalRequired", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="member-invites" className="cursor-pointer">Member Invites</Label>
                <p className="text-xs text-muted-foreground">
                  Allow members to invite others to the group
                </p>
              </div>
              <Switch
                id="member-invites"
                checked={watch("allowMemberInvites")}
                onCheckedChange={(checked) => setValue("allowMemberInvites", checked)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              onValueChange={(value) => setValue("category", value)}
              value={watch("category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="about">About *</Label>
            <Textarea
              id="about"
              placeholder="Describe your group..."
              rows={4}
              {...register("about")}
            />
            {errors.about && (
              <p className="text-sm text-destructive">{errors.about.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Country"
                {...register("location.country")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                {...register("location.city")}
              />
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label>Group Rules</Label>
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Rule ${index + 1}`}
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                  />
                  {rules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addRule}
              >
                Add Rule
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
