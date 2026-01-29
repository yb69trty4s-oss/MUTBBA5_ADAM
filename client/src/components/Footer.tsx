import { Instagram, Facebook, Phone, MapPin, Mail, MessageCircle } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                <span className="font-display text-2xl font-bold">ك</span>
              </div>
              <span className="font-display text-3xl font-bold text-white">كبة الدار</span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-xs">
              نقدم لكم أشهى المأكولات الشرقية المحضرة بكل حب وعناية، لننقل لكم طعم الأصالة في كل لقمة.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white font-display">روابط سريعة</h4>
            <ul className="space-y-4 text-white/70">
              <li><a href="/" className="hover:text-primary transition-colors">الرئيسية</a></li>
              <li><a href="/menu" className="hover:text-primary transition-colors">القائمة</a></li>
              <li><a href="/offers" className="hover:text-primary transition-colors">العروض</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">اتصل بنا</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white font-display">تواصل معنا</h4>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span dir="ltr">+961 81 984 634</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>info@kibbeh-house.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6 text-white font-display">تابعنا</h4>
            <div className="flex gap-4">
              <a href="https://vt.tiktok.com/ZSamBP9Qp/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <SiTiktok className="w-6 h-6" />
              </a>
              <a href="https://wa.me/96181984634" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <MessageCircle className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 text-center md:text-right">
          <p className="text-white/40 text-sm">
            © 2024 كبة الدار. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            صمم بكل حب <span className="text-red-500">♥</span> للأكل الشرقي
          </p>
        </div>
      </div>
    </footer>
  );
}
