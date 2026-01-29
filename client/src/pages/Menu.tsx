import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCategories, useProducts } from "@/hooks/use-shop-data";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Menu() {
  // Simple query param parsing (wouter doesn't have useSearchParams)
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined;

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategoryId);
  
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categoryId: selectedCategory });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      
      {/* Header */}
      <div className="bg-foreground text-background pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6 text-primary"
          >
            قائمتنا المتنوعة
          </motion.h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            تصفح تشكيلتنا الواسعة من الكبة والمقبلات والأطباق الرئيسية
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2 md:pb-0 md:justify-center">
            <Button
              variant={selectedCategory === undefined ? "default" : "outline"}
              onClick={() => setSelectedCategory(undefined)}
              className={`rounded-full px-6 transition-all ${selectedCategory === undefined ? "shadow-md scale-105" : "hover:bg-muted"}`}
            >
              الكل
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-6 transition-all ${selectedCategory === cat.id ? "shadow-md scale-105" : "hover:bg-muted"}`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-40">
            <h3 className="text-4xl font-display font-bold text-primary mb-4">قريباً...</h3>
            <p className="text-lg text-muted-foreground">نعمل على إضافة منتجات جديدة لهذا القسم</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {products?.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
