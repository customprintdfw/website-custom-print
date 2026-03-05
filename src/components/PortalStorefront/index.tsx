import { useState } from "react";
import { X, ShoppingCart, Tag, Check } from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Portal, PortalProduct } from "@animaapp/playground-react-sdk";
import { sendOrderEmail } from "../../utils/sendOrderEmail";
import { usePaymentSettings } from "../../hooks/usePaymentSettings";
import { PaymentButton } from "../PaymentButton";

interface PortalStorefrontProps {
  portal: Portal;
  onClose: () => void;
}

const CATEGORY_ALL = "All";

// Map common color names → CSS hex for swatches
const COLOR_SWATCHES: Record<string, string> = {
  "Black": "#111827",
  "White": "#F9FAFB",
  "Red": "#DC2626",
  "Navy": "#1E3A5F",
  "Royal Blue": "#2563EB",
  "Gray": "#6B7280",
  "Grey": "#6B7280",
  "Green": "#16A34A",
  "Yellow": "#EAB308",
  "Orange": "#EA580C",
  "Purple": "#7C3AED",
  "Pink": "#EC4899",
  "Maroon": "#7F1D1D",
  "Gold": "#D97706",
  "Brown": "#92400E",
  "Tan": "#D4A574",
  "Light Blue": "#38BDF8",
  "Sky Blue": "#0EA5E9",
  "Teal": "#0D9488",
  "Lime": "#84CC16",
  "Coral": "#F97316",
  "Burgundy": "#881337",
  "Forest Green": "#166534",
  "Charcoal": "#374151",
  "Silver": "#9CA3AF",
};

