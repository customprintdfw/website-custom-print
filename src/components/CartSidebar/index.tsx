import { useState } from "react";
import { X, ShoppingCart, Trash2, ChevronRight, Check } from "lucide-react";
import { useMutation } from "@animaapp/playground-react-sdk";
import { useCart } from "../../context/CartContext";
import { usePaymentSettings } from "../../hooks/usePaymentSettings";
import { PaymentButton } from "../PaymentButton";
import { sendOrderEmail } from "../../utils/sendOrderEmail";

type CheckoutState = "cart" | "form" | "payment" | "submitting" | "success" | "error";

export const CartSidebar = () => {
  const { items, isOpen, closeCart, removeItem, clearCart, totalPrice } = useCart();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { create } = useMutation("Order");
  const { settings, isEnabled: isPaymentEnabled } = usePaymentSettings();

  const handleClose = () => {
    closeCart();
    setTimeout(() => {
      if (checkoutState === "success") {
        setCheckoutState("cart");
        setCustomerName("");
        setCustomerEmail("");
        setNotes("");
        setSubmitError(null);
      }
    }, 300);
  };

  const submitOrders = async (paymentDetails?: any) => {
    setCheckoutState("submitting");
    try {
      for (const item of items) {
        await create({
          type: "product",
          status: "new",
          customerName,
          customerEmail,
          productName: item.product.name,
          productId: item.product.id,
          price: `$${item.subtotal}`,
          quantity: item.quantity,
          size: item.size,
          paper: item.paper,
          color: item.color,
          coating: item.coating,
          cardSlit: item.cardSlit,
          productionTime: item.productionTime,
          notes: notes || undefined,
          paymentProvider: paymentDetails ? settings?.provider : undefined,
          paymentReference: paymentDetails?.id || paymentDetails?.token || undefined,
        });

        sendOrderEmail({
          type: "product",
          customerName,
          customerEmail,
          productName: item.product.name,
          price: `$${item.subtotal}`,
          quantity: item.quantity,
          size: item.size,
          paper: item.paper,
          color: item.color,
          coating: item.coating,
          cardSlit: item.cardSlit,
          productionTime: item.productionTime,
          notes,
        });
      }
      clearCart();
      setCheckoutState("success");
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to place order. Please try again.");
      setCheckoutState("error");
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (isPaymentEnabled && settings) {
      setCheckoutState("payment");
    } else {
      submitOrders();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black border-b-4 border-lime-400">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-lime-400" />
            <h2 className="text-xl font-bold font-josefin_sans text-white">
              {checkoutState === "success"
                ? "Order Placed! 🎉"
                : `Your Cart (${items.length})`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Success ── */}
          {checkoutState === "success" ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold font-josefin_sans mb-3">Orders Received!</h3>
              <p className="text-gray-500 font-montserrat mb-2">
                Thanks, <strong>{customerName}</strong>! Your orders have been placed.
              </p>
              <p className="text-gray-400 font-montserrat text-sm mb-8">
                We'll reach out to <strong>{customerEmail}</strong> to confirm details and next steps.
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-10 py-3.5 rounded-full font-bold font-montserrat hover:from-lime-300 hover:to-yellow-300 transition-all shadow-md"
              >
                Done
              </button>
            </div>

          ) : checkoutState === "payment" ? (
            /* ── Payment Step ── */
            <div className="p-6">
              <button
                onClick={() => { setSubmitError(null); setCheckoutState("form"); }}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-montserrat text-sm mb-6 transition-colors"
              >
                ← Back to order details
              </button>
              <h3 className="text-xl font-bold font-josefin_sans mb-1">Complete Payment</h3>
              <p className="text-gray-500 font-montserrat text-sm mb-6">
                Review your order and pay securely below.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5">
                {items.map((item) => (
                  <div key={item.cartId} className="flex justify-between text-sm font-montserrat">
                    <span className="text-gray-500 truncate pr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0">${item.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-montserrat border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-700 font-bold">Total</span>
                  <span className="text-blue-600 font-bold text-lg">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {settings && (
                <PaymentButton
                  amount={totalPrice.toFixed(2)}
                  settings={settings}
                  onSuccess={(details) => submitOrders(details)}
                  onError={(msg) => setSubmitError(msg)}
                  onSkipPayment={() => submitOrders()}
                />
              )}

              {submitError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-montserrat">
                  {submitError}
                </div>
              )}
            </div>

          ) : checkoutState === "form" || checkoutState === "submitting" || checkoutState === "error" ? (
            /* ── Checkout Form ── */
            <div className="p-6">
              <button
                onClick={() => { setSubmitError(null); setCheckoutState("cart"); }}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-montserrat text-sm mb-6 transition-colors"
              >
                ← Back to cart
              </button>
              <h3 className="text-xl font-bold font-josefin_sans mb-1">Checkout</h3>
              <p className="text-gray-500 font-montserrat text-sm mb-6">
                Enter your details to complete your order.
              </p>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5">
                {items.map((item) => (
                  <div key={item.cartId} className="flex justify-between text-sm font-montserrat">
                    <span className="text-gray-500 truncate pr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0">${item.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-montserrat border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-700 font-bold">Total</span>
                  <span className="text-blue-600 font-bold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={checkoutState === "submitting"}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors disabled:opacity-60"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={checkoutState === "submitting"}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors disabled:opacity-60"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Notes / Artwork Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={checkoutState === "submitting"}
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
                  disabled={checkoutState === "submitting"}
                  className="w-full bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3.5 rounded-xl font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutState === "submitting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Orders...
                    </>
                  ) : isPaymentEnabled ? (
                    "Continue to Payment →"
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>
            </div>

          ) : items.length === 0 ? (
            /* ── Empty Cart ── */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingCart className="w-20 h-20 text-gray-200 mb-4" />
              <p className="text-gray-400 font-montserrat text-lg font-semibold">Your cart is empty</p>
              <p className="text-gray-300 font-montserrat text-sm mt-1">
                Configure a product and click "Add to Cart"
              </p>
            </div>

          ) : (
            /* ── Cart Items ── */
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.cartId} className="bg-gray-50 rounded-xl p-4 flex gap-3 border border-gray-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold font-josefin_sans text-sm text-black leading-tight">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 font-montserrat mt-1 space-y-0.5">
                      {item.size && <div>Size: {item.size}</div>}
                      {item.quantity && <div>Qty: {item.quantity}</div>}
                      {item.paper && <div>Paper: {item.paper}</div>}
                      {item.productionTime && (
                        <div className="capitalize">Production: {item.productionTime}</div>
                      )}
                    </div>
                    <div className="text-blue-600 font-bold font-montserrat text-sm mt-1.5">
                      ${item.subtotal}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only shown on cart view with items */}
        {checkoutState === "cart" && items.length > 0 && (
          <div className="border-t-2 border-gray-100 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat font-semibold text-gray-600">Order Total</span>
              <span className="text-2xl font-bold text-blue-600 font-montserrat">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setCheckoutState("form")}
              className="w-full bg-gradient-to-r from-blue-600 to-lime-400 text-white py-4 rounded-xl font-bold font-montserrat hover:from-blue-700 hover:to-lime-500 transition-all shadow-md flex items-center justify-center gap-2 text-lg"
            >
              Checkout <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-gray-400 hover:text-red-500 font-montserrat text-sm py-2 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};
