import { useState, useEffect } from "react";
import {
  Package, Search, Plus, RefreshCw, CheckCircle2, Zap, DollarSign,
  Edit2, Trash2, X, Check
} from "lucide-react";
import {
  billingStore, type IspPackage
} from "./billingData";

interface PackagesPageProps {
  onNavigate?: (page: string) => void;
}

export function PackagesPage({ onNavigate }: PackagesPageProps) {
  const [packagesList, setPackagesList] = useState<IspPackage[]>(billingStore.getPackages());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [editingPkg, setEditingPkg] = useState<IspPackage | null>(null);
  const [toast, setToast] = useState("");

  const [newPkg, setNewPkg] = useState({
    name: "", down: "20", up: "10", price: "1200", type: "PPPoE" as IspPackage["type"],
    mikrotikProfile: "profile-20M-10M", burstLimit: "30M/15M 20s", fupLimit: "Unlimited"
  });

  useEffect(() => {
    return billingStore.subscribe(() => {
      setPackagesList(billingStore.getPackages());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filteredPackages = packagesList.filter(pkg => {
    const q = search.toLowerCase();
    const matchSearch = !search || pkg.name.toLowerCase().includes(q) || pkg.mikrotikProfile.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || pkg.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleCreatePackage = () => {
    if (!newPkg.name || !newPkg.price) return;
    const pkg: IspPackage = {
      id: `PKG-${(packagesList.length + 1).toString().padStart(2, "0")}`,
      name: newPkg.name,
      down: Number(newPkg.down),
      up: Number(newPkg.up),
      price: Number(newPkg.price),
      type: newPkg.type,
      customers: 0,
      margin: 78,
      mikrotikProfile: newPkg.mikrotikProfile || `profile-${newPkg.down}M-${newPkg.up}M`,
      burstLimit: newPkg.burstLimit || "No Burst",
      fupLimit: newPkg.fupLimit || "Unlimited",
      status: "active",
    };
    billingStore.addPackage(pkg);
    setShowNewPackage(false);
    showToast(`Package "${pkg.name}" created and synced with MikroTik profile!`);
    setNewPkg({ name: "", down: "20", up: "10", price: "1200", type: "PPPoE", mikrotikProfile: "", burstLimit: "30M/15M 20s", fupLimit: "Unlimited" });
  };

  const handleUpdatePackage = () => {
    if (!editingPkg) return;
    billingStore.updatePackage(editingPkg);
    setEditingPkg(null);
    showToast(`Package "${editingPkg.name}" updated successfully!`);
  };

  const packageStats = {
    totalSubscribers: packagesList.reduce((a, b) => a + b.customers, 0),
    totalGbps: ((packagesList.reduce((a, b) => a + (b.down * b.customers), 0)) / 1000).toFixed(1),
    avgArpu: Math.round(packagesList.reduce((a, b) => a + (b.price * b.customers), 0) / (packagesList.reduce((a, b) => a + b.customers, 0) || 1)),
    activeCount: packagesList.filter(p => p.status === "active").length,
  };

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Internet Packages & Tariffs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              {packagesList.length} Active Profiles
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Bandwidth tiers, monthly pricing rates, FUP restrictions, and MikroTik PPP Profile provisioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("All packages synchronized with MikroTik PPPoE profiles!")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          >
            <RefreshCw size={14} /> Sync MikroTik
          </button>
          <button
            onClick={() => setShowNewPackage(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
            style={{ background: "var(--primary)", fontSize: 13 }}
          >
            <Plus size={14} /> Create Package
          </button>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Packages</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(196,53,53,0.1)" }}>
              <Package size={15} style={{ color: "var(--primary)" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>
            {packageStats.activeCount} Profiles
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Synced with MikroTik RouterOS</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Subscribers</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
              <CheckCircle2 size={15} style={{ color: "#16A34A" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#16A34A", marginBottom: 2 }}>
            {packageStats.totalSubscribers.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Active connected client accounts</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Provisioned Bandwidth</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
              <Zap size={15} style={{ color: "#2563EB" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
            {packageStats.totalGbps} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Total configured capacity</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Average ARPU</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#EDE9FE" }}>
              <DollarSign size={15} style={{ color: "#7C3AED" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#7C3AED", marginBottom: 2 }}>
            ৳{packageStats.avgArpu} /mo
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Avg revenue per subscriber</p>
        </div>
      </div>

      {/* ── Filter Toolbar & View Switcher ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search package name, profile..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          >
            <option value="all">All Connection Types</option>
            <option value="PPPoE">PPPoE</option>
            <option value="Static IP">Static IP</option>
            <option value="DHCP">DHCP</option>
            <option value="Hotspot">Hotspot</option>
            <option value="Corporate Lease">Corporate Lease</option>
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setViewMode("grid")}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: viewMode === "grid" ? "var(--primary)" : "transparent",
              color: viewMode === "grid" ? "white" : "var(--muted-foreground)",
            }}
          >
            Cards View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: viewMode === "table" ? "var(--primary)" : "transparent",
              color: viewMode === "table" ? "white" : "var(--muted-foreground)",
            }}
          >
            Detailed Table
          </button>
        </div>
      </div>

      {/* ── Package Grid ─────────────────────────────────────────────────────── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPackages.map(pkg => (
            <div
              key={pkg.id}
              className="rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                      {pkg.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                      MikroTik: <span className="font-mono text-primary font-medium">{pkg.mikrotikProfile}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
                    {pkg.type}
                  </span>
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ background: "var(--muted)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Download / Upload</span>
                    <span className="font-mono text-xs font-bold text-foreground">{pkg.down}M / {pkg.up}M</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Monthly Fee</span>
                    <span className="font-mono text-sm font-extrabold text-primary">৳{pkg.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Burst Rate</span>
                    <span style={{ fontSize: 11, color: "var(--foreground)" }}>{pkg.burstLimit}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Active Users</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{pkg.customers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Gross Margin</span>
                    <span className="text-xs font-semibold text-emerald-600">{pkg.margin}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (pkg.customers / 3840) * 100)}%`,
                        background: "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => setEditingPkg(pkg)}
                  className="flex-1 py-1.5 rounded text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => showToast(`Subscribers list for ${pkg.name} opened in CRM module.`)}
                  className="flex-1 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Subscribers
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Package Name", "Type", "Download", "Upload", "Monthly Price", "Burst Limit", "MikroTik Profile", "Subscribers", "Margin", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg, i) => (
                <tr
                  key={pkg.id}
                  style={{ borderBottom: i < filteredPackages.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{pkg.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{pkg.id}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--muted)" }}>{pkg.type}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs">{pkg.down} Mbps</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{pkg.up} Mbps</td>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">৳{pkg.price.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{pkg.burstLimit}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-foreground/80">{pkg.mikrotikProfile}</td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold">{pkg.customers.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-emerald-600">{pkg.margin}%</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPkg(pkg)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => showToast(`Archived package ${pkg.name}`)}
                        className="p-1.5 rounded hover:bg-muted text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Package Modal ──────────────────────────────────────── */}
      {(showNewPackage || editingPkg) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  {editingPkg ? `Edit Package: ${editingPkg.name}` : "Create Bandwidth Package"}
                </h3>
              </div>
              <button onClick={() => { setShowNewPackage(false); setEditingPkg(null); }} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">PACKAGE NAME</label>
                <input
                  value={editingPkg ? editingPkg.name : newPkg.name}
                  onChange={e => {
                    const v = e.target.value;
                    if (editingPkg) setEditingPkg(p => p ? { ...p, name: v } : null);
                    else setNewPkg(p => ({ ...p, name: v }));
                  }}
                  placeholder="e.g. 25 Mbps Turbo"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DOWNLOAD (MBPS)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.down : newPkg.down}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, down: v } : null);
                      else setNewPkg(p => ({ ...p, down: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">UPLOAD (MBPS)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.up : newPkg.up}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, up: v } : null);
                      else setNewPkg(p => ({ ...p, up: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">MONTHLY PRICE (৳)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.price : newPkg.price}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, price: v } : null);
                      else setNewPkg(p => ({ ...p, price: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TYPE</label>
                  <select
                    value={editingPkg ? editingPkg.type : newPkg.type}
                    onChange={e => {
                      const v = e.target.value as any;
                      if (editingPkg) setEditingPkg(p => p ? { ...p, type: v } : null);
                      else setNewPkg(p => ({ ...p, type: v }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="PPPoE">PPPoE</option>
                    <option value="Static IP">Static IP</option>
                    <option value="DHCP">DHCP</option>
                    <option value="Hotspot">Hotspot</option>
                    <option value="Corporate Lease">Corporate Lease</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">MIKROTIK PPPOE PROFILE NAME</label>
                <input
                  value={editingPkg ? editingPkg.mikrotikProfile : newPkg.mikrotikProfile}
                  onChange={e => {
                    const v = e.target.value;
                    if (editingPkg) setEditingPkg(p => p ? { ...p, mikrotikProfile: v } : null);
                    else setNewPkg(p => ({ ...p, mikrotikProfile: v }));
                  }}
                  placeholder="profile-20M-10M"
                  className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowNewPackage(false); setEditingPkg(null); }}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingPkg ? handleUpdatePackage : handleCreatePackage}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary"
              >
                {editingPkg ? "Save Changes" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75">
            <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
