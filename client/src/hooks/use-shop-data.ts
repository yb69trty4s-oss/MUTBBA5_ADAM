import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Category, type Product, type Offer } from "@shared/schema";

// Categories
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: [api.categories.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.categories.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch category");
      return api.categories.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Products
export function useProducts(filters?: { categoryId?: number; isPopular?: boolean }) {
  return useQuery({
    queryKey: [api.products.list.path, filters],
    queryFn: async () => {
      let url = api.products.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.categoryId) params.append("categoryId", String(filters.categoryId));
        if (filters.isPopular) params.append("isPopular", "true");
        url += `?${params.toString()}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Offers
export function useOffers() {
  return useQuery({
    queryKey: [api.offers.list.path],
    queryFn: async () => {
      const res = await fetch(api.offers.list.path);
      if (!res.ok) throw new Error("Failed to fetch offers");
      return api.offers.list.responses[200].parse(await res.json());
    },
  });
}
