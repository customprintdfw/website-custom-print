import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { Plus, Edit2, Trash2, Save, X, Upload, Eye } from "lucide-react";

export const LayoutTemplatesAdmin = () => {
  const { data: layouts, isPending, error } = useQuery("LayoutTemplate", {
    orderBy: { createdAt: "desc" },
  });
  const { create, update, remove, isPending: isMutating } = useMutation("LayoutTemplate");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    forTemplates: "",
    elementsJson: "",
    category: "",
    thumbnail: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      forTemplates: "",
      elementsJson: "",
      category: "",
      thumbnail: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (layout: any) => {
    setFormData({
      name: layout.name,
      description: layout.description,
      icon: layout.icon,
      forTemplates: layout.forTemplates,
      elementsJson: layout.elementsJson,
      category: layout.category,
      thumbnail: layout.thumbnail || "",
    });
    setEditingId(layout.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate JSON
      if (formData.elementsJson) {
        JSON.parse(formData.elementsJson);
      }

      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
      resetForm();
    } catch (err) {
      alert("Failed to save layout. Check that Elements JSON is valid.");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this layout template?")) return;
    try {
      await remove(id);
    } catch (err) {
      alert("Failed to delete layout.");
      console.error(err);
    }
  };

  const handleImportFromCode = () => {
    const codeLayouts = `[
  {
    "name": "Blank Canvas",
    "description": "Start from scratch",
    "icon": "📄",
    "forTemplates": "business-card,flyer,poster,postcard,shirt,banner,brochure,menu",
    "elementsJson": "[]",
    "category": "basic"
  },
  {
    "name": "Classic Business Card",
    "description": "Name, title, contact info",
    "icon": "💼",
    "forTemplates": "business-card",
    "category": "business",
    "elementsJson": "[{\\"type\\":\\"shape\\",\\"x\\":0,\\"y\\":0,\\"width\\":1050,\\"height\\":600,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#1e293b\\",\\"strokeColor\\":\\"#1e293b\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":50,\\"y\\":50,\\"width\\":400,\\"height\\":60,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Your Name\\",\\"fontSize\\":48,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"left\\",\\"color\\":\\"#ffffff\\"},{\\"type\\":\\"text\\",\\"x\\":50,\\"y\\":120,\\"width\\":300,\\"height\\":30,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Your Title / Position\\",\\"fontSize\\":20,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"left\\",\\"color\\":\\"#a3e635\\"},{\\"type\\":\\"shape\\",\\"x\\":50,\\"y\\":170,\\"width\\":200,\\"height\\":3,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"line\\",\\"strokeColor\\":\\"#a3e635\\",\\"strokeWidth\\":3},{\\"type\\":\\"text\\",\\"x\\":50,\\"y\\":450,\\"width\\":400,\\"height\\":100,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"📧 email@example.com\\\\n📱 (555) 123-4567\\\\n🌐 yourwebsite.com\\",\\"fontSize\\":16,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"left\\",\\"color\\":\\"#cbd5e1\\"}]"
  },
  {
    "name": "Event Flyer",
    "description": "Bold headline, details, CTA",
    "icon": "🎉",
    "forTemplates": "flyer",
    "category": "event",
    "elementsJson": "[{\\"type\\":\\"shape\\",\\"x\\":0,\\"y\\":0,\\"width\\":2550,\\"height\\":800,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#3b82f6\\",\\"strokeColor\\":\\"#3b82f6\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":100,\\"y\\":100,\\"width\\":2350,\\"height\\":150,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"BIG EVENT HAPPENING!\\",\\"fontSize\\":96,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#ffffff\\"},{\\"type\\":\\"text\\",\\"x\\":100,\\"y\\":280,\\"width\\":2350,\\"height\\":60,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Saturday, March 15th • 7:00 PM\\",\\"fontSize\\":42,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#fef08a\\"},{\\"type\\":\\"shape\\",\\"x\\":0,\\"y\\":800,\\"width\\":2550,\\"height\\":2500,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#ffffff\\",\\"strokeColor\\":\\"#ffffff\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":200,\\"y\\":1000,\\"width\\":2150,\\"height\\":1200,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Join us for an unforgettable evening!\\\\n\\\\n✨ Live Music\\\\n🍕 Food & Drinks\\\\n🎁 Door Prizes\\\\n\\\\nBring your friends and family for a night of fun and celebration.\\",\\"fontSize\\":48,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"left\\",\\"color\\":\\"#1e293b\\"},{\\"type\\":\\"shape\\",\\"x\\":700,\\"y\\":2600,\\"width\\":1150,\\"height\\":120,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#a3e635\\",\\"strokeColor\\":\\"#a3e635\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":700,\\"y\\":2620,\\"width\\":1150,\\"height\\":80,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"RSVP NOW!\\",\\"fontSize\\":56,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#000000\\"}]"
  },
  {
    "name": "Sale Poster",
    "description": "Big discount, product showcase",
    "icon": "🏷️",
    "forTemplates": "poster",
    "category": "sale",
    "elementsJson": "[{\\"type\\":\\"shape\\",\\"x\\":0,\\"y\\":0,\\"width\\":3600,\\"height\\":5400,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#fef08a\\",\\"strokeColor\\":\\"#fef08a\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":200,\\"y\\":300,\\"width\\":3200,\\"height\\":400,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"MEGA SALE\\",\\"fontSize\\":240,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#000000\\"},{\\"type\\":\\"shape\\",\\"x\\":800,\\"y\\":800,\\"width\\":2000,\\"height\\":800,\\"rotation\\":-5,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"rectangle\\",\\"fillColor\\":\\"#ef4444\\",\\"strokeColor\\":\\"#ef4444\\",\\"strokeWidth\\":0},{\\"type\\":\\"text\\",\\"x\\":800,\\"y\\":900,\\"width\\":2000,\\"height\\":600,\\"rotation\\":-5,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"50% OFF\\",\\"fontSize\\":180,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#ffffff\\"},{\\"type\\":\\"text\\",\\"x\\":200,\\"y\\":2000,\\"width\\":3200,\\"height\\":2400,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"🎯 All Products\\\\n🚀 Limited Time Only\\\\n💳 In-Store & Online\\\\n📦 Free Shipping Over $50\\\\n\\\\nDon't miss out on these incredible deals!\\",\\"fontSize\\":72,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#000000\\"},{\\"type\\":\\"text\\",\\"x\\":200,\\"y\\":4800,\\"width\\":3200,\\"height\\":200,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Visit us at YourStore.com\\",\\"fontSize\\":64,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#1e293b\\"}]"
  },
  {
    "name": "Simple T-Shirt",
    "description": "Centered logo/text design",
    "icon": "👕",
    "forTemplates": "shirt",
    "category": "apparel",
    "elementsJson": "[{\\"type\\":\\"text\\",\\"x\\":600,\\"y\\":600,\\"width\\":2200,\\"height\\":400,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"YOUR BRAND\\",\\"fontSize\\":160,\\"fontFamily\\":\\"Josefin Sans\\",\\"fontWeight\\":\\"bold\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#000000\\"},{\\"type\\":\\"text\\",\\"x\\":600,\\"y\\":1100,\\"width\\":2200,\\"height\\":200,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"text\\":\\"Est. 2024\\",\\"fontSize\\":64,\\"fontFamily\\":\\"Montserrat\\",\\"fontWeight\\":\\"normal\\",\\"fontStyle\\":\\"normal\\",\\"textDecoration\\":\\"none\\",\\"textAlign\\":\\"center\\",\\"color\\":\\"#64748b\\"},{\\"type\\":\\"shape\\",\\"x\\":1400,\\"y\\":1400,\\"width\\":600,\\"height\\":600,\\"rotation\\":0,\\"visible\\":true,\\"locked\\":false,\\"shapeType\\":\\"circle\\",\\"fillColor\\":\\"#a3e635\\",\\"strokeColor\\":\\"#000000\\",\\"strokeWidth\\":8}]"
  }
]`;

    const parsed = JSON.parse(codeLayouts);
    const promises = parsed.map((layout: any) => create(layout));
    Promise.all(promises)
      .then(() => alert(`Imported ${parsed.length} default layouts!`))
      .catch((err) => {
        alert("Failed to import layouts.");
        console.error(err);
      });
  };

  if (isPending) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-montserrat">Loading layout templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-montserrat">
        Error loading layouts: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-josefin_sans text-gray-900">Layout Templates</h2>
          <p className="text-gray-600 font-montserrat text-sm mt-1">
            Manage pre-made layouts for the Design Studio
          </p>
        </div>
        <div className="flex gap-2">
          {(!layouts || layouts.length === 0) && (
            <button
              onClick={handleImportFromCode}
              disabled={isMutating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold font-montserrat text-sm transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> Import Defaults
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            disabled={isMutating}
            className="flex items-center gap-2 bg-gradient-to-r from-lime-400 to-yellow-400 text-black px-4 py-2 rounded-lg font-bold font-montserrat text-sm hover:from-lime-300 hover:to-yellow-300 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Layout
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold font-josefin_sans">
                {editingId ? "Edit Layout Template" : "Add Layout Template"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder="Classic Business Card"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder="Name, title, contact info"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                    Icon (emoji) *
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    placeholder="💼"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    placeholder="business, event, sale, apparel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                  For Templates (comma-separated) *
                </label>
                <input
                  type="text"
                  value={formData.forTemplates}
                  onChange={(e) => setFormData({ ...formData, forTemplates: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder="business-card,flyer,poster"
                />
                <p className="text-xs text-gray-500 font-montserrat mt-1">
                  Valid: business-card, flyer, poster, postcard, shirt, banner, brochure, menu
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-montserrat focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold font-montserrat text-gray-700 mb-1">
                  Elements JSON *
                </label>
                <textarea
                  value={formData.elementsJson}
                  onChange={(e) => setFormData({ ...formData, elementsJson: e.target.value })}
                  required
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder='[{"type":"text","x":50,"y":50,...}]'
                />
                <p className="text-xs text-gray-500 font-montserrat mt-1">
                  JSON array of canvas elements. Must be valid JSON.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 bg-gradient-to-r from-lime-400 to-yellow-400 text-black py-3 rounded-lg font-bold font-montserrat hover:from-lime-300 hover:to-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isMutating ? "Saving..." : editingId ? "Update Layout" : "Create Layout"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold font-montserrat text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layouts Grid */}
      {layouts && layouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-lime-400 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{layout.icon}</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(layout)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(layout.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold font-josefin_sans text-lg text-gray-900 mb-1">
                {layout.name}
              </h3>
              <p className="text-gray-600 font-montserrat text-sm mb-3">{layout.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-lime-100 text-lime-800 px-2 py-1 rounded text-xs font-semibold font-montserrat">
                  {layout.category}
                </span>
                {layout.forTemplates.split(",").map((t: string) => (
                  <span
                    key={t}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-montserrat"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>

              <div className="text-xs text-gray-500 font-montserrat">
                {JSON.parse(layout.elementsJson).length} element
                {JSON.parse(layout.elementsJson).length !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-4">📐</div>
          <p className="text-gray-600 font-montserrat mb-4">No layout templates yet</p>
          <button
            onClick={handleImportFromCode}
            disabled={isMutating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold font-montserrat transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" /> Import Default Layouts
          </button>
        </div>
      )}
    </div>
  );
};
