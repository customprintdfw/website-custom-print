import { useAuth } from "@animaapp/playground-react-sdk";

export const DesktopMenu = () => {
  const { isAnonymous } = useAuth();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Portals", href: "#portals" },
    { label: "Products", href: "#products" },
    { label: "Design Studio", href: "/design" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="hidden md:flex items-center space-x-6">
      {menuItems.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className="text-white hover:text-lime-400 font-montserrat font-semibold text-base transition-colors duration-200 relative group"
        >
          {item.label}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 group-hover:w-full transition-all duration-300"></span>
        </a>
      ))}
      {!isAnonymous && (
        <a
          href="/admin"
          className="text-lime-400 hover:text-lime-300 font-montserrat font-semibold text-base transition-colors duration-200 relative group"
        >
          Admin
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 group-hover:w-full transition-all duration-300"></span>
        </a>
      )}
      <a
        href="#contact"
        className="bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-5 py-2 rounded-lg font-bold hover:from-lime-300 hover:to-yellow-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
      >
        Get Quote
      </a>
    </div>
  );
};
