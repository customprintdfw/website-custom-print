import { MobileMenuList } from "@/components/MobileMenu/components/MobileMenuList";

export const MobileMenu = () => {
  return (
    <div id="mobile-menu" className="hidden md:hidden bg-black border-t-2 border-lime-400">
      <MobileMenuList />
    </div>
  );
};
