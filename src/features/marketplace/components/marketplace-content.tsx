"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Card, CardContent } from "@/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  Search,
  SlidersHorizontal,
  Store,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  useGetProducts,
  useGetFeaturedProducts,
  useGetTopSellingProducts,
  useGetNewArrivals,
} from "../hooks/product-query";
import { ProductCard } from "./product-card";
import { ProductFilters, ProductSort } from "@/types/product.types";

const DEBOUNCE_MS = 400;

export function MarketplaceContent() {
  const [filters, setFilters] = useState<ProductFilters>({
    q: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sort: "relevance",
    page: 1,
    limit: 20,
  });

  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const debounceTimer = useRef<NodeJS.Timeout>(null);

  const debouncedSetFilters = useCallback((updater: (prev: ProductFilters) => ProductFilters) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters(updater);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const { data, isLoading, isFetching } = useGetProducts(filters);
  const { data: featuredData, isLoading: featuredLoading } = useGetFeaturedProducts(10);
  const { data: topSellingData, isLoading: topSellingLoading } = useGetTopSellingProducts(10);
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useGetNewArrivals(10);

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const currentPage = data?.page ?? 1;

  const featured = featuredData?.data ?? [];
  const topSelling = topSellingData?.data ?? [];
  const newArrivals = newArrivalsData?.data ?? [];

  const hasActiveFilters =
    filters.q || filters.categoryId || filters.minPrice || filters.maxPrice || filters.minRating;

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, q: searchInput, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort: value as ProductSort, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            Discover products from sellers around you
          </p>
        </div>
        <Link href="/seller">
          <Button className="gap-2">
            <Store className="w-4 h-4" />
            Seller Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Search + Sort + Button */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Select value={filters.sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="top_rated">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="secondary" className="shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Row 2: Price Range + Active Filter Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Price:</span>
              <Input
                placeholder="Min"
                type="number"
                value={minPriceInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinPriceInput(val);
                  debouncedSetFilters((prev) => ({ ...prev, minPrice: val, page: 1 }));
                }}
                className="w-24"
              />
              <span className="text-muted-foreground">&ndash;</span>
              <Input
                placeholder="Max"
                type="number"
                value={maxPriceInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaxPriceInput(val);
                  debouncedSetFilters((prev) => ({ ...prev, maxPrice: val, page: 1 }));
                }}
                className="w-24"
              />
            </div>

            {/* Active filter badges */}
            <div className="flex flex-wrap gap-2">
              {filters.minPrice && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setMinPriceInput("");
                    setFilters((prev) => ({ ...prev, minPrice: "", page: 1 }));
                  }}
                >
                  Min: &#x09F3;{Number(filters.minPrice).toLocaleString()} ×
                </Badge>
              )}
              {filters.maxPrice && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setMaxPriceInput("");
                    setFilters((prev) => ({ ...prev, maxPrice: "", page: 1 }));
                  }}
                >
                  Max: &#x09F3;{Number(filters.maxPrice).toLocaleString()} ×
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured, Top Selling, New Arrivals — only when no active filters */}
      {!hasActiveFilters && (
        <>
          {/* Featured Products */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Featured Products</h2>
              </div>
              {featuredLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-none p-0 gap-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {featured.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Top Selling Products */}
          {topSelling.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Top Selling</h2>
              </div>
              {topSellingLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-none p-0 gap-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topSelling.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">New Arrivals</h2>
              </div>
              {newArrivalsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-none p-0 gap-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {newArrivals.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* All Products Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {hasActiveFilters ? "Search Results" : "All Products"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-32 inline-block" />
          ) : (
            <>
              {total} product{total !== 1 ? "s" : ""} found
              {filters.q && (
                <span>
                  {" "}
                  for &ldquo;<span className="font-medium text-foreground">{filters.q}</span>&rdquo;
                </span>
              )}
            </>
          )}
        </span>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none p-0 gap-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-none">
          <CardContent className="py-16 text-center">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilters({
                  q: "",
                  categoryId: "",
                  minPrice: "",
                  maxPrice: "",
                  minRating: "",
                  sort: "relevance",
                  page: 1,
                  limit: 20,
                });
                setSearchInput("");
                setMinPriceInput("");
                setMaxPriceInput("");
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {generatePagination(currentPage, Math.ceil(total / filters.limit)).map(
              (page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9"
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </Button>
                )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to generate pagination array
function generatePagination(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total - 1, total];
  }

  if (current >= total - 2) {
    return [1, 2, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
