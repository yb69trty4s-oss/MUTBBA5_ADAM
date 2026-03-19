import { useQuery } from "@tanstack/react-query";
import { type Category, type Product } from "@shared/schema";
import { staticCategories, staticProducts, staticDeliveryLocations } from "@/data/static-data";

// Categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["static-categories"],
    queryFn: () => Promise.resolve(staticCategories),
    staleTime: Infinity,
  });
}

export function useCategory(id: number) {
  return useQuery<Category | undefined>({
    queryKey: ["static-category", id],
    queryFn: () => Promise.resolve(staticCategories.find((c) => c.id === id)),
    enabled: !!id,
    staleTime: Infinity,
  });
}

// Products
export function useProducts(filters?: { categoryId?: number; isPopular?: boolean }) {
  return useQuery<Product[]>({
    queryKey: ["static-products", filters],
    queryFn: () => {
      let result = staticProducts;
      if (filters?.categoryId) {
        result = result.filter((p) => p.categoryId === filters.categoryId);
      }
      if (filters?.isPopular) {
        result = result.filter((p) => p.isPopular);
      }
      return Promise.resolve(result);
    },
    staleTime: Infinity,
  });
}

export function useProduct(id: number) {
  return useQuery<Product | undefined>({
    queryKey: ["static-product", id],
    queryFn: () => Promise.resolve(staticProducts.find((p) => p.id === id)),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useDeliveryLocations() {
  return useQuery({
    queryKey: ["static-delivery-locations"],
    queryFn: () => Promise.resolve(staticDeliveryLocations),
    staleTime: Infinity,
  });
}
