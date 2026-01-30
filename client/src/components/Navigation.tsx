import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

import logoImg from "@assets/67b44034-7853-4948-8a1a-55382670af9a_1769759701219.jpeg";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "القائمة" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { getTotalItems, setIsCartOpen } = useCart();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className={`font-display text-2xl font-bold transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}>
                مطبخ آدم
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`relative font-medium text-lg cursor-pointer transition-colors duration-200 hover:text-primary ${
                    scrolled 
                      ? (location === link.href ? "text-primary" : "text-foreground") 
                      : (location === link.href ? "text-primary" : "text-white/90 hover:text-white")
                  }`}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 right-0 w-full h-0.5 bg-primary"
                    />
                  )}
                </span>
              </Link>
            ))}
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`relative rounded-full ${scrolled ? "text-foreground" : "text-white"}`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background">
                    {totalItems}
                  </span>
                )}
              </Button>

              <Link href="/contact">
                <Button 
                  variant={scrolled ? "default" : "secondary"}
                  className={`rounded-full px-6 font-bold shadow-lg ${!scrolled && "bg-white text-primary hover:bg-white/90"}`}
                >
                  اتصل بنا
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-full ${scrolled ? "text-foreground" : "text-white"}`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background">
                  {totalItems}
                </span>
              )}
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container px-4 py-6 space-y-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div 
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors cursor-pointer ${
                      location === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}
              <Link href="/contact">
                 <div onClick={() => setIsOpen(false)}>
                  <Button className="w-full mt-4 rounded-xl py-6 text-lg font-bold">
                    اتصل بنا
                  </Button>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
