import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const SYNC_INTERVAL = 2 * 60 * 1000;

export function useImageKitSync() {
  const queryClient = useQueryClient();
  const isRunning = useRef(false);

  useEffect(() => {
    const syncImages = async () => {
      if (isRunning.current) return;
      
      isRunning.current = true;
      try {
        const result = await apiRequest("/api/imagekit/sync", {
          method: "POST",
        });
        
        if (result.newProductsAdded > 0) {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
          console.log(`Synced ${result.newProductsAdded} new products from ImageKit`);
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
