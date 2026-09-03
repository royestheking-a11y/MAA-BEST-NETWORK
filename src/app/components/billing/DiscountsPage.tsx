import { useState, useEffect } from "react";
import {
  Tag, Search, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert,
  Percent, Copy, Check, X, Sliders, AlertCircle
} from "lucide-react";
import {
  billingStore, type DiscountRule, type CustomerAdjustment
} from "./billingData";

interface DiscountsPageProps {
  onNavigate?: (page: string) => void;
}

export function DiscountsPage({ onNavigate }: DiscountsPageProps) {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(billingStore.getDiscounts());
  const [adjustments, setAdjustments] = useState<CustomerAdjustment[]>(billingStore.getAdjustments());
  const [subTab, setSubTab] = useState<"coupons" | "policies" | "adjustments">("coupons");
  const [showNewPromo, setShowNewPromo] = useState(false);
  const [showNewAdjustment, setShowNewAdjustment] = useState(false);
  const [toast, setToast] = useState("");

  const [newPromo, setNewPromo] = useState({
    code: "", name: "", type: "percentage" as "percentage" | "fixed", value: "15",
    scope: "all" as DiscountRule["scope"], durationMonths: "3", maxUsage: "200", validUntil: "31 Dec 2026"
  });

  const [newAdj, setNewAdj] = useState({
    customer: "", custId: "", type: "waiver" as CustomerAdjustment["type"],
    nature: "discount" as "discount" | "penalty", amount: "", reason: "", ticketId: ""
  });

  const [penaltyPolicies, setPenaltyPolicies] = useState({
    graceDays: 5,
    lateFeeType: "fixed",
    lateFeeAmount: 50,
    reconnectFee: 150,
    autoBlockAfterGrace: true,
    autoLateFeeApply: true,
  });

  useEffect(() => {
    return billingStore.subscribe(() => {
      setDiscountRules(billingStore.getDiscounts());
      setAdjustments(billingStore.getAdjustments());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleCreatePromo = () => {
    if (!newPromo.code || !newPromo.value) return;
    const promo: DiscountRule = {
      id: `DISC-${(discountRules.length + 101).toString()}`,
      code: newPromo.code.toUpperCase(),
      name: newPromo.name || newPromo.code.toUpperCase(),
      type: newPromo.type,
      value: Number(newPromo.value),
      scope: newPromo.scope,
      durationMonths: Number(newPromo.durationMonths),
      usageCount: 0,
      maxUsage: Number(newPromo.maxUsage),
      validUntil: newPromo.validUntil,
      status: "active",
    };
    billingStore.addDiscount(promo);
    setShowNewPromo(false);
    showToast(`Promo rule "${promo.code}" activated!`);
    setNewPromo({ code: "", name: "", type: "percentage", value: "15", scope: "all", durationMonths: "3", maxUsage: "200", validUntil: "31 Dec 2026" });
  };

  const handleCreateAdjustment = () => {
    if (!newAdj.customer || !newAdj.amount) return;
    const adj: CustomerAdjustment = {
      id: `ADJ-${(adjustments.length + 501).toString()}`,
      customer: newAdj.customer,
      custId: newAdj.custId || "CUST-10099",
      type: newAdj.type,
      nature: newAdj.nature,
      amount: Number(newAdj.amount),
      reason: newAdj.reason || "Manual billing adjustment",
      ticketId: newAdj.ticketId || undefined,
      approvedBy: "Admin User",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "applied",
    };
    billingStore.addAdjustment(adj);
    setShowNewAdjustment(false);
    showToast(`Adjustment of ৳${adj.amount} applied for ${adj.customer}`);
    setNewAdj({ customer: "", custId: "", type: "waiver", nature: "discount", amount: "", reason: "", ticketId: "" });
  };

  const discountStats = {
    totalDiscounts: adjustments.filter(a => a.nature === "discount").reduce((acc, curr) => acc + curr.amount, 0) + 42500,
    totalPenalties: adjustments.filter(a => a.nature === "penalty").reduce((acc, curr) => acc + curr.amount, 0) + 18200,
    activePromos: discountRules.filter(d => d.status === "active").length,
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
              Discounts & Penalties
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              {discountStats.activePromos} Promo Rules Active
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Campaign promotional coupons, grace period late payment rules, reconnection charges, and customer waivers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewAdjustment(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          >
            <Plus size={14} /> Custom Adjustment
          </button>
          <button
            onClick={() => setShowNewPromo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
            style={{ background: "var(--primary)", fontSize: 13 }}
          >
            <Tag size={14} /> New Promo Code
          </button>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Discounts Allowed</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
              <Tag size={15} style={{ color: "#16A34A" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#16A34A", marginBottom: 2 }}>
            ৳{(discountStats.totalDiscounts / 1000).toFixed(1)}K
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Promo campaigns & goodwill waivers</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Promo Rules</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(196,53,53,0.1)" }}>
              <Percent size={15} style={{ color: "var(--primary)" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--primary)", marginBottom: 2 }}>
            {discountStats.activePromos} Coupons
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Live auto-applied discount codes</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Late Penalties Imposed</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#FEE2E2" }}>
              <AlertTriangle size={15} style={{ color: "#DC2626" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#DC2626", marginBottom: 2 }}>
            ৳{(discountStats.totalPenalties / 1000).toFixed(1)}K
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Overdue fee & line reconnection</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Grace Period Window</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
              <Clock size={15} style={{ color: "#2563EB" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
            {penaltyPolicies.graceDays} Days
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Auto-cutoff active after day 5</p>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
        {[
          { id: "coupons", label: "Promo Codes & Discount Rules", count: discountRules.length },
          { id: "policies", label: "Late Payment & Penalty Policies", count: undefined },
          { id: "adjustments", label: "Customer Adjustments & Waivers Log", count: adjustments.length },
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id as any)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            style={{
              background: subTab === st.id ? "var(--primary)" : "var(--muted)",
              color: subTab === st.id ? "white" : "var(--muted-foreground)",
            }}
          >
            <span>{st.label}</span>
            {st.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                {st.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Sub-View 1: Promo Codes & Discount Rules ─────────────────────────── */}
      {subTab === "coupons" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {discountRules.map(rule => (
            <div
              key={rule.id}
              className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  {rule.code}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: rule.status === "active" ? "#DCFCE7" : "#F3F4F6",
                    color: rule.status === "active" ? "#16A34A" : "#6B7280",
                  }}
                >
                  {rule.status.toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                {rule.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
                Scope: <span className="capitalize font-medium text-foreground">{rule.scope.replace("_", " ")}</span>
              </p>

              <div className="p-3 rounded-lg mb-4 space-y-1.5" style={{ background: "var(--muted)" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Discount Benefit</span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {rule.type === "percentage" ? `${rule.value}% OFF` : `৳${rule.value} Flat OFF`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Duration</span>
                  <span style={{ fontSize: 12, color: "var(--foreground)" }}>{rule.durationMonths} Months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Valid Until</span>
                  <span style={{ fontSize: 12, color: "var(--foreground)" }}>{rule.validUntil}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--muted-foreground)" }}>Redemptions</span>
                  <span className="font-mono font-medium text-foreground">{rule.usageCount} / {rule.maxUsage}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(rule.usageCount / rule.maxUsage) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    billingStore.setDiscounts(discountRules.map(r => r.id === rule.id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
                    showToast(`Status updated for ${rule.code}`);
                  }}
                  className="flex-1 py-1.5 rounded text-xs font-medium hover:bg-muted transition-colors"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {rule.status === "active" ? "Pause Code" : "Activate"}
                </button>
                <button
                  onClick={() => showToast(`Copied promo code ${rule.code} to clipboard!`)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sub-View 2: Late Payment & Penalty Policies ──────────────────────── */}
      {subTab === "policies" && (
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-primary" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Automated Late Fee & Grace Policies
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                  GRACE PERIOD (DAYS AFTER INVOICE DUE DATE)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={penaltyPolicies.graceDays}
                    onChange={e => setPenaltyPolicies(p => ({ ...p, graceDays: Number(e.target.value) }))}
                    className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Days before late penalty & auto-cutoff apply
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                  LATE PAYMENT PENALTY CHARGE (৳)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={penaltyPolicies.lateFeeAmount}
                    onChange={e => setPenaltyPolicies(p => ({ ...p, lateFeeAmount: Number(e.target.value) }))}
                    className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Fixed charge added to overdue invoice after grace window
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                  LINE RECONNECTION CHARGE (৳)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={penaltyPolicies.reconnectFee}
                    onChange={e => setPenaltyPolicies(p => ({ ...p, reconnectFee: Number(e.target.value) }))}
                    className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Charged when restoring suspended accounts
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={penaltyPolicies.autoLateFeeApply}
                  onChange={e => setPenaltyPolicies(p => ({ ...p, autoLateFeeApply: e.target.checked }))}
                  className="rounded accent-primary"
                />
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                  Automatically attach Late Fee to unpaid customer bills at 12:01 AM on cutoff day
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={penaltyPolicies.autoBlockAfterGrace}
                  onChange={e => setPenaltyPolicies(p => ({ ...p, autoBlockAfterGrace: e.target.checked }))}
                  className="rounded accent-primary"
                />
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                  Push suspended user IP/MAC to MikroTik <code>blocked_unpaid</code> firewall filter
                </span>
              </label>
            </div>

            <button
              onClick={() => showToast("Penalty policies updated & synced with automation engine!")}
              className="w-full py-2.5 rounded-lg text-white font-medium text-xs shadow-sm mt-2"
              style={{ background: "var(--primary)" }}
            >
              Save Policy Rules
            </button>
          </div>

          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-amber-500" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                BTRC & Standard ISP Guidelines
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block mb-0.5">Advance Notice Requirement</strong>
                  SMS notifications must be dispatched 3 days and 1 day before service disconnection.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block mb-0.5">Instant Auto-Reconnection</strong>
                  When customer pays via bKash/Nagad/Cards, system removes IP from MikroTik block list within 30 seconds.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block mb-0.5">Waiver Permission Hierarchy</strong>
                  Only Managers & Admins can issue discount adjustments above ৳500 per customer account.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-View 3: Customer Adjustments Log ──────────────────────────────── */}
      {subTab === "adjustments" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
              Audit log of all manual waivers, penalty adjustments & dispute credits
            </p>
            <button
              onClick={() => setShowNewAdjustment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary"
            >
              <Plus size={13} /> Apply New Adjustment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Adjustment ID", "Customer", "Type", "Nature", "Amount", "Reason / Ticket Ref", "Approved By", "Date", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj, i) => (
                  <tr
                    key={adj.id}
                    style={{ borderBottom: i < adjustments.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">{adj.id}</td>
                    <td className="px-4 py-3.5">
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{adj.customer}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{adj.custId}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize text-xs font-medium text-foreground">{adj.type.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: adj.nature === "discount" ? "#DCFCE7" : "#FEE2E2",
                          color: adj.nature === "discount" ? "#16A34A" : "#DC2626",
                        }}
                      >
                        {adj.nature === "discount" ? "- Discount / Credit" : "+ Penalty Charge"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm font-bold" style={{ color: adj.nature === "discount" ? "#16A34A" : "#DC2626" }}>
                      {adj.nature === "discount" ? "-" : "+"}৳{adj.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p style={{ fontSize: 12, color: "var(--foreground)" }}>{adj.reason}</p>
                      {adj.ticketId && (
                        <span className="font-mono text-xs text-primary font-medium">{adj.ticketId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{adj.approvedBy}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground/80">{adj.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check size={12} /> {adj.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create Promo Modal ───────────────────────────────────────────────── */}
      {showNewPromo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Discount Promo Code
                </h3>
              </div>
              <button onClick={() => setShowNewPromo(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PROMO CODE</label>
                  <input
                    value={newPromo.code}
                    onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. FESTIVE20"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DISCOUNT TYPE</label>
                  <select
                    value={newPromo.type}
                    onChange={e => setNewPromo(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (৳ Flat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">OFFER NAME</label>
                <input
                  value={newPromo.name}
                  onChange={e => setNewPromo(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Festive Eid Discount"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DISCOUNT VALUE ({newPromo.type === "percentage" ? "%" : "৳"})</label>
                  <input
                    type="number"
                    value={newPromo.value}
                    onChange={e => setNewPromo(p => ({ ...p, value: e.target.value }))}
                    placeholder="15"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">APPLICABLE FOR</label>
                  <select
                    value={newPromo.scope}
                    onChange={e => setNewPromo(p => ({ ...p, scope: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="new_customers">New Connections</option>
                    <option value="resellers">Resellers Only</option>
                    <option value="annual_plan">Annual Upfront</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DURATION (MONTHS)</label>
                  <input
                    type="number"
                    value={newPromo.durationMonths}
                    onChange={e => setNewPromo(p => ({ ...p, durationMonths: e.target.value }))}
                    placeholder="3"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">USAGE LIMIT</label>
                  <input
                    type="number"
                    value={newPromo.maxUsage}
                    onChange={e => setNewPromo(p => ({ ...p, maxUsage: e.target.value }))}
                    placeholder="200"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewPromo(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromo}
                disabled={!newPromo.code || !newPromo.value}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Publish Promo Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Adjustment Modal ──────────────────────────────────────────── */}
      {showNewAdjustment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Apply Custom Customer Adjustment
                </h3>
              </div>
              <button onClick={() => setShowNewAdjustment(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME</label>
                <input
                  value={newAdj.customer}
                  onChange={e => setNewAdj(p => ({ ...p, customer: e.target.value }))}
                  placeholder="e.g. Monir Ahmed"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ADJUSTMENT NATURE</label>
                  <select
                    value={newAdj.nature}
                    onChange={e => setNewAdj(p => ({ ...p, nature: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-medium"
                    style={inputStyle}
                  >
                    <option value="discount">Credit / Discount (-৳)</option>
                    <option value="penalty">Penalty / Charge (+৳)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AMOUNT (৳)</label>
                  <input
                    type="number"
                    value={newAdj.amount}
                    onChange={e => setNewAdj(p => ({ ...p, amount: e.target.value }))}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TYPE CATEGORY</label>
                  <select
                    value={newAdj.type}
                    onChange={e => setNewAdj(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="waiver">Service Outage Waiver</option>
                    <option value="promotional">Promotional Credit</option>
                    <option value="goodwill">Goodwill Adjustment</option>
                    <option value="late_fee">Late Payment Fee</option>
                    <option value="reconnection_charge">Reconnection Charge</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">SUPPORT TICKET ID</label>
                  <input
                    value={newAdj.ticketId}
                    onChange={e => setNewAdj(p => ({ ...p, ticketId: e.target.value }))}
                    placeholder="TCK-4812"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">REASON / JUSTIFICATION</label>
                <textarea
                  value={newAdj.reason}
                  onChange={e => setNewAdj(p => ({ ...p, reason: e.target.value }))}
                  placeholder="State the reason for this credit or penalty charge..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewAdjustment(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdjustment}
                disabled={!newAdj.customer || !newAdj.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Apply Adjustment
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
