import { useState, useEffect } from "react";
import {
  ArrowLeftRight, Search, Plus, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, CheckCircle2, AlertTriangle, X, Filter
} from "lucide-react";
import {
  financeStore, type FinanceTransaction
} from "./financeData";

interface TransactionsPageProps {
  onNavigate?: (page: string) => void;
}

export function TransactionsPage({ onNavigate }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(financeStore.getTransactions());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    return financeStore.subscribe(() => {
      setTransactions(financeStore.getTransactions());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.account.toLowerCase().includes(q) ||
      t.reference.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalInflow = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalOutflow = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              General Journal & Transactions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              Double-Entry Financial Trail
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Complete ledger of customer collections, upstream vendor payouts, operating expenses, and bank transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Financial ledger exported to CSV successfully!")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Metric Summary ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Income (Inflow)</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-600">
            +৳{totalInflow.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>MFS collections & reseller topups</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Expenses (Outflow)</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-red-100 text-red-600">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-red-600">
            -৳{totalOutflow.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Upstream bandwidth, salaries & rent</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Net Cash Movement</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-blue-100 text-blue-600">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-blue-600">
            ৳{(totalInflow - totalOutflow).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Net operating cash surplus</p>
        </div>
      </div>

      {/* ── Transactions Ledger Table ────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reference, description, account..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "income", "expense", "transfer"] as const).map(k => (
              <button
                key={k}
                onClick={() => setTypeFilter(k)}
                className="px-3 py-1.5 rounded-lg capitalize transition-colors text-xs font-medium"
                style={{
                  background: typeFilter === k ? "var(--primary)" : "var(--muted)",
                  color: typeFilter === k ? "white" : "var(--muted-foreground)",
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Transaction ID", "Date", "Category & Description", "Financial Account", "Reference / Trx", "Type", "Amount", "Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr
                key={t.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-4 font-mono font-bold text-primary">{t.id}</td>
                <td className="px-5 py-4 text-muted-foreground font-mono">{t.date}</td>
                <td className="px-5 py-4">
                  <div>
                    <span className="font-bold text-foreground block">{t.description}</span>
                    <span className="text-[11px] text-muted-foreground">{t.category}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-foreground font-medium">{t.account}</td>
                <td className="px-5 py-4 font-mono text-muted-foreground">{t.reference}</td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: t.type === "income" ? "#DCFCE7" : t.type === "transfer" ? "#DBEAFE" : "#FEE2E2",
                      color: t.type === "income" ? "#16A34A" : t.type === "transfer" ? "#2563EB" : "#DC2626",
                    }}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: t.type === "expense" ? "#DC2626" : "#16A34A" }}>
                  {t.type === "expense" ? "-" : "+"}৳{t.amount.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 size={11} /> {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
