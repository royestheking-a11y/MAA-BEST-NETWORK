import { useState, useEffect, useMemo } from "react";
import {
  Package, Plus, Search, Filter, CheckCircle2, AlertTriangle,
  XCircle, X, Edit3, Trash2, Download, Cpu, Radio, Server,
  Wifi, Battery, CheckSquare, Clock, MapPin, User, BarChart3,
  Wrench, Activity, Hash, RefreshCw, Layers, ShieldCheck,
  UserCheck, ArrowUpRight, ArrowDownLeft, Sparkles, Check
} from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";
import { activityLogger } from "../services/activityLogger";

export type ItemStatus = "available" | "assigned" | "damaged" | "maintenance" | "lost" | "retired";
export type ItemCategory = "onu" | "olt" | "mikrotik" | "router" | "switch" | "sfp" | "cable" | "adapter" | "ups" | "tools" | "other";

export interface InventoryItem {
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
  assignedCustomerId?: string;
  assignedCustomerName?: string;
  notes?: string;
  warrantyUntil?: string;
}

const CATEGORY_CONFIG: Record<ItemCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  onu:      { label: "ONU / ONT", icon: Radio, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" },
  olt:      { label: "OLT Chassis & Cards", icon: Server, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)" },
  mikrotik: { label: "MikroTik Routers", icon: Server, color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" },
  router:   { label: "WiFi Routers", icon: Wifi, color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" },
  switch:   { label: "Managed Switches", icon: Activity, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" },
  sfp:      { label: "SFP / PON Modules", icon: Cpu, color: "#06B6D4", bg: "rgba(6, 182, 212, 0.12)" },
  cable:    { label: "Fiber Cable & Splitters", icon: Hash, color: "#64748B", bg: "rgba(100, 116, 139, 0.12)" },
  adapter:  { label: "Power Adapters", icon: CheckSquare, color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" },
  ups:      { label: "Online UPS & Batteries", icon: Battery, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" },
  tools:    { label: "Splicer & Optical Tools", icon: Wrench, color: "#EC4899", bg: "rgba(236, 72, 153, 0.12)" },
  other:    { label: "Accessories", icon: Package, color: "#94A3B8", bg: "rgba(148, 163, 184, 0.12)" },
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; text: string; border: string }> = {
  available:   { label: "In Stock / Available", bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" },
  assigned:    { label: "Assigned to Client", bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" },
  maintenance: { label: "Under Maintenance", bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" },
  damaged:     { label: "Damaged / Defective", bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
  lost:        { label: "Missing / Lost", bg: "rgba(100, 116, 139, 0.15)", text: "#94A3B8", border: "rgba(100, 116, 139, 0.3)" },
  retired:     { label: "Retired / Scrapped", bg: "rgba(100, 116, 139, 0.1)", text: "#64748B", border: "rgba(100, 116, 139, 0.2)" },
};

const STORAGE_KEY = "mbn_isp_equipment_inventory_v1";

export function InventoryPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { customers } = useCustomerContext();

  const generateDefaultStock = (): InventoryItem[] => {
    const list: InventoryItem[] = [
      {
        id: "INV-001",
        name: "V-SOL 1GE+1FE XPON ONT",
        category: "onu",
        brand: "V-SOL",
        model: "V2801SG",
        serial: "VSOL-XP-8812-01A",
        status: "available",
        quantity: 12,
        purchaseDate: "12 Jan 2026",
        purchasePrice: 1350,
        location: "Kalkini Main Rack A1",
        warrantyUntil: "12 Jan 2027",
        notes: "Compatible with both EPON and GPON OLTs"
      },
      {
        id: "INV-002",
        name: "BDCOM GPON SFP Class C++ Transceiver",
        category: "sfp",
        brand: "BDCOM",
        model: "SFP-GPON-C++",
        serial: "BDC-SFP-77291-C",
        status: "available",
        quantity: 8,
        purchaseDate: "05 Feb 2026",
        purchasePrice: 3200,
        location: "NOC Fiber Store Box 2",
        warrantyUntil: "05 Feb 2028",
        notes: "High optical transmit power +7.5 dBm"
      },
      {
        id: "INV-003",
        name: "MikroTik Cloud Core Router CCR2004-16G-2S+",
        category: "mikrotik",
        brand: "MikroTik",
        model: "CCR2004-16G-2S+",
        serial: "HE9081299-CCR-01",
        status: "available",
        quantity: 1,
        purchaseDate: "18 Mar 2026",
        purchasePrice: 48500,
        location: "Central Server Room Rack 01",
        warrantyUntil: "18 Mar 2027",
        notes: "Core BGP Edge & PPPoE Gateway Router"
      },
      {
        id: "INV-004",
        name: "Fujikura 90S+ Core Alignment Fusion Splicer",
        category: "tools",
        brand: "Fujikura",
        model: "90S+",
        serial: "FJK-90S-SPL-5510",
        status: "available",
        quantity: 1,
        purchaseDate: "15 Dec 2025",
        purchasePrice: 285000,
        location: "Field Engineering Kit #1",
        warrantyUntil: "15 Dec 2028",
        notes: "Precision optical splicer with auto arc calibration"
      },
      {
        id: "INV-005",
        name: "Optical Fiber Distribution Box 1:8 Splitter PLC",
        category: "cable",
        brand: "NetX Fiber",
        model: "FDB-8P-OUTDOOR",
        serial: "FDB-8P-2026-081",
        status: "available",
        quantity: 15,
        purchaseDate: "01 Mar 2026",
        purchasePrice: 680,
        location: "Pole Mounting Depot",
        notes: "Waterproof IP65 outdoor enclosure"
      }
    ];

    // Map first few active customers as assigned ONUs
    if (customers && customers.length > 0) {
      customers.slice(0, 3).forEach((c, idx) => {
        list.push({
          id: `INV-CUST-${idx + 1}`,
          name: "V-SOL Gigabit XPON ONU",
          category: "onu",
          brand: "V-SOL",
          model: "V2801SG",
          serial: c.mac || c.boundMac || `VSOL-ONT-${c.id}`,
          status: "assigned",
          quantity: 1,
          purchaseDate: "10 Jan 2026",
          purchasePrice: 1400,
          location: `${c.subzone || c.zone} (Premises)`,
          assignedCustomerId: c.id,
          assignedCustomerName: c.name,
          warrantyUntil: "10 Jan 2027",
          notes: `Assigned to subscriber ${c.name} (${c.phone})`
        });
      });
    }

    return list;
  };

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return generateDefaultStock();
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [assigningItem, setAssigningItem] = useState<InventoryItem | null>(null);
  const [selectedCustomerForAssign, setSelectedCustomerForAssign] = useState("");
  const [toast, setToast] = useState("");

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "onu",
    brand: "V-SOL",
    model: "",
    serial: "",
    status: "available",
    quantity: 1,
    purchaseDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    purchasePrice: 1200,
    location: "Central Warehouse",
    notes: "",
    warrantyUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  });

  // Save to localStorage
  useEffect(() => {
    try {
      if (items && items.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Filtered Items
  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.serial.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.assignedCustomerName && item.assignedCustomerName.toLowerCase().includes(q)) ||
        (item.assignedCustomerId && item.assignedCustomerId.toLowerCase().includes(q)) ||
        item.location.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalAssetValue = items.reduce((sum, i) => sum + (i.purchasePrice * (i.quantity || 1)), 0);
    const totalUnits = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const availableUnits = items.filter(i => i.status === "available").reduce((sum, i) => sum + (i.quantity || 1), 0);
    const assignedUnits = items.filter(i => i.status === "assigned").reduce((sum, i) => sum + (i.quantity || 1), 0);
    const maintenanceUnits = items.filter(i => i.status === "maintenance" || i.status === "damaged").reduce((sum, i) => sum + (i.quantity || 1), 0);

    return { totalAssetValue, totalUnits, availableUnits, assignedUnits, maintenanceUnits };
  }, [items]);

  // Handle Add or Edit Save
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serial) {
      showToast("Please enter an equipment name and serial number.");
      return;
    }

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } as InventoryItem : item));
      activityLogger.log({
        type: "system",
        severity: "info",
        action: "Equipment Asset Updated",
        detail: `Updated specifications for ${formData.name} (${editingItem.id}, S/N: ${formData.serial}).`,
        metadata: { id: editingItem.id, serial: formData.serial, location: formData.location }
      });
      showToast(`Updated ${formData.name} successfully.`);
    } else {
      const newItem: InventoryItem = {
        id: `INV-${String(items.length + 1).padStart(3, "0")}`,
        name: formData.name || "Equipment Unit",
        category: (formData.category as ItemCategory) || "onu",
        brand: formData.brand || "Generic",
        model: formData.model || "Standard",
        serial: formData.serial || `SN-${Date.now().toString().slice(-6)}`,
        status: (formData.status as ItemStatus) || "available",
        quantity: Number(formData.quantity) || 1,
        purchaseDate: formData.purchaseDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        purchasePrice: Number(formData.purchasePrice) || 0,
        location: formData.location || "Central Warehouse",
        notes: formData.notes || "",
        warrantyUntil: formData.warrantyUntil || ""
      };

      setItems(prev => [newItem, ...prev]);
      activityLogger.log({
        type: "system",
        severity: "success",
        action: "New Hardware Asset Added",
        detail: `Added ${newItem.name} (S/N: ${newItem.serial}) with value ৳${newItem.purchasePrice.toLocaleString()} to ${newItem.location}.`,
        metadata: { id: newItem.id, serial: newItem.serial, price: newItem.purchasePrice }
      });
      showToast(`Added ${newItem.name} to inventory ledger.`);
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} (${id}) from inventory?`)) {
      setItems(prev => prev.filter(i => i.id !== id));
      activityLogger.log({
        type: "system",
        severity: "warning",
        action: "Equipment Removed",
        detail: `Removed ${name} (${id}) from equipment inventory.`,
        metadata: { id }
      });
      showToast(`Removed ${name} from inventory.`);
    }
  };

  // Handle Assign to Customer
  const handleAssignToCustomer = () => {
    if (!assigningItem || !selectedCustomerForAssign) return;
    const cust = customers.find(c => c.id === selectedCustomerForAssign);
    if (!cust) return;

    setItems(prev => prev.map(item => {
      if (item.id === assigningItem.id) {
        return {
          ...item,
          status: "assigned",
          assignedCustomerId: cust.id,
          assignedCustomerName: cust.name,
          location: `${cust.subzone || cust.zone} (Premises)`
        };
      }
      return item;
    }));

    activityLogger.log({
      type: "customer",
      severity: "success",
      action: "Hardware Dispatched to Subscriber",
      detail: `Assigned ${assigningItem.name} (S/N: ${assigningItem.serial}) to ${cust.name} (${cust.id}) at ${cust.zone}.`,
      targetId: cust.id,
      metadata: { itemId: assigningItem.id, serial: assigningItem.serial, customerPhone: cust.phone }
    });

    showToast(`Assigned ${assigningItem.name} to ${cust.name} (${cust.id}).`);
    setAssigningItem(null);
    setSelectedCustomerForAssign("");
  };

  // Handle Return to Warehouse
  const handleReturnToWarehouse = (item: InventoryItem) => {
    setItems(prev => prev.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          status: "available",
          assignedCustomerId: undefined,
          assignedCustomerName: undefined,
          location: "Central Warehouse Rack A"
        };
      }
      return i;
    }));

    activityLogger.log({
      type: "system",
      severity: "info",
      action: "Equipment Returned to Warehouse",
      detail: `Returned ${item.name} (S/N: ${item.serial}) from ${item.assignedCustomerName || "Client"} to Central Warehouse.`,
      metadata: { itemId: item.id, serial: item.serial }
    });

    showToast(`Returned ${item.name} to Central Warehouse.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Item Name", "Category", "Brand", "Model", "Serial/MAC", "Status", "Quantity", "Purchase Price (BDT)", "Location", "Assigned Customer ID", "Assigned Customer Name", "Warranty Until"];
    const rows = items.map(i => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      `"${i.brand}"`,
      `"${i.model}"`,
      `"${i.serial}"`,
      i.status,
      i.quantity,
      i.purchasePrice,
      `"${i.location}"`,
      `"${i.assignedCustomerId || ''}"`,
      `"${i.assignedCustomerName || ''}"`,
      `"${i.warrantyUntil || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ISP_Equipment_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Equipment & Hardware Asset Ledger
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Layers size={12} /> {stats.totalUnits} Total Assets
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Central inventory tracking for Optical ONUs, OLT cards, MikroTik core routers, SFP optics, and field technician equipment.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                name: "",
                category: "onu",
                brand: "V-SOL",
                model: "",
                serial: `VSOL-${Math.floor(1000 + Math.random() * 9000)}`,
                status: "available",
                quantity: 1,
                purchaseDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                purchasePrice: 1350,
                location: "Central Warehouse Rack A",
                notes: "",
                warrantyUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Equipment</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-card hover:bg-muted text-foreground border border-border transition-all cursor-pointer shadow-xs"
          >
            <Download size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setItems(generateDefaultStock());
              showToast("Inventory refreshed with active customer lines.");
            }}
            title="Refresh inventory sync"
            className="p-2 rounded-xl text-xs font-medium bg-card hover:bg-muted text-foreground border border-border transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Asset Valuation & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Total Asset Value</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">৳{stats.totalAssetValue.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BarChart3 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Available in Stock</p>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{stats.availableUnits} Units</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Assigned to Clients</p>
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{stats.assignedUnits} Units</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Damaged / Repairs</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{stats.maintenanceUnits} Units</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Wrench size={18} />
          </div>
        </div>
      </div>

      {/* Filter Row: Categories */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            categoryFilter === "all"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          All Categories ({items.length})
        </button>

        {(Object.keys(CATEGORY_CONFIG) as ItemCategory[]).map(cat => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = items.filter(i => i.category === cat).length;
          const isSelected = categoryFilter === cat;
          const Icon = cfg.icon;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon size={12} style={{ color: isSelected ? "#fff" : cfg.color }} />
              <span>{cfg.label}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search equipment by name, brand, model, serial MAC, customer, location..."
            className="w-full pl-9 pr-8 py-2 rounded-xl outline-none text-xs bg-card border border-border text-foreground placeholder-muted-foreground focus:border-primary transition-all shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-border text-foreground outline-none cursor-pointer focus:border-primary shadow-xs"
          >
            <option value="all">Filter: All Status ({items.length})</option>
            {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map(s => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label} ({items.filter(i => i.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package size={32} className="text-muted-foreground mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">No Equipment Found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting search keywords or category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground border-b border-border font-semibold">
                  <th className="py-3 px-4">ITEM NAME & SPECS</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">SERIAL / MAC NUMBER</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">LOCATION / ASSIGNED CLIENT</th>
                  <th className="py-3 px-4 text-right">UNIT PRICE</th>
                  <th className="py-3 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                  const stCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
                  const Icon = catCfg.icon;

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                            style={{ background: catCfg.bg, borderColor: catCfg.color }}
                          >
                            <Icon size={14} style={{ color: catCfg.color }} />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {item.brand} · {item.model}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: catCfg.bg, color: catCfg.color }}
                        >
                          {catCfg.label}
                        </span>
                      </td>

                      {/* Serial */}
                      <td className="py-3 px-4 font-mono text-foreground">
                        <div className="font-semibold">{item.serial}</div>
                        <div className="text-[10px] text-muted-foreground">ID: {item.id}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1"
                          style={{ background: stCfg.bg, color: stCfg.text, borderColor: stCfg.border }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: stCfg.text }} />
                          {stCfg.label}
                        </span>
                      </td>

                      {/* Location / Assignee */}
                      <td className="py-3 px-4">
                        {item.assignedCustomerName ? (
                          <div>
                            <span className="font-semibold text-primary flex items-center gap-1">
                              <User size={11} /> {item.assignedCustomerName}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">({item.assignedCustomerId})</span>
                          </div>
                        ) : (
                          <div className="text-foreground flex items-center gap-1">
                            <MapPin size={11} className="text-muted-foreground" /> {item.location}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ৳{item.purchasePrice.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.status === "available" ? (
                            <button
                              onClick={() => {
                                setAssigningItem(item);
                                setSelectedCustomerForAssign(customers[0]?.id || "");
                              }}
                              title="Assign to Subscriber"
                              className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Assign
                            </button>
                          ) : item.status === "assigned" ? (
                            <button
                              onClick={() => handleReturnToWarehouse(item)}
                              title="Return back to Warehouse"
                              className="px-2 py-1 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-[11px] font-medium transition-all cursor-pointer"
                            >
                              Return
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData(item);
                              setShowAddModal(true);
                            }}
                            title="Edit specifications"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete equipment"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleSaveItem}
            className="bg-card border border-border text-foreground rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {editingItem ? `Edit Equipment (${editingItem.id})` : "Add New Equipment Asset"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Equipment Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. V-SOL 1GE+1FE XPON ONT"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as ItemCategory[]).map(c => (
                      <option key={c} value={c}>
                        {CATEGORY_CONFIG[c].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  >
                    {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map(s => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Brand / Vendor</label>
                  <input
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. V-SOL, MikroTik, BDCOM"
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Model No.</label>
                  <input
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. V2801SG"
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Serial / MAC Number</label>
                  <input
                    required
                    value={formData.serial}
                    onChange={e => setFormData({ ...formData, serial: e.target.value })}
                    placeholder="e.g. VSOL-8812-01A"
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">Purchase Price (৳)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    placeholder="1350"
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Physical Location / Storage Rack</label>
                <input
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Kalkini Central Warehouse Rack 01"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Warranty Expiry Date</label>
                <input
                  value={formData.warrantyUntil}
                  onChange={e => setFormData({ ...formData, warrantyUntil: e.target.value })}
                  placeholder="e.g. 15 Dec 2027"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-foreground bg-muted hover:bg-muted/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs cursor-pointer"
              >
                {editingItem ? "Save Changes" : "Create Asset Record"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign to Customer Modal */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border text-foreground rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Assign Equipment to Subscriber</h3>
              </div>
              <button onClick={() => setAssigningItem(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-1">
              <div className="font-semibold text-foreground">{assigningItem.name}</div>
              <div className="text-muted-foreground">Serial: <span className="font-mono text-primary font-semibold">{assigningItem.serial}</span></div>
              <div className="text-muted-foreground">Current Stock Location: {assigningItem.location}</div>
            </div>

            <div className="text-xs">
              <label className="block text-foreground font-semibold mb-1.5">Select Active Subscriber</label>
              <select
                value={selectedCustomerForAssign}
                onChange={e => setSelectedCustomerForAssign(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary text-xs shadow-xs"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) · {c.phone} · {c.zone}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-foreground bg-muted hover:bg-muted/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignToCustomer}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary text-white text-xs font-medium shadow-2xl animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