function parseOpts(val?: string): string[] {
  return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// ── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  onOrder,
}: {
  product: PortalProduct;
  onOrder: (p: PortalProduct) => void;
}) => {
  const sizeCount = parseOpts(product.availableSizes).length;
  const colorCount = parseOpts(product.availableColors).length;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.category && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
            {product.category}
          </span>
        )}
        {product.minQty && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
            Min {product.minQty}
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-bold font-josefin_sans text-base leading-tight mb-1">{product.name}</h4>
        {product.description && (
          <p className="text-gray-500 text-xs font-montserrat line-clamp-2 mb-2">{product.description}</p>
        )}
        {(sizeCount > 0 || colorCount > 0) && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {sizeCount > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full font-montserrat">
                {sizeCount} sizes
              </span>
            )}
            {colorCount > 0 && (
              <span className="text-xs bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded-full font-montserrat">
                {colorCount} colors
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lime-600 font-bold text-lg font-montserrat">{product.price}</span>
          <button
            onClick={() => onOrder(product)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-lime-400 text-white px-4 py-2 rounded-full text-sm font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow hover:shadow-md"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Order Modal ───────────────────────────────────────────────────────────────
const OrderModal = ({
  product,
  portal,
  onClose,
}: {
  product: PortalProduct;
  portal: Portal;
  onClose: () => void;
}) => {
  const sizes = parseOpts(product.availableSizes);
  const colors = parseOpts(product.availableColors);
  const styles = parseOpts(product.availableStyles);
  const printLocs = parseOpts(product.printLocations);
  const printTypes = parseOpts(product.printTypes);
  const minQty = product.minQty ? Math.max(1, parseInt(product.minQty) || 1) : 1;

  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [style, setStyle] = useState(styles[0] || "");
  const [printLocation, setPrintLocation] = useState(printLocs[0] || "");
  const [printType, setPrintType] = useState(printTypes[0] || "");
  const [qty, setQty] = useState(minQty);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment">("form");

  const { create, isPending } = useMutation("Order");
  const { settings, isEnabled: isPaymentEnabled } = usePaymentSettings();

  // Calculate total amount for payment
  const unitPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const totalAmount = (unitPrice * qty).toFixed(2);

  const submitOrder = async (paymentDetails?: any) => {
    setSubmitError(null);
    try {
      const paymentNote = paymentDetails
        ? `[Payment: ${settings?.provider?.toUpperCase()} | Ref: ${paymentDetails?.id || paymentDetails?.token || 'N/A'}]`
        : '';
      const finalNotes = [notes, paymentNote].filter(Boolean).join('\n') || undefined;

      await create({
        type: "portal",
        status: "new",
        customerName: name,
        customerEmail: email,
        productName: product.name,
        price: product.price,
        quantity: String(qty),
        portalId: portal.id,
        portalName: portal.name,
        productId: product.id,
        size: size || undefined,
        color: color || undefined,
        style: style || undefined,
        printLocation: printLocation || undefined,
        printType: printType || undefined,
        category: product.category,
        notes: finalNotes,
        paymentProvider: paymentDetails ? settings?.provider : undefined,
        paymentReference: paymentDetails?.id || paymentDetails?.token || undefined,
      });

      sendOrderEmail({
        type: "portal",
        customerName: name,
        customerEmail: email,
        productName: product.name,
        price: product.price,
        quantity: String(qty),
        portalName: portal.name,
        size: size || undefined,
        color: color || undefined,
        style: style || undefined,
        printLocation: printLocation || undefined,
        printType: printType || undefined,
        category: product.category,
        notes: notes || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to place order. Please try again.");
      setStep("form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (isPaymentEnabled && settings) {
      setStep("payment");
      return;
    }
    await submitOrder();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-xl font-bold font-josefin_sans">Order Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Success ── */}
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-black" />
            </div>
            <h4 className="text-2xl font-bold font-josefin_sans mb-2">Order Received!</h4>
            <p className="text-gray-500 font-montserrat text-sm mb-6">
              We'll contact you shortly to confirm your order for{" "}
              <strong>{product.name}</strong> from the <strong>{portal.name}</strong> portal.
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-8 py-3 rounded-full font-bold font-montserrat hover:from-lime-300 hover:to-yellow-300 transition-all"
            >
              Done
            </button>
          </div>

        ) : step === "payment" ? (
          /* ── Payment Step ── */
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            <button
              onClick={() => { setSubmitError(null); setStep("form"); }}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-montserrat text-sm transition-colors"
            >
              ← Back to order details
            </button>

            <div>
              <h4 className="text-lg font-bold font-josefin_sans">Complete Payment</h4>
              <p className="text-gray-500 font-montserrat text-sm mt-1">Review your order and pay securely.</p>
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <div className="flex gap-3 items-center mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                />
                <div>
                  <p className="font-bold font-josefin_sans text-sm">{product.name}</p>
                  {size && <p className="text-gray-500 text-xs font-montserrat">Size: {size}</p>}
                  {color && <p className="text-gray-500 text-xs font-montserrat">Color: {color}</p>}
                </div>
              </div>
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-500">Qty</span>
                <span className="font-semibold">{qty}</span>
              </div>
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold">{name}</span>
              </div>
              <div className="flex justify-between text-sm font-montserrat border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-700 font-bold">Total</span>
                <span className="text-lime-600 font-bold text-lg">${totalAmount}</span>
              </div>
            </div>

            {settings && (
              <PaymentButton
                amount={totalAmount}
                settings={settings}
                onSuccess={(details) => submitOrder(details)}
                onError={(msg) => setSubmitError(msg)}
                onSkipPayment={() => submitOrder()}
              />
            )}

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
                {submitError}
              </div>
            )}
          </div>

        ) : (
          /* ── Order Form ── */
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-5">
              {/* Product preview */}
              <div className="flex gap-4 items-center bg-gray-50 rounded-xl p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div>
                  <p className="font-bold font-josefin_sans">{product.name}</p>
                  <p className="text-lime-600 font-bold font-montserrat">{product.price}</p>
                  {product.category && (
                    <p className="text-gray-400 text-xs font-montserrat">{product.category}</p>
                  )}
                </div>
              </div>

              {/* ── Size Selector ── */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">
                    Size <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold font-montserrat border-2 transition-all ${
                          size === s
                            ? "bg-black text-lime-400 border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Color Selector ── */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">
                    Color <span className="text-red-400">*</span>
                    {color && <span className="font-normal text-gray-500 ml-2">— {color}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const hex = COLOR_SWATCHES[c];
                      const isSelected = color === c;
                      const isLight = c === "White" || c === "Yellow" || c === "Gold" || c === "Tan" || c === "Silver";
                      return hex ? (
                        <button
                          key={c}
                          type="button"
                          title={c}
                          onClick={() => setColor(c)}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-lime-500 scale-110 shadow-md" : "border-gray-300 hover:border-gray-500"
                          }`}
                          style={{ backgroundColor: hex }}
                        >
                          {isSelected && (
                            <Check
                              className="w-4 h-4"
                              style={{ color: isLight ? "#111827" : "#ffffff" }}
                            />
                          )}
                        </button>
                      ) : (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold font-montserrat border-2 transition-all ${
                            isSelected
                              ? "bg-black text-lime-400 border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Style / Cut ── */}
              {styles.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-montserrat">
                    Style / Cut <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat bg-white transition-colors"
                  >
                    {styles.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* ── Print Location ── */}
              {printLocs.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-montserrat">
                    Print Location <span className="text-red-400">*</span>
                  </label>
                  {printLocs.length <= 5 ? (
                    <div className="flex flex-wrap gap-2">
                      {printLocs.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setPrintLocation(loc)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold font-montserrat border-2 transition-all ${
                            printLocation === loc
                              ? "bg-black text-lime-400 border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select
                      value={printLocation}
                      onChange={(e) => setPrintLocation(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat bg-white transition-colors"
                    >
                      {printLocs.map((loc) => <option key={loc}>{loc}</option>)}
                    </select>
                  )}
                </div>
              )}

              {/* ── Print Type ── */}
              {printTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-montserrat">
                    Print Type <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {printTypes.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPrintType(pt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold font-montserrat border-2 transition-all ${
                          printType === pt
                            ? "bg-gradient-to-r from-blue-600 to-lime-400 text-white border-transparent"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Quantity ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-montserrat">
                  Quantity
                  {product.minQty && (
                    <span className="text-gray-400 font-normal ml-1.5 text-xs">
                      (minimum: {product.minQty})
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(minQty, qty - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-gray-400 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={minQty}
                    max={9999}
                    value={qty}
                    onChange={(e) => setQty(Math.max(minQty, parseInt(e.target.value) || minQty))}
                    className="w-20 text-center px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat font-bold text-lg transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-gray-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ── Customer Info ── */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Notes / Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors"
                    placeholder="Artwork details, custom text, special requests…"
                  />
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
                  {submitError}
                </div>
              )}
            </div>

            {/* Sticky submit */}
            <div className="px-6 pb-6 flex-shrink-0">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3.5 rounded-xl font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order…
                  </>
                ) : isPaymentEnabled ? (
                  "Continue to Payment →"
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Place Order
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Storefront ────────────────────────────────────────────────────────────────
export const PortalStorefront = ({ portal, onClose }: PortalStorefrontProps) => {
  const { data: products, isPending, error } = useQuery("PortalProduct", {
    where: { portalId: portal.id },
    orderBy: { createdAt: "desc" },
  });

  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);
  const [orderingProduct, setOrderingProduct] = useState<PortalProduct | null>(null);

  const categories = products
    ? [CATEGORY_ALL, ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))]
    : [CATEGORY_ALL];

  const filtered = products
    ? activeCategory === CATEGORY_ALL
      ? products
      : products.filter((p) => p.category === activeCategory)
    : [];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-gray-50 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${portal.color} p-6 flex-shrink-0`}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className={`${portal.badgeBg} text-xs font-bold px-3 py-1 rounded-full font-montserrat`}>
                  {portal.badge}
                </span>
                <h2 className="text-3xl font-bold font-josefin_sans text-white mt-2 drop-shadow">
                  {portal.name}
                </h2>
                <p className="text-white/80 font-montserrat text-sm mt-1">{portal.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2 overflow-x-auto flex-shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold font-montserrat whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-black text-lime-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat !== CATEGORY_ALL && <Tag className="w-3 h-3" />}
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          <div className="flex-1 overflow-y-auto p-6">
            {isPending && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500 font-montserrat">
                Error: {error.message}
              </div>
            )}

            {!isPending && !error && filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-montserrat font-semibold">No products available yet</p>
                <p className="text-sm mt-2 font-montserrat">
                  Check back soon or contact us to place a custom order.
                </p>
              </div>
            )}

            {!isPending && !error && filtered.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onOrder={setOrderingProduct} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <p className="text-gray-500 font-montserrat text-sm">
              {!isPending && filtered.length > 0 && `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </p>
            <a
              href="#contact"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 font-montserrat text-sm font-semibold transition-colors"
            >
              Need something custom? Contact us →
            </a>
          </div>
        </div>
      </div>

      {orderingProduct && (
        <OrderModal
          product={orderingProduct}
          portal={portal}
          onClose={() => setOrderingProduct(null)}
        />
      )}
    </>
  );
};
