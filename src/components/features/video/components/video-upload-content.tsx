"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { CheckCircle, AlertCircle, Upload } from "lucide-react";
import { useGetMonetizationStatus } from "@/components/features/monetization";
import { UploadLongVideoDialog } from "./upload-long-video-dialog";
import type { MonetizationData } from "@/types";

function VideoUploadSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function NotApprovedState({ data }: { data: MonetizationData }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Long Video Upload</h1>
        <p className="text-muted-foreground">
          Upload long-form video content to your profile
        </p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            Monetization Required
          </CardTitle>
          <CardDescription>
            You need an approved monetization application to upload long videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium capitalize">Current Status: {data.user.monetizationStatus}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovedState({ data }: { data: MonetizationData }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Long Video Upload</h1>
        <p className="text-muted-foreground">
          Upload long-form video content to your profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Monetization Approved
          </CardTitle>
          <CardDescription>
            You are eligible to upload long videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Long Video
          </Button>
        </CardContent>
      </Card>

      <UploadLongVideoDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
}

export function VideoUploadContent() {
  const { monetizationQuery } = useGetMonetizationStatus();

  if (monetizationQuery.isLoading) {
    return <VideoUploadSkeleton />;
  }

  if (monetizationQuery.isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              Error Loading Monetization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to load monetization data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = monetizationQuery.data?.data;

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {data.user.monetizationStatus === "approved" ? (
        <ApprovedState data={data} />
      ) : (
        <NotApprovedState data={data} />
      )}
    </div>
  );
}
