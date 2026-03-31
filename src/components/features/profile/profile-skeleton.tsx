"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover and Header Skeleton */}
      <Card className="border-none shadow-2xl overflow-hidden">
        {/* Cover Photo Skeleton */}
        <Skeleton className="w-full h-48 sm:h-64 md:h-80" />
        
        {/* Profile Info Section */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Avatar and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-20 gap-4">
            {/* Avatar Skeleton */}
            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background" />
            
            {/* Name and Edit Button */}
            <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 sm:mt-0 sm:ml-4">
              {/* Name and Username Skeleton */}
              <div className="space-y-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Edit Profile Button Skeleton */}
              <Skeleton className="h-10 w-32 shrink-0" />
            </div>
          </div>

          {/* Name and Bio Skeleton */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          {/* Stats Skeleton */}
          <div className="flex items-center gap-6 py-4 mt-4 border-t border-b">
            <div className="text-center sm:text-left">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20 mt-1" />
            </div>
            <div className="text-center sm:text-left">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20 mt-1" />
            </div>
          </div>

          {/* Additional Info Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Card>

      {/* Content Tabs Skeleton */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="flex gap-2 border-b px-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Posts/Content Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Cards Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
