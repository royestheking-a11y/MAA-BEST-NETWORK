import { useState, useEffect, useMemo } from "react";
import {
  TicketCheck, Search, Plus, CheckCircle2, AlertTriangle, Clock,
  XCircle, X, Check, User, Phone, MapPin, ChevronRight, Zap, ShieldCheck, Wrench
} from "lucide-react";
import {
  crmStore, type SupportTicket
} from "./crmData";
import { useCustomerContext, Customer } from "../../context/CustomerContext";

interface TicketsPageProps {
  onNavigate?: (page: string) => void;
}

export function TicketsPage({ onNavigate }: TicketsPageProps) {
  const { customers } = useCustomerContext();
  const [tickets, setTickets] = useState<SupportTicket[]>(crmStore.getTickets());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState("");

  // Customer Auto-Search state
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [selectedCustDetails, setSelectedCustDetails] = useState<Customer | null>(null);

  const [newTicket, setNewTicket] = useState({
    customerName: "", custId: "", phone: "", zone: "",
    category: "no_internet" as SupportTicket["category"],
    priority: "high" as SupportTicket["priority"],
    subject: "", description: "", assignedTech: ""
  });

  useEffect(() => {
    return crmStore.subscribe(() => {
      setTickets(crmStore.getTickets());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Filter matching customers for ticket creation
  const matchingCustomers = useMemo(() => {
    if (!custSearchQuery.trim()) return customers.slice(0, 8);
    const q = custSearchQuery.toLowerCase();
    return customers.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.pppUser.toLowerCase().includes(q) ||
      (c.zone && c.zone.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [customers, custSearchQuery]);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustDetails(cust);
    setNewTicket(prev => ({
      ...prev,
      customerName: cust.name,
      custId: cust.clientCode || cust.id,
      phone: cust.phone,
      zone: cust.subzone || cust.zone || "",
      subject: prev.subject || `Internet link down / support request for ${cust.name} (${cust.clientCode || cust.id})`,
    }));
    setCustSearchQuery(`${cust.name} (${cust.clientCode || cust.id})`);
    setShowCustSuggestions(false);
    showToast(`✓ Auto-selected subscriber: ${cust.name} (${cust.clientCode || cust.id})`);
  };

  const handleCreate = () => {
    if (!newTicket.customerName || !newTicket.subject) return;
    const assigned = newTicket.assignedTech.trim() || "NOC Support Desk";
    const tck: SupportTicket = {
      id: `TCK-${(tickets.length + 4422).toString()}`,
      customerName: newTicket.customerName,
      custId: newTicket.custId || "CUST-000",
      phone: newTicket.phone || "—",
      zone: newTicket.zone || "Main Zone",
      category: newTicket.category,
      priority: newTicket.priority,
      status: "open",
      subject: newTicket.subject,
      description: newTicket.description || `Subscriber ${newTicket.customerName} reported ${newTicket.category.replace("_", " ")} issue.`,
      assignedTech: assigned,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      slaDeadline: "4h remaining",
    };
    crmStore.addTicket(tck);
    setShowCreateModal(false);
    showToast(`Support Ticket #${tck.id} opened & assigned to ${tck.assignedTech}!`);
    setNewTicket({ customerName: "", custId: "", phone: "", zone: "", category: "no_internet", priority: "high", subject: "", description: "", assignedTech: "" });
    setCustSearchQuery("");
    setSelectedCustDetails(null);
  };

  const handleResolve = (id: string) => {
    crmStore.resolveTicket(id);
    showToast(`Ticket #${id} marked as resolved! Resolution SMS sent.`);
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.id.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.zone.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openTickets = tickets.filter(t => t.status === "open").length;
  const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer Support & Helpdesk Tickets
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: openTickets > 0 ? "#FEE2E2" : "#DCFCE7", color: openTickets > 0 ? "#DC2626" : "#16A34A" }}>
              {openTickets} Open · {inProgressTickets} In Progress
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            SLA tracking, technician work orders, optical failure complaints, and customer resolution workflow
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Open Support Ticket
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Pending Open Tickets</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-red-100 text-red-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "#DC2626" }}>
            {openTickets}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Awaiting tech dispatch</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Under Investigation</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-amber-100 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "#D97706" }}>
            {inProgressTickets}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Field teams active on-site</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Resolved Today</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "#16A34A" }}>
            {resolvedTickets}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Within standard 4h SLA</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Avg Resolution Time</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-blue-100 text-blue-600">
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 22, color: "#2563EB" }}>
            1h 45m
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>94.2% SLA compliance rate</p>
        </div>
      </div>

      {/* ── Tickets List Container ───────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ticket ID, customer, phone, issue..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "open", "in_progress", "resolved"] as const).map(k => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className="px-3 py-1.5 rounded-lg capitalize transition-colors text-xs"
                style={{
                  fontWeight: statusFilter === k ? 600 : 400,
                  background: statusFilter === k ? "var(--primary)" : "var(--muted)",
                  color: statusFilter === k ? "white" : "var(--muted-foreground)",
                }}
              >
                {k.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map(t => {
            const isCritical = t.priority === "critical";
            const isOpen = t.status === "open";
            return (
              <div
                key={t.id}
                className="p-5 flex items-start justify-between gap-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCritical ? "#FEE2E2" : t.status === "resolved" ? "#DCFCE7" : "#FEF3C7",
                      color: isCritical ? "#DC2626" : t.status === "resolved" ? "#16A34A" : "#D97706",
                    }}
                  >
                    <TicketCheck size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">{t.id}</span>
                      <span
                        className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          background: isCritical ? "#FEE2E2" : "#FEF3C7",
                          color: isCritical ? "#DC2626" : "#D97706",
                        }}
                      >
                        {t.priority}
                      </span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>
                        {t.subject}
                      </h4>
                    </div>

                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
                      Customer: <strong className="text-foreground">{t.customerName}</strong> ({t.custId}) · Phone: <span className="font-mono text-foreground">{t.phone}</span> · Zone: {t.zone} · Created: {t.createdAt}
                    </p>

                    <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: t.status === "resolved" ? "#DCFCE7" : isOpen ? "#FEE2E2" : "#FEF3C7",
                      color: t.status === "resolved" ? "#16A34A" : isOpen ? "#DC2626" : "#D97706",
                    }}
                  >
                    {t.status.replace("_", " ")}
                  </span>

                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    Assigned: <strong className="text-foreground">{t.assignedTech}</strong>
                  </span>

                  {t.status !== "resolved" && (
                    <button
                      onClick={() => handleResolve(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm mt-1"
                    >
                      <Check size={12} /> Mark Fixed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Open Ticket Modal ────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TicketCheck size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Customer Support Ticket
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* ── SUBSCRIBER FAST SEARCH / AUTO-FILL ── */}
              <div className="space-y-1 relative">
                <label className="font-extrabold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Search size={12} className="text-primary" />
                  <span>SEARCH & SELECT SUBSCRIBER (AUTO-FILL)</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search User ID (e.g. MBN0001), Phone, or Name..."
                    value={custSearchQuery}
                    onChange={e => {
                      setCustSearchQuery(e.target.value);
                      setShowCustSuggestions(true);
                    }}
                    onFocus={() => setShowCustSuggestions(true)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-primary/40 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary shadow-xs"
                  />
                  {custSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustSearchQuery("");
                        setSelectedCustDetails(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Auto-suggest dropdown */}
                {showCustSuggestions && matchingCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold text-muted-foreground uppercase border-b border-border">
                      Select Subscriber from Database ({matchingCustomers.length} Found)
                    </div>
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-primary/10 text-primary border border-primary/20">
                              {cust.clientCode || cust.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {cust.phone} · {cust.subzone || cust.zone} · {cust.package}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.netStatus === "online" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                          }`}>
                            {cust.netStatus === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Customer Verified Chip */}
              {selectedCustDetails && (
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={14} className="text-primary flex-shrink-0" />
                    <span>Selected: {selectedCustDetails.name} ({selectedCustDetails.clientCode || selectedCustDetails.id})</span>
                  </div>
                  <span className="font-mono text-muted-foreground text-[10px]">Zone: {selectedCustDetails.subzone || selectedCustDetails.zone}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME *</label>
                  <input
                    value={newTicket.customerName}
                    onChange={e => setNewTicket(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="e.g. Delwar Hossain"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">USER / CLIENT ID</label>
                  <input
                    value={newTicket.custId}
                    onChange={e => setNewTicket(p => ({ ...p, custId: e.target.value }))}
                    placeholder="MBN0001"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-bold text-primary"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PHONE NUMBER</label>
                  <input
                    value={newTicket.phone}
                    onChange={e => setNewTicket(p => ({ ...p, phone: e.target.value }))}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ZONE / AREA</label>
                  <input
                    value={newTicket.zone}
                    onChange={e => setNewTicket(p => ({ ...p, zone: e.target.value }))}
                    placeholder="Mirpur-10"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ISSUE CATEGORY</label>
                  <select
                    value={newTicket.category}
                    onChange={e => setNewTicket(p => ({ ...p, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    <option value="no_internet">No Internet (Red LOS on ONU)</option>
                    <option value="slow_speed">Slow Speed / High Latency</option>
                    <option value="fiber_cut">Optical Fiber Core Cut</option>
                    <option value="router_config">Wi-Fi Router Configuration</option>
                    <option value="billing_issue">Billing Dispute / Payment Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">SEVERITY PRIORITY</label>
                  <select
                    value={newTicket.priority}
                    onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    <option value="critical">Critical (Emergency - 2h SLA)</option>
                    <option value="high">High (4h SLA)</option>
                    <option value="medium">Medium (8h SLA)</option>
                    <option value="low">Low (24h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">TICKET SUBJECT *</label>
                <input
                  value={newTicket.subject}
                  onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Red Optical light flashing on GPON ONU"
                  className="w-full px-3 py-2 rounded-xl outline-none font-semibold"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">PROBLEM DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={newTicket.description}
                  onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))}
                  placeholder="Additional details, technician notes, or customer comments..."
                  className="w-full px-3 py-2 rounded-xl outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">ASSIGN FIELD TECHNICIAN / ENGINEER</label>
                <input
                  type="text"
                  value={newTicket.assignedTech}
                  onChange={e => setNewTicket(p => ({ ...p, assignedTech: e.target.value }))}
                  placeholder="Type technician name or leave blank for Auto-dispatch..."
                  className="w-full px-3 py-2 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs border border-border hover:bg-muted font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTicket.customerName || !newTicket.subject}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Open Ticket & Dispatch
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
