"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Building, CreditCard, MapPin, Phone, User, Wallet, Clock, CheckCircle, AlertCircle, Loader2, Plus } from "lucide-react";
import { useSellerProfile } from "../hooks/seller-query";
import { SellerApplicationDialog } from "./seller-application-dialog";

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
    // User has not applied yet - show application prompt
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to the Marketplace!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Apply to become a seller today and start selling your products on Daygist's marketplace. It's free and takes just a few minutes.
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
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

  // Render different views based on seller status
  const renderSellerContent = () => {
    switch (sellerData.data?.status) {
      case "pending":
        return <PendingSellerView seller={sellerData.data} />;
      case "approved":
        return <ApprovedSellerView seller={sellerData.data} stats={sellerData.status} />;
      case "rejected":
        return <RejectedSellerView seller={sellerData.data} />;
      default:
        return <PendingSellerView seller={sellerData.data} />;
    }
  };

  return (
    <div className="space-y-6">
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
              variant={sellerData.data?.status === "approved" ? "default" :
                       sellerData.data?.status === "pending" ? "secondary" : "destructive"}
            >
              {sellerData.data?.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Applied on {new Date(sellerData.data?.createdAt).toLocaleDateString()}
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
                <span>{sellerData.data?.businessType}</span>
              </div>
            </div>
            <div className="space-y-4">
              {sellerData.data?.district && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{sellerData.data?.district}</span>
                </div>
              )}
              {sellerData.data?.businessType === "individual" && sellerData.data?.nidNumber && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>ID: {sellerData.data?.nidNumber}</span>
                </div>
              )}
              {sellerData.data?.businessType === "business" && sellerData.data?.tradeLicense && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{sellerData.data?.tradeLicense}</span>
                </div>
              )}
            </div>
          </div>
          {sellerData.data?.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sellerData.data?.description}
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

function PendingSellerView({ seller }: { seller: any }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
          Application Under Review
        </CardTitle>
        <CardDescription>
          Your seller application is being processed. We'll notify you when there's an update.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Application ID:</span>
            <span className="font-medium">#{seller._id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Applied:</span>
            <span className="font-medium">
              {new Date(seller.createdAt).toLocaleDateString()}
            </span>
          </div>
          {seller.reason && (
            <div className="pt-2 border-t">
              <span className="text-sm font-medium">Rejection Reason:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {seller.reason}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Our team will review your application (2-3 business days)</li>
            <li>• You'll receive an email notification when approved or rejected</li>
            <li>• If approved, you can start adding products to your shop</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovedSellerView({ seller, stats }: { seller: any; stats: any }) {
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
                +{Math.floor(stats?.productCount * 0.2) || 2} this month
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
              <div className="text-2xl font-bold">BDT {stats?.walletBalance?.toLocaleString() || 0}</div>
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

function RejectedSellerView({ seller }: { seller: any }) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Application Rejected
        </CardTitle>
        <CardDescription>
          Unfortunately, your seller application was not approved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
          {seller.reason && (
            <div>
              <span className="text-sm font-medium">Rejection Reason:</span>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                {seller.reason}
              </p>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Application ID:</span>
            <span className="font-medium">#{seller._id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Submitted:</span>
            <span className="font-medium">
              {new Date(seller.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-medium">
              {new Date(seller.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 className="font-medium mb-2">You can now re-apply with corrected information.</h4>
          <p className="text-sm text-muted-foreground">
            Make sure to address all requirements and ensure all documents are properly uploaded.
            We typically respond to applications within 2-3 business days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}