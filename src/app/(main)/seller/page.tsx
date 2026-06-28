"use client";

import { SellerDashboard } from "@/features/seller/components/seller-dashboard";
import { useSellerProfile } from "@/features/seller/hooks/seller-query";

export default function SellerPage() {
  const { data: sellerData, isLoading, error } = useSellerProfile();

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Error loading seller data</h3>
          <p className="text-muted-foreground">
            There was a problem loading your seller information.
          </p>
        </div>
      </div>
    );
  }

  // Render the seller dashboard (it handles all states: no seller, pending, approved, rejected)
  return <SellerDashboard />;
}