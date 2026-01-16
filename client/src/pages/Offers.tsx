import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useOffers } from "@/hooks/use-shop-data";
import { OfferCard } from "@/components/OfferCard";
import { motion } from "framer-motion";

export default function Offers() {
  const { data: offers, isLoading } = useOffers();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      <div className="bg-primary/5 pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground"
          >
            عروض خاصة وحصرية
          </motion.h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            لا تفوت فرصة تجربة أشهى الأطباق بأسعار مميزة لفترة محدودة
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {offers?.map((offer, idx) => (
              <OfferCard key={offer.id} offer={offer} index={idx} />
            ))}
            
            {offers?.length === 0 && (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
                <h3 className="text-2xl font-bold text-muted-foreground mb-2">انتهت العروض الحالية</h3>
                <p className="text-muted-foreground">تابعنا لتبقى على اطلاع بأحدث عروضنا!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
