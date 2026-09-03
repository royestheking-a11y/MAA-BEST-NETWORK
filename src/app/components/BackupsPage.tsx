import { useState } from "react";
import { HardDrive, Download, RefreshCw, CheckCircle2, XCircle, Clock, Settings, Shield } from "lucide-react";

interface BackupItem {
  id: string;
  date: string;
  time: string;
  type: string;
  size: string;
  status: string;
  file: string;
  duration: string;
}

const backups: BackupItem[] = [];

const storageUsed = 0.0;
const storageTotal = 10;

export function BackupsPage() {
  const [retention, setRetention] = useState("7");
  const [schedule, setSchedule] = useState("03:00");

  const successful = backups.filter(b => b.status === "success").length;

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>System Backups</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Automated daily backups at 3:00 AM · Last 7 backups retained</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
            <RefreshCw size={14} /> Create Backup Now
          </button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Backups", value: `${backups.length}`, sub: "Last 14 days", icon: HardDrive, color: "#8B2020", bg: "#FDF3F3" },
          { label: "Successful", value: `${successful}`, sub: `${Math.round(successful/backups.length*100)}% success rate`, icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Latest Size", value: "312 MB", sub: "19 Aug 2026", icon: HardDrive, color: "#2563EB", bg: "#DBEAFE" },
          { label: "Storage Used", value: `${storageUsed} GB`, sub: `/ ${storageTotal} GB total`, icon: Shield, color: "#7C3AED", bg: "#EDE9FE" },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-center rounded-lg mb-3" style={{ width: 34, height: 34, background: k.bg }}>
                <Icon size={16} style={{ color: k.color }} />
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>{k.value}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 1 }}>{k.label}</p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-5">
        {/* Backup table */}
        <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Backup History</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["ID", "Date & Time", "Type", "Size", "Duration", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < backups.length-1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{b.id}</span></td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{b.date}</p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{b.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 600, background: b.type === "Manual" ? "#DBEAFE" : "var(--muted)", color: b.type === "Manual" ? "#2563EB" : "var(--muted-foreground)" }}>
                      {b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--foreground)" }}>{b.size}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{b.duration}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {b.status === "success"
                        ? <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
                        : <XCircle size={14} style={{ color: "#DC2626" }} />}
                      <span style={{ fontSize: 12, fontWeight: 500, color: b.status === "success" ? "#16A34A" : "#DC2626", textTransform: "capitalize" }}>{b.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "success" && (
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded-md" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 11 }}>
                        <Download size={11} /> Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Settings panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={15} style={{ color: "var(--muted-foreground)" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>Backup Settings</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>SCHEDULE TIME</label>
                <input type="time" value={schedule} onChange={e => setSchedule(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>RETENTION (DAYS)</label>
                <select value={retention} onChange={e => setRetention(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <button className="w-full py-2.5 rounded-lg text-white" style={{ background: "#8B2020", fontSize: 13, fontWeight: 500 }}>Save Settings</button>
            </div>
          </div>

          {/* Storage gauge */}
          <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)", marginBottom: 12 }}>Storage Usage</h3>
            <div className="mb-3">
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Used: {storageUsed} GB</span>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{storageTotal} GB total</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full" style={{ width: `${storageUsed/storageTotal*100}%`, background: "#8B2020" }} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{((storageTotal - storageUsed)).toFixed(1)} GB free · {backups.filter(b=>b.status==="success").length} backup files</p>
          </div>
        </div>
      </div>
    </div>
  );
}
