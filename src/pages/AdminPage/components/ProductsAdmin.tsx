import { useState, useRef } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Product, ProductDraft } from "@animaapp/playground-react-sdk";
import { Pencil, Trash2, Plus, X, ChevronDown, ChevronUp, Calculator, TrendingUp, Upload, Link } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const ALL_OPTIONS = [
  { key: "size",           label: "Size" },
  { key: "paper",          label: "Paper" },
  { key: "quantity",       label: "Quantity" },
  { key: "color",          label: "Color" },
  { key: "coating",        label: "Coating" },
  { key: "cardSlit",       label: "Card Slit" },
  { key: "productionTime", label: "Production Time" },
] as const;

type OptionKey = typeof ALL_OPTIONS[number]["key"];
const DEFAULT_ENABLED = ALL_OPTIONS.map((o) => o.key).join(",");

const DEFAULT_SIZE_OPTIONS = [
  '9" x 12" Standard',
  '8.5" x 11" Letter',
  '11" x 17" Tabloid',
  '5" x 7" Half Sheet',
];
const DEFAULT_COLOR_OPTIONS = [
  "Full Color Front (Outside), No Back (Inside)",
  "Full Color Both Sides",
  "Black & White Front Only",
  "Black & White Both Sides",
];
const DEFAULT_COATING_OPTIONS = [
  "High Gloss UV Coating Front",
  "Matte Coating Front",
  "No Coating",
  "Soft Touch Matte",
];
const DEFAULT_TIERS = [
  { qty: "25",   price: "" },
  { qty: "50",   price: "" },
  { qty: "100",  price: "" },
  { qty: "250",  price: "" },
  { qty: "500",  price: "" },
  { qty: "1000", price: "" },
];

const emptyDraft: ProductDraft = {
  name: "",
  price: "",
  image: "",
  description: "",
  enabledOptions: DEFAULT_ENABLED,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function safeJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

const parseOptions = (raw: string | undefined): Set<OptionKey> => {
  if (!raw) return new Set(ALL_OPTIONS.map((o) => o.key));
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean) as OptionKey[]);
};

const serializeOptions = (set: Set<OptionKey>): string =>
  ALL_OPTIONS.map((o) => o.key).filter((k) => set.has(k)).join(",");

const serializeTiers = (tiers: Array<{ qty: string; price: string }>): string | undefined => {
  const valid = tiers.filter((t) => t.qty.trim() && t.price.trim());
  if (valid.length === 0) return undefined;
  return JSON.stringify(
    valid.map((t) => ({ qty: parseInt(t.qty), price: t.price.replace("$", "") }))
  );
};

const serializeUpcharges = (
  items: Array<{ option: string; amount: string }>
): string | undefined => {
  const valid = items.filter(
    (i) => i.option.trim() && i.amount.trim() && i.amount !== "0" && i.amount !== "0.00"
  );
  if (valid.length === 0) return undefined;
  const obj: Record<string, string> = {};
  valid.forEach((i) => { obj[i.option] = i.amount.replace("$", ""); });
  return JSON.stringify(obj);
};

// ── Image Upload Field ─────────────────────────────────────────────────────────
function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { onChange(reader.result as string); setUploading(false); };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Product Image *</label>
      <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold font-montserrat transition-colors ${tab === "upload" ? "bg-lime-400 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold font-montserrat transition-colors ${tab === "url" ? "bg-lime-400 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          <Link className="w-3.5 h-3.5" /> Paste URL
        </button>
      </div>

      {tab === "upload" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center gap-2 hover:border-lime-400 hover:bg-lime-50 transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-montserrat text-gray-500">Reading image…</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-montserrat font-semibold text-gray-600">Click to choose an image</span>
                <span className="text-xs font-montserrat text-gray-400">JPG, PNG, GIF, WebP supported</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
          placeholder="https://images.unsplash.com/…"
        />
      )}

      {value && (
        <div className="mt-3 relative inline-block">
          <img
            src={value}
            alt="preview"
            className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {/* Hidden required input so form validation still works */}
      <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} aria-hidden="true" />
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="flex items-center justify-between cursor-pointer select-none group">
    <span className="font-montserrat text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
      {label}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-lime-400" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </label>
);

