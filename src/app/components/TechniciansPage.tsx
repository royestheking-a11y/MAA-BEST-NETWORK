import { useState } from "react";
import {
  Wrench, Plus, Search, CheckCircle2, AlertTriangle, Clock, X,
  Phone, Mail, MapPin, User, TicketCheck, Star, Activity,
  ChevronRight, Circle, Edit3, Map, Camera, Trash2, Check,
  Shield, Award, Briefcase, RefreshCw, Smartphone
} from "lucide-react";

interface TechniciansPageProps {
  onNavigate?: (page: string) => void;
}

type TechStatus = "available" | "on_job" | "offline";

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  zone: string;
  skills: string[];
  status: TechStatus;
  activeTickets: number;
  resolvedTotal: number;
  avgResolutionHours: number;
  rating: number;
  joinDate: string;
  currentJob?: string;
  currentLocation?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<TechStatus, { label: string; bg: string; text: string; dot: string }> = {
  available: { label: "Available", bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
  on_job: { label: "On Job", bg: "rgba(37,99,235,0.1)", text: "#2563EB", dot: "#2563EB" },
  offline: { label: "Offline", bg: "rgba(107,114,128,0.1)", text: "#6B7280", dot: "#6B7280" },
};

const initialTechnicians: Technician[] = [];

const recentJobs: { id: string; tech: string; customer: string; type: string; zone: string; status: string; started: string; resolvedAt?: string; photo: boolean }[] = [];

const AVAILABLE_ZONES = [
  "Mirpur", "Uttara", "Dhanmondi", "Gulshan", "Banani",
  "Mohammadpur", "Motijheel", "Chittagong", "Sylhet", "All Zones"
];

const inputStyle = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--foreground)"
};

