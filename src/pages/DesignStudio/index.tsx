import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  X,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Minus,
  Undo,
  Redo,
  Download,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Layers,
  Eye,
  EyeOff,
  Copy,
  ShoppingCart,
} from "lucide-react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { useCart } from "../../context/CartContext";

// ── Template Definitions ────────────────────────────────────────────────────────
type TemplateType = "business-card" | "flyer" | "poster" | "postcard" | "shirt" | "banner" | "brochure" | "menu";

interface Template {
  id: TemplateType;
  name: string;
  width: number;
  height: number;
  unit: "in" | "px";
  dpi: number;
  description: string;
  icon: string;
  category: "print" | "apparel" | "signage";
}

// ── Pre-Made Layout Templates ──────────────────────────────────────────────────
interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  forTemplates: TemplateType[];
  elements: Omit<CanvasElement, "id">[];
}

const TEMPLATES: Template[] = [
  {
    id: "business-card",
    name: "Business Card",
    width: 3.5,
    height: 2,
    unit: "in",
    dpi: 300,
    description: "Standard 3.5\" × 2\" business card",
    icon: "💼",
    category: "print",
  },
  {
    id: "flyer",
    name: "Flyer",
    width: 8.5,
    height: 11,
    unit: "in",
    dpi: 300,
    description: "Letter-size flyer (8.5\" × 11\")",
    icon: "📄",
    category: "print",
  },
  {
    id: "poster",
    name: "Poster",
    width: 24,
    height: 36,
    unit: "in",
    dpi: 150,
    description: "Large poster (24\" × 36\")",
    icon: "🖼️",
    category: "print",
  },
  {
    id: "postcard",
    name: "Postcard",
    width: 6,
    height: 4,
    unit: "in",
    dpi: 300,
    description: "Standard postcard (6\" × 4\")",
    icon: "✉️",
    category: "print",
  },
  {
    id: "shirt",
    name: "T-Shirt Design",
    width: 12,
    height: 16,
    unit: "in",
    dpi: 150,
    description: "Front print area (12\" × 16\")",
    icon: "👕",
    category: "apparel",
  },
  {
    id: "banner",
    name: "Banner",
    width: 48,
    height: 24,
    unit: "in",
    dpi: 100,
    description: "Vinyl banner (4' × 2')",
    icon: "🎌",
    category: "signage",
  },
  {
    id: "brochure",
    name: "Brochure",
    width: 8.5,
    height: 11,
    unit: "in",
    dpi: 300,
    description: "Tri-fold brochure panel",
    icon: "📰",
    category: "print",
  },
  {
    id: "menu",
    name: "Menu",
    width: 8.5,
    height: 14,
    unit: "in",
    dpi: 300,
    description: "Restaurant menu (8.5\" × 14\")",
    icon: "🍽️",
    category: "print",
  },
];

// ── Canvas Element Types ────────────────────────────────────────────────────────
type ElementType = "text" | "image" | "shape" | "line";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  // Image-specific
  imageUrl?: string;
  // Shape-specific
  shapeType?: "rectangle" | "circle" | "line";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

