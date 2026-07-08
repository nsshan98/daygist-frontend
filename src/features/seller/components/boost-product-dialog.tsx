"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import { Zap, Check, Loader2, Wallet } from "lucide-react";
import { useGetBoostPricing, usePayFee, useSellerProfile } from "../hooks/seller-query";
import { Product, BoostPricingTier } from "@/types/product.types";

const TIER_ICONS: Record<string, string> = {
  basic: "⚡",
  regular: "🔥",
  pro: "💎",
};

const TIER_COLORS: Record<string, string> = {
  basic: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
  regular: "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20",
  pro: "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20",
};

const TIER_BADGE_COLORS: Record<string, string> = {
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  regular: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

interface BoostProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoostProductDialog({ product, open, onOpenChange }: BoostProductDialogProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const { data: pricingData, isLoading: pricingLoading } = useGetBoostPricing();
  const { data: sellerData } = useSellerProfile();
  const { payFeeMutation } = usePayFee();

  const walletBalance = sellerData?.status?.walletBalance ?? 0;
  const tiers = pricingData?.data ?? [];

  const handleBoost = () => {
    if (!selectedTier) return;

    payFeeMutation.mutate(
      {
        productId: product._id,
        payload: { feeType: "boost", tier: selectedTier as "basic" | "regular" | "pro" },
      },
      {
        onSuccess: () => {
          setSelectedTier(null);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Boost Product
          </DialogTitle>
          <DialogDescription>
            Boost &ldquo;{product.title}&rdquo; to get more visibility in the marketplace.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Balance */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Wallet Balance:</span>
          <span className="text-sm font-semibold">
            &#x09F3;{walletBalance.toLocaleString()}
          </span>
        </div>

        {/* Pricing Tiers */}
        {pricingLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {tiers
              .filter((t) => t.isActive)
              .map((tier) => {
                const isSelected = selectedTier === tier.tier;
                const canAfford = walletBalance >= tier.price;

                return (
                  <button
                    key={tier._id}
                    type="button"
                    disabled={!canAfford}
                    onClick={() => setSelectedTier(tier.tier)}
                    className={`relative flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : TIER_COLORS[tier.tier]
                    } ${!canAfford ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
                  >
                    <span className="text-2xl">{TIER_ICONS[tier.tier]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{tier.tier}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${TIER_BADGE_COLORS[tier.tier]}`}
                        >
                          {tier.defaultDays} days
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Boost your product for {tier.defaultDays} days
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold">&#x09F3;{tier.price.toLocaleString()}</p>
                      {!canAfford && (
                        <p className="text-xs text-destructive">Insufficient balance</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={payFeeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleBoost}
            disabled={!selectedTier || payFeeMutation.isPending}
          >
            {payFeeMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Boost Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
