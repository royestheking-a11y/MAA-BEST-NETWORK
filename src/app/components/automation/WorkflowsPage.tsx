import { useState, useEffect } from "react";
import {
  Workflow, Search, Plus, CheckCircle2, AlertTriangle, X,
  Clock, Zap, Power, Server, Smartphone, DollarSign
} from "lucide-react";
import {
  automationStore, type AutomationWorkflow
} from "./automationData";

interface WorkflowsPageProps {
  onNavigate?: (page: string) => void;
}

export function WorkflowsPage({ onNavigate }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(automationStore.getWorkflows());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newWf, setNewWf] = useState({
    name: "",
    triggerEvent: "bill_generated" as AutomationWorkflow["triggerEvent"],
    action: "send_sms" as AutomationWorkflow["action"],
    delayHours: "0"
  });

  useEffect(() => {
    return automationStore.subscribe(() => {
      setWorkflows(automationStore.getWorkflows());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleToggle = (id: string) => {
    automationStore.toggleWorkflow(id);
    const wf = workflows.find(w => w.id === id);
    showToast(`Workflow "${wf?.name}" ${!wf?.enabled ? "Activated" : "Paused"}!`);
  };

  const handleAdd = () => {
    if (!newWf.name) return;
    const wf: AutomationWorkflow = {
      id: `WF-${(workflows.length + 1).toString().padStart(2, "0")}`,
      name: newWf.name,
      triggerEvent: newWf.triggerEvent,
      action: newWf.action,
      enabled: true,
      delayHours: Number(newWf.delayHours || 0),
      executionsCount: 0,
      lastRun: "just registered",
    };
    automationStore.addWorkflow(wf);
    setShowAddModal(false);
    showToast(`Automation rule "${wf.name}" registered and active!`);
    setNewWf({ name: "", triggerEvent: "bill_generated", action: "send_sms", delayHours: "0" });
  };

  const getActionIcon = (act: AutomationWorkflow["action"]) => {
    switch (act) {
      case "send_sms": return <Smartphone size={16} className="text-blue-600" />;
      case "disable_mikrotik_pppoe": return <Server size={16} className="text-red-600" />;
      case "enable_mikrotik_pppoe": return <Server size={16} className="text-emerald-600" />;
      default: return <DollarSign size={16} className="text-amber-600" />;
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
              Automation Rules & Triggers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              {workflows.filter(w => w.enabled).length} Active Daemons Running
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Zero-touch billing cycles, auto-expiration cutoffs, instant reconnection on payment, and late fee assessments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Create Automation Rule
        </button>
      </div>

      {/* ── Workflows Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {workflows.map(wf => (
          <div
            key={wf.id}
            className="rounded-xl p-5 border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {getActionIcon(wf.action)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                      {wf.name}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>ID: {wf.id} · Delay: {wf.delayHours}h</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(wf.id)}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    background: wf.enabled ? "#DCFCE7" : "var(--muted)",
                    color: wf.enabled ? "#16A34A" : "var(--muted-foreground)",
                  }}
                >
                  <Power size={12} /> {wf.enabled ? "ACTIVE" : "PAUSED"}
                </button>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Trigger Event</span>
                  <span className="font-semibold text-foreground capitalize">{wf.triggerEvent.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Automated Action</span>
                  <span className="font-semibold text-primary capitalize">{wf.action.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Lifetime Executions</span>
                  <span className="font-mono font-bold text-foreground">{wf.executionsCount.toLocaleString()} times</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Last Run: {wf.lastRun}</span>
              <span className="text-emerald-600 font-semibold">● Trigger Verified</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Workflow Modal ───────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Workflow size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Automated Workflow
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">RULE / WORKFLOW NAME</label>
                <input
                  value={newWf.name}
                  onChange={e => setNewWf(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 24-Hour Expiry Reminder SMS"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">TRIGGER EVENT</label>
                <select
                  value={newWf.triggerEvent}
                  onChange={e => setNewWf(p => ({ ...p, triggerEvent: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                >
                  <option value="bill_generated">When Monthly Invoice is Generated</option>
                  <option value="due_date_reached">When Due Date is Reached</option>
                  <option value="grace_period_expired">When 5-Day Grace Period Expires</option>
                  <option value="payment_received">When Invoice is Paid</option>
                  <option value="ticket_resolved">When Support Ticket is Closed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">SYSTEM ACTION</label>
                <select
                  value={newWf.action}
                  onChange={e => setNewWf(p => ({ ...p, action: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                >
                  <option value="send_sms">Dispatch Custom SMS Notification</option>
                  <option value="disable_mikrotik_pppoe">Disable PPPoE Secret on MikroTik (Cut Off)</option>
                  <option value="enable_mikrotik_pppoe">Enable PPPoE Secret & Restore Internet</option>
                  <option value="apply_late_fee">Apply ৳50 Late Penalty Fee</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">EXECUTION DELAY (HOURS)</label>
                <input
                  type="number"
                  value={newWf.delayHours}
                  onChange={e => setNewWf(p => ({ ...p, delayHours: e.target.value }))}
                  placeholder="0 (Instant)"
                  className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
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
                disabled={!newWf.name}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Save Rule
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
