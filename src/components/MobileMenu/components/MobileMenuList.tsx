import { useAuth } from "@animaapp/playground-react-sdk";
import { Link, useNavigate } from "react-router-dom";

const closeMobileMenu = () => {
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) mobileMenu.classList.add("hidden");
};

export const MobileMenuList = () => {
  const { isAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    closeMobileMenu();
    
    // Handle hash links (anchor links on the same page)
    if (href.startsWith("#")) {
      // If we're not on the home page, navigate there first
      if (window.location.pathname !== "/") {
        navigate("/");
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        // Already on home page, just scroll
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Portals", href: "#portals" },
    { label: "Products", href: "#products" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="px-4 py-6 space-y-4">
      {menuItems.map((item, index) => {
        // Use Link for route navigation, button for hash links
        if (item.href.startsWith("#")) {
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.href)}
              className="block w-full text-left text-white hover:text-lime-400 font-montserrat font-semibold text-lg py-2 transition-colors duration-200"
            >
              {item.label}
            </button>
          );
        }
        
        return (
          <Link
            key={index}
            to={item.href}
            onClick={closeMobileMenu}
            className="block text-white hover:text-lime-400 font-montserrat font-semibold text-lg py-2 transition-colors duration-200"
          >
            {item.label}
          </Link>
        );
      })}
      {!isAnonymous && (
        <Link
          to="/admin"
          onClick={closeMobileMenu}
          className="block text-lime-400 hover:text-lime-300 font-montserrat font-semibold text-lg py-2 transition-colors duration-200"
        >
          Admin Panel
        </Link>
      )}
      <button
        onClick={() => handleNavigation("#contact")}
        className="block w-full text-center bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:from-lime-300 hover:to-yellow-300 transition-all duration-300 shadow-md"
      >
        Get Quote
      </button>
    </div>
  );
};
