import { motion } from "framer-motion";
import { type Product } from "@shared/schema";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-6">
            عرض التفاصيل
          </Button>
        </div>
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
            <span className="text-xs text-muted-foreground">السعر</span>
            <span className="text-lg font-bold text-primary">
              {(product.price / 100).toFixed(2)} د.أ
            </span>
          </div>
          <Button size="icon" className="rounded-full shadow-md bg-primary hover:bg-primary/90">
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
