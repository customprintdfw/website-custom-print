import type { Product } from "@animaapp/playground-react-sdk";

export interface PricingTier {
  qty: number;
  price: string;
}

export interface PricingResult {
  baseUnitPrice: number;
  sizeAdj: number;
  colorAdj: number;
  coatingAdj: number;
  perUnitPrice: number;
  rushFee: number;
  subtotal: number;
  originalSubtotal: number;
  savings: number;
  discountPct: number;
  hasTiers: boolean;
  hasUpcharges: boolean;
}

export interface SqftPricingResult {
  isSqft: true;
  widthIn: number;
  heightIn: number;
  sqftPerPiece: number;
  totalSqft: number;
  effectiveSqft: number; // max(totalSqft, minSqFt)
  pricePerSqft: number;
  rushFee: number;
  subtotal: number;
  qty: number;
}

export function safeFloat(val: string | undefined, fallback = 0): number {
  if (!val) return fallback;
  const n = parseFloat(val.replace(/[$,]/g, ""));
  return isNaN(n) ? fallback : n;
}

export function safeJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function calculatePrice(
  product: Product,
  qty: number,
  size: string,
  color: string,
  coating: string,
  productionTime: string
): PricingResult {
  const tiers = safeJSON<PricingTier[]>(product.pricingTiers, []);
  const colorMap = safeJSON<Record<string, string>>(product.colorUpcharge, {});
  const sizeMap = safeJSON<Record<string, string>>(product.sizeUpcharge, {});
  const coatingMap = safeJSON<Record<string, string>>(product.coatingUpcharge, {});

  // Base sell price — prefer explicit sellPrice, fall back to display price
  const sellPrice = safeFloat(product.sellPrice || product.price);

  // Find best tier: highest qualifying qty tier
  const hasTiers = tiers.length > 0;
  let baseUnitPrice = sellPrice;
  if (hasTiers) {
    const sorted = [...tiers]
      .filter((t) => t.price)
      .sort((a, b) => b.qty - a.qty);
    const match = sorted.find((t) => qty >= t.qty);
    if (match) {
      baseUnitPrice = safeFloat(match.price);
    } else if (sorted.length > 0) {
      // Below minimum tier — use smallest tier price
      baseUnitPrice = safeFloat(sorted[sorted.length - 1].price);
    }
  }

  const sizeAdj = safeFloat(sizeMap[size]);
  const colorAdj = safeFloat(colorMap[color]);
  const coatingAdj = safeFloat(coatingMap[coating]);
  const hasUpcharges = sizeAdj !== 0 || colorAdj !== 0 || coatingAdj !== 0;

  const perUnitPrice = baseUnitPrice + sizeAdj + colorAdj + coatingAdj;
  const rushFee = productionTime === "rush" ? safeFloat(product.rushUpcharge) : 0;

  const subtotal = perUnitPrice * qty + rushFee;
  const originalSubtotal = sellPrice * qty;
  const savings = Math.max(0, originalSubtotal - perUnitPrice * qty);
  const discountPct =
    originalSubtotal > 0 ? Math.round((savings / originalSubtotal) * 100) : 0;

  return {
    baseUnitPrice,
    sizeAdj,
    colorAdj,
    coatingAdj,
    perUnitPrice,
    rushFee,
    subtotal,
    originalSubtotal,
    savings,
    discountPct,
    hasTiers,
    hasUpcharges,
  };
}

/**
 * Calculate price for sq-ft-priced products.
 * widthIn / heightIn are in inches; qty is number of pieces.
 * Total sq ft = (widthIn × heightIn / 144) × qty
 * Enforces sqftMinSqFt as a floor on the billable sq ft.
 */
export function calculateSqftPrice(
  product: Product,
  widthIn: number,
  heightIn: number,
  qty: number,
  productionTime: string
): SqftPricingResult {
  const pricePerSqft = safeFloat(product.sqftPricePerSqFt);
  const minSqFt = safeFloat(product.sqftMinSqFt, 0);
  const rushFee = productionTime === "rush" ? safeFloat(product.rushUpcharge) : 0;

  const sqftPerPiece = (widthIn * heightIn) / 144;
  const totalSqft = sqftPerPiece * qty;
  const effectiveSqft = Math.max(totalSqft, minSqFt);
  const subtotal = effectiveSqft * pricePerSqft + rushFee;

  return {
    isSqft: true,
    widthIn,
    heightIn,
    sqftPerPiece,
    totalSqft,
    effectiveSqft,
    pricePerSqft,
    rushFee,
    subtotal,
    qty,
  };
}
