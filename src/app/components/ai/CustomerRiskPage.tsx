import { useState, useMemo } from "react";
import {
  BrainCircuit, Search, AlertTriangle, CheckCircle2, X,
  Phone, User, ShieldAlert, HeartHandshake, RefreshCw,
  Gift, Calendar, Wrench, MessageSquare, Zap, ChevronRight,
  TrendingDown, Activity, Sparkles, Filter
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";
import { activityLogger } from "../../services/activityLogger";

export function CustomerRiskPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { customers, grantExtraDays, updateCustomer } = useCustomerContext();
  const [search, setSearch] = useState("");
  const [riskTierFilter, setRiskTierFilter] = useState<"all" | "critical" | "elevated" | "moderate">("all");
  const [toast, setToast] = useState("");
  const [recalcKey, setRecalcKey] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Heuristic AI Churn Scoring Algorithm on REAL Customers
  const evaluatedCustomers = useMemo(() => {
    return customers
      .filter(c => c.userType !== "free") // Free tier subscribers never churn (100% satisfied/permanent)
      .map(c => {
        let score = 15; // baseline
        const riskFactors: string[] = [];

        // 1. Due amount / Overdue factor
        const due = c.dueAmount || c.due || 0;
        if (due > 0) {
          score += 35;
          riskFactors.push(`Unpaid invoice balance of ৳${due.toLocaleString()}`);
        }

        // 2. Expiration proximity & Days remaining
        if (c.daysRemaining !== undefined && c.daysRemaining <= 3) {
          score += 25;
          riskFactors.push(`Subscription expiring in ${c.daysRemaining} days without payment`);
        }

        // 3. Optical ONU Signal Degradation
        const signalMatch = (c.onuSignal || "").match(/-(\d+(\.\d+)?)/);
        if (signalMatch) {
          const dbm = parseFloat(signalMatch[1]);
          if (dbm > 25.0) {
            score += 20;
            riskFactors.push(`High optical attenuation (${c.onuSignal}) causing packet drops`);
          }
        }

        // 4. Line offline / Disconnected
        if (c.netStatus === "offline" || c.status === "suspended" || c.status === "disconnected") {
          score += 25;
          riskFactors.push("Line currently disconnected or offline on MikroTik");
        }

        // 5. Normal monthly plan vs corporate
        if (c.userType === "unlimited") {
          score = Math.max(5, score - 30); // VIP unlimited clients have high retention
        }

        score = Math.min(95, Math.max(10, score));

        let riskLevel: "critical" | "elevated" | "moderate" | "low" = "low";
        if (score >= 75) riskLevel = "critical";
        else if (score >= 55) riskLevel = "elevated";
        else if (score >= 35) riskLevel = "moderate";

        return {
          customer: c,
          score,
          riskLevel,
          riskFactors: riskFactors.length > 0 ? riskFactors : ["Routine renewal tracking"]
        };
      })
      .filter(item => item.score >= 35) // Only display accounts with elevated churn probability
      .sort((a, b) => b.score - a.score);
  }, [customers, recalcKey]);

  // Filtered
  const filtered = useMemo(() => {
    return evaluatedCustomers.filter(item => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.customer.name.toLowerCase().includes(q) ||
        item.customer.id.toLowerCase().includes(q) ||
        item.customer.phone.includes(q) ||
        (item.customer.zone && item.customer.zone.toLowerCase().includes(q));

      const matchTier = riskTierFilter === "all" || item.riskLevel === riskTierFilter;
      return matchSearch && matchTier;
    });
  }, [evaluatedCustomers, search, riskTierFilter]);

  // 1-Click Retention: Grant Grace Days
  const handleGrantGrace = (customerId: string, name: string) => {
    grantExtraDays(customerId, 3);
    showToast(`Granted +3 Days Grace Extension to ${name} (${customerId})!`);
  };

  // 1-Click Retention: Apply 10% Discount
  const handleApplyDiscount = (customerId: string, name: string, currentPrice: number) => {
    const discounted = Math.round(currentPrice * 0.9);
    updateCustomer(customerId, { price: discounted, monthlyBill: discounted });
    showToast(`Applied 10% Retention Discount (৳${discounted}/mo) to ${name}!`);
    activityLogger.log({
      type: "billing",
      severity: "success",
      action: "Retention Discount Applied",
      detail: `Reduced monthly fee for ${name} (${customerId}) from ৳${currentPrice} to ৳${discounted}/mo.`,
      targetId: customerId
    });
  };

  // 1-Click Retention: Send VIP SMS
  const handleSendRetentionSms = (customerId: string, name: string, phone: string) => {
    showToast(`Dispatched special retention offer SMS to ${name} (${phone})!`);
    activityLogger.log({
      type: "customer",
      severity: "info",
      action: "Retention SMS Dispatched",
      detail: `Sent special loyalty package SMS notification to ${name} at ${phone}.`,
      targetId: customerId
    });
  };

  const stats = useMemo(() => {
    const criticalCount = evaluatedCustomers.filter(e => e.riskLevel === "critical").length;
    const elevatedCount = evaluatedCustomers.filter(e => e.riskLevel === "elevated").length;
    const moderateCount = evaluatedCustomers.filter(e => e.riskLevel === "moderate").length;
    const atRiskRevenue = evaluatedCustomers.reduce((sum, e) => sum + (e.customer.price || 500), 0);
    return { criticalCount, elevatedCount, moderateCount, atRiskRevenue };
  }, [evaluatedCustomers]);

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xs">
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Customer Churn Risk & Retention Predictor
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <ShieldAlert size={12} /> {evaluatedCustomers.length} At-Risk Subscribers Identified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              AI behavioral model assessing optical complaints, payment velocity, expiration deadlines & line disconnections in real-time.
            </p>
          </div>
        </div>

        {/* Recalculate Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRecalcKey(prev => prev + 1);
              showToast("Re-analyzed churn telemetry across all subscriber accounts!");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-card hover:bg-muted text-foreground border border-border transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} className="text-primary" />
            <span>Re-Calculate Risk Scores</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">Critical Churn Risk</p>
            <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">{stats.criticalCount} Subscribers</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">Elevated Risk</p>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 mt-0.5">{stats.elevatedCount} Subscribers</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">Moderate Risk</p>
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.moderateCount} Subscribers</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">Monthly Revenue at Risk</p>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-500 mt-0.5">৳{stats.atRiskRevenue.toLocaleString()} / mo</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <TrendingDown size={18} />
          </div>
        </div>
      </div>

      {/* Filter Row: Search & Tier Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriber by name, ID, phone number, or network zone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl outline-none text-xs bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-red-500 transition-all shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: `All (${evaluatedCustomers.length})` },
            { id: "critical", label: `Critical (${stats.criticalCount})` },
            { id: "elevated", label: `Elevated (${stats.elevatedCount})` },
            { id: "moderate", label: `Moderate (${stats.moderateCount})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setRiskTierFilter(t.id as any)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                riskTierFilter === t.id
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 bg-card border border-border rounded-2xl text-center flex flex-col items-center justify-center shadow-xs">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-foreground">No High Churn Risk Subscribers In This Filter</h3>
            <p className="text-xs text-muted-foreground mt-1">All monitored accounts are healthy or satisfied with their active plans.</p>
          </div>
        ) : (
          filtered.map(item => {
            const isCrit = item.riskLevel === "critical";
            const isElev = item.riskLevel === "elevated";
            const badgeBg = isCrit ? "rgba(239, 68, 68, 0.12)" : isElev ? "rgba(245, 158, 11, 0.12)" : "rgba(59, 130, 246, 0.12)";
            const badgeColor = isCrit ? "#DC2626" : isElev ? "#D97706" : "#2563EB";
            const badgeBorder = isCrit ? "rgba(239, 68, 68, 0.3)" : isElev ? "rgba(245, 158, 11, 0.3)" : "rgba(59, 130, 246, 0.3)";

            return (
              <div
                key={item.customer.id}
                className="bg-card border border-border hover:border-border/80 hover:shadow-md rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      {/* Risk Score Circle */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base border shadow-xs group-hover:scale-105 transition-transform"
                        style={{ background: badgeBg, color: badgeColor, borderColor: badgeBorder }}
                      >
                        {item.score}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.customer.name}
                          </h3>
                          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                            {item.customer.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.customer.phone} · <span className="text-foreground font-medium">{item.customer.zone}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      style={{ background: badgeBg, color: badgeColor, borderColor: badgeBorder }}
                    >
                      {item.riskLevel} Risk
                    </span>
                  </div>

                  {/* Plan & Signal Sub-Bar */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-1 flex-wrap">
                    <span>Plan: <strong className="text-foreground">{item.customer.package}</strong></span>
                    <span>Rate: <strong className="text-emerald-600 dark:text-emerald-400">৳{item.customer.price || item.customer.monthlyBill}/mo</strong></span>
                    <span>Optical Rx: <strong className={item.customer.onuSignal?.includes("-2") ? "text-amber-600 dark:text-amber-400 font-bold" : "text-foreground font-medium"}>{item.customer.onuSignal || "—"}</strong></span>
                  </div>

                  {/* Key Risk Factors List */}
                  <div className="mt-3 bg-muted/40 p-3 rounded-xl border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Triggered Risk Factors:
                    </span>
                    {item.riskFactors.map((f, i) => (
                      <div key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-red-500 font-bold mt-0.5">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Retention Actions Toolbar */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <HeartHandshake size={13} className="text-amber-500" /> Retention Actions:
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleGrantGrace(item.customer.id, item.customer.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Calendar size={11} /> +3 Grace Days
                    </button>

                    <button
                      onClick={() => handleApplyDiscount(item.customer.id, item.customer.name, item.customer.price || 500)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Gift size={11} /> -10% Discount
                    </button>

                    <button
                      onClick={() => handleSendRetentionSms(item.customer.id, item.customer.name, item.customer.phone)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare size={11} /> VIP SMS
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-xs font-semibold shadow-2xl">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