// ── UpchargeTable ──────────────────────────────────────────────────────────────
const UpchargeTable = ({
  label,
  items,
  onChange,
  defaultOptions,
}: {
  label: string;
  items: Array<{ option: string; amount: string }>;
  onChange: (items: Array<{ option: string; amount: string }>) => void;
  defaultOptions: string[];
}) => {
  const addRow = () => onChange([...items, { option: "", amount: "0.00" }]);
  const removeRow = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: "option" | "amount", value: string) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  const loadDefaults = () => {
    const existing = new Set(items.map((i) => i.option));
    const toAdd = defaultOptions.filter((o) => !existing.has(o));
    onChange([...items, ...toAdd.map((o) => ({ option: o, amount: "0.00" }))]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-600 font-montserrat uppercase tracking-wide">
          {label}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadDefaults}
            className="text-xs text-blue-500 hover:text-blue-700 font-montserrat transition-colors"
          >
            Load Defaults
          </button>
          <button
            type="button"
            onClick={addRow}
            className="text-xs text-lime-600 hover:text-lime-700 font-montserrat font-semibold transition-colors"
          >
            + Add
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 font-montserrat italic py-1.5">
          No upcharges — click "Load Defaults" or "+ Add"
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.option}
                onChange={(e) => updateRow(idx, "option", e.target.value)}
                placeholder="Option name"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-lime-400 outline-none min-w-0"
              />
              <div className="relative w-24 flex-shrink-0">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) => updateRow(idx, "amount", e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-lime-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const ProductsAdmin = () => {
  const { data: products, isPending, error } = useQuery("Product", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating, error: mutationError } = useMutation("Product");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductDraft>(emptyDraft);
  const [enabledSet, setEnabledSet] = useState<Set<OptionKey>>(
    new Set(ALL_OPTIONS.map((o) => o.key))
  );

  // Pricing formula state
  const [showPricingSection, setShowPricingSection] = useState(false);
  const [costPerItem, setCostPerItem] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [rushUpcharge, setRushUpcharge] = useState("");
  const [pricingTiers, setPricingTiers] = useState<Array<{ qty: string; price: string }>>(DEFAULT_TIERS);
  const [sizeUpcharges, setSizeUpcharges] = useState<Array<{ option: string; amount: string }>>([]);
  const [colorUpcharges, setColorUpcharges] = useState<Array<{ option: string; amount: string }>>([]);
  const [coatingUpcharges, setCoatingUpcharges] = useState<Array<{ option: string; amount: string }>>([]);

  // Sq ft pricing state
  const [sqftEnabled, setSqftEnabled] = useState(false);
  const [sqftPricePerSqFt, setSqftPricePerSqFt] = useState("");
  const [sqftMinSqFt, setSqftMinSqFt] = useState("");
  // Preview inputs for sq ft
  const [sqftPreviewW, setSqftPreviewW] = useState("24");
  const [sqftPreviewH, setSqftPreviewH] = useState("36");
  const [sqftPreviewQty, setSqftPreviewQty] = useState("1");
  // Multi-item sq ft calculator
  const [sqftCalcItems, setSqftCalcItems] = useState<Array<{ w: string; h: string; qty: string }>>([
    { w: "", h: "", qty: "1" },
  ]);

  const toggleOption = (key: OptionKey, on: boolean) => {
    setEnabledSet((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const resetPricingState = () => {
    setCostPerItem("");
    setSellPrice("");
    setRushUpcharge("");
    setPricingTiers(DEFAULT_TIERS);
    setSizeUpcharges([]);
    setColorUpcharges([]);
    setCoatingUpcharges([]);
    setSqftEnabled(false);
    setSqftPricePerSqFt("");
    setSqftMinSqFt("");
    setSqftPreviewW("24");
    setSqftPreviewH("36");
    setSqftPreviewQty("1");
    setSqftCalcItems([{ w: "", h: "", qty: "1" }]);
    setShowPricingSection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft: ProductDraft = {
      ...form,
      enabledOptions: serializeOptions(enabledSet),
      costPerItem: costPerItem || undefined,
      sellPrice: sellPrice || undefined,
      rushUpcharge: rushUpcharge || undefined,
      pricingTiers: serializeTiers(pricingTiers),
      colorUpcharge: serializeUpcharges(colorUpcharges),
      sizeUpcharge: serializeUpcharges(sizeUpcharges),
      coatingUpcharge: serializeUpcharges(coatingUpcharges),
      sqftEnabled: sqftEnabled ? "true" : "false",
      sqftPricePerSqFt: sqftEnabled ? (sqftPricePerSqFt || undefined) : undefined,
      sqftMinSqFt: sqftEnabled ? (sqftMinSqFt || undefined) : undefined,
    };
    try {
      if (editingId) {
        await update(editingId, draft);
      } else {
        await create(draft);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyDraft);
      setEnabledSet(new Set(ALL_OPTIONS.map((o) => o.key)));
      resetPricingState();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || "",
      enabledOptions: product.enabledOptions || DEFAULT_ENABLED,
    });
    setEnabledSet(parseOptions(product.enabledOptions));
    setEditingId(product.id);
    setShowForm(true);

    // Parse pricing fields
    setCostPerItem(product.costPerItem || "");
    setSellPrice(product.sellPrice || "");
    setRushUpcharge(product.rushUpcharge || "");

    const tiers = safeJSON<Array<{ qty: number; price: string }>>(product.pricingTiers, []);
    setPricingTiers(
      tiers.length > 0
        ? tiers.map((t) => ({ qty: String(t.qty), price: t.price }))
        : DEFAULT_TIERS
    );

    const colorMap = safeJSON<Record<string, string>>(product.colorUpcharge, {});
    setColorUpcharges(Object.entries(colorMap).map(([option, amount]) => ({ option, amount })));

    const sizeMap = safeJSON<Record<string, string>>(product.sizeUpcharge, {});
    setSizeUpcharges(Object.entries(sizeMap).map(([option, amount]) => ({ option, amount })));

    const coatingMap = safeJSON<Record<string, string>>(product.coatingUpcharge, {});
    setCoatingUpcharges(Object.entries(coatingMap).map(([option, amount]) => ({ option, amount })));

    setSqftEnabled(product.sqftEnabled === "true");
    setSqftPricePerSqFt(product.sqftPricePerSqFt || "");
    setSqftMinSqFt(product.sqftMinSqFt || "");

    const hasPricing = !!(
      product.pricingTiers ||
      product.colorUpcharge ||
      product.sizeUpcharge ||
      product.coatingUpcharge ||
      product.costPerItem ||
      product.sellPrice ||
      product.sqftEnabled === "true"
    );
    setShowPricingSection(hasPricing);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await remove(id); } catch (err) { console.error("Failed to delete:", err); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyDraft);
    setEnabledSet(new Set(ALL_OPTIONS.map((o) => o.key)));
    resetPricingState();
  };

  // Live preview rows
  const previewRows = pricingTiers
    .filter((t) => t.qty.trim() && t.price.trim())
    .map((t) => ({ qty: parseInt(t.qty), unitPrice: parseFloat(t.price) }))
    .sort((a, b) => a.qty - b.qty);
  const baseSellPrice = parseFloat(sellPrice || "0");

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="text-center py-12 text-red-500 font-montserrat">Error: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-josefin_sans">Products</h2>
          <p className="text-gray-500 font-montserrat text-sm mt-1">{products?.length || 0} total products</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyDraft);
            setEnabledSet(new Set(ALL_OPTIONS.map((o) => o.key)));
            resetPricingState();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-5 py-2.5 rounded-lg font-bold hover:from-lime-300 hover:to-yellow-300 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {mutationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-montserrat text-sm">
          {mutationError.message}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-bold font-josefin_sans">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                  Product Name *
                </label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. Custom T-Shirts"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                  Display Price *
                  <span className="text-gray-400 font-normal ml-1 text-xs">(shown on product card, e.g. "From $5.00")</span>
                </label>
                <input
                  type="text" required value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. From $5.00"
                />
              </div>

              <ImageUploadField
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Description</label>
                <textarea
                  rows={3} value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors"
                  placeholder="Describe the product..."
                />
              </div>

              {/* ── Configurator Options ── */}
              <div className="border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-700 font-montserrat">Configurator Options</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEnabledSet(new Set(ALL_OPTIONS.map((o) => o.key)))}
                      className="text-xs text-lime-600 hover:text-lime-700 font-montserrat font-semibold transition-colors"
                    >
                      All on
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEnabledSet(new Set())}
                      className="text-xs text-gray-400 hover:text-gray-600 font-montserrat font-semibold transition-colors"
                    >
                      All off
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {ALL_OPTIONS.map(({ key, label }) => (
                    <Toggle
                      key={key}
                      label={label}
                      checked={enabledSet.has(key)}
                      onChange={(on) => toggleOption(key, on)}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-montserrat mt-3">
                  {enabledSet.size} of {ALL_OPTIONS.length} options shown to customers
                </p>
              </div>

              {/* ── Pricing Formula ── */}
              <div className="border-2 border-lime-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPricingSection(!showPricingSection)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-lime-50 hover:bg-lime-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-lime-600" />
                    <span className="text-sm font-bold text-gray-700 font-montserrat">
                      Pricing Formula
                    </span>
                    {(sellPrice || pricingTiers.some((t) => t.price)) && (
                      <span className="bg-lime-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  {showPricingSection ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showPricingSection && (
                  <div className="p-4 space-y-5">

                    {/* Cost / Sell / Rush row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 font-montserrat">
                          Cost/Item
                          <span className="text-gray-400 font-normal ml-1">(internal)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number" step="0.01" min="0" value={costPerItem}
                            onChange={(e) => setCostPerItem(e.target.value)}
                            className="w-full pl-6 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                            placeholder="2.50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 font-montserrat">
                          Sell Price
                          <span className="text-gray-400 font-normal ml-1">(base/unit)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number" step="0.01" min="0" value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="w-full pl-6 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                            placeholder="8.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 font-montserrat">
                          Rush Fee
                          <span className="text-gray-400 font-normal ml-1">(flat)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number" step="0.01" min="0" value={rushUpcharge}
                            onChange={(e) => setRushUpcharge(e.target.value)}
                            className="w-full pl-6 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                            placeholder="5.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Margin preview */}
                    {costPerItem && sellPrice &&
                      parseFloat(costPerItem) > 0 && parseFloat(sellPrice) > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 text-xs font-montserrat flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex gap-4 flex-wrap">
                          <span className="text-gray-600">
                            Cost: <strong>${parseFloat(costPerItem).toFixed(2)}</strong>
                          </span>
                          <span className="text-gray-600">
                            Sell: <strong>${parseFloat(sellPrice).toFixed(2)}</strong>
                          </span>
                          <span className="text-green-700 font-bold">
                            Profit: ${(parseFloat(sellPrice) - parseFloat(costPerItem)).toFixed(2)}{" "}
                            ({(((parseFloat(sellPrice) - parseFloat(costPerItem)) / parseFloat(sellPrice)) * 100).toFixed(0)}% margin)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quantity Pricing Tiers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600 font-montserrat uppercase tracking-wide">
                          Quantity Pricing Tiers (Volume Discounts)
                        </span>
                        <button
                          type="button"
                          onClick={() => setPricingTiers([...pricingTiers, { qty: "", price: "" }])}
                          className="text-xs text-lime-600 hover:text-lime-700 font-montserrat font-semibold transition-colors"
                        >
                          + Add Tier
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-gray-400 font-montserrat px-1">
                          <span>Min Qty</span>
                          <span>Price / Unit ($)</span>
                          <span></span>
                        </div>
                        {pricingTiers.map((tier, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                            <input
                              type="number" min="1" value={tier.qty}
                              onChange={(e) =>
                                setPricingTiers(
                                  pricingTiers.map((t, i) =>
                                    i === idx ? { ...t, qty: e.target.value } : t
                                  )
                                )
                              }
                              placeholder="100"
                              className="px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-lime-400 outline-none"
                            />
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                              <input
                                type="number" step="0.01" min="0" value={tier.price}
                                onChange={(e) =>
                                  setPricingTiers(
                                    pricingTiers.map((t, i) =>
                                      i === idx ? { ...t, price: e.target.value } : t
                                    )
                                  )
                                }
                                placeholder="6.00"
                                className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-lime-400 outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setPricingTiers(pricingTiers.filter((_, i) => i !== idx))
                              }
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 font-montserrat mt-1.5">
                        Customer gets the price for the highest tier their quantity qualifies for.
                      </p>
                    </div>

                    {/* ── Sq Ft Pricing ── */}
                    <div className="border-2 border-blue-100 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSqftEnabled(!sqftEnabled)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📐</span>
                          <span className="text-sm font-bold text-gray-700 font-montserrat">
                            Sq Ft Pricing
                          </span>
                          <span className="text-xs text-gray-400 font-montserrat font-normal">
                            (for banners, signs, wraps, etc.)
                          </span>
                          {sqftEnabled && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sqftEnabled ? "bg-blue-500" : "bg-gray-200"}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${sqftEnabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                        </div>
                      </button>

                      {sqftEnabled && (
                        <div className="p-4 space-y-4">
                          <p className="text-xs text-gray-500 font-montserrat bg-blue-50 rounded-lg px-3 py-2">
                            Customer enters width × height in inches. Price = (W × H ÷ 144) × price/sq ft × qty.
                            A minimum sq ft floor prevents under-billing on tiny orders.
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1 font-montserrat">
                                Price per Sq Ft *
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                <input
                                  type="number" step="0.01" min="0"
                                  value={sqftPricePerSqFt}
                                  onChange={(e) => setSqftPricePerSqFt(e.target.value)}
                                  className="w-full pl-6 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 outline-none font-montserrat text-sm transition-colors"
                                  placeholder="3.50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1 font-montserrat">
                                Min Sq Ft
                                <span className="text-gray-400 font-normal ml-1">(floor)</span>
                              </label>
                              <input
                                type="number" step="0.5" min="0"
                                value={sqftMinSqFt}
                                onChange={(e) => setSqftMinSqFt(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 outline-none font-montserrat text-sm transition-colors"
                                placeholder="1.00"
                              />
                            </div>
                          </div>

                          {/* Multi-Item Sq Ft Calculator */}
                          <div className="border border-blue-200 rounded-xl overflow-hidden">
                            <div className="bg-blue-100 px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">🧮</span>
                                <span className="text-xs font-bold text-blue-800 font-montserrat uppercase tracking-wide">
                                  Multi-Item Sq Ft Calculator
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setSqftCalcItems([...sqftCalcItems, { w: "", h: "", qty: "1" }])
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 font-montserrat font-semibold transition-colors"
                              >
                                + Add Item
                              </button>
                            </div>

                            <div className="p-3 space-y-2">
                              {/* Header row */}
                              <div className="grid grid-cols-[1fr_1fr_60px_80px_24px] gap-1.5 text-xs text-gray-400 font-montserrat px-0.5">
                                <span>Width (in)</span>
                                <span>Height (in)</span>
                                <span>Qty</span>
                                <span className="text-right">Sq Ft</span>
                                <span></span>
                              </div>

                              {sqftCalcItems.map((item, idx) => {
                                const w = parseFloat(item.w) || 0;
                                const h = parseFloat(item.h) || 0;
                                const q = parseInt(item.qty) || 1;
                                const sf = (w * h / 144) * q;
                                return (
                                  <div key={idx} className="grid grid-cols-[1fr_1fr_60px_80px_24px] gap-1.5 items-center">
                                    <input
                                      type="number" min="0.5" step="0.5"
                                      value={item.w}
                                      onChange={(e) =>
                                        setSqftCalcItems(sqftCalcItems.map((it, i) =>
                                          i === idx ? { ...it, w: e.target.value } : it
                                        ))
                                      }
                                      placeholder="24"
                                      className="px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                    />
                                    <input
                                      type="number" min="0.5" step="0.5"
                                      value={item.h}
                                      onChange={(e) =>
                                        setSqftCalcItems(sqftCalcItems.map((it, i) =>
                                          i === idx ? { ...it, h: e.target.value } : it
                                        ))
                                      }
                                      placeholder="36"
                                      className="px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                    />
                                    <input
                                      type="number" min="1"
                                      value={item.qty}
                                      onChange={(e) =>
                                        setSqftCalcItems(sqftCalcItems.map((it, i) =>
                                          i === idx ? { ...it, qty: e.target.value } : it
                                        ))
                                      }
                                      placeholder="1"
                                      className="px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                    />
                                    <div className="text-right">
                                      {w > 0 && h > 0 ? (
                                        <span className="text-xs font-semibold text-blue-700 font-montserrat">
                                          {sf.toFixed(3)}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-300 font-montserrat">—</span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSqftCalcItems(sqftCalcItems.filter((_, i) => i !== idx))
                                      }
                                      disabled={sqftCalcItems.length === 1}
                                      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Totals row */}
                              {(() => {
                                const ppsf = parseFloat(sqftPricePerSqFt) || 0;
                                const minSF = parseFloat(sqftMinSqFt) || 0;
                                const rawTotal = sqftCalcItems.reduce((sum, item) => {
                                  const w = parseFloat(item.w) || 0;
                                  const h = parseFloat(item.h) || 0;
                                  const q = parseInt(item.qty) || 1;
                                  return sum + (w * h / 144) * q;
                                }, 0);
                                const hasAnyDims = sqftCalcItems.some(
                                  (it) => parseFloat(it.w) > 0 && parseFloat(it.h) > 0
                                );
                                if (!hasAnyDims) return null;
                                const effectiveTotal = Math.max(rawTotal, minSF);
                                const totalPrice = effectiveTotal * ppsf;
                                return (
                                  <div className="border-t border-blue-200 pt-2 mt-1 space-y-1 text-xs font-montserrat">
                                    <div className="flex justify-between text-gray-600">
                                      <span>Total sq ft ({sqftCalcItems.reduce((s, it) => s + (parseInt(it.qty) || 1), 0)} pcs)</span>
                                      <span className="font-semibold">{rawTotal.toFixed(3)} sq ft</span>
                                    </div>
                                    {effectiveTotal > rawTotal && (
                                      <div className="flex justify-between text-orange-600">
                                        <span>Min sq ft floor applied</span>
                                        <span className="font-semibold">{effectiveTotal.toFixed(2)} sq ft billed</span>
                                      </div>
                                    )}
                                    {ppsf > 0 && (
                                      <>
                                        <div className="flex justify-between text-gray-600">
                                          <span>Rate</span>
                                          <span>${ppsf.toFixed(2)}/sq ft</span>
                                        </div>
                                        <div className="flex justify-between text-blue-700 font-bold border-t border-blue-200 pt-1 mt-0.5">
                                          <span>Estimated Total</span>
                                          <span className="text-base">${totalPrice.toFixed(2)}</span>
                                        </div>
                                      </>
                                    )}
                                    {!ppsf && (
                                      <p className="text-gray-400 italic">
                                        Set "Price per Sq Ft" above to see estimated total.
                                      </p>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setSqftCalcItems([{ w: "", h: "", qty: "1" }])}
                                      className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                                    >
                                      Clear all
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Single-item quick preview */}
                          {sqftPricePerSqFt && parseFloat(sqftPricePerSqFt) > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-600 font-montserrat uppercase tracking-wide mb-2">
                                📊 Single-Item Price Preview
                              </p>
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div>
                                  <label className="block text-xs text-gray-400 font-montserrat mb-1">Width (in)</label>
                                  <input
                                    type="number" min="1" value={sqftPreviewW}
                                    onChange={(e) => setSqftPreviewW(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 font-montserrat mb-1">Height (in)</label>
                                  <input
                                    type="number" min="1" value={sqftPreviewH}
                                    onChange={(e) => setSqftPreviewH(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 font-montserrat mb-1">Qty</label>
                                  <input
                                    type="number" min="1" value={sqftPreviewQty}
                                    onChange={(e) => setSqftPreviewQty(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-montserrat focus:border-blue-400 outline-none"
                                  />
                                </div>
                              </div>
                              {(() => {
                                const w = parseFloat(sqftPreviewW) || 0;
                                const h = parseFloat(sqftPreviewH) || 0;
                                const q = parseInt(sqftPreviewQty) || 1;
                                const ppsf = parseFloat(sqftPricePerSqFt) || 0;
                                const minSF = parseFloat(sqftMinSqFt) || 0;
                                const sqftPerPiece = (w * h) / 144;
                                const totalSqft = sqftPerPiece * q;
                                const effectiveSqft = Math.max(totalSqft, minSF);
                                const total = effectiveSqft * ppsf;
                                return (
                                  <div className="bg-blue-50 rounded-lg p-3 text-xs font-montserrat space-y-1">
                                    <div className="flex justify-between text-gray-600">
                                      <span>Size</span>
                                      <span className="font-semibold">{w}" × {h}"</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                      <span>Sq ft / piece</span>
                                      <span className="font-semibold">{sqftPerPiece.toFixed(3)} sq ft</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                      <span>Total sq ft ({q} pcs)</span>
                                      <span className="font-semibold">{totalSqft.toFixed(3)} sq ft</span>
                                    </div>
                                    {effectiveSqft > totalSqft && (
                                      <div className="flex justify-between text-orange-600">
                                        <span>Min sq ft applied</span>
                                        <span className="font-semibold">{effectiveSqft.toFixed(2)} sq ft</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                      <span>Rate</span>
                                      <span className="font-semibold">${ppsf.toFixed(2)}/sq ft</span>
                                    </div>
                                    <div className="flex justify-between text-blue-700 font-bold border-t border-blue-200 pt-1 mt-1">
                                      <span>Total</span>
                                      <span>${total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Upcharge Tables */}
                    <UpchargeTable
                      label="Size Upcharges (per unit)"
                      items={sizeUpcharges}
                      onChange={setSizeUpcharges}
                      defaultOptions={DEFAULT_SIZE_OPTIONS}
                    />
                    <UpchargeTable
                      label="Color Upcharges (per unit)"
                      items={colorUpcharges}
                      onChange={setColorUpcharges}
                      defaultOptions={DEFAULT_COLOR_OPTIONS}
                    />
                    <UpchargeTable
                      label="Coating Upcharges (per unit)"
                      items={coatingUpcharges}
                      onChange={setCoatingUpcharges}
                      defaultOptions={DEFAULT_COATING_OPTIONS}
                    />

                    {/* Live Preview Table */}
                    {previewRows.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 font-montserrat uppercase tracking-wide mb-2">
                          📊 Pricing Preview
                        </p>
                        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          <table className="w-full text-xs font-montserrat">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="text-left px-3 py-2 text-gray-500 font-semibold">Qty</th>
                                <th className="text-right px-3 py-2 text-gray-500 font-semibold">Unit Price</th>
                                <th className="text-right px-3 py-2 text-gray-500 font-semibold">Run Total</th>
                                {baseSellPrice > 0 && (
                                  <th className="text-right px-3 py-2 text-gray-500 font-semibold">Discount</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {previewRows.map((row, idx) => {
                                const discount =
                                  baseSellPrice > 0 && baseSellPrice > row.unitPrice
                                    ? Math.round(
                                        ((baseSellPrice - row.unitPrice) / baseSellPrice) * 100
                                      )
                                    : 0;
                                return (
                                  <tr key={idx} className="border-t border-gray-200">
                                    <td className="px-3 py-2 text-gray-700 font-semibold">{row.qty}</td>
                                    <td className="px-3 py-2 text-right text-gray-700">
                                      ${row.unitPrice.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-blue-600">
                                      ${(row.unitPrice * row.qty).toFixed(2)}
                                    </td>
                                    {baseSellPrice > 0 && (
                                      <td className="px-3 py-2 text-right">
                                        {discount > 0 ? (
                                          <span className="text-lime-600 font-bold">-{discount}%</span>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={isMutating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3 rounded-lg font-bold font-montserrat disabled:opacity-50 hover:from-blue-700 hover:to-lime-500 transition-all"
                >
                  {isMutating ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button" onClick={handleCancel}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-bold font-montserrat hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Products Grid ── */}
      {!products || products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl font-montserrat font-semibold">No products yet</p>
          <p className="text-sm mt-2 font-montserrat">Click "Add Product" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const enabled = parseOptions(product.enabledOptions);
            const hasPricing = !!(product.pricingTiers || product.sellPrice);
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold font-josefin_sans text-lg leading-tight">
                      {product.name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lime-500 font-bold text-lg">{product.price}</span>
                      {hasPricing && (
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Calculator className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-500 font-montserrat">
                            {product.sqftEnabled === "true" ? "Sq ft pricing" : "Formula active"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-gray-500 text-sm font-montserrat line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ALL_OPTIONS.map(({ key, label }) => (
                      <span
                        key={key}
                        className={`text-xs px-2 py-0.5 rounded-full font-montserrat font-semibold ${
                          enabled.has(key)
                            ? "bg-lime-100 text-lime-700"
                            : "bg-gray-100 text-gray-400 line-through"
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(product)}
                      disabled={isMutating}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isMutating}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
