"use client";

import { useCreatePostStore } from "../stores/create-post-store";
import { Textarea } from "@/components/atoms/textarea";

export function TextPostForm() {
  const {
    textContent,
    setTextContent,
  } = useCreatePostStore();

  return (
    <div className="space-y-4">
      {/* Text Input Area */}
      <div className="relative min-h-[150px] rounded-xl overflow-hidden">
        <Textarea
          placeholder="What's on your mind?"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[150px] border-0 resize-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70 text-base text-left"
        />
      </div>
    </div>
  );
}
