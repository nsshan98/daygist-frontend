"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileSchemaType } from "@/zod/profile-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useUpdateProfile } from "../hooks/profile-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Spinner } from "@/components/atoms/spinner";
import { Plus, Trash2 } from "lucide-react";

interface EducationFieldProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}

function EducationFields({ register, errors, setValue, watch }: EducationFieldProps) {
  const education = watch("education") || [];

  const addEducation = () => {
    setValue("education", [...education, { school: "", degree: "", field: "", startYear: "", endYear: "" }]);
  };

  const removeEducation = (index: number) => {
    const newEducation = education.filter((_: any, i: number) => i !== index);
    setValue("education", newEducation);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = education.map((edu: any, i: number) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    setValue("education", newEducation);
  };

  return (
    <div className="space-y-4">
      {education.map((edu: any, index: number) => (
        <div key={index} className="p-4 border rounded-lg space-y-3 relative bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeEducation(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
            <div className="space-y-2">
              <Label htmlFor={`school-${index}`}>School/University</Label>
              <Input 
                id={`school-${index}`} 
                {...register(`education.${index}.school`)}
                placeholder="e.g., Harvard University"
              />
              {errors.education?.[index]?.school && (
                <p className="text-sm text-destructive">{errors.education[index].school.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`degree-${index}`}>Degree</Label>
              <Input 
                id={`degree-${index}`} 
                {...register(`education.${index}.degree`)}
                placeholder="e.g., Bachelor of Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`field-${index}`}>Field of Study</Label>
              <Input 
                id={`field-${index}`} 
                {...register(`education.${index}.field`)}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor={`startYear-${index}`}>Start Year</Label>
                <Input 
                  id={`startYear-${index}`} 
                  {...register(`education.${index}.startYear`)}
                  placeholder="2019"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`endYear-${index}`}>End Year</Label>
                <Input 
                  id={`endYear-${index}`} 
                  {...register(`education.${index}.endYear`)}
                  placeholder="2023"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={addEducation}
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </Button>
    </div>
  );
}

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  bio?: string | null;
  about?: string | null;
  birthDate?: string | null;
  relationship?: string | null;
  address?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    fullAddress?: string | null;
    zip?: string | null;
  };
  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  education?: Array<{
    school: string;
    degree?: string | null;
    field?: string | null;
    startYear?: string | null;
    endYear?: string | null;
  }>;
}

interface EditProfileDialogProps {
  profile: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ profile, open, onOpenChange }: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProfileMutation } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      about: profile.about || "",
      birthDate: profile.birthDate || "",
      relationship: (profile.relationship as any) || "",
      address: {
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        country: profile.address?.country || "",
        fullAddress: profile.address?.fullAddress || "",
        zip: profile.address?.zip || "",
      },
      contact: {
        phone: profile.contact?.phone || "",
        email: profile.contact?.email || "",
        website: profile.contact?.website || "",
        facebook: profile.contact?.facebook || "",
        instagram: profile.contact?.instagram || "",
        linkedin: profile.contact?.linkedin || "",
      },
      education: profile.education || [],
    },
  });

  const onSubmit = (data: UpdateProfileSchemaType) => {
    setIsSubmitting(true);
    
    // Filter out unchanged values
    const updatedData: any = {};
    
    if (data.name && data.name !== (profile.name || "")) updatedData.name = data.name;
    if (data.username && data.username !== (profile.username || "")) updatedData.username = data.username;
    if (data.bio !== (profile.bio || "")) updatedData.bio = data.bio === "" ? null : data.bio;
    if (data.about !== (profile.about || "")) updatedData.about = data.about === "" ? null : data.about;
    if (data.birthDate !== (profile.birthDate || "")) updatedData.birthDate = data.birthDate === "" ? null : data.birthDate;
    if ((data.relationship || "") !== (profile.relationship || "")) updatedData.relationship = !data.relationship ? null : data.relationship;
    
    if (data.address) {
      const addressChanges: any = {};
      if (data.address.city !== (profile.address?.city || "")) addressChanges.city = data.address.city === "" ? null : data.address.city;
      if (data.address.state !== (profile.address?.state || "")) addressChanges.state = data.address.state === "" ? null : data.address.state;
      if (data.address.country !== (profile.address?.country || "")) addressChanges.country = data.address.country === "" ? null : data.address.country;
      if (data.address.fullAddress !== (profile.address?.fullAddress || "")) addressChanges.fullAddress = data.address.fullAddress === "" ? null : data.address.fullAddress;
      if (data.address.zip !== (profile.address?.zip || "")) addressChanges.zip = data.address.zip === "" ? null : data.address.zip;
      
      if (Object.keys(addressChanges).length > 0) {
        updatedData.address = addressChanges;
      }
    }
    
    if (data.contact) {
      const contactChanges: any = {};
      if (data.contact.phone !== (profile.contact?.phone || "")) contactChanges.phone = data.contact.phone === "" ? null : data.contact.phone;
      if (data.contact.email !== (profile.contact?.email || "")) contactChanges.email = data.contact.email === "" ? null : data.contact.email;
      if (data.contact.website !== (profile.contact?.website || "")) contactChanges.website = data.contact.website === "" ? null : data.contact.website;
      if (data.contact.facebook !== (profile.contact?.facebook || "")) contactChanges.facebook = data.contact.facebook === "" ? null : data.contact.facebook;
      if (data.contact.instagram !== (profile.contact?.instagram || "")) contactChanges.instagram = data.contact.instagram === "" ? null : data.contact.instagram;
      if (data.contact.linkedin !== (profile.contact?.linkedin || "")) contactChanges.linkedin = data.contact.linkedin === "" ? null : data.contact.linkedin;
      
      if (Object.keys(contactChanges).length > 0) {
        updatedData.contact = contactChanges;
      }
    }

    // Handle education changes
    if (data.education) {
      updatedData.education = data.education;
    }

    // Only submit if there are changes
    if (Object.keys(updatedData).length === 0) {
      toast.info("No changes made");
      setIsSubmitting(false);
      return;
    }

    updateProfileMutation.mutate(updatedData, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        onOpenChange(false);
      },
      onError: (error) => {
        const message = isAxiosError(error) 
          ? error.response?.data?.message || "Failed to update profile"
          : "Failed to update profile";
        toast.error(message);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and personal details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Basic Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" disabled {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                {...register("bio")} 
                rows={3}
                placeholder="Tell us a little about yourself..."
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea 
                id="about" 
                {...register("about")} 
                rows={4}
                placeholder="Write more about yourself..."
              />
              {errors.about && (
                <p className="text-sm text-destructive">{errors.about.message}</p>
              )}
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Personal Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && (
                  <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship Status</Label>
                <Select 
                  value={watch("relationship") || "NOT_SPECIFIED"} 
                  onValueChange={(value) => setValue("relationship", value === "NOT_SPECIFIED" ? null : (value as any))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_SPECIFIED">Not specified</SelectItem>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="IN_RELATIONSHIP">In a relationship</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-sm text-destructive">{errors.relationship.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Location</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("address.city")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("address.state")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("address.country")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">Full Address</Label>
                <Input id="fullAddress" {...register("address.fullAddress")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" {...register("address.zip")} />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register("contact.phone")} />
                {errors.contact?.phone && (
                  <p className="text-sm text-destructive">{errors.contact.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("contact.email")} />
                {errors.contact?.email && (
                  <p className="text-sm text-destructive">{errors.contact.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" {...register("contact.website")} />
                {errors.contact?.website && (
                  <p className="text-sm text-destructive">{errors.contact.website.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input id="facebook" type="url" {...register("contact.facebook")} />
                {errors.contact?.facebook && (
                  <p className="text-sm text-destructive">{errors.contact.facebook.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" type="url" {...register("contact.instagram")} />
                {errors.contact?.instagram && (
                  <p className="text-sm text-destructive">{errors.contact.instagram.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input id="linkedin" type="url" {...register("contact.linkedin")} />
                {errors.contact?.linkedin && (
                  <p className="text-sm text-destructive">{errors.contact.linkedin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Education</h4>
            
            <EducationFields 
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
