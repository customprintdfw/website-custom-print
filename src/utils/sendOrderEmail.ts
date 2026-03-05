// ─────────────────────────────────────────────────────────────────────────────
// Order Email Notifications via Formspree
//
// ✅ ONE-TIME SETUP (takes ~2 minutes):
//   1. Go to https://formspree.io/register and create a FREE account
//   2. Click "+ New Form", name it "CustomPrint DFW Orders"
//   3. Set the notification email to: order@customprintdfw.com
//   4. Copy the 8-character form ID shown in the endpoint URL (e.g. "xpwzabcd")
//   5. Replace YOUR_ORDER_FORM_ID below with that ID
//
// Free tier: 50 submissions/month. Upgrade at formspree.io for more.
// ─────────────────────────────────────────────────────────────────────────────

const FORMSPREE_FORM_ID = "YOUR_ORDER_FORM_ID"; // ← replace this with your form ID
const ORDER_NOTIFICATION_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;
const IS_CONFIGURED = FORMSPREE_FORM_ID !== "YOUR_ORDER_FORM_ID";

export interface OrderEmailData {
  type: "portal" | "product";
  customerName: string;
  customerEmail: string;
  productName: string;
  price: string;
  quantity: string;
  portalName?: string;
  size?: string;
  color?: string;
  style?: string;
  printLocation?: string;
  printType?: string;
  category?: string;
  paper?: string;
  coating?: string;
  productionTime?: string;
  cardSlit?: string;
  notes?: string;
}

/**
 * Sends an order notification email to order@customprintdfw.com via Formspree.
 * Errors are caught and logged — they do NOT bubble up so a failed email never
 * blocks the order from being saved to the database.
 */
export async function sendOrderEmail(order: OrderEmailData): Promise<void> {
  const isPortal = order.type === "portal";
  const subject = `🛒 New ${isPortal ? "Portal" : "Product"} Order — ${order.productName}`;

  const lines: string[] = [
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `ORDER TYPE : ${isPortal ? "Portal / Spirit Shop" : "Product / Print"}`,
    ...(isPortal && order.portalName ? [`PORTAL     : ${order.portalName}`] : []),
    `PRODUCT    : ${order.productName}`,
    ...(order.category ? [`CATEGORY   : ${order.category}`] : []),
    ...(order.size ? [`SIZE       : ${order.size}`] : []),
    ...(order.color ? [`COLOR      : ${order.color}`] : []),
    ...(order.style ? [`STYLE      : ${order.style}`] : []),
    ...(order.printLocation ? [`PRINT LOC  : ${order.printLocation}`] : []),
    ...(order.printType ? [`PRINT TYPE : ${order.printType}`] : []),
    `QUANTITY   : ${order.quantity}`,
    `PRICE      : ${order.price}`,
    ...(order.paper ? [`PAPER      : ${order.paper}`] : []),
    ...(order.coating ? [`COATING    : ${order.coating}`] : []),
    ...(order.productionTime ? [`PRODUCTION : ${order.productionTime}`] : []),
    ...(order.cardSlit ? [`CARD SLIT  : ${order.cardSlit}`] : []),
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `CUSTOMER   : ${order.customerName}`,
    `EMAIL      : ${order.customerEmail}`,
    ...(order.notes ? [`NOTES      : ${order.notes}`] : []),
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (!IS_CONFIGURED) {
    console.warn(
      "[sendOrderEmail] ⚠️  Formspree is not configured yet.\n" +
      "  → Go to https://formspree.io/register, create a form for order@customprintdfw.com,\n" +
      "    then paste the form ID into FORMSPREE_FORM_ID in src/utils/sendOrderEmail.ts"
    );
    return;
  }

  try {
    const res = await fetch(ORDER_NOTIFICATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        message: lines.join("\n"),
        orderType: order.type,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        product: order.productName,
        quantity: order.quantity,
        price: order.price,
        ...(order.portalName && { portal: order.portalName }),
        ...(order.size && { size: order.size }),
        ...(order.color && { color: order.color }),
        ...(order.style && { style: order.style }),
        ...(order.printLocation && { printLocation: order.printLocation }),
        ...(order.printType && { printType: order.printType }),
        ...(order.notes && { notes: order.notes }),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn(
        "[sendOrderEmail] Formspree returned an error:",
        data?.errors?.[0]?.message ?? res.statusText
      );
    }
  } catch (err) {
    console.warn("[sendOrderEmail] Failed to send notification email:", err);
  }
}