export function TechniciansPage({ onNavigate }: TechniciansPageProps) {
  const [techList, setTechList] = useState<Technician[]>(initialTechnicians);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const [newTech, setNewTech] = useState({
    name: "",
    phone: "",
    email: "",
    zone: "Mirpur",
    skills: "Fiber Splicing, ONU Installation",
    status: "available" as TechStatus,
    currentJob: "",
    currentLocation: "",
    notes: ""
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const filtered = techList.filter(t => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.zone.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchZone = zoneFilter === "all" || t.zone === zoneFilter;
    return matchSearch && matchStatus && matchZone;
  });

  const stats = {
    total: techList.length,
    available: techList.filter(t => t.status === "available").length,
    onJob: techList.filter(t => t.status === "on_job").length,
    offline: techList.filter(t => t.status === "offline").length,
    totalResolved: techList.reduce((s, t) => s + t.resolvedTotal, 0),
    activeTickets: techList.reduce((s, t) => s + t.activeTickets, 0),
  };

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name.trim() || !newTech.phone.trim()) {
      showToast("Please provide both Name and Phone number");
      return;
    }

    const nextIdNum = techList.length + 1;
    const nextId = `TECH-${String(nextIdNum).padStart(3, "0")}`;
    const skillsArray = newTech.skills
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const created: Technician = {
      id: nextId,
      name: newTech.name.trim(),
      phone: newTech.phone.trim(),
      email: newTech.email.trim() || `${newTech.name.toLowerCase().replace(/\s+/g, ".")}@isp.com`,
      zone: newTech.zone,
      skills: skillsArray.length > 0 ? skillsArray : ["General Support"],
      status: newTech.status,
      activeTickets: 0,
      resolvedTotal: 0,
      avgResolutionHours: 2.0,
      rating: 5.0,
      joinDate: "Just now",
      currentJob: newTech.currentJob.trim() || undefined,
      currentLocation: newTech.currentLocation.trim() || undefined,
      notes: newTech.notes.trim() || undefined
    };

    setTechList(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewTech({
      name: "",
      phone: "",
      email: "",
      zone: "Mirpur",
      skills: "Fiber Splicing, ONU Installation",
      status: "available",
      currentJob: "",
      currentLocation: "",
      notes: ""
    });
    showToast(`Technician ${created.name} (${created.id}) added successfully!`);
  };

  const handleStartEdit = (tech: Technician, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTech({ ...tech });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;
    if (!editingTech.name.trim() || !editingTech.phone.trim()) {
      showToast("Name and Phone cannot be empty");
      return;
    }

    setTechList(prev =>
      prev.map(t => (t.id === editingTech.id ? editingTech : t))
    );

    if (selected && selected.id === editingTech.id) {
      setSelected(editingTech);
    }

    showToast(`Technician ${editingTech.name} updated successfully!`);
    setEditingTech(null);
  };

  const handleDeleteTechnician = (id: string, name: string) => {
    setTechList(prev => prev.filter(t => t.id !== id));
    if (selected?.id === id) setSelected(null);
    if (editingTech?.id === id) setEditingTech(null);
    setDeleteConfirmId(null);
    showToast(`Technician ${name} removed`);
  };

  const handleQuickStatusChange = (id: string, newStatus: TechStatus) => {
    setTechList(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (selected && selected.id === id) {
      setSelected(prev => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Technician Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
              {techList.length} Technicians
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Field technician dispatch, team profiles, real-time jobs, and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={15} /> Add Technician
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Technicians", value: stats.total, color: "var(--foreground)", icon: Wrench },
          { label: "Available Now", value: stats.available, color: "#16A34A", icon: CheckCircle2 },
          { label: "Currently On Job", value: stats.onJob, color: "#2563EB", icon: Activity },
          { label: "Total Jobs Resolved", value: stats.totalResolved.toLocaleString(), color: "var(--primary)", icon: TicketCheck },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, background: `${s.color === "var(--foreground)" ? "rgba(100,100,100,0.1)" : `${s.color}18`}` }}>
                <Icon size={19} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 max-w-80 px-3 py-2.5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: 13, color: "var(--foreground)" }}
            placeholder="Search name, phone, zone, skills..."
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "var(--muted-foreground)" }}>
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm outline-none"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="all">All Statuses ({techList.length})</option>
          <option value="available">Available ({stats.available})</option>
          <option value="on_job">On Job ({stats.onJob})</option>
          <option value="offline">Offline ({stats.offline})</option>
        </select>

        <select
          value={zoneFilter}
          onChange={e => setZoneFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm outline-none"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="all">All Zones</option>
          {AVAILABLE_ZONES.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      {/* Technician Cards Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        {filtered.map(tech => {
          const sc = STATUS_CONFIG[tech.status];
          return (
            <div
              key={tech.id}
              className="rounded-2xl p-5 border cursor-pointer transition-all relative group flex flex-col justify-between"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
              onClick={() => setSelected(tech)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,32,32,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                {/* Top Row: Avatar + Name + Status & Edit Button */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                      style={{ width: 48, height: 48, background: "linear-gradient(135deg, #8B2020, #C43535)" }}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>{tech.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{tech.id} · Joined {tech.joinDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>
                      <Circle size={6} fill={sc.dot} stroke="none" /> {sc.label}
                    </span>
                    <button
                      onClick={e => handleStartEdit(tech, e)}
                      title="Edit Technician"
                      className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact & Zone */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} /> {tech.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> {tech.zone}
                    </span>
                  </div>

                  {tech.email && (
                    <div className="flex items-center gap-1.5 text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                      <Mail size={12} /> {tech.email}
                    </div>
                  )}

                  {tech.currentJob && (
                    <div className="rounded-xl p-2.5 flex items-center gap-2 mt-1" style={{ background: "rgba(37,99,235,0.08)", fontSize: 12, color: "#2563EB" }}>
                      <Wrench size={13} className="flex-shrink-0" />
                      <span className="truncate">{tech.currentJob}</span>
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tech.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: "rgba(139,32,32,0.08)", color: "var(--primary)" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="text-center">
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                    {tech.resolvedTotal}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Resolved</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                    {tech.avgResolutionHours}h
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} fill="#F59E0B" stroke="none" />
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                      {tech.rating}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Rating</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border rounded-2xl mb-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Wrench size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>No technicians found</div>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>Try clearing or changing your search filters</p>
        </div>
      )}

      {/* Recent Field Jobs Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              Recent Field Jobs & Dispatches
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
              Live task log assigned to technicians across all operational zones
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th className="px-5 py-3 text-left">Ticket</th>
                <th className="px-5 py-3 text-left">Technician</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Task Type</th>
                <th className="px-5 py-3 text-left">Zone</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Proof Photo</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map(job => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  in_progress: { bg: "rgba(37,99,235,0.1)", text: "#2563EB" },
                  resolved: { bg: "rgba(22,163,74,0.1)", text: "#16A34A" },
                  assigned: { bg: "rgba(217,119,6,0.1)", text: "#D97706" },
                };
                const sc = statusColors[job.status] || { bg: "rgba(107,114,128,0.1)", text: "#6B7280" };
                return (
                  <tr key={job.id} style={{ borderTop: "1px solid var(--border)", fontSize: 13 }}>
                    <td className="px-5 py-3.5 font-mono font-semibold" style={{ color: "var(--primary)", fontSize: 12 }}>{job.id}</td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: "var(--foreground)" }}>{job.tech}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{job.customer}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--foreground)" }}>{job.type}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{job.zone}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: sc.bg, color: sc.text }}>
                        {job.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {job.photo ? (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#16A34A" }}>
                          <Camera size={12} /> Uploaded
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ADD TECHNICIAN MODAL ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
                  <User size={18} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--foreground)" }}>Add New Technician</h2>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Create technician profile for dispatch & field operations</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTechnician} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>FULL NAME *</label>
                  <input
                    required
                    value={newTech.name}
                    onChange={e => setNewTech(n => ({ ...n, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="e.g. Sumon Ahmed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>PHONE NUMBER *</label>
                  <input
                    required
                    value={newTech.phone}
                    onChange={e => setNewTech(n => ({ ...n, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="01711-XXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={newTech.email}
                    onChange={e => setNewTech(n => ({ ...n, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="sumon@isp.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>ASSIGNED ZONE</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    value={newTech.zone}
                    onChange={e => setNewTech(n => ({ ...n, zone: e.target.value }))}
                  >
                    {AVAILABLE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>INITIAL STATUS</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    value={newTech.status}
                    onChange={e => setNewTech(n => ({ ...n, status: e.target.value as TechStatus }))}
                  >
                    <option value="available">Available</option>
                    <option value="on_job">On Job</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>CURRENT LOCATION (OPTIONAL)</label>
                  <input
                    value={newTech.currentLocation}
                    onChange={e => setNewTech(n => ({ ...n, currentLocation: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="e.g. Mirpur-10, Block-C"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>SKILLS (COMMA SEPARATED)</label>
                <input
                  value={newTech.skills}
                  onChange={e => setNewTech(n => ({ ...n, skills: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={inputStyle}
                  placeholder="Fiber Splicing, ONU Installation, OTDR, MikroTik"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>CURRENT JOB DESCRIPTION (OPTIONAL)</label>
                <input
                  value={newTech.currentJob}
                  onChange={e => setNewTech(n => ({ ...n, currentJob: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={inputStyle}
                  placeholder="e.g. TKT-2290 — Fiber break repair at Mirpur-2"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
                  style={{ background: "var(--primary)" }}
                >
                  Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT TECHNICIAN MODAL ───────────────────────────────────────── */}
      {editingTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl" style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--foreground)" }}>
                    Edit Technician: {editingTech.name}
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    ID: {editingTech.id} · Member since {editingTech.joinDate}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingTech(null)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>FULL NAME *</label>
                  <input
                    required
                    value={editingTech.name}
                    onChange={e => setEditingTech(t => t ? { ...t, name: e.target.value } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>PHONE NUMBER *</label>
                  <input
                    required
                    value={editingTech.phone}
                    onChange={e => setEditingTech(t => t ? { ...t, phone: e.target.value } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={editingTech.email}
                    onChange={e => setEditingTech(t => t ? { ...t, email: e.target.value } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>ASSIGNED ZONE</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    value={editingTech.zone}
                    onChange={e => setEditingTech(t => t ? { ...t, zone: e.target.value } : null)}
                  >
                    {AVAILABLE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>CURRENT STATUS</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    value={editingTech.status}
                    onChange={e => setEditingTech(t => t ? { ...t, status: e.target.value as TechStatus } : null)}
                  >
                    <option value="available">Available</option>
                    <option value="on_job">On Job</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>RATING (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={editingTech.rating}
                    onChange={e => setEditingTech(t => t ? { ...t, rating: parseFloat(e.target.value) || 5.0 } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>AVG RESOLUTION (HRS)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editingTech.avgResolutionHours}
                    onChange={e => setEditingTech(t => t ? { ...t, avgResolutionHours: parseFloat(e.target.value) || 2.0 } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>SKILLS (COMMA SEPARATED)</label>
                <input
                  value={editingTech.skills.join(", ")}
                  onChange={e => {
                    const parsed = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setEditingTech(t => t ? { ...t, skills: parsed } : null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={inputStyle}
                  placeholder="Fiber Splicing, ONU Installation, OTDR, MikroTik"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>ACTIVE JOB ASSIGNMENT</label>
                  <input
                    value={editingTech.currentJob || ""}
                    onChange={e => setEditingTech(t => t ? { ...t, currentJob: e.target.value } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="e.g. TKT-2289 — ONU installation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>CURRENT LOCATION</label>
                  <input
                    value={editingTech.currentLocation || ""}
                    onChange={e => setEditingTech(t => t ? { ...t, currentLocation: e.target.value } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                    placeholder="e.g. Mirpur-10, Block-C"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>ACTIVE TICKETS</label>
                  <input
                    type="number"
                    min="0"
                    value={editingTech.activeTickets}
                    onChange={e => setEditingTech(t => t ? { ...t, activeTickets: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>TOTAL RESOLVED JOBS</label>
                  <input
                    type="number"
                    min="0"
                    value={editingTech.resolvedTotal}
                    onChange={e => setEditingTech(t => t ? { ...t, resolvedTotal: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingTech.id)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Remove
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTech(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    style={{ background: "var(--primary)" }}
                  >
                    <Check size={14} /> Update Technician
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TECHNICIAN DETAIL DRAWER ────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
          <div
            className="rounded-2xl sm:rounded-l-2xl sm:rounded-r-none shadow-2xl w-full sm:w-[420px] h-full sm:h-auto overflow-y-auto flex flex-col justify-between"
            style={{ background: "var(--card)", border: "1px solid var(--border)", maxHeight: "100vh" }}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
                    {selected.id}
                  </span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                    Technician Profile
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(selected)}
                    title="Edit Technician"
                    className="p-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-5 space-y-5">
                {/* Profile Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <div
                    className="rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow"
                    style={{ width: 56, height: 56, background: "linear-gradient(135deg, #8B2020, #C43535)" }}
                  >
                    {selected.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-base truncate" style={{ color: "var(--foreground)" }}>{selected.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].text }}
                      >
                        <Circle size={5} fill={STATUS_CONFIG[selected.status].dot} stroke="none" />
                        {STATUS_CONFIG[selected.status].label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Zone: {selected.zone}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} fill="#F59E0B" stroke="none" />
                      <span className="font-bold text-xs" style={{ color: "var(--foreground)" }}>{selected.rating}</span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>rating</span>
                    </div>
                  </div>
                </div>

                {/* Status Quick Switch */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>STATUS ACTION</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "on_job", "offline"] as TechStatus[]).map(st => {
                      const cfg = STATUS_CONFIG[st];
                      const isActive = selected.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleQuickStatusChange(selected.id, st)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5"
                          style={{
                            borderColor: isActive ? cfg.text : "var(--border)",
                            background: isActive ? cfg.bg : "transparent",
                            color: isActive ? cfg.text : "var(--foreground)"
                          }}
                        >
                          <Circle size={6} fill={cfg.dot} stroke="none" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Table */}
                <div className="space-y-2.5">
                  {[
                    { label: "Phone", value: selected.phone, isLink: `tel:${selected.phone}`, icon: Phone },
                    { label: "Email", value: selected.email, isLink: `mailto:${selected.email}`, icon: Mail },
                    { label: "Assigned Zone", value: selected.zone, icon: MapPin },
                    { label: "Active Tickets", value: `${selected.activeTickets} open tickets`, icon: Briefcase },
                    { label: "Total Completed", value: `${selected.resolvedTotal} jobs resolved`, icon: TicketCheck },
                    { label: "Avg Resolution", value: `${selected.avgResolutionHours} hours`, icon: Clock },
                    { label: "Joined Date", value: selected.joinDate, icon: User },
                  ].map(row => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
                          <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 }}>{row.label}</span>
                        </div>
                        {row.isLink ? (
                          <a href={row.isLink} className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                            {row.value}
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 600 }}>{row.value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Active Job Card */}
                {selected.currentJob && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                      <Wrench size={13} /> CURRENT DISPATCH
                    </div>
                    <div style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                      {selected.currentJob}
                    </div>
                    {selected.currentLocation && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                        <MapPin size={11} /> {selected.currentLocation}
                      </div>
                    )}
                  </div>
                )}

                {/* Skills */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>CERTIFICATIONS & SKILLS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium border" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-5 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => handleStartEdit(selected)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow"
                style={{ background: "var(--primary)" }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
              <button
                onClick={() => setDeleteConfirmId(selected.id)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-5 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-100 dark:bg-red-900/30 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>Remove Technician?</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>
              Are you sure you want to remove this technician from the team roster? Active jobs should be reassigned.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const t = techList.find(x => x.id === deleteConfirmId);
                  if (t) handleDeleteTechnician(t.id, t.name);
                }}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ─────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500, border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
