import { useState } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import type { Portal } from "@animaapp/playground-react-sdk";
import { PortalStorefront } from "../../components/PortalStorefront";

const PortalCard = ({ portal, onShop }: { portal: Portal; onShop: (p: Portal) => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={portal.image}
          alt={portal.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-110" : "scale-100"}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${portal.color} opacity-70`}></div>
        <div className="absolute top-3 right-3">
          <span className={`${portal.badgeBg} text-xs font-bold px-3 py-1 rounded-full font-montserrat shadow`}>
            {portal.badge}
          </span>
        </div>
        <div className="absolute bottom-3 left-4">
          <h3 className="text-white font-bold font-josefin_sans text-xl drop-shadow">{portal.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 font-montserrat text-sm mb-5 leading-relaxed">{portal.description}</p>
        <button
          onClick={() => onShop(portal)}
          className="w-full bg-gradient-to-r from-blue-600 to-lime-400 text-white py-2.5 rounded-xl font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow-md hover:shadow-lg"
        >
          Shop Now →
        </button>
      </div>
    </div>
  );
};

export const WebToPrintPortals = () => {
  const { data: portals, isPending, error } = useQuery("Portal");
  const [activePortal, setActivePortal] = useState<Portal | null>(null);

  return (
    <div id="portals" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans text-black mb-4">
            Web-to-Print Portals
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-lime-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-montserrat max-w-3xl mx-auto">
            Dedicated online stores for schools, teams, and organizations. Easy ordering, custom branding, and bulk pricing — all in one place.
          </p>
        </div>

        {isPending && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-200 rounded-xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 font-montserrat mb-16">
            Error loading portals: {error.message}
          </div>
        )}

        {!isPending && !error && (!portals || portals.length === 0) && (
          <div className="text-center py-16 text-gray-400 mb-16">
            <div className="text-5xl mb-4">🏫</div>
            <p className="text-lg font-montserrat">No portals yet. Add portals in the <a href="/admin" className="text-lime-500 hover:underline">admin panel</a>.</p>
          </div>
        )}

        {!isPending && !error && portals && portals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {portals.map((portal) => (
              <PortalCard key={portal.id} portal={portal} onShop={setActivePortal} />
            ))}
          </div>
        )}

        {activePortal && (
          <PortalStorefront portal={activePortal} onClose={() => setActivePortal(null)} />
        )}

        {/* CTA Banner */}
        <div className="bg-black rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-lime-900/20 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold font-josefin_sans text-white mb-4">
              Want Your Own Portal?
            </h3>
            <p className="text-gray-300 font-montserrat mb-8 max-w-2xl mx-auto text-lg">
              We set up custom branded online stores for schools, sports teams, businesses, and organizations. No setup fees, easy management, and dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="inline-block bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-10 py-4 rounded-full font-bold text-lg hover:from-lime-300 hover:to-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Set Up Your Portal
              </a>
              <a href="#contact" className="inline-block border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
