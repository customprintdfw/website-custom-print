import { useQuery } from "@animaapp/playground-react-sdk";
import type { Product } from "@animaapp/playground-react-sdk";

interface ProductShowcaseProps {
  onProductSelect: (product: Product) => void;
}

export const ProductShowcase = ({ onProductSelect }: ProductShowcaseProps) => {
  const { data: products, isPending, error } = useQuery("Product");

  return (
    <div id="products" className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-josefin_sans text-black mb-4">
            Featured Products
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-lime-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-montserrat max-w-2xl mx-auto">
            Browse our popular products — click any item to configure and order
          </p>
        </div>

        {isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 font-montserrat">
            Error loading products: {error.message}
          </div>
        )}

        {!isPending && !error && (!products || products.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-lg font-montserrat">No products yet. Add products in the <a href="/admin" className="text-lime-500 hover:underline">admin panel</a>.</p>
          </div>
        )}

        {!isPending && !error && products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-lime-400 cursor-pointer group"
                onClick={() => onProductSelect(product)}
              >
                <div className="aspect-square overflow-hidden bg-gray-200 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-bold font-montserrat text-sm bg-black/60 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold font-josefin_sans text-black mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 font-montserrat text-sm mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-lime-500">{product.price}</span>
                    <button
                      className="bg-gradient-to-r from-blue-600 to-lime-400 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-lime-500 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={(e) => { e.stopPropagation(); onProductSelect(product); }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