// ── Main Component ──────────────────────────────────────────────────────────────
export const DesignStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName") || "Custom Design";

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "text" | "image" | "shape" | "line">("select");
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLayers, setShowLayers] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addItem } = useCart();
  const { create: createOrder } = useMutation("Order");
  const { data: dbLayouts, isPending: layoutsLoading } = useQuery("LayoutTemplate");

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // ── Template Selection ──────────────────────────────────────────────────────
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowLayoutPicker(true);
  };

  const handleSelectLayout = (layout: LayoutTemplate) => {
    if (!selectedTemplate) return;
    
    // Scale elements to match template DPI
    const scaledElements = layout.elements.map((el, idx) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${idx}`,
    }));

    setElements(scaledElements);
    setHistory([scaledElements]);
    setHistoryIndex(0);
    setBackgroundColor("#ffffff");
    setShowLayoutPicker(false);
  };

  // ── History Management ──────────────────────────────────────────────────────
  const saveToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // ── Add Elements ────────────────────────────────────────────────────────────
  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      rotation: 0,
      visible: true,
      locked: false,
      text: "Double-click to edit",
      fontSize: 24,
      fontFamily: "Montserrat",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "left",
      color: "#000000",
    };
    const updated = [...elements, newElement];
    setElements(updated);
    saveToHistory(updated);
    setSelectedElementId(newElement.id);
    setTool("select");
  };

  const addImageElement = (url: string) => {
    const newElement: CanvasElement = {
      id: `image-${Date.now()}`,
      type: "image",
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      rotation: 0,
      visible: true,
      locked: false,
      imageUrl: url,
    };
    const updated = [...elements, newElement];
    setElements(updated);
    saveToHistory(updated);
    setSelectedElementId(newElement.id);
    setTool("select");
  };

  const addShapeElement = (shapeType: "rectangle" | "circle") => {
    const newElement: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      rotation: 0,
      visible: true,
      locked: false,
      shapeType,
      fillColor: "#3b82f6",
      strokeColor: "#1e40af",
      strokeWidth: 2,
    };
    const updated = [...elements, newElement];
    setElements(updated);
    saveToHistory(updated);
    setSelectedElementId(newElement.id);
    setTool("select");
  };

  const addLineElement = () => {
    const newElement: CanvasElement = {
      id: `line-${Date.now()}`,
      type: "shape",
      x: 50,
      y: 100,
      width: 200,
      height: 0,
      rotation: 0,
      visible: true,
      locked: false,
      shapeType: "line",
      strokeColor: "#000000",
      strokeWidth: 3,
    };
    const updated = [...elements, newElement];
    setElements(updated);
    saveToHistory(updated);
    setSelectedElementId(newElement.id);
    setTool("select");
  };

  // ── Update Element ──────────────────────────────────────────────────────────
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(updated);
  };

  const commitElementUpdate = () => {
    saveToHistory(elements);
  };

  // ── Delete Element ──────────────────────────────────────────────────────────
  const deleteElement = (id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    setElements(updated);
    saveToHistory(updated);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // ── Duplicate Element ───────────────────────────────────────────────────────
  const duplicateElement = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const newElement = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
    const updated = [...elements, newElement];
    setElements(updated);
    saveToHistory(updated);
    setSelectedElementId(newElement.id);
  };

  // ── Layer Order ─────────────────────────────────────────────────────────────
  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;
    const updated = [...elements];
    if (direction === "up" && index < elements.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    } else if (direction === "down" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    }
    setElements(updated);
    saveToHistory(updated);
  };

  // ── Image Upload ────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      addImageElement(url);
    };
    reader.readAsDataURL(file);
  };

  // ── Export Design ───────────────────────────────────────────────────────────
  const exportDesign = () => {
    // In a real app, this would render to a high-res canvas and export as PNG/PDF
    const designData = {
      template: selectedTemplate,
      elements,
      backgroundColor,
    };
    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate?.name.replace(/\s+/g, "-").toLowerCase()}-design.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Save & Order ────────────────────────────────────────────────────────────
  const handleSaveAndOrder = async () => {
    if (!selectedTemplate) return;

    // Export design as JSON (in production, render to image)
    const designData = {
      template: selectedTemplate,
      elements,
      backgroundColor,
    };

    try {
      await createOrder({
        type: "product",
        status: "new",
        customerName: "Design Studio User",
        customerEmail: "design@customprintdfw.com",
        productName: productName,
        productId: productId || undefined,
        price: "$0.00",
        quantity: "1",
        size: `${selectedTemplate.width}" × ${selectedTemplate.height}"`,
        notes: `Design Studio: ${selectedTemplate.name}\n\nDesign data: ${JSON.stringify(designData)}`,
        designFileName: `${selectedTemplate.name.replace(/\s+/g, "-").toLowerCase()}-design.json`,
      });

      alert("Design saved! Redirecting to cart...");
      navigate("/");
    } catch (err) {
      console.error("Failed to save design:", err);
      alert("Failed to save design. Please try again.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  
  // Layout Picker Modal
  if (selectedTemplate && showLayoutPicker) {
    // Convert DB layouts to local format
    const convertedLayouts: LayoutTemplate[] = dbLayouts
      ? dbLayouts
          .filter((dbLayout) =>
            dbLayout.forTemplates.split(",").map((t) => t.trim()).includes(selectedTemplate.id)
          )
          .map((dbLayout) => ({
            id: dbLayout.id,
            name: dbLayout.name,
            description: dbLayout.description,
            icon: dbLayout.icon,
            forTemplates: dbLayout.forTemplates.split(",").map((t) => t.trim()) as TemplateType[],
            elements: JSON.parse(dbLayout.elementsJson),
          }))
      : [];

    const availableLayouts = convertedLayouts;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-josefin_sans text-white mb-2">
              Choose a Layout
            </h1>
            <p className="text-gray-400 font-montserrat">
              {selectedTemplate.name} • {selectedTemplate.width}" × {selectedTemplate.height}"
            </p>
          </div>

          {layoutsLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-montserrat">Loading layouts...</p>
            </div>
          ) : availableLayouts.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700">
              <div className="text-5xl mb-4">📐</div>
              <p className="text-gray-400 font-montserrat mb-2">No layouts available for this template</p>
              <p className="text-gray-500 font-montserrat text-sm">
                Add layouts via Admin Panel → Layouts tab
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {availableLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleSelectLayout(layout)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 hover:border-lime-400 transition-all hover:scale-105 text-left group"
              >
                <div className="text-5xl mb-4">{layout.icon}</div>
                <h3 className="text-xl font-bold font-josefin_sans text-white mb-2 group-hover:text-lime-400 transition-colors">
                  {layout.name}
                </h3>
                <p className="text-gray-400 font-montserrat text-sm">
                  {layout.description}
                </p>
                {layout.elements.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500 font-montserrat">
                    {layout.elements.length} element{layout.elements.length !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setShowLayoutPicker(false);
              }}
              className="text-gray-400 hover:text-white font-montserrat transition-colors"
            >
              ← Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold font-josefin_sans text-white mb-4">
              🎨 Design Studio
            </h1>
            <p className="text-gray-400 font-montserrat text-lg">
              Create professional designs for business cards, flyers, posters, shirts, and more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 hover:border-lime-400 transition-all hover:scale-105 text-left group"
              >
                <div className="text-5xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-bold font-josefin_sans text-white mb-2 group-hover:text-lime-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-gray-400 font-montserrat text-sm mb-3">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-montserrat">
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {template.width}" × {template.height}"
                  </span>
                  <span className="bg-gray-700 px-2 py-1 rounded">{template.dpi} DPI</span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white font-montserrat transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canvasWidth = selectedTemplate.width * selectedTemplate.dpi * zoom;
  const canvasHeight = selectedTemplate.height * selectedTemplate.dpi * zoom;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Toolbar */}
      <div className="bg-black border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold font-josefin_sans text-lg">{selectedTemplate.name}</h2>
            <p className="text-xs text-gray-400 font-montserrat">
              {selectedTemplate.width}" × {selectedTemplate.height}" @ {selectedTemplate.dpi} DPI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-2" />
          <button
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm font-montserrat text-gray-400 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-2" />
          <button
            onClick={exportDesign}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-montserrat text-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleSaveAndOrder}
            className="px-4 py-2 bg-gradient-to-r from-lime-400 to-yellow-400 text-black hover:from-lime-300 hover:to-yellow-300 rounded-lg font-bold font-montserrat text-sm transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Save & Order
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => setTool("select")}
            className={`p-3 rounded-lg transition-colors ${
              tool === "select" ? "bg-lime-400 text-black" : "hover:bg-gray-700"
            }`}
            title="Select"
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={addTextElement}
            className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add Text"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => addShapeElement("rectangle")}
            className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add Rectangle"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => addShapeElement("circle")}
            className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add Circle"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={addLineElement}
            className="p-3 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add Line"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`p-3 rounded-lg transition-colors ${
              showLayers ? "bg-lime-400 text-black" : "hover:bg-gray-700"
            }`}
            title="Toggle Layers"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-700 p-8">
          <div
            ref={canvasRef}
            className="mx-auto shadow-2xl relative"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              backgroundColor,
            }}
          >
            {elements.map((el) => {
              if (!el.visible) return null;

              const isSelected = el.id === selectedElementId;

              return (
                <div
                  key={el.id}
                  onClick={() => !el.locked && setSelectedElementId(el.id)}
                  className={`absolute cursor-move ${
                    isSelected ? "ring-2 ring-lime-400" : ""
                  } ${el.locked ? "cursor-not-allowed opacity-60" : ""}`}
                  style={{
                    left: `${el.x * zoom}px`,
                    top: `${el.y * zoom}px`,
                    width: `${el.width * zoom}px`,
                    height: `${el.height * zoom}px`,
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                >
                  {el.type === "text" && (
                    <div
                      contentEditable={!el.locked}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        updateElement(el.id, { text: e.currentTarget.textContent || "" });
                        commitElementUpdate();
                      }}
                      style={{
                        fontSize: `${(el.fontSize || 24) * zoom}px`,
                        fontFamily: el.fontFamily,
                        fontWeight: el.fontWeight,
                        fontStyle: el.fontStyle,
                        textDecoration: el.textDecoration,
                        textAlign: el.textAlign,
                        color: el.color,
                        outline: "none",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {el.text}
                    </div>
                  )}

                  {el.type === "image" && el.imageUrl && (
                    <img
                      src={el.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  )}

                  {el.type === "shape" && el.shapeType === "rectangle" && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: el.fillColor,
                        border: `${(el.strokeWidth || 0) * zoom}px solid ${el.strokeColor}`,
                      }}
                    />
                  )}

                  {el.type === "shape" && el.shapeType === "circle" && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: el.fillColor,
                        border: `${(el.strokeWidth || 0) * zoom}px solid ${el.strokeColor}`,
                      }}
                    />
                  )}

                  {el.type === "shape" && el.shapeType === "line" && (
                    <div
                      className="w-full"
                      style={{
                        borderTop: `${(el.strokeWidth || 2) * zoom}px solid ${el.strokeColor}`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          {/* Properties Panel */}
          {selectedElement && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold font-josefin_sans mb-4 flex items-center justify-between">
                <span>Properties</span>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="p-1.5 hover:bg-red-600 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </h3>

              <div className="space-y-3">
                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 font-montserrat block mb-1">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                      onBlur={commitElementUpdate}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-montserrat block mb-1">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                      onBlur={commitElementUpdate}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-montserrat block mb-1">W</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      onBlur={commitElementUpdate}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-montserrat block mb-1">H</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      onBlur={commitElementUpdate}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Text Properties */}
                {selectedElement.type === "text" && (
                  <>
                    <div>
                      <label className="text-xs text-gray-400 font-montserrat block mb-1">Font Size</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 24}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        onBlur={commitElementUpdate}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-montserrat block mb-1">Font Family</label>
                      <select
                        value={selectedElement.fontFamily || "Montserrat"}
                        onChange={(e) => {
                          updateElement(selectedElement.id, { fontFamily: e.target.value });
                          commitElementUpdate();
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      >
                        <option>Montserrat</option>
                        <option>Josefin Sans</option>
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Georgia</option>
                        <option>Courier New</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, {
                            fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold",
                          });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.fontWeight === "bold" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <Bold className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, {
                            fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic",
                          });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.fontStyle === "italic" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <Italic className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, {
                            textDecoration: selectedElement.textDecoration === "underline" ? "none" : "underline",
                          });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.textDecoration === "underline" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <Underline className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, { textAlign: "left" });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.textAlign === "left" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <AlignLeft className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, { textAlign: "center" });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.textAlign === "center" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <AlignCenter className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          updateElement(selectedElement.id, { textAlign: "right" });
                          commitElementUpdate();
                        }}
                        className={`flex-1 p-2 rounded transition-colors ${
                          selectedElement.textAlign === "right" ? "bg-lime-400 text-black" : "bg-gray-700"
                        }`}
                      >
                        <AlignRight className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-montserrat block mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.color || "#000000"}
                        onChange={(e) => {
                          updateElement(selectedElement.id, { color: e.target.value });
                          commitElementUpdate();
                        }}
                        className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {/* Shape Properties */}
                {selectedElement.type === "shape" && (
                  <>
                    {selectedElement.shapeType !== "line" && (
                      <div>
                        <label className="text-xs text-gray-400 font-montserrat block mb-1">Fill Color</label>
                        <input
                          type="color"
                          value={selectedElement.fillColor || "#3b82f6"}
                          onChange={(e) => {
                            updateElement(selectedElement.id, { fillColor: e.target.value });
                            commitElementUpdate();
                          }}
                          className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-400 font-montserrat block mb-1">Stroke Color</label>
                      <input
                        type="color"
                        value={selectedElement.strokeColor || "#1e40af"}
                        onChange={(e) => {
                          updateElement(selectedElement.id, { strokeColor: e.target.value });
                          commitElementUpdate();
                        }}
                        className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-montserrat block mb-1">Stroke Width</label>
                      <input
                        type="number"
                        value={selectedElement.strokeWidth || 2}
                        onChange={(e) => updateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })}
                        onBlur={commitElementUpdate}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 rounded px-3 py-2 text-sm font-montserrat transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      updateElement(selectedElement.id, { locked: !selectedElement.locked });
                      commitElementUpdate();
                    }}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      selectedElement.locked ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {selectedElement.locked ? "🔒" : "🔓"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Background */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold font-josefin_sans mb-3">Canvas</h3>
            <div>
              <label className="text-xs text-gray-400 font-montserrat block mb-1">Background Color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Layers Panel */}
          {showLayers && (
            <div className="p-4">
              <h3 className="font-bold font-josefin_sans mb-3">Layers ({elements.length})</h3>
              <div className="space-y-1">
                {[...elements].reverse().map((el, idx) => {
                  const actualIndex = elements.length - 1 - idx;
                  const isSelected = el.id === selectedElementId;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected ? "bg-lime-400 text-black" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(el.id, { visible: !el.visible });
                          commitElementUpdate();
                        }}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        {el.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <span className="flex-1 text-sm font-montserrat truncate">
                        {el.type === "text" ? el.text?.slice(0, 20) : `${el.type} ${el.id.split("-")[1]}`}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(el.id, "up");
                          }}
                          disabled={actualIndex === elements.length - 1}
                          className="p-1 hover:bg-gray-600 rounded disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(el.id, "down");
                          }}
                          disabled={actualIndex === 0}
                          className="p-1 hover:bg-gray-600 rounded disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
