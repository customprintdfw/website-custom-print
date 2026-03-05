import { useState } from "react";
import { useAuth } from "@animaapp/playground-react-sdk";
import { ProductsAdmin } from "./components/ProductsAdmin";
import { ServicesAdmin } from "./components/ServicesAdmin";
import { PortalsAdmin } from "./components/PortalsAdmin";
import { OrdersAdmin } from "./components/OrdersAdmin";
import { PaymentsAdmin } from "./components/PaymentsAdmin";
import { WordPressAdmin } from "./components/WordPressAdmin";
import { LayoutTemplatesAdmin } from "./components/LayoutTemplatesAdmin";
import { LogOut, ArrowLeft, ShieldCheck } from "lucide-react";

type Tab = "products" | "services" | "portals" | "orders" | "payments" | "wordpress" | "layouts";

const TAB_CONFIG = [
  { id: "products" as Tab, label: "Products", emoji: "📦" },
  { id: "services" as Tab, label: "Services", emoji: "⚙️" },
  { id: "portals" as Tab, label: "Portals", emoji: "🏫" },
  { id: "orders" as Tab, label: "Orders", emoji: "🛒" },
  { id: "payments" as Tab, label: "Payments", emoji: "💳" },
  { id: "wordpress" as Tab, label: "Blog / WP", emoji: "📝" },
  { id: "layouts" as Tab, label: "Layouts", emoji: "🎨" },
];

export const AdminPage = () => {
  const { user, isPending, isAnonymous, login, logout } = useAuth({ requireAuth: true });
  const [activeTab, setActiveTab] = useState<Tab>("products");

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-montserrat">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isAnonymous) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center border-2 border-lime-400">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <img
            src="https://c.animaapp.com/mm19g6djl5wbUX/img/uploaded-asset-1771977209008-0.png"
            alt="CustomPrint DFW"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold font-josefin_sans text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 font-montserrat mb-8">Sign in to manage your products, services, and portals.</p>
          <button
            onClick={login}
            className="w-full bg-gradient-to-r from-lime-400 to-yellow-400 text-black py-3.5 rounded-xl font-bold font-montserrat text-lg hover:from-lime-300 hover:to-yellow-300 transition-all shadow-lg"
          >
            Sign In
          </button>
          <a href="/" className="block mt-4 text-gray-500 hover:text-gray-300 font-montserrat text-sm transition-colors">
            ← Back to Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black border-b-4 border-lime-400 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img
                src="https://c.animaapp.com/mm19g6djl5wbUX/img/uploaded-asset-1771977209008-0.png"
                alt="CustomPrint DFW"
                className="h-12 w-auto"
              />
              <div>
                <span className="text-lime-400 font-bold font-josefin_sans text-lg block leading-tight">Admin Panel</span>
                <span className="text-gray-500 font-montserrat text-xs">CustomPrint DFW</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white font-montserrat text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Site
              </a>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-white font-montserrat text-sm font-semibold">{user.name || user.email}</p>
                    <p className="text-gray-500 font-montserrat text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold font-montserrat text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold font-montserrat text-sm transition-all border-b-4 ${
                  activeTab === tab.id
                    ? "border-lime-400 text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "products" && <ProductsAdmin />}
        {activeTab === "services" && <ServicesAdmin />}
        {activeTab === "portals" && <PortalsAdmin />}
        {activeTab === "orders" && <OrdersAdmin />}
        {activeTab === "payments" && <PaymentsAdmin />}
        {activeTab === "wordpress" && <WordPressAdmin />}
        {activeTab === "layouts" && <LayoutTemplatesAdmin />}
      </div>
    </div>
  );
};
