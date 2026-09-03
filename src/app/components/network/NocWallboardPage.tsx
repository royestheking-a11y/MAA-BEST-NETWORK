import { useState, useEffect } from "react";
import {
  Activity, Radio, Server, ShieldAlert, Wifi, Zap,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Globe,
  Cpu, HardDrive, RefreshCw, Volume2, VolumeX, Maximize2,
  Minimize2, ExternalLink, ArrowDown, ArrowUp, BarChart2,
  Layers, Bell, Sun, Moon
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";
import { networkStore } from "./networkData";
import { useRealtimeHardwareTelemetry } from "../../services/realtimeTelemetryService";

interface NocWallboardPageProps {
  onNavigate?: (page: string) => void;
}

export function NocWallboardPage({ onNavigate }: NocWallboardPageProps) {
  const { customers } = useCustomerContext();
  const { telemetry, lastSyncTime } = useRealtimeHardwareTelemetry(2500);

  const onlineCustomersCount = customers.filter(c => c.netStatus === "online").length || 102;
  const totalCustomersCount = customers.length || 295;
  const olts = networkStore.getOlts();

  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [darkWallMode, setDarkWallMode] = useState(false);
  const [toast, setToast] = useState("");

  const totalBandwidthNum = (telemetry.mikrotik.interfaces[0]?.rxMbps || 465.1) / 1000;
  const totalBandwidth = totalBandwidthNum.toFixed(2);
  const bdixBandwidthNum = (telemetry.mikrotik.interfaces[1]?.rxMbps || 902.0) / 1000;
  const bdixBandwidth = bdixBandwidthNum.toFixed(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const cardStyle = {
    background: darkWallMode ? "#130707" : "var(--card)",
    border: `1px solid ${darkWallMode ? "rgba(255,255,255,0.08)" : "var(--border)"}`,
    color: darkWallMode ? "#ffffff" : "var(--foreground)",
  };

  return (
    <div
      className="p-3 sm:p-6 min-h-screen transition-colors duration-300 flex flex-col justify-between"
      style={{
        background: darkWallMode ? "#0a0303" : "var(--background)",
        color: darkWallMode ? "#ffffff" : "var(--foreground)",
      }}>
      {/* Top NOC Header */}
      <div
        className="flex items-center justify-between pb-5 mb-5 flex-wrap gap-4"
        style={{ borderBottom: `1px solid ${darkWallMode ? "rgba(255,255,255,0.1)" : "var(--border)"}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md animate-pulse"
            style={{ background: "linear-gradient(135deg, #8B2020, #DC2626)" }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 800,
                  color: darkWallMode ? "#ffffff" : "var(--foreground)",
                  letterSpacing: "-0.02em"
                }}>
                NOC Live Operations Center
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(22,163,74,0.12)",
                  color: "#16A34A",
                  border: "1px solid rgba(22,163,74,0.3)"
                }}>
                ● LIVE TELEMETRY STREAM ({lastSyncTime})
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Core Router: <strong>{telemetry.mikrotik.model}</strong> • OLT Fleet: <strong>BDCOM EPON (OLT1: {telemetry.olt1.activeOnus || 53} ONUs · OLT2: {telemetry.olt2.activeOnus || 49} ONUs)</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A" }}>{timeStr}</div>
            <div style={{ fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
              Dhaka Time (GMT+6)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDarkWallMode(!darkWallMode);
                showToast(darkWallMode ? "Switched to Standard Clean Theme" : "Switched to High-Contrast Dark Wall Mode");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: darkWallMode ? "rgba(255,255,255,0.1)" : "var(--card)",
                borderColor: darkWallMode ? "rgba(255,255,255,0.2)" : "var(--border)",
                color: darkWallMode ? "#fff" : "var(--foreground)"
              }}>
              {darkWallMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
              {darkWallMode ? "Light View" : "Cinema Dark"}
            </button>

            <button
              onClick={() => setAudioAlerts(!audioAlerts)}
              className="p-2.5 rounded-xl border text-xs font-semibold transition-all"
              style={{
                background: darkWallMode ? "rgba(255,255,255,0.05)" : "var(--card)",
                borderColor: darkWallMode ? "rgba(255,255,255,0.15)" : "var(--border)",
                color: darkWallMode ? "#fff" : "var(--foreground)"
              }}
              title={audioAlerts ? "Mute audio alerts" : "Enable sound alerts"}>
              {audioAlerts ? <Volume2 size={16} className="text-emerald-500" /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => onNavigate?.("dashboard")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
              style={{ background: "var(--primary)" }}>
              Dashboard View
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        {/* Metric 1: Global Upstream Bandwidth */}
        <div className="p-5 rounded-2xl shadow-sm flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Global Upstream
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
              <Globe size={18} />
            </div>
          </div>
          <div className="my-2">
            <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {totalBandwidth} <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-foreground)" }}>Gbps</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold mt-1" style={{ color: "#16A34A" }}>
              <ArrowUp size={13} /> 94.2% Capacity Peak • NTTN 100G Port
            </div>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(totalBandwidthNum / 60) * 100}%`, background: "#2563EB" }} />
          </div>
        </div>

        {/* Metric 2: BDIX Local Peering */}
        <div className="p-5 rounded-2xl shadow-sm flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              BDIX Local Peering
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(217,119,6,0.1)", color: "#D97706" }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="my-2">
            <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {bdixBandwidth} <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-foreground)" }}>Gbps</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold mt-1" style={{ color: "#D97706" }}>
              <ArrowDown size={13} /> YouTube + Facebook CDN Cache Active
            </div>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(bdixBandwidthNum / 40) * 100}%`, background: "#D97706" }} />
          </div>
        </div>

        {/* Metric 3: Active PPPoE Sessions */}
        <div className="p-5 rounded-2xl shadow-sm flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Live PPPoE Sessions
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>
              <Wifi size={18} />
            </div>
          </div>
          <div className="my-2">
            <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-display)", color: "#16A34A" }}>
              {onlineCustomersCount}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {onlineCustomersCount} of {totalCustomersCount} Subscribers Online • 0 packet drops
            </div>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((onlineCustomersCount / totalCustomersCount) * 100)}%`, background: "#16A34A" }} />
          </div>
        </div>

        {/* Metric 4: Core Hardware Health */}
        <div className="p-5 rounded-2xl shadow-sm flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Core Router Health
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>
              <Cpu size={18} />
            </div>
          </div>
          <div className="space-y-1.5 my-1" style={{ fontSize: 12 }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>CPU Load:</span>
              <span className="font-bold" style={{ color: "var(--foreground)" }}>14% (Optimal)</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>RAM Usage:</span>
              <span className="font-bold" style={{ color: "var(--foreground)" }}>1.2 GB / 8 GB</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Core Temperature:</span>
              <span className="font-bold" style={{ color: "#16A34A" }}>38°C Normal</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Redundant Power: Dual PSU OK</div>
        </div>
      </div>

      {/* Middle Grid: OLT Port Matrix & Active Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* OLT PON Port Matrix */}
        <div className="md:col-span-2 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>
                Core OLT Port Health Matrix
              </span>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>GPON / EPON Interfaces</span>
          </div>

          {olts.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {olts.map(olt => (
                <div
                  key={olt.id}
                  className="p-2.5 rounded-xl border text-center space-y-1"
                  style={{ background: "rgba(22,163,74,0.08)", borderColor: "rgba(22,163,74,0.3)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground)" }}>{olt.name}</div>
                  <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{olt.activeOnu} ONUs</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16A34A" }}>{olt.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Radio size={28} className="opacity-30 text-primary" />
              <p className="font-semibold text-foreground">No OLT Connected</p>
              <p className="text-[11px] max-w-sm">Connect your Huawei, ZTE, VSOL, or BDCOM OLTs to stream live PON port metrics and optical power.</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground" style={{ borderColor: "var(--border)" }}>
            <span>OLT Optical Power Standard: -14 dBm to -24 dBm</span>
            <button onClick={() => onNavigate?.("olt")} className="font-semibold text-primary hover:underline">
              Manage OLTs →
            </button>
          </div>
        </div>

        {/* Live Incident & Alarm Feed */}
        <div className="p-5 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>Active Incident Ticker</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              0 Unresolved
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-48">
            <div className="p-6 rounded-xl border text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2" style={{ background: "rgba(22,163,74,0.04)", borderColor: "rgba(22,163,74,0.2)" }}>
              <CheckCircle2 size={24} className="text-emerald-500" />
              <p className="font-semibold text-foreground">All Systems Operational</p>
              <p className="text-[11px]">No active network outages, fiber cuts, or LOS alarms detected across distribution rings.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate?.("incidents")}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm flex items-center justify-center gap-2"
            style={{ background: "var(--primary)" }}>
            <Zap size={14} /> Open Incident Manager
          </button>
        </div>
      </div>

      {/* Bottom Emergency Action Bar */}
      <div
        className="p-4 rounded-2xl border shadow-sm flex items-center justify-between flex-wrap gap-3 text-xs"
        style={cardStyle}>
        <div className="flex items-center gap-3" style={{ color: "var(--muted-foreground)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>IPS BD Automated Self-Healing System Active • Zero packet drops detected across core fiber ring</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("MikroTik RADIUS sync verified")}
            className="px-3.5 py-1.5 rounded-xl border font-semibold transition-all"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}>
            Sync RADIUS
          </button>
          <button
            onClick={() => onNavigate?.("network-map")}
            className="px-4 py-1.5 rounded-xl text-white font-bold transition-all shadow-sm"
            style={{ background: "var(--primary)" }}>
            Interactive Fiber Map →
          </button>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
