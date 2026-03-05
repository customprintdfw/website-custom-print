import { HeroContent } from "@/sections/Hero/components/HeroContent";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-lime-400 to-yellow-400 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <HeroContent />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};
