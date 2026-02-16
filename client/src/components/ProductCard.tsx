import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Product } from "@shared/schema";
import { ShoppingBag, Star, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.isPopular && (
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>مشهور</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold font-display mb-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">السعر / {product.unitType || "حبة"}</span>
            <span className="text-lg font-bold text-primary min-h-[1.75rem] block">
              {product.price > 0 && `${(product.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`}
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            {added ? (
              <motion.div
                key="added"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-green-500 text-white rounded-full p-2"
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : showQuantity ? (
              <motion.div
                key="quantity"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2"
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    const step = product.unitType === "كيلو" ? 0.5 : 1;
                    setQuantity(Math.max(step, quantity - step));
                  }}
                  data-testid={`button-decrease-qty-${product.id}`}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    const step = product.unitType === "كيلو" ? 0.5 : 1;
                    setQuantity(quantity + step);
                  }}
                  data-testid={`button-increase-qty-${product.id}`}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary"
                  onClick={handleAddToCart}
                  data-testid={`button-confirm-add-${product.id}`}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  size="icon"
                  className="rounded-full shadow-md bg-primary hover:bg-primary/90"
                  onClick={() => setShowQuantity(true)}
                  data-testid={`button-add-to-cart-${product.id}`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
