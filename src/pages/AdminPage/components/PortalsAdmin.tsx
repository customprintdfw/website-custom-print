import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Portal, PortalDraft } from "@animaapp/playground-react-sdk";
import { Pencil, Trash2, Plus, X, Package } from "lucide-react";
import { PortalProductsAdmin } from "./PortalProductsAdmin";

const emptyDraft: PortalDraft = {
  name: "",
  description: "",
  image: "",
  color: "from-blue-700 to-blue-900",
  badge: "🎓 School Portal",
  badgeBg: "bg-white/90 text-blue-800",
};

const COLOR_OPTIONS = [
  { label: "Blue", value: "from-blue-700 to-blue-900" },
  { label: "Red", value: "from-red-700 to-red-900" },
  { label: "Green", value: "from-green-700 to-green-900" },
  { label: "Orange", value: "from-orange-500 to-yellow-600" },
  { label: "Purple", value: "from-purple-700 to-indigo-800" },
  { label: "Lime", value: "from-lime-500 to-green-700" },
  { label: "Black", value: "from-gray-800 to-gray-900" },
  { label: "Teal", value: "from-teal-600 to-teal-800" },
];

const BADGE_BG_OPTIONS = [
  { label: "Blue text", value: "bg-white/90 text-blue-800" },
  { label: "Red text", value: "bg-white/90 text-red-800" },
  { label: "Green text", value: "bg-white/90 text-green-800" },
  { label: "Orange text", value: "bg-white/90 text-orange-700" },
  { label: "Purple text", value: "bg-white/90 text-purple-800" },
  { label: "Lime on black", value: "bg-black/80 text-lime-400" },
  { label: "Black on lime", value: "bg-lime-400/90 text-black" },
];

export const PortalsAdmin = () => {
  const { data: portals, isPending, error } = useQuery("Portal", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating, error: mutationError } = useMutation("Portal");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortalDraft>(emptyDraft);
  const [managingPortal, setManagingPortal] = useState<Portal | null>(null);

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
      setForm(emptyDraft);
    } catch (err) {
      console.error("Failed to save portal:", err);
    }
  };

  const handleEdit = (portal: Portal) => {
    setForm({ name: portal.name, description: portal.description, image: portal.image, color: portal.color, badge: portal.badge, badgeBg: portal.badgeBg });
    setEditingId(portal.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portal?")) return;
    try { await remove(id); } catch (err) { console.error("Failed to delete:", err); }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyDraft); };

  if (managingPortal) {
    return <PortalProductsAdmin portal={managingPortal} onBack={() => setManagingPortal(null)} />;
  }

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
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
          <h2 className="text-2xl font-bold font-josefin_sans">Portals</h2>
          <p className="text-gray-500 font-montserrat text-sm mt-1">{portals?.length || 0} total portals</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyDraft); }}
          className="flex items-center gap-2 bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-5 py-2.5 rounded-lg font-bold hover:from-lime-300 hover:to-yellow-300 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Portal
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-xl font-bold font-josefin_sans">{editingId ? "Edit Portal" : "Add New Portal"}</h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Portal Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. Terrell ISD"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Description *</label>
                <textarea
                  rows={3} required value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors"
                  placeholder="Describe the portal..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Image URL *</label>
                <input
                  type="text" required value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="https://images.unsplash.com/..."
                />
                {form.image && (
                  <img src={form.image} alt="preview" className="mt-2 h-20 w-32 object-cover rounded-lg border border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Overlay Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setForm({ ...form, color: opt.value })}
                      className={`h-10 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all relative ${form.color === opt.value ? "border-black scale-105" : "border-transparent hover:border-gray-400"}`}
                      title={opt.label}
                    />
                  ))}
                </div>
                <input
                  type="text" value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                  placeholder="from-blue-700 to-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Badge Text *</label>
                <input
                  type="text" required value={form.badge}
                  onChange={e => setForm({ ...form, badge: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. 🎓 School Portal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Badge Style</label>
                <div className="flex flex-wrap gap-2">
                  {BADGE_BG_OPTIONS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setForm({ ...form, badgeBg: opt.value })}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${opt.value} ${form.badgeBg === opt.value ? "border-black scale-105" : "border-transparent hover:border-gray-400"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text" value={form.badgeBg}
                  onChange={e => setForm({ ...form, badgeBg: e.target.value })}
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                  placeholder="bg-white/90 text-blue-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={isMutating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3 rounded-lg font-bold font-montserrat disabled:opacity-50 hover:from-blue-700 hover:to-lime-500 transition-all"
                >
                  {isMutating ? "Saving..." : editingId ? "Update Portal" : "Add Portal"}
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

      {/* Portals Grid */}
      {!portals || portals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🏫</div>
          <p className="text-xl font-montserrat font-semibold">No portals yet</p>
          <p className="text-sm mt-2 font-montserrat">Click "Add Portal" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map(portal => (
            <div key={portal.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40 overflow-hidden">
                <img src={portal.image} alt={portal.name} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${portal.color} opacity-70`}></div>
                <div className="absolute top-2 right-2">
                  <span className={`${portal.badgeBg} text-xs font-bold px-2 py-0.5 rounded-full font-montserrat`}>{portal.badge}</span>
                </div>
                <div className="absolute bottom-2 left-3">
                  <h3 className="text-white font-bold font-josefin_sans text-lg drop-shadow">{portal.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-500 text-sm font-montserrat line-clamp-2">{portal.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setManagingPortal(portal)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-lime-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-lime-600 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" /> Products
                  </button>
                  <button
                    onClick={() => handleEdit(portal)} disabled={isMutating}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(portal.id)} disabled={isMutating}
                    className="flex items-center justify-center gap-1.5 bg-red-500 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
