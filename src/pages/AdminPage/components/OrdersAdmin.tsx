import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import type { Order } from "@animaapp/playground-react-sdk";
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = ["new", "in-progress", "completed", "cancelled"] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_STYLES: Record<Status, { bg: string; text: string; icon: React.ReactNode }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", icon: <Clock className="w-3.5 h-3.5" /> },
  "in-progress": { bg: "bg-yellow-100", text: "text-yellow-700", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  completed: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const OrderRow = ({ order, onStatusChange, onDelete }: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const status = (order.status as Status) in STATUS_STYLES ? (order.status as Status) : "new";
  const style = STATUS_STYLES[status];

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Main Row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Type Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          order.type === "portal" ? "bg-purple-100" : "bg-blue-100"
        }`}>
          {order.type === "portal"
            ? <ShoppingBag className="w-5 h-5 text-purple-600" />
            : <Package className="w-5 h-5 text-blue-600" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold font-josefin_sans text-gray-900 truncate">{order.productName}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-montserrat ${style.bg} ${style.text}`}>
              {style.icon} {order.status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-montserrat ${
              order.type === "portal" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
            }`}>
              {order.type === "portal" ? "Portal" : "Product"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-sm text-gray-500 font-montserrat">{order.customerName}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500 font-montserrat">{order.customerEmail}</span>
            {order.portalName && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-purple-500 font-montserrat">{order.portalName}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-blue-600 font-montserrat">{order.price}</p>
            <p className="text-xs text-gray-400 font-montserrat">qty: {order.quantity}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500 font-montserrat">{date}</p>
            <p className="text-xs text-gray-400 font-montserrat">{time}</p>
          </div>

          {/* Status Selector */}
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="text-xs font-montserrat border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:border-lime-400 outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete order"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {order.size && <Detail label="Size" value={order.size} />}
            {order.color && <Detail label="Color" value={order.color} />}
            {order.style && <Detail label="Style" value={order.style} />}
            {order.printType && <Detail label="Print Type" value={order.printType} />}
            {order.printLocation && <Detail label="Print Location" value={order.printLocation} />}
            {order.quantity && <Detail label="Quantity" value={order.quantity} />}
            {order.price && <Detail label="Price" value={order.price} />}
            {order.paper && <Detail label="Paper" value={order.paper} />}
            {order.coating && <Detail label="Coating" value={order.coating} />}
            {order.productionTime && <Detail label="Production" value={order.productionTime} />}
            {order.cardSlit && <Detail label="Card Slit" value={order.cardSlit} />}
            {order.category && <Detail label="Category" value={order.category} />}
            {order.portalName && <Detail label="Portal" value={order.portalName} />}
          </div>
          {order.notes && (
            <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 font-montserrat mb-1">Notes</p>
              <p className="text-sm text-gray-700 font-montserrat">{order.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
    <p className="text-xs font-semibold text-gray-400 font-montserrat">{label}</p>
    <p className="text-sm text-gray-800 font-montserrat font-medium truncate">{value}</p>
  </div>
);

const FILTER_OPTIONS = ["all", "new", "in-progress", "completed", "cancelled"] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

export const OrdersAdmin = () => {
  const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "portal" | "product">("all");

  const { data: orders, isPending, error } = useQuery("Order", {
    orderBy: { createdAt: "desc" },
  });

  const { update, remove } = useMutation("Order");

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await update(id, { status });
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const filtered = orders?.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType = typeFilter === "all" || o.type === typeFilter;
    return matchStatus && matchType;
  }) ?? [];

  // Stats
  const newCount = orders?.filter((o) => o.status === "new").length ?? 0;
  const inProgressCount = orders?.filter((o) => o.status === "in-progress").length ?? 0;
  const completedCount = orders?.filter((o) => o.status === "completed").length ?? 0;
  const portalCount = orders?.filter((o) => o.type === "portal").length ?? 0;
  const productCount = orders?.filter((o) => o.type === "product").length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-josefin_sans text-gray-900 mb-1">Orders</h2>
        <p className="text-gray-500 font-montserrat text-sm">
          All orders placed through portals and products
        </p>
      </div>

      {/* Stats */}
      {orders && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "New", value: newCount, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "In Progress", value: inProgressCount, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Completed", value: completedCount, color: "text-green-600", bg: "bg-green-50" },
            { label: "Portal Orders", value: portalCount, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Product Orders", value: productCount, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold font-josefin_sans ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 font-montserrat mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-montserrat capitalize transition-all ${
                statusFilter === f ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["all", "portal", "product"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-montserrat capitalize transition-all ${
                typeFilter === t ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-red-500 font-montserrat">
          Error loading orders: {error.message}
        </div>
      )}

      {/* Empty */}
      {!isPending && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-montserrat font-semibold">
            {orders?.length === 0 ? "No orders yet" : "No orders match your filters"}
          </p>
          <p className="text-sm mt-2 font-montserrat">
            {orders?.length === 0
              ? "Orders will appear here when customers place them through portals or products."
              : "Try adjusting the filters above."}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!isPending && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
