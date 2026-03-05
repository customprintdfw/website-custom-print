import { useState, useRef } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Portal, PortalProduct, PortalProductDraft } from "@animaapp/playground-react-sdk";
import { Pencil, Trash2, Plus, X, ArrowLeft, Package, Upload, Link, Settings } from "lucide-react";

const CATEGORIES = ["T-Shirts", "Hoodies", "Hats", "Jackets", "Polos", "Bags", "Accessories", "Banners", "Stickers", "Other"];

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "One Size"];
const COLOR_PRESETS = ["Black", "White", "Red", "Navy", "Royal Blue", "Gray", "Green", "Yellow", "Orange", "Purple", "Pink", "Maroon", "Gold", "Charcoal", "Brown", "Teal"];
const STYLE_PRESETS = ["Crew Neck", "V-Neck", "Long Sleeve", "Short Sleeve", "Tank Top", "Polo", "Zip-Up", "Pullover", "Button-Up", "Raglan"];
const PRINT_LOCATION_PRESETS = ["Front", "Back", "Left Chest", "Right Chest", "Left Sleeve", "Right Sleeve", "Full Back", "Full Front", "Hood", "Pocket Area"];
const PRINT_TYPE_PRESETS = ["DTF", "Screen Print", "Embroidery", "Sublimation", "Vinyl", "Laser Engraving", "Heat Transfer", "Puff Print"];

const emptyDraft = (portalId: string): PortalProductDraft => ({
  portalId,
  name: "",
  price: "",
  image: "",
  description: "",
  category: "T-Shirts",
  availableSizes: "",
  availableColors: "",
  availableStyles: "",
  printLocations: "",
  printTypes: "",
  minQty: "",
});

interface PortalProductsAdminProps {
  portal: Portal;
  onBack: () => void;
}

