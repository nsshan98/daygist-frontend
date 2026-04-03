"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { PrivacyType, useCreatePostStore } from "../stores/create-post-store";
import { Globe, Users, Lock } from "lucide-react";

const privacyOptions = [
  {
    value: "public" as PrivacyType,
    label: "Public",
    description: "Anyone can see",
    icon: Globe,
  },
  {
    value: "friends" as PrivacyType,
    label: "Friends",
    description: "Only friends can see",
    icon: Users,
  },
  {
    value: "private" as PrivacyType,
    label: "Private",
    description: "Only you can see",
    icon: Lock,
  },
];

export function PrivacySelector() {
  const { privacy, setPrivacy } = useCreatePostStore();

  return (
    <Select value={privacy} onValueChange={(value) => setPrivacy(value as PrivacyType)}>
      <SelectTrigger className="w-44 h-8 text-sm border-muted bg-muted/30 hover:bg-muted/50 transition-colors">
        <SelectValue placeholder="Select privacy" />
      </SelectTrigger>
      <SelectContent>
        {privacyOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <option.icon className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm text-left font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
