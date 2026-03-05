import React from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

const imageMap: Record<string, string> = {
  "⚙️": "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80",
  "🚗": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "🧵": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
  "💡": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
  "👕": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  "🖨️": "https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&q=80",
  "🎌": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
};

// Fallback: try to match by common title keywords
const titleImageMap: Record<string, string> = {
  cnc: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80",
  wrap: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  embroidery: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
  sign: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
  shirt: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  dtf: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  print: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&q=80",
  banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
};

function resolveImage(icon: string, title: string): string {
  // If icon is already a URL or base64 data URL, use it directly
  if (icon.startsWith("http") || icon.startsWith("data:")) return icon;
  if (imageMap[icon]) return imageMap[icon];
  const lower = title.toLowerCase();
  for (const [keyword, url] of Object.entries(titleImageMap)) {
    if (lower.includes(keyword)) return url;
  }
  return "https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&q=80";
}

export const ServiceCard = ({ title, description, icon, gradient }: ServiceCardProps) => {
  const imageUrl = resolveImage(icon, title);

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-lime-400 transform hover:-translate-y-2">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-40 transition-opacity duration-300`} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold font-josefin_sans text-black mb-3">
          {title}
        </h3>
        <p className="text-gray-600 font-montserrat leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
