import { useState } from "react";
import {
  Package, Plus, Search, Filter, CheckCircle2, AlertTriangle,
  XCircle, X, Edit3, Trash2, MoreHorizontal, Download,
  Cpu, Radio, Server, Wifi, Battery, Archive,
  CheckSquare, Clock, MapPin, User, BarChart3, ChevronRight,
  Wrench, Shield, Activity, Hash
} from "lucide-react";

interface InventoryPageProps {
  onNavigate?: (page: string) => void;
}

type ItemStatus = "available" | "assigned" | "damaged" | "maintenance" | "lost" | "retired";
type ItemCategory = "onu" | "olt" | "mikrotik" | "router" | "switch" | "sfp" | "cable" | "adapter" | "ups" | "tools" | "other";

interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  brand: string;
  model: string;
  serial: string;
  status: ItemStatus;
  quantity: number;
  purchaseDate: string;
  purchasePrice: number;
  location: string;
  assignedTo?: string;
  assignedCustomer?: string;
  notes?: string;
  warrantyUntil?: string;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ElementType> = {
  onu: Radio, olt: Radio, mikrotik: Server, router: Wifi, switch: Activity,
  sfp: Cpu, cable: Hash, adapter: CheckSquare, ups: Battery, tools: Wrench, other: Package,
};

const CATEGORY_COLORS: Record<ItemCategory, string> = {
  onu: "#2563EB", olt: "#7C3AED", mikrotik: "#8B2020", router: "#16A34A",
  switch: "#D97706", sfp: "#0891B2", cable: "#6B7280", adapter: "#16A34A",
  ups: "#F59E0B", tools: "#64748B", other: "#9CA3AF",
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; text: string }> = {
  available: { label: "Available", bg: "rgba(22,163,74,0.1)", text: "#16A34A" },
  assigned: { label: "Assigned", bg: "rgba(37,99,235,0.1)", text: "#2563EB" },
  damaged: { label: "Damaged", bg: "rgba(220,38,38,0.1)", text: "#DC2626" },
  maintenance: { label: "Maintenance", bg: "rgba(217,119,6,0.1)", text: "#D97706" },
  lost: { label: "Lost", bg: "rgba(107,114,128,0.1)", text: "#6B7280" },
  retired: { label: "Retired", bg: "rgba(107,114,128,0.07)", text: "#9CA3AF" },
};

const initialInventory: InventoryItem[] = [];