// ── Chip Selector ──────────────────────────────────────────────────────────
function ChipSelector({
  label,
  presets,
  value,
  onChange,
  hint,
}: {
  label: string;
  presets: string[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const [custom, setCustom] = useState("");

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item).join(","));
    } else {
      onChange([...selected, item].join(","));
    }
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed || selected.includes(trimmed)) { setCustom(""); return; }
    onChange([...selected, trimmed].join(","));
    setCustom("");
  };

  const remove = (item: string) => {
    onChange(selected.filter((s) => s !== item).join(","));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-montserrat">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1.5 text-xs">{hint}</span>}
      </label>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {presets.map((p) => {
          const isSelected = selected.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={`px-3 py-1 rounded-full text-xs font-bold font-montserrat transition-all border-2 ${
                isSelected
                  ? "bg-lime-400 border-lime-400 text-black"
                  : "bg-white border-gray-200 text-gray-600 hover:border-lime-300 hover:bg-lime-50"
              }`}
            >
              {isSelected ? "✓ " : ""}{p}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom option…"
          className="flex-1 px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:border-lime-400 outline-none font-montserrat transition-colors"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold font-montserrat transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Custom (non-preset) selected items */}
      {selected.filter((s) => !presets.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.filter((s) => !presets.includes(s)).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold font-montserrat"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                className="hover:text-red-600 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-gray-400 font-montserrat mt-1">
          {selected.length} option{selected.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

// ── Image Upload Field ──────────────────────────────────────────────────────
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
      <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} aria-hidden="true" />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export const PortalProductsAdmin = ({ portal, onBack }: PortalProductsAdminProps) => {
  const { data: products, isPending, error } = useQuery("PortalProduct", {
    where: { portalId: portal.id },
    orderBy: { createdAt: "desc" },
  });
  const { create, update, remove, isPending: isMutating, error: mutationError } = useMutation("PortalProduct");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortalProductDraft>(emptyDraft(portal.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update(editingId, form);
      } else {
        await create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyDraft(portal.id));
    } catch (err) {
      console.error("Failed to save portal product:", err);
    }
  };

  const handleEdit = (product: PortalProduct) => {
    setForm({
      portalId: portal.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || "",
      category: product.category || "T-Shirts",
      availableSizes: product.availableSizes || "",
      availableColors: product.availableColors || "",
      availableStyles: product.availableStyles || "",
      printLocations: product.printLocations || "",
      printTypes: product.printTypes || "",
      minQty: product.minQty || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await remove(id); } catch (err) { console.error("Failed to delete:", err); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyDraft(portal.id));
  };

  const countOpts = (val?: string) => (val ? val.split(",").filter((s) => s.trim()).length : 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-black font-montserrat text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portals
        </button>
        <div className="w-px h-5 bg-gray-300" />
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${portal.color} flex-shrink-0`} />
          <div>
            <h2 className="text-2xl font-bold font-josefin_sans leading-tight">{portal.name}</h2>
            <p className="text-gray-500 font-montserrat text-xs">Portal Products</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyDraft(portal.id)); }}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-bold font-josefin_sans">
                {editingId ? "Edit Product" : "Add Product to Portal"}
              </h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* ── Basic Info ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Product Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. Spirit T-Shirt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Price *</label>
                  <input
                    type="text" required value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                    placeholder="e.g. $24.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Category</label>
                  <select
                    value={form.category || "T-Shirts"}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <ImageUploadField value={form.image} onChange={(url) => setForm({ ...form, image: url })} />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Description</label>
                <textarea
                  rows={2} value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors"
                  placeholder="Describe the product…"
                />
              </div>

              {/* ── Product Options ── */}
              <div className="border-t-2 border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold font-josefin_sans text-base leading-tight">Product Options</h4>
                    <p className="text-xs font-montserrat text-gray-400">Customers choose from these when ordering</p>
                  </div>
                </div>

                <ChipSelector
                  label="Available Sizes"
                  presets={SIZE_PRESETS}
                  value={form.availableSizes || ""}
                  onChange={(v) => setForm({ ...form, availableSizes: v })}
                />

                <ChipSelector
                  label="Available Colors"
                  presets={COLOR_PRESETS}
                  value={form.availableColors || ""}
                  onChange={(v) => setForm({ ...form, availableColors: v })}
                />

                <ChipSelector
                  label="Styles / Cuts"
                  presets={STYLE_PRESETS}
                  value={form.availableStyles || ""}
                  onChange={(v) => setForm({ ...form, availableStyles: v })}
                />

                <ChipSelector
                  label="Print Locations"
                  presets={PRINT_LOCATION_PRESETS}
                  value={form.printLocations || ""}
                  onChange={(v) => setForm({ ...form, printLocations: v })}
                />

                <ChipSelector
                  label="Print Types"
                  presets={PRINT_TYPE_PRESETS}
                  value={form.printTypes || ""}
                  onChange={(v) => setForm({ ...form, printTypes: v })}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">
                    Min. Order Quantity
                    <span className="text-gray-400 font-normal ml-1.5 text-xs">(leave blank for no minimum)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.minQty || ""}
                    onChange={(e) => setForm({ ...form, minQty: e.target.value })}
                    className="w-32 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                    placeholder="e.g. 12"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={isMutating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3 rounded-lg font-bold font-montserrat disabled:opacity-50 hover:from-blue-700 hover:to-lime-500 transition-all"
                >
                  {isMutating ? "Saving…" : editingId ? "Update Product" : "Add Product"}
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

      {/* Loading */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-center py-12 text-red-500 font-montserrat">Error: {error.message}</div>}

      {/* Empty */}
      {!isPending && !error && (!products || products.length === 0) && (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-montserrat font-semibold">No products in this portal yet</p>
          <p className="text-sm mt-2 font-montserrat">Click "Add Product" to start building the catalog</p>
        </div>
      )}

      {/* Products Grid */}
      {!isPending && !error && products && products.length > 0 && (
        <>
          <p className="text-gray-500 font-montserrat text-sm mb-4">
            {products.length} product{products.length !== 1 ? "s" : ""} in this portal
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const sizeCount = countOpts(product.availableSizes);
              const colorCount = countOpts(product.availableColors);
              const styleCount = countOpts(product.availableStyles);
              const printTypeCount = countOpts(product.printTypes);
              const printLocCount = countOpts(product.printLocations);
              return (
                <div key={product.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video overflow-hidden bg-gray-100 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold font-josefin_sans text-lg leading-tight">{product.name}</h3>
                      <span className="text-lime-600 font-bold text-lg whitespace-nowrap">{product.price}</span>
                    </div>
                    {product.description && (
                      <p className="text-gray-500 text-sm font-montserrat line-clamp-2 mt-1">{product.description}</p>
                    )}

                    {/* Option badges */}
                    {(sizeCount > 0 || colorCount > 0 || styleCount > 0 || printTypeCount > 0 || printLocCount > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {sizeCount > 0 && (
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
                            {sizeCount} size{sizeCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {colorCount > 0 && (
                          <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
                            {colorCount} color{colorCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {styleCount > 0 && (
                          <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
                            {styleCount} style{styleCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {printTypeCount > 0 && (
                          <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
                            {printTypeCount} print type{printTypeCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {printLocCount > 0 && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full font-montserrat">
                            {printLocCount} location{printLocCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(product)} disabled={isMutating}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)} disabled={isMutating}
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
        </>
      )}
    </div>
  );
};
