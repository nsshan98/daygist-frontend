import { ReelsFeed } from "@/components/features/reels";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ReelsPage() {
  return (
    <div className="h-[calc(100vh-64px)] bg-background overflow-hidden">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      }>
        <ReelsFeed />
      </Suspense>
    </div>
  );
}
