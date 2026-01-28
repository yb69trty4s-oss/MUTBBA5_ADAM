import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SecretAdminButton } from "@/components/SecretAdminButton";
import { CartProvider } from "@/context/CartContext";
import { Cart } from "@/components/Cart";
import { CartButton } from "@/components/CartButton";
import { CheckoutModal } from "@/components/CheckoutModal";

// Pages
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
          <SecretAdminButton />
          <CartButton />
          <Cart />
          <CheckoutModal />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
