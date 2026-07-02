import { axiosClient } from "@/lib/api/axios-client";
import { CategoryTreeResponse } from "@/types/category.types";
import { useQuery } from "@tanstack/react-query";

// ===============================|| CATEGORY QUERIES ||============================== //

const useGetCategoryTree = () => {
  const categoryTreeQuery = useQuery({
    queryKey: ["category-tree"],
    queryFn: async (): Promise<CategoryTreeResponse> => {
      const { data } = await axiosClient.get("/e-commerce/categories/tree");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });

  return categoryTreeQuery;
};

export { useGetCategoryTree };
