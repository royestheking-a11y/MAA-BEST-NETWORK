import { useState, useEffect } from "react";
import {
  Monitor, Activity, RefreshCw, Zap, Clock, Wifi, Server,
  AlertTriangle, CheckCircle2, X, ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";
import {
  INITIAL_TELEMETRY, type MetricPoint
} from "./networkData";

interface MonitoringPageProps {
  onNavigate?: (page: string) => void;
}

const PEERING_PROBES = [
  { target: "Google BDIX Direct", ip: "172.217.160.14", latency: 4.2, status: "optimal", jitter: "0.4ms", loss: "0.0%" },
  { target: "Facebook / Meta CDN", ip: "157.240.239.35", latency: 5.1, status: "optimal", jitter: "0.6ms", loss: "0.0%" },
  { target: "Cloudflare DNS", ip: "1.1.1.1", latency: 6.8, status: "optimal", jitter: "0.8ms", loss: "0.0%" },
  { target: "Akamai Edge", ip: "23.218.211.55", latency: 8.4, status: "optimal", jitter: "1.1ms", loss: "0.0%" },
  { target: "International Upstream (Singtel)", ip: "203.0.113.5", latency: 38.5, status: "optimal", jitter: "2.4ms", loss: "0.1%" },
  { target: "BDIX National Peering Hub", ip: "103.242.204.1", latency: 3.8, status: "optimal", jitter: "0.2ms", loss: "0.0%" },
];

export function MonitoringPage({ onNavigate }: MonitoringPageProps) {
  const [telemetry, setTelemetry] = useState<MetricPoint[]>(INITIAL_TELEMETRY);
  const [liveThroughput, setLiveThroughput] = useState({ rx: 8.84, tx: 4.12 });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Live ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveThroughput({
        rx: Number((8.5 + Math.random() * 0.8).toFixed(2)),
        tx: Number((3.9 + Math.random() * 0.5).toFixed(2)),
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Network Telemetry & Monitoring
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live Telemetry
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            High-precision traffic analytics, BGP/CDN latency probes, core interface saturation, and SNMP traps
          </p>
        </div>

        <button
          onClick={() => showToast("Real-time telemetry stream synchronized with Prometheus / InfluxDB!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
        >
          <RefreshCw size={14} /> Refresh Probes
        </button>
      </div>

      {/* ── Live Throughput Gauges ────────────────────────────────────────────── */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="rounded-xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Live Inbound (Download)</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-blue-100 text-blue-600">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#2563EB" }}>
            {liveThroughput.rx} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>88.4% of 10G upstream capacity</p>
        </div>

        <div className="rounded-xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Live Outbound (Upload)</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-purple-100 text-purple-600">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#7C3AED" }}>
            {liveThroughput.tx} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>CDN cache return & cloud traffic</p>
        </div>

        <div className="rounded-xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Core BDIX Latency</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <Zap size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#16A34A" }}>
            3.8 ms
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>National Exchange direct fiber</p>
        </div>

        <div className="rounded-xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Packet Loss Rate</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#16A34A" }}>
            0.01%
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Zero buffer overflow drops</p>
        </div>
      </div>

      {/* ── Real-Time Traffic Graph ──────────────────────────────────────────── */}
      <div className="rounded-xl p-5 mb-5 shadow-sm space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              24-Hour Bandwidth Aggregation (Gbps)
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Aggregate ingress vs egress traffic on main 10G transit interfaces</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Download Ingress
            </span>
            <span className="flex items-center gap-1.5 text-purple-600">
              <span className="w-3 h-3 rounded bg-purple-600 inline-block" /> Upload Egress
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="G" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="download" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRx)" name="Download (Gbps)" />
              <Area type="monotone" dataKey="upload" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTx)" name="Upload (Gbps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Peering & CDN Ping Probes Table ──────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              BGP Peering & Content Delivery Latency Probes
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">ICMP / HTTP Probes every 10 seconds</span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Target Peering Destination", "Endpoint IP", "Average Latency", "Jitter", "Packet Loss", "Probe Status"].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEERING_PROBES.map((p, i) => (
              <tr
                key={p.target}
                style={{ borderBottom: i < PEERING_PROBES.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-3.5 font-semibold text-foreground">{p.target}</td>
                <td className="px-5 py-3.5 font-mono text-muted-foreground">{p.ip}</td>
                <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">{p.latency} ms</td>
                <td className="px-5 py-3.5 font-mono text-foreground">{p.jitter}</td>
                <td className="px-5 py-3.5 font-mono text-emerald-600">{p.loss}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={10} /> {p.status}
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
