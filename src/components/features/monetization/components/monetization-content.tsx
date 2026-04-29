"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { DollarSign, Wallet, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useGetMonetizationStatus } from "../hooks/monetization-query";
import { ApplyMonetizationDialog } from "./apply-monetization-dialog";
import type { MonetizationData } from "@/types";

function MonetizationSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
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

function NotMonetizedState({ data }: { data: MonetizationData }) {
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
        <p className="text-muted-foreground">
          Track your earnings and manage your monetization settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.available.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monetization Not Active
          </CardTitle>
          <CardDescription>
            Apply for our monetization program to start earning from your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-6 space-y-3">
            <h3 className="font-semibold">Benefits of Monetization:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Earn money from your posts and content
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Get paid directly to your preferred payment method
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Track your earnings in real-time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Withdraw your earnings anytime
              </li>
            </ul>
          </div>

          <Button
            onClick={() => setShowApplyDialog(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Apply for Monetization
          </Button>
        </CardContent>
      </Card>

      <ApplyMonetizationDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
      />
    </>
  );
}

function PendingState({ data }: { data: MonetizationData }) {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
        <p className="text-muted-foreground">
          Your monetization application is under review
        </p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            Application Pending
          </CardTitle>
          <CardDescription>
            We're reviewing your monetization application. This usually takes 2-5 business days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Applied on: {new Date(data.app!.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ApprovedState({ data }: { data: MonetizationData }) {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
        <p className="text-muted-foreground">
          Manage your earnings and withdrawal settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available Balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.available.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.wallet.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Monetization Active
          </CardTitle>
          <CardDescription>
            Your monetization is approved and active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium">Status</div>
            <div className="text-sm text-muted-foreground">
              Approved on: {data.app?.approvedAt ? new Date(data.app.approvedAt).toLocaleDateString() : "N/A"}
            </div>
          </div>

          {data.lastWithdraw && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-sm font-medium">Last Withdrawal</div>
              <div className="text-sm text-muted-foreground">
                {new Date(data.lastWithdraw).toLocaleDateString()}
              </div>
            </div>
          )}

          <Button className="w-full sm:w-auto" size="lg">
            <Wallet className="h-4 w-4 mr-2" />
            Withdraw Earnings
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function RejectedState({ data }: { data: MonetizationData }) {
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monetization</h1>
        <p className="text-muted-foreground">
          Your monetization application was not approved
        </p>
      </div>

      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            Application Rejected
          </CardTitle>
          <CardDescription>
            Unfortunately, your application did not meet our requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.app?.rejectedReason && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-sm font-medium mb-1">Reason:</div>
              <div className="text-sm text-muted-foreground">{data.app.rejectedReason}</div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium mb-2">What you can do:</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                Review our monetization requirements
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                Create more high-quality content
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                Reapply after improving your profile
              </li>
            </ul>
          </div>

          <Button
            onClick={() => setShowApplyDialog(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            Reapply for Monetization
          </Button>
        </CardContent>
      </Card>

      <ApplyMonetizationDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
      />
    </>
  );
}

export function MonetizationContent() {
  const { monetizationQuery } = useGetMonetizationStatus();

  if (monetizationQuery.isLoading) {
    return <MonetizationSkeleton />;
  }

  if (monetizationQuery.isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              Error Loading Monetization
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
    <div className="container mx-auto py-8 px-4 space-y-8">
      {data.user.monetizationStatus === "none" && <NotMonetizedState data={data} />}
      {data.user.monetizationStatus === "pending" && <PendingState data={data} />}
      {data.user.monetizationStatus === "approved" && <ApprovedState data={data} />}
      {data.user.monetizationStatus === "rejected" && <RejectedState data={data} />}
    </div>
  );
}
