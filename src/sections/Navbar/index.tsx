import { ShoppingCart } from "lucide-react";
import { NavbarToggle } from "@/sections/Navbar/components/NavbarToggle";
import { NavbarLogo } from "@/sections/Navbar/components/NavbarLogo";
import { DesktopMenu } from "@/sections/Navbar/components/DesktopMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { useCart } from "@/context/CartContext";

export const Navbar = () => {
  const { items, openCart } = useCart();

  return (
    <div className="sticky top-0 z-50">
      <nav className="bg-black border-b-4 border-lime-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <NavbarToggle />
            <NavbarLogo />
            <div className="flex items-center gap-3">
              <DesktopMenu />
              <button
                onClick={openCart}
                className="relative p-2.5 text-white hover:text-lime-400 transition-colors rounded-lg hover:bg-white/10"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-lime-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-montserrat leading-none">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu />
    </div>
  );
};
