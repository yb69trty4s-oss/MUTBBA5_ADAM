import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useCategories, useProducts } from "@/hooks/use-shop-data";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, Utensils, MessageCircle } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export default function Home() {
  const [heroImage, setHeroImage] = useState<string>("");
  const { data: categories, isLoading: isCatLoading } = useCategories();
  const { data: featuredProducts, isLoading: isProdLoading } = useProducts({ isPopular: true });

  useEffect(() => {
    const images = ["/images/hero1.png", "/images/hero2.png"];
    const random = images[Math.floor(Math.random() * images.length)];
    setHeroImage(random);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {heroImage && (
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30 z-10" />
            <img 
              src={heroImage} 
              alt="Hero" 
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        )}

        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-white mb-6 drop-shadow-2xl">
              مذاق الأصالة
            </h1>
            <p className="text-xl md:text-3xl text-white/90 font-light mb-10 max-w-2xl mx-auto drop-shadow-md">
              نقدم لكم أشهى الكبة والمأكولات الشرقية المحضرة يدوياً بأجود المكونات
            </p>
            <Link href="/menu">
              <Button className="h-14 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                تصفح القائمة
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/80"
        >
          <ChevronDown className="w-10 h-10" />
        </motion.div>
      </header>

      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              أصنافنا المميزة
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">واتساب</h3>
              <p className="text-muted-foreground mb-4">اطلب الآن مباشرة عبر الواتساب</p>
              <a 
                href="https://wa.me/96181984634" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xl font-bold text-primary hover:underline"
                dir="ltr"
              >
                +961 81 984 634
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <SiTiktok className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">تيك توك</h3>
              <p className="text-muted-foreground mb-4">تابعوا أحدث فيديوهاتنا</p>
              <a 
                href="https://vt.tiktok.com/ZSamBP9Qp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xl font-bold text-primary hover:underline"
              >
                @kibbeh_house
              </a>
            </motion.div>
          </div>

          {isCatLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {categories?.map((category, index) => (
                <Link key={category.id} href={`/menu?category=${category.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-full overflow-hidden mb-6 border-4 border-white shadow-xl">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <h3 className="text-center text-xl font-bold font-display group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              الأكثر طلباً
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              اختيارات زبائننا المفضلة، محضرة يومياً لضمان الجودة والطعم الأصيل
            </p>
          </div>

          {isProdLoading ? (
             <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/menu">
              <Button size="lg" className="rounded-full px-12 text-lg h-14 bg-foreground hover:bg-foreground/90 text-background">
                <Utensils className="ml-2 w-5 h-5" />
                شاهد القائمة الكاملة
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
