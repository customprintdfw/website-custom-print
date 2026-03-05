import { ServicesGrid } from "@/sections/ServicesSection/components/ServicesGrid";

export const ServicesSection = () => {
  return (
    <div id="services" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans text-black mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-lime-400 to-yellow-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-montserrat max-w-2xl mx-auto">
            Professional printing and customization services for all your needs
          </p>
        </div>
        <ServicesGrid />
      </div>
    </div>
  );
};
