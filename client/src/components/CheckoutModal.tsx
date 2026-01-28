import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, MapPin, Package, ArrowLeft, Loader2 } from "lucide-react";
import type { DeliveryLocation } from "@shared/schema";

export function CheckoutModal() {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    getTotalPrice,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<"choice" | "delivery">("choice");
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);

  const { data: locations = [], isLoading } = useQuery<DeliveryLocation[]>({
    queryKey: ["/api/delivery-locations"],
    enabled: isCheckoutOpen,
  });

  const buildWhatsAppMessage = (deliveryLocation?: DeliveryLocation) => {
    let message = "مرحباً، أريد طلب:\n\n";
    
    items.forEach((item) => {
      message += `- ${item.product.name}: ${item.quantity} ${item.product.unitType || "حبة"}\n`;
    });
    
    message += `\nالمجموع: ${(getTotalPrice() / 100).toFixed(2)} د.أ`;
    
    if (deliveryLocation) {
      message += `\n\nالتوصيل إلى: ${deliveryLocation.name}`;
      message += `\nسعر التوصيل: ${(deliveryLocation.price / 100).toFixed(2)} د.أ`;
      message += `\nالإجمالي مع التوصيل: ${((getTotalPrice() + deliveryLocation.price) / 100).toFixed(2)} د.أ`;
    } else {
      message += "\n\nاستلام من المحل";
    }
    
    return encodeURIComponent(message);
  };

  const handleTakeaway = () => {
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/?text=${message}`, "_blank");
    clearCart();
    setIsCheckoutOpen(false);
    setStep("choice");
  };

  const handleDeliverySelect = (location: DeliveryLocation) => {
    setSelectedLocation(location);
    const message = buildWhatsAppMessage(location);
    window.open(`https://wa.me/?text=${message}`, "_blank");
    clearCart();
    setIsCheckoutOpen(false);
    setStep("choice");
    setSelectedLocation(null);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep("choice");
    setSelectedLocation(null);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-background rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              {step === "delivery" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setStep("choice")}
                  data-testid="button-back-checkout"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <h2 className="text-xl font-bold flex-1 text-center">
                {step === "choice" ? "طريقة الاستلام" : "اختر منطقة التوصيل"}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleClose}
                data-testid="button-close-checkout"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {step === "choice" ? (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover-elevate"
                    onClick={handleTakeaway}
                    data-testid="button-takeaway"
                  >
                    <Package className="w-8 h-8 text-primary" />
                    <span className="text-lg font-bold">استلام من المحل</span>
                    <span className="text-sm text-muted-foreground">اختر المكان عبر واتساب</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover-elevate"
                    onClick={() => setStep("delivery")}
                    data-testid="button-delivery"
                  >
                    <MapPin className="w-8 h-8 text-primary" />
                    <span className="text-lg font-bold">توصيل للمنزل</span>
                    <span className="text-sm text-muted-foreground">اختر منطقتك ونوصل لك</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد مناطق توصيل متاحة حالياً</p>
                      <p className="text-sm mt-2">يمكنك اختيار الاستلام من المحل</p>
                    </div>
                  ) : (
                    locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleDeliverySelect(location)}
                        className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border hover-elevate transition-all text-right"
                        data-testid={`button-location-${location.id}`}
                      >
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-lg">{location.name}</p>
                          <p className="text-primary font-medium">
                            {(location.price / 100).toFixed(2)} د.أ
                          </p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">مجموع الطلب:</span>
                <span className="text-xl font-bold text-primary">
                  {(getTotalPrice() / 100).toFixed(2)} د.أ
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
