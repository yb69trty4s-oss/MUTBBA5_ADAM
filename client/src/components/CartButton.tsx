import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-6 left-6 z-40"
    >
      <Button
        size="lg"
        className="h-14 px-6 rounded-full shadow-xl bg-primary hover:bg-primary/90 gap-2"
        onClick={() => setIsCartOpen(true)}
        data-testid="button-open-cart"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="font-bold">السلة</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={totalItems}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
          >
            {totalItems}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
