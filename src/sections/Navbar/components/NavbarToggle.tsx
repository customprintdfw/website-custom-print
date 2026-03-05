import { Menu } from "lucide-react";

export const NavbarToggle = () => {
  const handleToggle = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="md:hidden text-lime-400 hover:text-lime-300 transition-colors"
      aria-label="Toggle menu"
    >
      <Menu className="w-8 h-8" />
    </button>
  );
};
