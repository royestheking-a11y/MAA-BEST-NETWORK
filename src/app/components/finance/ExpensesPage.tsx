import { useState, useEffect } from "react";
import {
  TrendingDown, Search, Plus, CheckCircle2, AlertTriangle, X,
  Building2, CreditCard, RefreshCw, FileText
} from "lucide-react";
import {
  financeStore, type ExpenseItem
} from "./financeData";

interface ExpensesPageProps {
  onNavigate?: (page: string) => void;
}

export function ExpensesPage({ onNavigate }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(financeStore.getExpenses());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newExp, setNewExp] = useState({
    vendor: "", category: "upstream_bw" as ExpenseItem["category"],
    amount: "15000", paidFrom: "EBL Principal Current A/C", invoiceNo: ""
  });

  useEffect(() => {
    return financeStore.subscribe(() => {
      setExpenses(financeStore.getExpenses());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAdd = () => {
    if (!newExp.vendor || !newExp.amount) return;
    const exp: ExpenseItem = {
      id: `EXP-${(expenses.length + 106).toString()}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      category: newExp.category,
      vendor: newExp.vendor,
      amount: Number(newExp.amount),
      paidFrom: newExp.paidFrom,
      invoiceNo: newExp.invoiceNo || `VCH-${Date.now().toString().slice(-4)}`,
      status: "paid",
    };
    financeStore.addExpense(exp);
    setShowAddModal(false);
    showToast(`Expense ৳${exp.amount.toLocaleString()} recorded under ${exp.category.replace("_", " ")}!`);
    setNewExp({ vendor: "", category: "upstream_bw", amount: "15000", paidFrom: "EBL Principal Current A/C", invoiceNo: "" });
  };

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      e.vendor.toLowerCase().includes(q) ||
      e.invoiceNo.toLowerCase().includes(q) ||
      e.paidFrom.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);

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
              Operating Expenses & Vendor Payouts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
              Total OPEX: ৳{totalExpense.toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Upstream IIG/NTTN bandwidth leases, DC rack electricity, field fiber repairs, and staff payroll
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Record Expense Voucher
        </button>
      </div>

      {/* ── Expense Breakdown Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Upstream IIG / NTTN</span>
          <p className="font-mono text-xl font-bold text-foreground mt-1">
            ৳{expenses.filter(e => e.category === "upstream_bw").reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Core transit commitments</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Staff Payroll (NOC & Field)</span>
          <p className="font-mono text-xl font-bold text-foreground mt-1">
            ৳{expenses.filter(e => e.category === "staff_salary").reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>14 engineering personnel</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>DC Rent & Utilities</span>
          <p className="font-mono text-xl font-bold text-foreground mt-1">
            ৳{expenses.filter(e => e.category === "office_rent" || e.category === "utilities").reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Tower lease & DESCO power</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Fiber Maintenance</span>
          <p className="font-mono text-xl font-bold text-foreground mt-1">
            ৳{expenses.filter(e => e.category === "fiber_maintenance").reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Splice kits & drop wire</p>
        </div>
      </div>

      {/* ── Expenses Table ───────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendor, invoice no, bank account..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "upstream_bw", "staff_salary", "office_rent", "utilities"] as const).map(k => (
              <button
                key={k}
                onClick={() => setCategoryFilter(k)}
                className="px-3 py-1.5 rounded-lg capitalize transition-colors text-xs font-medium"
                style={{
                  background: categoryFilter === k ? "var(--primary)" : "var(--muted)",
                  color: categoryFilter === k ? "white" : "var(--muted-foreground)",
                }}
              >
                {k.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Expense ID", "Date", "Vendor / Payee", "Category", "Paid From Account", "Invoice / Voucher", "Amount", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-red-600">{e.id}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.date}</td>
                  <td className="px-5 py-3.5 font-bold text-foreground">{e.vendor}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                      {e.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.paidFrom}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground">{e.invoiceNo}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-foreground">৳{e.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Expense Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-red-600" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Record Operating Expense
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">VENDOR / BENEFICIARY</label>
                <input
                  value={newExp.vendor}
                  onChange={e => setNewExp(p => ({ ...p, vendor: e.target.value }))}
                  placeholder="e.g. Summit Communications Ltd."
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CATEGORY</label>
                  <select
                    value={newExp.category}
                    onChange={e => setNewExp(p => ({ ...p, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="upstream_bw">Upstream Bandwidth</option>
                    <option value="fiber_maintenance">Fiber Maintenance</option>
                    <option value="office_rent">Office / POP Rent</option>
                    <option value="staff_salary">Staff Payroll</option>
                    <option value="utilities">Electricity & Fuel</option>
                    <option value="marketing">Marketing & Promo</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AMOUNT (৳)</label>
                  <input
                    type="number"
                    value={newExp.amount}
                    onChange={e => setNewExp(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PAID FROM ACCOUNT</label>
                  <select
                    value={newExp.paidFrom}
                    onChange={e => setNewExp(p => ({ ...p, paidFrom: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>EBL Principal Current A/C</option>
                    <option>City Bank Operation A/C</option>
                    <option>bKash Merchant Master</option>
                    <option>Mirpur Cash Counter</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">INVOICE / BILL NO.</label>
                  <input
                    value={newExp.invoiceNo}
                    onChange={e => setNewExp(p => ({ ...p, invoiceNo: e.target.value }))}
                    placeholder="e.g. SUM-INV-883"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newExp.vendor || !newExp.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 disabled:opacity-50"
              >
                Post Expense
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
