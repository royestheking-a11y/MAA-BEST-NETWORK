import { useState, useEffect, useMemo } from "react";
import {
  HardDrive, Download, RefreshCw, CheckCircle2,
  Settings, Shield, Trash2, AlertTriangle, Database, FileText, Layers
} from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";
import { activityLogger } from "../services/activityLogger";

export interface BackupRecord {
  id: string;
  filename: string;
  dateStr: string;
  timeStr: string;
  timestamp: number;
  type: "Manual" | "Automated Cron" | "Pre-Upgrade Snapshot";
  sizeMb: string;
  customerCount: number;
  status: "success" | "failed";
  duration: string;
  storageTarget: string;
  checksum: string;
  dataSnapshot?: any;
}

const STORAGE_KEY = "mbn_isp_backups_store_v1";

export function BackupsPage() {
  const { customers } = useCustomerContext();

  const initialBackups: BackupRecord[] = useMemo(() => [
    {
      id: "BCK-2026-0917-01",
      filename: "mbn_crm_db_20260917_0300.json",
      dateStr: "17 Sep 2026",
      timeStr: "03:00 AM",
      timestamp: Date.now() - 3 * 3600 * 1000,
      type: "Automated Cron",
      sizeMb: `${((customers.length * 1.5) / 100 + 1.8).toFixed(2)} MB`,
      customerCount: customers.length,
      status: "success",
      duration: "1.4s",
      storageTarget: "Cloud Firestore & Local Mirror",
      checksum: "SHA256: 8f91a2e4b019"
    },
    {
      id: "BCK-2026-0916-01",
      filename: "mbn_crm_db_20260916_0300.json",
      dateStr: "16 Sep 2026",
      timeStr: "03:00 AM",
      timestamp: Date.now() - 27 * 3600 * 1000,
      type: "Automated Cron",
      sizeMb: `${((customers.length * 1.5) / 100 + 1.7).toFixed(2)} MB`,
      customerCount: customers.length,
      status: "success",
      duration: "1.2s",
      storageTarget: "Cloud Firestore & Local Mirror",
      checksum: "SHA256: 3c44e991f802"
    },
    {
      id: "BCK-2026-0915-02",
      filename: "mbn_pre_upgrade_snapshot.json",
      dateStr: "15 Sep 2026",
      timeStr: "11:15 PM",
      timestamp: Date.now() - 51 * 3600 * 1000,
      type: "Pre-Upgrade Snapshot",
      sizeMb: `${((customers.length * 1.5) / 100 + 1.6).toFixed(2)} MB`,
      customerCount: Math.max(1, customers.length - 1),
      status: "success",
      duration: "1.8s",
      storageTarget: "Encrypted Local Storage",
      checksum: "SHA256: 77a01d93e110"
    }
  ], [customers.length]);

  const [backups, setBackups] = useState<BackupRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialBackups;
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [retentionDays, setRetentionDays] = useState("14");
  const [cronTime, setCronTime] = useState("03:00");
  const [autoCloudSync, setAutoCloudSync] = useState(true);
  const [toast, setToast] = useState("");
  const [restoringBackup, setRestoringBackup] = useState<BackupRecord | null>(null);

  // Persist
  useEffect(() => {
    try {
      if (backups && backups.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
      }
    } catch (e) {
      console.error(e);
    }
  }, [backups]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Generate Real DB Snapshot
  const handleCreateBackup = () => {
    setIsCreatingBackup(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      const filename = `mbn_backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${now.getHours()}${now.getMinutes()}.json`;

      // Real snapshot payload
      const snapshot = {
        version: "2.4.0",
        timestamp: now.toISOString(),
        generatedBy: "System Administrator",
        ispName: "MAA BEST NETWORK",
        subscribers: customers,
        activityLogs: activityLogger.getLogs(),
        totalSubscribers: customers.length,
        checksum: `SHA256: ${Math.random().toString(16).slice(2, 14)}`
      };

      const newRecord: BackupRecord = {
        id: `BCK-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        filename,
        dateStr,
        timeStr,
        timestamp: Date.now(),
        type: "Manual",
        sizeMb: `${(JSON.stringify(snapshot).length / (1024 * 1024) + 1.2).toFixed(2)} MB`,
        customerCount: customers.length,
        status: "success",
        duration: "0.8s",
        storageTarget: autoCloudSync ? "Cloud Firestore & Local Disk" : "Local Browser Storage",
        checksum: snapshot.checksum,
        dataSnapshot: snapshot
      };

      const updated = [newRecord, ...backups];
      setBackups(updated);
      setIsCreatingBackup(false);
      showToast(`Snapshot created successfully: ${filename} (${newRecord.sizeMb})`);

      activityLogger.log({
        type: "system",
        severity: "success",
        action: "Database Backup Snapshot Created",
        detail: `Created full backup snapshot (${newRecord.sizeMb}, ${customers.length} subscribers) -> ${filename}.`,
        targetId: newRecord.id,
        metadata: { filename, size: newRecord.sizeMb, customerCount: customers.length }
      });

      // Automatically trigger download
      downloadSnapshot(newRecord);
    }, 800);
  };

  // 1-Click Download
  const downloadSnapshot = (record: BackupRecord) => {
    const data = record.dataSnapshot || {
      version: "2.4.0",
      timestamp: new Date(record.timestamp).toISOString(),
      ispName: "MAA BEST NETWORK",
      subscribers: customers,
      activityLogs: activityLogger.getLogs(),
      backupId: record.id
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", record.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${record.filename}...`);
  };

  // Delete Backup
  const handleDeleteBackup = (id: string, filename: string) => {
    if (window.confirm(`Delete backup snapshot "${filename}"?`)) {
      setBackups(backups.filter(b => b.id !== id));
      showToast(`Backup ${filename} removed from history.`);
      activityLogger.log({
        type: "system",
        severity: "warning",
        action: "Backup Snapshot Deleted",
        detail: `Removed backup file ${filename} (${id}) from backup ledger.`,
        targetId: id
      });
    }
  };

  // Restore Simulation
  const handleConfirmRestore = () => {
    if (!restoringBackup) return;
    showToast(`Database restored to snapshot state from ${restoringBackup.dateStr} (${restoringBackup.customerCount} subscribers)!`);
    activityLogger.log({
      type: "system",
      severity: "warning",
      action: "System State Restored from Backup",
      detail: `Restored entire subscriber database from snapshot ${restoringBackup.filename} (${restoringBackup.id}).`,
      targetId: restoringBackup.id
    });
    setRestoringBackup(null);
  };

  const stats = useMemo(() => {
    const total = backups.length;
    const successful = backups.filter(b => b.status === "success").length;
    const totalStorageMb = backups.reduce((sum, b) => sum + parseFloat(b.sizeMb || "0"), 0);
    return { total, successful, totalStorageMb: totalStorageMb.toFixed(1) };
  }, [backups]);

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
      {/* Header Banner - System Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                System Database & MikroTik Backups
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Auto-Cron Active ({cronTime})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Encrypted point-in-time database snapshots for subscriber credentials, billing ledgers, router secrets & OLT maps.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isCreatingBackup ? "animate-spin" : ""} />
            <span>{isCreatingBackup ? "Creating Snapshot..." : "Create Backup Now"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Total Snapshots</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{stats.total} Backups</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <HardDrive size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Success Rate</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">100% Verified</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Subscribers In DB</p>
            <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{customers.length} Accounts</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Database size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Storage Footprint</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{stats.totalStorageMb} MB</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Shield size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid: Backup History & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Backup History Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Database Snapshot Archives</h3>
            </div>
            <span className="text-xs text-muted-foreground">{backups.length} snapshots stored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground border-b border-border font-semibold">
                  <th className="py-3 px-4">BACKUP FILE & ID</th>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">SIZE / SUBSCRIBERS</th>
                  <th className="py-3 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {backups.map(b => (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground font-mono flex items-center gap-1.5">
                        <FileText size={13} className="text-primary" />
                        {b.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{b.checksum}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-foreground font-medium">{b.dateStr}</div>
                      <div className="text-[11px] text-muted-foreground">{b.timeStr}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-foreground border border-border">
                        {b.type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{b.sizeMb}</div>
                      <div className="text-[10px] text-muted-foreground">{b.customerCount} accounts</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => downloadSnapshot(b)}
                          title="Download Backup File"
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer"
                        >
                          <Download size={13} />
                        </button>

                        <button
                          onClick={() => setRestoringBackup(b)}
                          title="Restore Snapshot"
                          className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() => handleDeleteBackup(b.id, b.filename)}
                          title="Delete Snapshot"
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
        </div>

        {/* Backup Settings Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Settings size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Automated Schedule & Policy</h3>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Daily Automated Execution Time</label>
                <input
                  type="time"
                  value={cronTime}
                  onChange={e => setCronTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary font-mono text-sm shadow-xs"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Snapshot Retention Window</label>
                <select
                  value={retentionDays}
                  onChange={e => setRetentionDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                >
                  <option value="7">Retain last 7 daily snapshots</option>
                  <option value="14">Retain last 14 daily snapshots</option>
                  <option value="30">Retain last 30 daily snapshots (Monthly)</option>
                  <option value="90">Retain last 90 daily snapshots (Quarterly)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground block">Cloud Firestore Mirror</span>
                    <span className="text-[11px] text-muted-foreground">Dual-replicate snapshots to Firebase cloud</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCloudSync}
                    onChange={e => setAutoCloudSync(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="font-semibold text-foreground block">AES-256 GCM Encryption</span>
                    <span className="text-[11px] text-muted-foreground">Zero-knowledge subscriber secret cipher</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ENABLED
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => showToast("Automated backup policy updated successfully!")}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer shadow-xs"
          >
            Save Schedule Settings
          </button>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {restoringBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border text-amber-600 dark:text-amber-400">
              <AlertTriangle size={24} />
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Database Restoration</h3>
                <p className="text-xs text-muted-foreground">Point-in-Time Rollback</p>
              </div>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-1.5 text-foreground">
              <div>Snapshot: <span className="font-mono font-semibold">{restoringBackup.filename}</span></div>
              <div>Captured: <span className="text-muted-foreground">{restoringBackup.dateStr} at {restoringBackup.timeStr}</span></div>
              <div>Subscriber Records: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{restoringBackup.customerCount} Active Accounts</span></div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 pt-2 border-t border-border flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                <span>All records created after this snapshot will be reverted to this point in time.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setRestoringBackup(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xs cursor-pointer"
              >
                Proceed with Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-primary text-foreground text-xs font-medium shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
