import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export function Cart() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    getTotalPrice,
    setIsCheckoutOpen,
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 left-0 h-full w-full max-w-md bg-background shadow-xl z-50 flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                سلة المشتريات
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsCartOpen(false)}
                data-testid="button-close-cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>السلة فارغة</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-card rounded-lg border"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.product.price.toLocaleString()} $ / {item.product.unitType || "حبة"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => {
                            const step = item.product.unitType === "كيلو" ? 0.5 : 1;
                            updateQuantity(item.product.id, item.quantity - step);
                          }}
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => {
                            const step = item.product.unitType === "كيلو" ? 0.5 : 1;
                            updateQuantity(item.product.id, item.quantity + step);
                          }}
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.product.id)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-left font-bold text-primary">
                      {(item.product.price * item.quantity).toLocaleString()} $
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t bg-muted/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">المجموع:</span>
                  <span className="text-2xl font-bold text-primary">
                    {getTotalPrice().toLocaleString()} $
                  </span>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  اطلب الآن
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
