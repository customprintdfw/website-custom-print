import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { ServicesSection } from "@/sections/ServicesSection";
import { WebToPrintPortals } from "@/sections/WebToPrintPortals";
import { ProductShowcase } from "@/sections/ProductShowcase";
import { SocialBlog } from "@/sections/SocialBlog";
import { ContactSection } from "@/sections/ContactSection";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CartSidebar } from "@/components/CartSidebar";
import { AdminPage } from "@/pages/AdminPage";
import { BlogPage } from "@/pages/BlogPage";
import { DesignStudio } from "@/pages/DesignStudio";
import type { Product } from "@animaapp/playground-react-sdk";

const MainSite = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ServicesSection />
      <WebToPrintPortals />
      <ProductShowcase onProductSelect={setSelectedProduct} />
      <SocialBlog />
      <ContactSection />
      <footer className="bg-black border-t border-gray-800 py-4 text-center">
        <p className="text-gray-400 font-montserrat text-sm">
          © Copyright 2026 CustomPrintDFW. All rights reserved.
        </p>
      </footer>
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CartSidebar />
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/design" element={<DesignStudio />} />
      </Routes>
    </BrowserRouter>
  );
};
