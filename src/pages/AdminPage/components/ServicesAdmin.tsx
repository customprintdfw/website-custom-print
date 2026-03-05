import { useState, useRef } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Service, ServiceDraft } from "@animaapp/playground-react-sdk";
import { Pencil, Trash2, Plus, X, Upload, ImageIcon } from "lucide-react";

const emptyDraft: ServiceDraft = {
  title: "",
  description: "",
  icon: "⚙️",
  gradient: "from-blue-500 to-blue-600",
};

const GRADIENT_OPTIONS = [
  "from-blue-500 to-blue-600",
  "from-blue-600 to-blue-700",
  "from-blue-700 to-blue-800",
  "from-lime-400 to-lime-500",
  "from-lime-500 to-lime-600",
  "from-yellow-400 to-yellow-500",
  "from-yellow-500 to-yellow-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
];

const ICON_OPTIONS = ["⚙️", "🚗", "🎨", "👕", "🧵", "🪧", "📋", "🖨️", "✂️", "🏷️", "📦", "🎯", "🖼️", "🏆", "⭐"];

export const ServicesAdmin = () => {
  const { data: services, isPending, error } = useQuery("Service", { orderBy: { createdAt: "desc" } });
  const { create, update, remove, isPending: isMutating, error: mutationError } = useMutation("Service");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceDraft>(emptyDraft);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error("Failed to save service:", err);
    }
  };

  const handleEdit = (service: Service) => {
    setForm({ title: service.title, description: service.description, icon: service.icon, gradient: service.gradient });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try { await remove(id); } catch (err) { console.error("Failed to delete:", err); }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyDraft); };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-24 bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
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
          <h2 className="text-2xl font-bold font-josefin_sans">Services</h2>
          <p className="text-gray-500 font-montserrat text-sm mt-1">{services?.length || 0} total services</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyDraft); }}
          className="flex items-center gap-2 bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-5 py-2.5 rounded-lg font-bold hover:from-lime-300 hover:to-yellow-300 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Service
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
              <h3 className="text-xl font-bold font-josefin_sans">{editingId ? "Edit Service" : "Add New Service"}</h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Service Title *</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat transition-colors"
                  placeholder="e.g. CNC Work"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-montserrat">Description *</label>
                <textarea
                  rows={3} required value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat resize-none transition-colors"
                  placeholder="Describe the service..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Icon / Image</label>

                {/* Image Upload */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 font-montserrat mb-1.5">Upload a custom image (replaces emoji)</label>
                  <div
                    className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-lime-400 hover:bg-lime-50/30 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.icon.startsWith("data:") || form.icon.startsWith("http") ? (
                      <div className="relative w-full">
                        <img
                          src={form.icon}
                          alt="Service icon preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setForm({ ...form, icon: "⚙️" }); }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <span className="text-white text-xs font-montserrat font-semibold flex items-center gap-1"><Upload className="w-3 h-3" /> Change image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-lime-400 transition-colors" />
                        <span className="text-sm text-gray-400 font-montserrat group-hover:text-lime-600 transition-colors">Click to upload image</span>
                        <span className="text-xs text-gray-300 font-montserrat">PNG, JPG, GIF, WebP</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const result = ev.target?.result as string;
                          if (result) setForm({ ...form, icon: result });
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                {/* Emoji picker (only shown when no image uploaded) */}
                {!form.icon.startsWith("data:") && !form.icon.startsWith("http") && (
                  <>
                    <label className="block text-xs text-gray-500 font-montserrat mb-1.5">Or pick an emoji</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon} type="button"
                          onClick={() => setForm({ ...form, icon })}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${form.icon === icon ? "border-lime-400 bg-lime-50" : "border-gray-200 hover:border-gray-400"}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text" value={form.icon}
                      onChange={e => setForm({ ...form, icon: e.target.value })}
                      className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                      placeholder="Or type any emoji..."
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Card Gradient</label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_OPTIONS.map(g => (
                    <button
                      key={g} type="button"
                      onClick={() => setForm({ ...form, gradient: g })}
                      className={`h-10 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${form.gradient === g ? "border-black scale-105" : "border-transparent hover:border-gray-400"}`}
                    />
                  ))}
                </div>
                <input
                  type="text" value={form.gradient}
                  onChange={e => setForm({ ...form, gradient: e.target.value })}
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-lime-400 outline-none font-montserrat text-sm transition-colors"
                  placeholder="from-blue-500 to-blue-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={isMutating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-lime-400 text-white py-3 rounded-lg font-bold font-montserrat disabled:opacity-50 hover:from-blue-700 hover:to-lime-500 transition-all"
                >
                  {isMutating ? "Saving..." : editingId ? "Update Service" : "Add Service"}
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

      {/* Services Grid */}
      {!services || services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-xl font-montserrat font-semibold">No services yet</p>
          <p className="text-sm mt-2 font-montserrat">Click "Add Service" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-br ${service.gradient} p-6 text-center`}>
                <div className="text-5xl">{service.icon}</div>
              </div>
              <div className="p-4">
                <h3 className="font-bold font-josefin_sans text-lg mb-1">{service.title}</h3>
                <p className="text-gray-500 text-sm font-montserrat line-clamp-2">{service.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(service)} disabled={isMutating}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)} disabled={isMutating}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
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
