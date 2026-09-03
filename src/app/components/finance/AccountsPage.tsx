import { useState, useEffect } from "react";
import {
  Building2, Search, Plus, CreditCard, RefreshCw, CheckCircle2,
  AlertTriangle, X, Wallet, ArrowLeftRight, Landmark, Smartphone
} from "lucide-react";
import {
  financeStore, type FinanceAccount
} from "./financeData";

interface AccountsPageProps {
  onNavigate?: (page: string) => void;
}

export function AccountsPage({ onNavigate }: AccountsPageProps) {
  const [accounts, setAccounts] = useState<FinanceAccount[]>(financeStore.getAccounts());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newAcc, setNewAcc] = useState({
    name: "", type: "bank" as FinanceAccount["type"], accountNumber: "",
    bankName: "", balance: "50000"
  });

  useEffect(() => {
    return financeStore.subscribe(() => {
      setAccounts(financeStore.getAccounts());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAdd = () => {
    if (!newAcc.name || !newAcc.accountNumber) return;
    const acc: FinanceAccount = {
      id: `ACC-${(accounts.length + 1).toString().padStart(2, "0")}`,
      name: newAcc.name,
      type: newAcc.type,
      accountNumber: newAcc.accountNumber,
      bankName: newAcc.bankName || newAcc.name,
      balance: Number(newAcc.balance || 0),
      currency: "BDT",
      lastReconciled: "just now",
    };
    financeStore.addAccount(acc);
    setShowAddModal(false);
    showToast(`Account "${acc.name}" added to financial ledger!`);
    setNewAcc({ name: "", type: "bank", accountNumber: "", bankName: "", balance: "50000" });
  };

  const totalLiquidity = accounts.reduce((a, b) => a + b.balance, 0);

  const getAccountIcon = (type: FinanceAccount["type"]) => {
    switch (type) {
      case "bank": return <Landmark size={20} className="text-blue-600" />;
      case "mfs": return <Smartphone size={20} className="text-pink-600" />;
      default: return <Wallet size={20} className="text-emerald-600" />;
    }
  };

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
              Financial Accounts & Treasury
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Total Liquid Funds: ৳{totalLiquidity.toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Commercial bank accounts, bKash/Nagad merchant floats, and field cash collection vaults
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => showToast("Account balances synced with bank & MFS API settlement feeds!")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Reconcile Feeds
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
            style={{ background: "var(--primary)", fontSize: 13 }}
          >
            <Plus size={14} /> Add Bank / MFS Account
          </button>
        </div>
      </div>

      {/* ── Account Cards Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="rounded-xl p-5 border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                      {acc.name}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{acc.bankName}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                  {acc.type.replace("_", " ")}
                </span>
              </div>

              <div className="pt-4 space-y-2">
                <span className="text-xs text-muted-foreground block">AVAILABLE BALANCE</span>
                <p className="font-mono text-2xl font-bold text-foreground">
                  ৳{acc.balance.toLocaleString()}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  A/C: <span className="text-foreground font-semibold">{acc.accountNumber}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Reconciled: {acc.lastReconciled}</span>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate("transactions");
                }}
                className="text-primary font-semibold hover:underline"
              >
                Statement →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Account Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Link Financial Account
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">ACCOUNT NAME</label>
                <input
                  value={newAcc.name}
                  onChange={e => setNewAcc(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. BRAC Bank Corporate A/C"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ACCOUNT TYPE</label>
                  <select
                    value={newAcc.type}
                    onChange={e => setNewAcc(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="bank">Bank Account</option>
                    <option value="mfs">MFS Merchant (bKash/Nagad)</option>
                    <option value="cash_counter">Physical Cash Counter</option>
                    <option value="petty_cash">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BANK / INSTITUTION</label>
                  <input
                    value={newAcc.bankName}
                    onChange={e => setNewAcc(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. BRAC Bank PLC"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ACCOUNT / WALLET NO.</label>
                  <input
                    value={newAcc.accountNumber}
                    onChange={e => setNewAcc(p => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="150120..."
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">OPENING BALANCE (৳)</label>
                  <input
                    type="number"
                    value={newAcc.balance}
                    onChange={e => setNewAcc(p => ({ ...p, balance: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
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
                disabled={!newAcc.name || !newAcc.accountNumber}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Save Account
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
