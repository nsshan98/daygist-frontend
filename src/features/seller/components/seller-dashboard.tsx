"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { Building, CreditCard, MapPin, Phone, User, Wallet, CheckCircle, AlertCircle, Loader2, Plus, Clock, FileText, Shield, Search } from "lucide-react";
import { useSellerProfile } from "../hooks/seller-query";
import { SellerApplicationDialog } from "./seller-application-dialog";
import { SellerProfile, SellerStats } from "@/types/seller.types";

export function SellerDashboard() {
  const { data: sellerData, isLoading, error } = useSellerProfile();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold">Error loading seller data</h3>
          <p className="text-muted-foreground">
            There was a problem loading your seller information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!sellerData?.data) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to the Marketplace!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Apply to become a seller today and start selling your products on Daygist&apos;s marketplace. It&apos;s free and takes just a few minutes.
            </p>
          </div>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Ready to Start Selling?</CardTitle>
            <CardDescription>
              Join our community of successful sellers and reach thousands of buyers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Free to apply</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Quick verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Access to buyers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Secure payments</span>
              </div>
            </div>

            <Button
              onClick={() => setIsApplicationDialogOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Apply to Become a Seller
            </Button>
          </CardContent>
        </Card>

        <SellerApplicationDialog
          open={isApplicationDialogOpen}
          onOpenChange={setIsApplicationDialogOpen}
        />
      </div>
    );
  }

  const renderSellerContent = () => {
    switch (sellerData.data?.status) {
      case "pending":
        return <PendingSellerView seller={sellerData.data} />;
      case "approved":
        return <ApprovedSellerView seller={sellerData.data} stats={sellerData.status} />;
      case "rejected":
        return <RejectedSellerView seller={sellerData.data} onReapply={() => setIsApplicationDialogOpen(true)} />;
      default:
        return <PendingSellerView seller={sellerData.data!} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your seller account and track your business performance.
          </p>
        </div>
        {sellerData.data?.status === "rejected" && (
          <Button
            onClick={() => setIsApplicationDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Re-apply
          </Button>
        )}
      </div>

      {/* Seller Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {sellerData.data?.shopName?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            {sellerData.data?.shopName}
            <Badge
            className="capitalize"
              variant={sellerData.data?.status === "approved" ? "default" :
                       sellerData.data?.status === "pending" ? "secondary" : "destructive"}
            >
              {sellerData.data?.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Applied on {new Date(sellerData.data?.createdAt || "").toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{sellerData.data?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{sellerData.data?.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{sellerData.data?.businessType}</span>
              </div>
            </div>
            <div className="space-y-4">
              {sellerData.data?.district && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{sellerData.data.district}</span>
                </div>
              )}
              {sellerData.data?.businessType === "individual" && sellerData.data?.nidNumber && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>ID: {sellerData.data.nidNumber}</span>
                </div>
              )}
              {sellerData.data?.businessType === "business" && sellerData.data?.tradeLicense && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{sellerData.data.tradeLicense}</span>
                </div>
              )}
            </div>
          </div>
          {sellerData.data?.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sellerData.data.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {renderSellerContent()}

      <SellerApplicationDialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      />
    </div>
  );
}

function PendingSellerView({ seller }: { seller: SellerProfile }) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Status Banner */}
      <Card className="border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Application Under Review
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Your seller application is being reviewed by our team. We&apos;ll notify you once a decision is made.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Application Details</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Application ID</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                #{seller._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">
                {new Date(seller.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shop Name</span>
              <span className="font-medium">{seller.shopName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Business Type</span>
              <span className="font-medium capitalize">{seller.businessType}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Review Process</h4>
          </div>
          <div className="space-y-0">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="w-px h-full bg-border my-1" />
              </div>
              <div className="pb-4">
                <p className="font-medium text-sm">Application Submitted</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(seller.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Search className="h-4 w-4 text-amber-600" />
                </div>
                <div className="w-px h-full bg-border my-1" />
              </div>
              <div className="pb-4">
                <p className="font-medium text-sm">Under Review</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Our team is reviewing your documents
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">3</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Decision</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Typically within 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium">What happens next?</h4>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Our team will review your application (2-3 business days)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>You&apos;ll receive a notification when approved or rejected</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>If approved, you can start adding products to your shop</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovedSellerView({ seller, stats }: { seller: SellerProfile; stats: SellerStats }) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.productCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor((stats?.productCount || 0) * 0.2)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedOrdersCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingOrdersCount || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT {(stats?.walletBalance || 0).toLocaleString()}</div>
              <p className="text-xs text-green-600">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Approved on {seller.approvedAt ? new Date(seller.approvedAt).toLocaleDateString() : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {seller.approvedBy && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Approved by: {seller.approvedBy}</p>
                  <p className="text-sm text-muted-foreground">
                    {seller.approvedAt && `On ${new Date(seller.approvedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="products">
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              Manage your product listings on the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Product management coming soon</p>
              <p className="text-sm">You can add products after the seller setup is complete.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              Track and manage customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Order management coming soon</p>
              <p className="text-sm">Start by adding your first product.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wallet">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Management</CardTitle>
            <CardDescription>
              Withdraw your earnings and view transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Wallet management coming soon</p>
              <p className="text-sm">Withdrawals will be available once your account is fully set up.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function RejectedSellerView({ seller, onReapply }: { seller: SellerProfile; onReapply: () => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Status Banner */}
      <Card className="border-red-200 bg-linear-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Application Rejected
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Unfortunately, your seller application was not approved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Reason */}
      {seller.reason && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-red-900 dark:text-red-100">Rejection Reason</h4>
            </div>
            <p className="text-sm text-muted-foreground p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30">
              {seller.reason}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Details */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Application Details</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Application ID</span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                #{seller._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">
                {new Date(seller.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">
                {new Date(seller.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Re-apply CTA */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h4 className="font-medium mb-2">Ready to try again?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Address the rejection reason above, ensure all documents are properly uploaded, and submit a new application.
            We typically respond within 2-3 business days.
          </p>
          <Button onClick={onReapply} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Re-apply for Seller Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
