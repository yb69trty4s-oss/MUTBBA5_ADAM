import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const SYNC_INTERVAL = 2 * 60 * 1000;

interface SyncResponse {
  success: boolean;
  totalFiles: number;
  newProductsAdded: number;
  newCategoriesAdded: number;
  newLocationsAdded: number;
  products: unknown[];
  categories: unknown[];
  locations: unknown[];
}

export function useImageKitSync() {
  const queryClient = useQueryClient();
  const isRunning = useRef(false);

  useEffect(() => {
    const syncImages = async () => {
      if (isRunning.current) return;
      
      isRunning.current = true;
      try {
        const response = await apiRequest("POST", "/api/imagekit/sync");
        const result: SyncResponse = await response.json();
        
        if (result.newProductsAdded > 0) {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          console.log(`Synced ${result.newProductsAdded} new products from ImageKit`);
        }
        
        if (result.newCategoriesAdded > 0) {
          queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
          console.log(`Synced ${result.newCategoriesAdded} new categories from ImageKit`);
        }
        
        if (result.newLocationsAdded > 0) {
          queryClient.invalidateQueries({ queryKey: ["/api/delivery-locations"] });
          console.log(`Synced ${result.newLocationsAdded} new delivery locations from ImageKit`);
        }
      } catch (error) {
        console.error("ImageKit sync failed:", error);
      } finally {
        isRunning.current = false;
      }
    };

    syncImages();

    const intervalId = setInterval(syncImages, SYNC_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [queryClient]);
}
