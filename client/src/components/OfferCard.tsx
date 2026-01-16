import { motion } from "framer-motion";
import { type Offer } from "@shared/schema";
import { Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfferCardProps {
  offer: Offer;
  index: number;
}

export function OfferCard({ offer, index }: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-lg group"
    >
      <div className="grid md:grid-cols-2 h-full">
        <div className="relative h-64 md:h-full overflow-hidden">
          <img
            src={offer.image}
            alt={offer.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent md:hidden" />
          <div className="absolute top-4 right-4 md:left-4 md:right-auto bg-destructive text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-10">
            <Tag className="w-4 h-4" />
            <span>عرض خاص</span>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-center relative bg-gradient-to-br from-card to-muted/30">
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-3 text-foreground">
            {offer.title}
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {offer.description}
          </p>
          
          <div className="flex items-end gap-4 mb-8">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">السعر بعد الخصم</span>
              <span className="text-3xl font-bold text-primary">
                {(offer.discountedPrice / 100).toFixed(2)} د.أ
              </span>
            </div>
            {offer.originalPrice && (
              <span className="text-xl text-muted-foreground line-through decoration-destructive decoration-2 mb-1 opacity-60">
                {(offer.originalPrice / 100).toFixed(2)} د.أ
              </span>
            )}
          </div>

          <Button className="w-fit gap-2 text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            اطلب الآن <ArrowLeft className="w-5 h-5 rtl-flip" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
