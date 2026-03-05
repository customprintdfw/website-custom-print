import { useQuery } from "@animaapp/playground-react-sdk";
import { ServiceCard } from "@/sections/ServicesSection/components/ServiceCard";

export const ServicesGrid = () => {
  const { data: services, isPending, error } = useQuery("Service");

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 animate-pulse">
            <div className="bg-gray-200 h-32"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-montserrat">
        Error loading services: {error.message}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">⚙️</div>
        <p className="text-lg font-montserrat">No services yet. Add services in the <a href="/admin" className="text-lime-500 hover:underline">admin panel</a>.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  );
};
