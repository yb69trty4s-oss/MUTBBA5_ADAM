import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      <div className="pt-32 pb-12 px-4 container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">تواصل معنا</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نسعد دائماً باستقبال استفساراتكم وملاحظاتكم
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-8 rounded-3xl shadow-lg border border-border"
          >
            <h2 className="text-2xl font-bold font-display mb-6">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">الاسم</label>
                  <Input id="name" required placeholder="اسمك الكريم" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input id="email" type="email" required placeholder="example@mail.com" className="rounded-xl h-12" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">الموضوع</label>
                <Input id="subject" required placeholder="عنوان الرسالة" className="rounded-xl h-12" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">الرسالة</label>
                <Textarea id="message" required placeholder="اكتب رسالتك هنا..." className="rounded-xl min-h-[150px] resize-none" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl text-lg font-bold gap-2">
                {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                {!isSubmitting && <Send className="w-4 h-4 rtl-flip" />}
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
              <h3 className="text-2xl font-bold font-display mb-6 text-primary">معلومات الاتصال</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">واتساب</h4>
                    <p className="text-muted-foreground" dir="ltr">+961 81 984 634</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">البريد الإلكتروني</h4>
                    <p className="text-muted-foreground">info@kibbeh-house.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                    <SiTiktok className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">تيك توك</h4>
                    <p className="text-muted-foreground">@kibbeh_house</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">ساعات العمل</h4>
                    <p className="text-muted-foreground">يومياً من 10:00 صباحاً - 11:00 مساءً</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl overflow-hidden h-64 shadow-lg border border-border">
              <div className="w-full h-full bg-muted flex items-center justify-center relative">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60" 
                  alt="Contact Us" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <a href="https://wa.me/96181984634" target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="shadow-lg font-bold">
                      <MessageCircle className="w-4 h-4 ml-2" />
                      تواصل معنا عبر واتساب
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
