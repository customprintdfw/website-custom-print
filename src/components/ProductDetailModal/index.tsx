import { useState } from "react";
import { X, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, Check, HelpCircle, ShoppingCart } from "lucide-react";
import { useMutation } from "@animaapp/playground-react-sdk";
import type { Product } from "@animaapp/playground-react-sdk";
import { sendOrderEmail } from "../../utils/sendOrderEmail";
import { usePaymentSettings } from "../../hooks/usePaymentSettings";
import { PaymentButton } from "../PaymentButton";
import { useCart } from "../../context/CartContext";
import { calculatePrice, calculateSqftPrice } from "../../utils/pricingCalculator";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
type OptionKey = "size" | "paper" | "quantity" | "color" | "coating" | "cardSlit" | "productionTime";

const parseEnabledOptions = (raw: string | undefined): Set<OptionKey> => {
  const ALL: OptionKey[] = ["size", "paper", "quantity", "color", "coating", "cardSlit", "productionTime"];
  if (!raw) return new Set(ALL);
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean) as OptionKey[]);
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const SelectField = ({
  label,
  value,
  options,
  onChange,
  showHelp,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  showHelp?: boolean;
}) => (
  <div className="relative border border-gray-300 rounded-lg px-4 pt-5 pb-3 hover:border-lime-400 transition-colors">
    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-montserrat font-semibold">
      {label}
    </label>
    <div className="flex items-center justify-between">
      <span className="font-montserrat text-sm text-gray-800">{value}</span>
      <div className="flex items-center gap-1.5">
        {showHelp && <HelpCircle className="w-4 h-4 text-gray-400" />}
        <Check className="w-5 h-5 text-green-500" />
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
    <select
      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

type OrderFormState = "idle" | "collecting" | "payment" | "submitting" | "success" | "error" | "added";

// ── Main Component ─────────────────────────────────────────────────────────────
export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState('9" x 12" Standard');
  const [paper, setPaper] = useState("14 pt. Gloss");
  const [quantity, setQuantity] = useState("100");
  const [color, setColor] = useState("Full Color Front (Outside), No Back (Inside)");
  const [coating, setCoating] = useState("High Gloss UV Coating Front");
  const [cardSlit, setCardSlit] = useState("no-slit");
  const [productionTime, setProductionTime] = useState("regular");

  // Sq ft inputs
  const [sqftWidth, setSqftWidth] = useState("24");
  const [sqftHeight, setSqftHeight] = useState("36");
  const [sqftQty, setSqftQty] = useState("1");

  const [orderState, setOrderState] = useState<OrderFormState>("idle");
  const [orderType, setOrderType] = useState<"upload" | "design">("upload");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { create } = useMutation("Order");
  const { settings, isEnabled: isPaymentEnabled } = usePaymentSettings();
  const { addItem } = useCart();

  if (!product) return null;

  const enabled = parseEnabledOptions(product.enabledOptions);
  const has = (key: OptionKey) => enabled.has(key);

  const thumbnails = [product.image, product.image, product.image];

  const isSqft = product.sqftEnabled === "true";

  const qty = parseInt(quantity);
  const sqftW = parseFloat(sqftWidth) || 0;
  const sqftH = parseFloat(sqftHeight) || 0;
  const sqftQtyNum = parseInt(sqftQty) || 1;

  const sqftPricing = isSqft
    ? calculateSqftPrice(product, sqftW, sqftH, sqftQtyNum, has("productionTime") ? productionTime : "regular")
    : null;

  const pricing = !isSqft
    ? calculatePrice(
        product,
        qty,
        has("size") ? size : "",
        has("color") ? color : "",
        has("coating") ? coating : "",
        has("productionTime") ? productionTime : "regular"
      )
    : null;

  const subtotal = isSqft
    ? (sqftPricing!.subtotal.toFixed(2))
    : pricing!.subtotal.toFixed(2);
  const originalSubtotal = !isSqft ? pricing!.originalSubtotal.toFixed(2) : subtotal;

  const handleAddToCart = () => {
    addItem({
      product,
      quantity: isSqft ? String(sqftQtyNum) : (has("quantity") ? quantity : "1"),
      size: isSqft
        ? `${sqftWidth}" × ${sqftHeight}" (${sqftPricing!.effectiveSqft.toFixed(2)} sq ft)`
        : (has("size") ? size : undefined),
      paper: has("paper") ? paper : undefined,
      color: has("color") ? color : undefined,
      coating: has("coating") ? coating : undefined,
      cardSlit: has("cardSlit") ? cardSlit : undefined,
      productionTime: has("productionTime") ? productionTime : undefined,
      subtotal,
    });
    setOrderState("added");
    setTimeout(() => {
      onClose();
      setOrderState("idle");
    }, 1200);
  };

  const handleOrderClick = (type: "upload" | "design") => {
    if (type === "design") {
      // Navigate to design studio
      const params = new URLSearchParams({
        productId: product.id,
        productName: product.name,
      });
      window.location.href = `/design?${params.toString()}`;
      return;
    }
    setOrderType(type);
    setOrderState("collecting");
  };

  const submitOrder = async (paymentDetails?: any) => {
    setOrderState("submitting");
    try {
      const paymentNote = paymentDetails
        ? `[Payment: ${settings?.provider?.toUpperCase()} | Ref: ${paymentDetails?.id || paymentDetails?.token || 'N/A'}]`
        : '';
      const finalNotes = [notes, paymentNote].filter(Boolean).join('\n') || undefined;

      const orderSize = isSqft
        ? `${sqftWidth}" × ${sqftHeight}" (${sqftPricing!.effectiveSqft.toFixed(2)} sq ft)`
        : (has("size") ? size : undefined);
      const orderQty = isSqft ? String(sqftQtyNum) : (has("quantity") ? quantity : "1");

      await create({
        type: "product",
        status: "new",
        customerName,
        customerEmail,
        productName: product.name,
        productId: product.id,
        price: `$${subtotal}`,
        quantity: orderQty,
        size: orderSize,
        paper: has("paper") ? paper : undefined,
        color: has("color") ? color : undefined,
        coating: has("coating") ? coating : undefined,
        cardSlit: has("cardSlit") ? cardSlit : undefined,
        productionTime: has("productionTime") ? productionTime : undefined,
        notes: finalNotes,
        paymentProvider: paymentDetails ? settings?.provider : undefined,
        paymentReference: paymentDetails?.id || paymentDetails?.token || undefined,
      });

      sendOrderEmail({
        type: "product",
        customerName,
        customerEmail,
        productName: product.name,
        price: `$${subtotal}`,
        quantity: orderQty,
        size: orderSize,
        paper: has("paper") ? paper : undefined,
        color: has("color") ? color : undefined,
        coating: has("coating") ? coating : undefined,
        cardSlit: has("cardSlit") ? cardSlit : undefined,
        productionTime: has("productionTime") ? productionTime : undefined,
        notes,
      });

      setOrderState("success");
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to place order. Please try again.");
      setOrderState("error");
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (isPaymentEnabled && settings) {
      setOrderState("payment");
      return;
    }
    await submitOrder();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold font-josefin_sans text-black">{product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* ── Success ── */}
        {orderState === "success" ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-3xl font-bold font-josefin_sans mb-3">Order Received!</h3>
            <p className="text-gray-500 font-montserrat mb-2">
              Thanks, <strong>{customerName}</strong>! Your order for{" "}
              <strong>{product.name}</strong> has been placed.
            </p>
            <p className="text-gray-400 font-montserrat text-sm mb-8">
              We'll reach out to <strong>{customerEmail}</strong> to confirm details and next steps.
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-10 py-3.5 rounded-full font-bold font-montserrat hover:from-lime-300 hover:to-yellow-300 transition-all shadow-md"
            >
              Done
            </button>
          </div>

        ) : orderState === "payment" ? (
          /* ── Payment Step ── */
          <div className="p-6 max-w-lg mx-auto">
            <button
              onClick={() => { setSubmitError(null); setOrderState("collecting"); }}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-montserrat text-sm mb-6 transition-colors"
            >
              ← Back to order details
            </button>
            <h3 className="text-xl font-bold font-josefin_sans mb-1">Complete Payment</h3>
            <p className="text-gray-500 font-montserrat text-sm mb-6">
              Review your order and pay securely below.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5">
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-500">Product</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              {has("size") && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-gray-500">Size</span>
                  <span className="font-semibold">{size}</span>
                </div>
              )}
              {has("quantity") && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-gray-500">Qty</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm font-montserrat border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-700 font-bold">Total</span>
                <span className="text-blue-600 font-bold text-lg">${subtotal}</span>
              </div>
            </div>

            {settings && (
              <PaymentButton
                amount={subtotal}
                settings={settings}
                onSuccess={(details) => submitOrder(details)}
                onError={(msg) => setSubmitError(msg)}
                onSkipPayment={() => submitOrder()}
              />
            )}

            {submitError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
                {submitError}
              </div>
            )}
          </div>

        ) : orderState === "collecting" || orderState === "submitting" || orderState === "error" ? (
          /* ── Order Form ── */
          <div className="p-6 max-w-lg mx-auto">
            <button
              onClick={() => setOrderState("idle")}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-montserrat text-sm mb-6 transition-colors"
            >
              ← Back to configuration
            </button>
            <h3 className="text-xl font-bold font-josefin_sans mb-1">Complete Your Order</h3>
            <p className="text-gray-500 font-montserrat text-sm mb-6">
              {orderType === "upload" ? "Upload your design after we confirm." : "We'll help you design online."}
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5">
              <div className="flex justify-between text-sm font-montserrat">
                <span className="text-gray-500">Product</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              {has("size") && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-gray-500">Size</span>
                  <span className="font-semibold">{size}</span>
                </div>
              )}
              {has("quantity") && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-gray-500">Qty</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
              )}
              {has("productionTime") && (
                <div className="flex justify-between text-sm font-montserrat">
                  <span className="text-gray-500">Production</span>
                  <span className="font-semibold capitalize">{productionTime}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-montserrat border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-700 font-bold">Subtotal</span>
                <span className="text-blue-600 font-bold">${subtotal}</span>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Your Name *</label>
                <input
                  type="text" required value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={orderState === "submitting"}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors disabled:opacity-60"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Email *</label>
                <input
                  type="email" required value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={orderState === "submitting"}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors disabled:opacity-60"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Notes / Artwork Instructions</label>
                <textarea
                  rows={3} value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={orderState === "submitting"}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors disabled:opacity-60"
                  placeholder="Any special requests, colors, or artwork notes..."
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={orderState === "submitting"}
                className="w-full bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3.5 rounded-xl font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderState === "submitting" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : isPaymentEnabled ? (
                  "Continue to Payment →"
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>

        ) : (
          /* ── Main Configuration View ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left: Image Gallery */}
            <div>
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square mb-3 group">
                <img
                  src={thumbnails[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 hover:bg-white transition-colors shadow font-montserrat">
                  <ZoomIn className="w-3.5 h-3.5" /> View Larger
                </button>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors shadow opacity-0 group-hover:opacity-100"
                  onClick={() => setSelectedImage((i) => (i - 1 + thumbnails.length) % thumbnails.length)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors shadow opacity-0 group-hover:opacity-100"
                  onClick={() => setSelectedImage((i) => (i + 1) % thumbnails.length)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3">
                {thumbnails.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === i
                        ? "border-lime-400 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {product.description && (
                <p className="mt-4 text-gray-600 font-montserrat text-sm leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Right: Configuration */}
            <div className="space-y-4">
              {/* ── Sq Ft Inputs (replaces size when sqft mode is on) ── */}
              {isSqft ? (
                <div className="border border-gray-300 rounded-lg px-4 pt-5 pb-4 space-y-3">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-500 font-montserrat font-semibold hidden">
                    Dimensions
                  </label>
                  <p className="text-xs font-semibold text-gray-500 font-montserrat uppercase tracking-wide">
                    📐 Dimensions (inches)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 font-montserrat mb-1">Width (in)</label>
                      <input
                        type="number" min="1" step="0.5"
                        value={sqftWidth}
                        onChange={(e) => setSqftWidth(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-montserrat mb-1">Height (in)</label>
                      <input
                        type="number" min="1" step="0.5"
                        value={sqftHeight}
                        onChange={(e) => setSqftHeight(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                        placeholder="36"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-montserrat mb-1">Qty</label>
                      <input
                        type="number" min="1"
                        value={sqftQty}
                        onChange={(e) => setSqftQty(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                        placeholder="1"
                      />
                    </div>
                  </div>
                  {sqftPricing && sqftW > 0 && sqftH > 0 && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs font-montserrat text-blue-700 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{sqftPricing.sqftPerPiece.toFixed(3)} sq ft/piece</span>
                      <span>×{sqftQtyNum} = {sqftPricing.totalSqft.toFixed(3)} sq ft</span>
                      {sqftPricing.effectiveSqft > sqftPricing.totalSqft && (
                        <span className="text-orange-600 font-semibold">
                          Min {sqftPricing.effectiveSqft.toFixed(2)} sq ft applied
                        </span>
                      )}
                      <span className="font-bold">@ ${sqftPricing.pricePerSqft.toFixed(2)}/sq ft</span>
                    </div>
                  )}
                </div>
              ) : has("size") && (
                <SelectField
                  label="Size"
                  value={size}
                  options={['9" x 12" Standard', '8.5" x 11" Letter', '11" x 17" Tabloid', '5" x 7" Half Sheet']}
                  onChange={setSize}
                />
              )}

              {has("paper") && (
                <div className="relative">
                  <SelectField
                    label="Paper"
                    value={paper}
                    options={["14 pt. Gloss", "16 pt. Matte", "100 lb. Silk", "80 lb. Uncoated"]}
                    onChange={setPaper}
                  />
                  <button className="absolute -top-2.5 right-3 bg-white px-1 text-xs text-blue-500 font-montserrat hover:underline">
                    Paper Thickness
                  </button>
                </div>
              )}

              {!isSqft && has("quantity") && (
                <SelectField
                  label="Quantity"
                  value={quantity}
                  options={["25", "50", "100", "250", "500", "1000", "2500"]}
                  onChange={setQuantity}
                />
              )}

              {has("color") && (
                <SelectField
                  label="Color"
                  value={color}
                  options={[
                    "Full Color Front (Outside), No Back (Inside)",
                    "Full Color Both Sides",
                    "Black & White Front Only",
                    "Black & White Both Sides",
                  ]}
                  onChange={setColor}
                />
              )}

              {has("coating") && (
                <SelectField
                  label="Coating"
                  value={coating}
                  options={["High Gloss UV Coating Front", "Matte Coating Front", "No Coating", "Soft Touch Matte"]}
                  onChange={setCoating}
                  showHelp
                />
              )}

              {has("cardSlit") && (
                <div className="border border-gray-300 rounded-lg px-4 pt-5 pb-3">
                  <label className="block text-xs text-gray-500 font-montserrat font-semibold mb-3">
                    Card Slit
                  </label>
                  <div className="flex gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="slit" value="no-slit"
                        checked={cardSlit === "no-slit"}
                        onChange={() => setCardSlit("no-slit")}
                        className="accent-lime-500 w-4 h-4"
                      />
                      <span className="font-montserrat text-sm">No Slit</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="slit" value="right-slit"
                        checked={cardSlit === "right-slit"}
                        onChange={() => setCardSlit("right-slit")}
                        className="accent-lime-500 w-4 h-4"
                      />
                      <span className="font-montserrat text-sm">Right Pocket Slit</span>
                    </label>
                  </div>
                </div>
              )}

              {has("productionTime") && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold font-montserrat text-gray-800">Production Time</span>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-300">
                    <button
                      onClick={() => setProductionTime("regular")}
                      className={`py-3 text-center transition-all ${
                        productionTime === "regular"
                          ? "bg-lime-400 text-black"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <div className="font-montserrat font-bold text-sm">Regular</div>
                      <div className="font-montserrat text-xs mt-0.5">3-5 Business Days</div>
                    </button>
                    <button
                      onClick={() => setProductionTime("rush")}
                      className={`py-3 text-center transition-all ${
                        productionTime === "rush"
                          ? "bg-lime-400 text-black"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <div className="font-montserrat font-bold text-sm">Rush</div>
                      <div className="font-montserrat text-xs mt-0.5">1-2 Business Days</div>
                    </button>
                  </div>
                </div>
              )}

              {["Process Type", "Estimated Shipping"].map((label) => (
                <div
                  key={label}
                  className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <span className="font-montserrat text-sm text-gray-700">{label}</span>
                  <div className="flex items-center gap-2">
                    {label === "Estimated Shipping" && <HelpCircle className="w-4 h-4 text-gray-400" />}
                    <span className="text-gray-400 text-lg font-light">+</span>
                  </div>
                </div>
              ))}

              <div className="border-t-2 border-gray-100 pt-4 space-y-3">
                {/* Price Breakdown — Sq Ft Mode */}
                {isSqft && sqftPricing && sqftW > 0 && sqftH > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs font-montserrat space-y-1">
                    <p className="font-bold text-gray-600 mb-1.5">📐 Sq Ft Price Breakdown</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Dimensions</span>
                      <span className="font-semibold">{sqftWidth}" × {sqftHeight}"</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Sq ft / piece</span>
                      <span>{sqftPricing.sqftPerPiece.toFixed(3)} sq ft</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>× {sqftQtyNum} piece{sqftQtyNum !== 1 ? "s" : ""}</span>
                      <span>{sqftPricing.totalSqft.toFixed(3)} sq ft</span>
                    </div>
                    {sqftPricing.effectiveSqft > sqftPricing.totalSqft && (
                      <div className="flex justify-between text-orange-600">
                        <span>Min sq ft floor</span>
                        <span className="font-semibold">{sqftPricing.effectiveSqft.toFixed(2)} sq ft billed</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Rate</span>
                      <span>${sqftPricing.pricePerSqft.toFixed(2)}/sq ft</span>
                    </div>
                    {sqftPricing.rushFee > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Rush fee</span>
                        <span>+${sqftPricing.rushFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown — Standard Mode */}
                {!isSqft && pricing && (pricing.hasTiers || pricing.hasUpcharges || pricing.rushFee > 0) && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs font-montserrat space-y-1">
                    <p className="font-bold text-gray-600 mb-1.5">Price Breakdown</p>
                    <div className="flex justify-between text-gray-600">
                      <span>{pricing.hasTiers ? `${qty}-unit tier` : "Base price"}</span>
                      <span>${pricing.baseUnitPrice.toFixed(2)}/unit</span>
                    </div>
                    {pricing.sizeAdj !== 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Size adj.</span>
                        <span className={pricing.sizeAdj > 0 ? "text-orange-600" : "text-green-600"}>
                          {pricing.sizeAdj > 0 ? "+" : ""}${pricing.sizeAdj.toFixed(2)}/unit
                        </span>
                      </div>
                    )}
                    {pricing.colorAdj !== 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Color adj.</span>
                        <span className={pricing.colorAdj > 0 ? "text-orange-600" : "text-green-600"}>
                          {pricing.colorAdj > 0 ? "+" : ""}${pricing.colorAdj.toFixed(2)}/unit
                        </span>
                      </div>
                    )}
                    {pricing.coatingAdj !== 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Coating adj.</span>
                        <span className={pricing.coatingAdj > 0 ? "text-orange-600" : "text-green-600"}>
                          {pricing.coatingAdj > 0 ? "+" : ""}${pricing.coatingAdj.toFixed(2)}/unit
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-700 font-semibold border-t border-blue-100 pt-1 mt-1">
                      <span>× {qty} units</span>
                      <span>${(pricing.perUnitPrice * qty).toFixed(2)}</span>
                    </div>
                    {pricing.rushFee > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Rush fee (flat)</span>
                        <span>+${pricing.rushFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-montserrat text-sm text-gray-600 font-semibold">
                    Subtotal (excludes shipping):
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {!isSqft && pricing && pricing.savings > 0 && (
                      <span className="text-gray-400 line-through font-montserrat text-sm">
                        ${originalSubtotal}
                      </span>
                    )}
                    <span className="text-blue-600 font-bold text-xl font-montserrat">${subtotal}</span>
                    {!isSqft && pricing && pricing.discountPct > 0 && (
                      <span className="bg-lime-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        -{pricing.discountPct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={orderState === "added"}
                  className={`w-full py-3.5 rounded-full font-bold font-montserrat transition-all shadow-md flex items-center justify-center gap-2 ${
                    orderState === "added"
                      ? "bg-green-500 text-white scale-95"
                      : "bg-gradient-to-r from-lime-400 to-yellow-400 text-black hover:from-lime-300 hover:to-yellow-300 hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {orderState === "added" ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOrderClick("upload")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-bold font-montserrat text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Upload Design
                  </button>
                  <button
                    onClick={() => handleOrderClick("design")}
                    className="bg-black text-lime-400 border-2 border-lime-400 py-3 rounded-full font-bold font-montserrat text-sm hover:bg-lime-400 hover:text-black transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Design Online
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
