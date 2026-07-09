import { Skeleton } from "@/components/atoms/skeleton";

interface CommentSkeletonProps {
  size?: "sm" | "md" | "lg";
}

export function CommentSkeleton({ size = "md" }: CommentSkeletonProps) {
  const avatarSize = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const nameWidth = size === "sm" ? "w-16" : "w-24";
  const textHeight = size === "sm" ? "h-3" : size === "lg" ? "h-16" : "h-4";
  const gap = size === "sm" ? "gap-2" : "gap-3";

  return (
    <div className={`flex ${gap} py-2`}>
      <Skeleton className={`${avatarSize} rounded-full`} />
      <div className="flex-1 space-y-1.5">
        <Skeleton className={`h-3 ${nameWidth}`} />
        <Skeleton className={`${textHeight} w-full rounded-2xl`} />
      </div>
    </div>
  );
}