const inputStyle = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--foreground)",
};

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState("");

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: "onu", status: "available", quantity: 1, purchasePrice: 0,
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.serial.includes(search) || item.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchCat = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const stats = {
    total: items.reduce((s, i) => s + i.quantity, 0),
    available: items.filter(i => i.status === "available").reduce((s, i) => s + i.quantity, 0),
    assigned: items.filter(i => i.status === "assigned").reduce((s, i) => s + i.quantity, 0),
    damaged: items.filter(i => i.status === "damaged").reduce((s, i) => s + i.quantity, 0),
    totalValue: items.reduce((s, i) => s + (i.purchasePrice * i.quantity), 0),
  };

  const handleAdd = () => {
    if (!newItem.name || !newItem.serial) return;
    const item: InventoryItem = {
      id: `INV-${String(items.length + 1).padStart(3, "0")}`,
      name: newItem.name!,
      category: newItem.category as ItemCategory,
      brand: newItem.brand || "—",
      model: newItem.model || "—",
      serial: newItem.serial!,
      status: newItem.status as ItemStatus,
      quantity: newItem.quantity || 1,
      purchaseDate: newItem.purchaseDate || new Date().toLocaleDateString("en-GB"),
      purchasePrice: newItem.purchasePrice || 0,
      location: newItem.location || "Warehouse",
      notes: newItem.notes,
    };
    setItems(prev => [item, ...prev]);
    setShowAddModal(false);
    showToast(`Equipment "${item.name}" added to inventory!`);
    setNewItem({ category: "onu", status: "available", quantity: 1, purchasePrice: 0 });
  };

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Equipment Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
              {items.length} Items
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Track ONU, OLT, MikroTik, switches, cables and all ISP equipment
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: "var(--primary)" }}>
            <Plus size={14} /> Add Equipment
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Items", value: stats.total, color: "var(--foreground)", icon: Package },
          { label: "Available", value: stats.available, color: "#16A34A", icon: CheckCircle2 },
          { label: "Assigned", value: stats.assigned, color: "#2563EB", icon: User },
          { label: "Damaged", value: stats.damaged, color: "#DC2626", icon: AlertTriangle },
          { label: "Total Value", value: `৳${(stats.totalValue / 1000).toFixed(0)}k`, color: "var(--primary)", icon: BarChart3, isText: true },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: `${s.color}15` }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 max-w-80 px-3 py-2.5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent"
            style={{ fontSize: 13, color: "var(--foreground)" }} placeholder="Search equipment, serial, brand..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="all">All Categories</option>
          {Object.keys(CATEGORY_ICONS).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
        </select>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border overflow-hidden overflow-x-auto shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ background: "var(--muted)", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <th className="px-5 py-3 text-left">Equipment</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Serial</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Assigned To</th>
              <th className="px-5 py-3 text-right">Value</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const Icon = CATEGORY_ICONS[item.category];
              const catColor = CATEGORY_COLORS[item.category];
              const sc = STATUS_CONFIG[item.status];
              return (
                <tr key={item.id} className="group" style={{ borderTop: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: `${catColor}15` }}>
                        <Icon size={16} style={{ color: catColor }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{item.brand} · {item.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase" style={{ background: `${catColor}15`, color: catColor }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{item.serial}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold" style={{ fontSize: 14, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>{item.quantity}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    <div className="flex items-center gap-1"><MapPin size={11} /> {item.location}</div>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    {item.assignedCustomer ? (
                      <div>
                        <div style={{ color: "var(--primary)", fontWeight: 500 }}>{item.assignedCustomer}</div>
                        <div style={{ fontSize: 11 }}>{item.assignedTo}</div>
                      </div>
                    ) : item.assignedTo || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right" style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                    ৳{(item.purchasePrice * item.quantity).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => setSelected(item)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "var(--muted-foreground)", background: "var(--muted)" }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12" style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
                No equipment found matching your filters.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5 sticky top-0 z-10" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>Add Equipment</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>EQUIPMENT NAME *</label>
                  <input value={newItem.name || ""} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="e.g. Huawei EG8145X6 ONU" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>CATEGORY</label>
                  <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}
                    value={newItem.category} onChange={e => setNewItem(n => ({ ...n, category: e.target.value as ItemCategory }))}>
                    {["onu", "olt", "mikrotik", "router", "switch", "sfp", "cable", "adapter", "ups", "tools", "other"].map(c => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>STATUS</label>
                  <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}
                    value={newItem.status} onChange={e => setNewItem(n => ({ ...n, status: e.target.value as ItemStatus }))}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>BRAND</label>
                  <input value={newItem.brand || ""} onChange={e => setNewItem(n => ({ ...n, brand: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="Huawei, ZTE, MikroTik..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>MODEL</label>
                  <input value={newItem.model || ""} onChange={e => setNewItem(n => ({ ...n, model: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="Model number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>SERIAL NUMBER *</label>
                  <input value={newItem.serial || ""} onChange={e => setNewItem(n => ({ ...n, serial: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="Serial / IMEI" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>QUANTITY</label>
                  <input type="number" min="1" value={newItem.quantity || 1} onChange={e => setNewItem(n => ({ ...n, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>PURCHASE PRICE (৳)</label>
                  <input type="number" value={newItem.purchasePrice || 0} onChange={e => setNewItem(n => ({ ...n, purchasePrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>PURCHASE DATE</label>
                  <input type="date" value={newItem.purchaseDate || ""} onChange={e => setNewItem(n => ({ ...n, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>WARRANTY UNTIL</label>
                  <input type="date" value={newItem.warrantyUntil || ""} onChange={e => setNewItem(n => ({ ...n, warrantyUntil: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>STORAGE LOCATION</label>
                  <input value={newItem.location || ""} onChange={e => setNewItem(n => ({ ...n, location: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="Warehouse, Server Room, etc." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>NOTES</label>
                  <textarea value={newItem.notes || ""} onChange={e => setNewItem(n => ({ ...n, notes: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 72 }} placeholder="Any additional information..." />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
                  <Plus size={14} className="inline mr-2" /> Add Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Item Detail Drawer ─────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl sm:rounded-l-none shadow-2xl w-full sm:w-96 h-full sm:h-auto overflow-y-auto"
            style={{ background: "var(--card)", border: "1px solid var(--border)", maxHeight: "100vh" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>Equipment Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 48, height: 48, background: `${CATEGORY_COLORS[selected.category]}15` }}>
                  {(() => { const Icon = CATEGORY_ICONS[selected.category]; return <Icon size={22} style={{ color: CATEGORY_COLORS[selected.category] }} />; })()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{selected.brand} · {selected.model}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "ID", value: selected.id },
                  { label: "Serial Number", value: selected.serial },
                  { label: "Status", value: STATUS_CONFIG[selected.status].label },
                  { label: "Quantity", value: String(selected.quantity) },
                  { label: "Purchase Date", value: selected.purchaseDate },
                  { label: "Purchase Price", value: `৳${(selected.purchasePrice * selected.quantity).toLocaleString()}` },
                  { label: "Location", value: selected.location },
                  { label: "Assigned To", value: selected.assignedTo || "—" },
                  { label: "Customer", value: selected.assignedCustomer || "—" },
                  { label: "Warranty Until", value: selected.warrantyUntil || "—" },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: "var(--foreground)", textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#D97706", marginBottom: 4 }}>NOTES</div>
                    <div style={{ fontSize: 12, color: "var(--foreground)" }}>{selected.notes}</div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Mark Available", status: "available" as ItemStatus, color: "#16A34A" },
                  { label: "Mark Damaged", status: "damaged" as ItemStatus, color: "#DC2626" },
                  { label: "Maintenance", status: "maintenance" as ItemStatus, color: "#D97706" },
                  { label: "Retire", status: "retired" as ItemStatus, color: "#6B7280" },
                ].map(action => (
                  <button key={action.status}
                    onClick={() => { setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: action.status } : i)); setSelected(null); showToast(`Status updated to ${action.status}`); }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={{ borderColor: action.color, color: action.color, background: `${action.color}10` }}>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
