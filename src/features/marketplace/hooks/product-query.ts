import { axiosClient } from "@/lib/api/axios-client";
import {
  Product,
  ProductListResponse,
  ProductSectionResponse,
  ProductDetailResponse,
  ProductRelatedResponse,
  ProductFilters,
} from "@/types/product.types";
import { useQuery } from "@tanstack/react-query";

// ===============================|| PRODUCT LIST ||============================== //

const buildProductQueryString = (filters: ProductFilters): string => {
  const qs = new URLSearchParams();
  if (filters.q) qs.set("q", filters.q);
  if (filters.categoryId) qs.set("categoryId", filters.categoryId);
  if (filters.minPrice) qs.set("minPrice", filters.minPrice);
  if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
  if (filters.minRating) qs.set("minRating", filters.minRating);
  if (filters.sort) qs.set("sort", filters.sort);
  qs.set("page", String(filters.page));
  qs.set("limit", String(filters.limit));
  return qs.toString();
};

const useGetProducts = (filters: ProductFilters) => {
  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: async (): Promise<ProductListResponse> => {
      const queryString = buildProductQueryString(filters);
      const { data } = await axiosClient.get(`/e-commerce/products?${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return productsQuery;
};

// ===============================|| FEATURED PRODUCTS ||============================== //

const useGetFeaturedProducts = (limit = 12, country = "Bangladesh") => {
  const featuredQuery = useQuery({
    queryKey: ["products", "featured", limit, country],
    queryFn: async (): Promise<ProductSectionResponse> => {
      const { data } = await axiosClient.get(
        `/e-commerce/products/featured?limit=${limit}&country=${country}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return featuredQuery;
};

// ===============================|| TOP SELLING PRODUCTS ||============================== //

const useGetTopSellingProducts = (limit = 12, country = "Bangladesh") => {
  const topSellingQuery = useQuery({
    queryKey: ["products", "top-selling", limit, country],
    queryFn: async (): Promise<ProductSectionResponse> => {
      const { data } = await axiosClient.get(
        `/e-commerce/products/top-selling?limit=${limit}&country=${country}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return topSellingQuery;
};

// ===============================|| NEW ARRIVALS ||============================== //

const useGetNewArrivals = (limit = 12, days = 30, country = "Bangladesh") => {
  const newArrivalsQuery = useQuery({
    queryKey: ["products", "new-arrivals", limit, days, country],
    queryFn: async (): Promise<ProductSectionResponse> => {
      const { data } = await axiosClient.get(
        `/e-commerce/products/new-arrivals?limit=${limit}&days=${days}&country=${country}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return newArrivalsQuery;
};

// ===============================|| SINGLE PRODUCT ||============================== //

const useGetProduct = (id: string) => {
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<ProductDetailResponse> => {
      const { data } = await axiosClient.get(`/e-commerce/products/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  return productQuery;
};

// ===============================|| RELATED PRODUCTS ||============================== //

const useGetRelatedProducts = (id: string, limit = 10) => {
  const relatedQuery = useQuery({
    queryKey: ["products", "related", id, limit],
    queryFn: async (): Promise<ProductRelatedResponse> => {
      const { data } = await axiosClient.get(
        `/e-commerce/products/${id}/related?limit=${limit}`
      );
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return relatedQuery;
};

// ===============================|| PRODUCT HOOKS EXPORT ||============================== //

export {
  useGetProducts,
  useGetFeaturedProducts,
  useGetTopSellingProducts,
  useGetNewArrivals,
  useGetProduct,
  useGetRelatedProducts,
};
