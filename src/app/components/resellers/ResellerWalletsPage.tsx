import { useState, useEffect } from "react";
import {
  Wallet, Search, Plus, ArrowUpRight, ArrowDownRight, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, X, CreditCard, UserCheck
} from "lucide-react";
import {
  resellersStore, type WalletTransaction, type MacReseller
} from "./resellersData";

interface ResellerWalletsPageProps {
  onNavigate?: (page: string) => void;
}

export function ResellerWalletsPage({ onNavigate }: ResellerWalletsPageProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(resellersStore.getWalletTrx());
  const [resellers, setResellers] = useState<MacReseller[]>(resellersStore.getMacResellers());
  const [search, setSearch] = useState("");
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [toast, setToast] = useState("");

  const [topupForm, setTopupForm] = useState({
    resellerId: "RSL-101",
    amount: "5000",
    method: "bKash Merchant",
    trxId: "",
  });

  useEffect(() => {
    return resellersStore.subscribe(() => {
      setTransactions(resellersStore.getWalletTrx());
      setResellers(resellersStore.getMacResellers());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleTopup = () => {
    const selected = resellers.find(r => r.id === topupForm.resellerId);
    if (!selected || !topupForm.amount) return;

    const trx: WalletTransaction = {
      id: `TX-${(transactions.length + 7705).toString()}`,
      resellerName: selected.company,
      resellerId: selected.id,
      amount: Number(topupForm.amount),
      type: "topup",
      method: topupForm.method,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      trxId: topupForm.trxId || `MFS-${Date.now().toString().slice(-7)}`,
      status: "completed",
    };

    resellersStore.addTopup(trx);
    setShowTopupModal(false);
    showToast(`৳${trx.amount.toLocaleString()} credited to ${selected.company}'s wallet!`);
    setTopupForm({ resellerId: "RSL-101", amount: "5000", method: "bKash Merchant", trxId: "" });
  };

  const filteredTrx = transactions.filter(t => {
    const q = search.toLowerCase();
    return !search ||
      t.resellerName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.trxId.toLowerCase().includes(q) ||
      t.method.toLowerCase().includes(q);
  });

  const totalBalance = resellers.reduce((a, b) => a + b.balance, 0);

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
              Reseller Wallet Ledgers & Top-Up
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#EDE9FE", color: "#7C3AED" }}>
              Total Float: ৳{totalBalance.toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Prepaid balance management, MFS auto-recharges, commission credit deposits, and billing deductions
          </p>
        </div>

        <button
          onClick={() => setShowTopupModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Recharge Reseller Wallet
        </button>
      </div>

      {/* ── Reseller Float Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {resellers.map(r => (
          <div key={r.id} className="rounded-xl p-4 border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{r.company}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                style={{
                  background: r.balance < 3000 ? "#FEE2E2" : "#DCFCE7",
                  color: r.balance < 3000 ? "#DC2626" : "#16A34A",
                }}
              >
                {r.balance < 3000 ? "Low" : "OK"}
              </span>
            </div>
            <p className="font-mono text-xl font-bold" style={{ color: r.balance < 3000 ? "#DC2626" : "#16A34A" }}>
              ৳{r.balance.toLocaleString()}
            </p>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
              <span>{r.clients} Users</span>
              <button
                onClick={() => {
                  setTopupForm(p => ({ ...p, resellerId: r.id }));
                  setShowTopupModal(true);
                }}
                className="text-primary font-semibold hover:underline"
              >
                Top-Up +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Wallet Ledger Table ──────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transaction ID, partner, method..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{filteredTrx.length} ledger records</span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Transaction ID", "Reseller Partner", "Type", "Amount", "Method / Gateway", "Trx Reference", "Date & Time", "Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTrx.map((t, i) => (
              <tr
                key={t.id}
                style={{ borderBottom: i < filteredTrx.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-3.5 font-mono font-bold text-primary">{t.id}</td>
                <td className="px-5 py-3.5 font-bold text-foreground">{t.resellerName}</td>
                <td className="px-5 py-3.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: t.type === "topup" ? "#DCFCE7" : t.type === "commission" ? "#EDE9FE" : "#FEE2E2",
                      color: t.type === "topup" ? "#16A34A" : t.type === "commission" ? "#7C3AED" : "#DC2626",
                    }}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono font-bold" style={{ color: t.type === "deduction" ? "#DC2626" : "#16A34A" }}>
                  {t.type === "deduction" ? "-" : "+"}৳{t.amount.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-foreground">{t.method}</td>
                <td className="px-5 py-3.5 font-mono text-muted-foreground">{t.trxId}</td>
                <td className="px-5 py-3.5 text-muted-foreground text-[11px]">{t.date}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 size={11} /> {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Top-Up Modal ─────────────────────────────────────────────────────── */}
      {showTopupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Recharge Reseller Float
                </h3>
              </div>
              <button onClick={() => setShowTopupModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">SELECT RESELLER</label>
                <select
                  value={topupForm.resellerId}
                  onChange={e => setTopupForm(p => ({ ...p, resellerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                >
                  {resellers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.company} (Balance: ৳{r.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">RECHARGE AMOUNT (৳)</label>
                  <input
                    type="number"
                    value={topupForm.amount}
                    onChange={e => setTopupForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PAYMENT CHANNEL</label>
                  <select
                    value={topupForm.method}
                    onChange={e => setTopupForm(p => ({ ...p, method: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>bKash Merchant</option>
                    <option>Nagad Business</option>
                    <option>Bank Deposit (EBL)</option>
                    <option>Cash Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">MFS / BANK TRX ID</label>
                <input
                  value={topupForm.trxId}
                  onChange={e => setTopupForm(p => ({ ...p, trxId: e.target.value }))}
                  placeholder="e.g. BKH8839120"
                  className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={!topupForm.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Confirm Deposit
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
