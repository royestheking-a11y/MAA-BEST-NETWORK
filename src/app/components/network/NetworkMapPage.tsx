import { useState } from "react";
import {
  Map as MapIcon, Activity, RefreshCw, Layers, Server, Radio, Zap,
  CheckCircle2, AlertTriangle, XCircle, X, MapPin, ZoomIn, ZoomOut,
  Search, Shield, Cpu, MemoryStick, Clock, Users, Signal, ChevronRight
} from "lucide-react";
import {
  INITIAL_MAP_NODES, INITIAL_MAP_EDGES, type MapNode, type MapNodeType, type MapNodeStatus
} from "./networkData";

const NR: Record<MapNodeType, number> = { internet: 38, mikrotik: 31, olt: 25, zone: 31 };

function getNodeFill(type: MapNodeType, status: MapNodeStatus) {
  if (status === "offline") return type === "zone" ? "#78350F" : "#991B1B";
  return { internet: "#1E40AF", mikrotik: "#7B1111", olt: "#065F46", zone: "#4C1D95" }[type];
}

function getNodeStroke(type: MapNodeType, status: MapNodeStatus) {
  if (status === "offline") return type === "zone" ? "#D97706" : "#FCA5A5";
  if (status === "warning") return "#FBBF24";
  return { internet: "#60A5FA", mikrotik: "#F87171", olt: "#34D399", zone: "#A78BFA" }[type];
}

function getEdgeColor(status: MapNodeStatus) {
  return { online: "#2DD4BF", warning: "#FBBF24", offline: "#F87171" }[status];
}

function fmtBadge(n: MapNode) {
  if (!n.sessions) return null;
  return n.sessions >= 1000 ? `${(n.sessions / 1000).toFixed(1)}k` : String(n.sessions);
}

interface NetworkMapPageProps {
  onNavigate?: (page: string) => void;
}

export function NetworkMapPage({ onNavigate }: NetworkMapPageProps) {
  const [zoom, setZoom] = useState(90);
  const [selected, setSelected] = useState<string | null>("MK1");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const VW = 1020, VH = 530;
  const nodeMap = new Map(INITIAL_MAP_NODES.map(n => [n.id, n]));
  const selNode = selected ? INITIAL_MAP_NODES.find(n => n.id === selected) : null;
  const hasIssues = INITIAL_MAP_NODES.some(n => n.status !== "online");

  const filteredNodes = INITIAL_MAP_NODES.filter(n => {
    const matchFilter = filterType === "all" || n.type === filterType;
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.ip.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Network Topology Map
            </h1>
            {hasIssues ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                ● 2 Network Outages Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                ● All Nodes Operational
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Live graphical topology — BGP transit, core MikroTik CCRs, GPON OLTs & subscriber distribution zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
            <button
              onClick={() => setZoom(z => Math.max(55, z - 10))}
              className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="font-mono text-xs font-semibold px-2 text-foreground min-w-[44px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(150, z + 10))}
              className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          <button
            onClick={() => { setSelected(null); showToast("Topology SNMP status refreshed!"); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} /> Refresh SNMP
          </button>
        </div>
      </div>

      {/* ── Main Map & Inspector Layout ──────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        {/* Toolbar & Legend Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30 text-xs flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              {(["all", "mikrotik", "olt", "zone"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className="px-2.5 py-1 rounded-md capitalize font-medium transition-colors text-[11px]"
                  style={{
                    background: filterType === type ? "var(--primary)" : "var(--muted)",
                    color: filterType === type ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {type === "all" ? "All Layers" : type === "mikrotik" ? "MikroTik" : type === "olt" ? "OLT Chassis" : "Zones"}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-border mx-1" />

            <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> BGP Upstream
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-red-800 inline-block" /> MikroTik Core
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" /> OLT Chassis
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-800 inline-block" /> Service Zone
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Online</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Offline</span>
          </div>
        </div>

        {/* Two-Column Map Canvas + Node Detail Drawer */}
        <div className="flex flex-col lg:flex-row min-h-[540px]">
          {/* SVG Map Canvas */}
          <div className="flex-1 overflow-auto bg-muted/10 p-4 relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
            <svg
              width={VW * zoom / 100}
              height={VH * zoom / 100}
              viewBox={`0 0 ${VW} ${VH}`}
              className="transition-transform duration-150"
              style={{ display: "block", cursor: "default", maxWidth: "100%" }}
            >
              <defs>
                {/* Glow filters */}
                {(["glow-blue", "glow-teal", "glow-maroon", "glow-purple"] as const).map(id => (
                  <filter key={id} id={id} x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
                <filter id="edge-glow" x="-20%" y="-200%" width="140%" height="500%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>

                {/* Edge Paths for animateMotion */}
                {INITIAL_MAP_EDGES.map(e => {
                  const a = nodeMap.get(e.from);
                  const b = nodeMap.get(e.to);
                  if (!a || !b) return null;
                  return (
                    <path
                      key={`p-${e.from}-${e.to}`}
                      id={`p-${e.from}-${e.to}`}
                      d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                      fill="none"
                      stroke="none"
                    />
                  );
                })}

                {/* Dot Grid Pattern */}
                <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="14" cy="14" r="1.2" fill="var(--border)" opacity="0.8" />
                </pattern>
              </defs>

              {/* Background dot grid */}
              <rect width={VW} height={VH} fill="url(#dotgrid)" />

              {/* ── Edges ── */}
              {INITIAL_MAP_EDGES.map(e => {
                const a = nodeMap.get(e.from);
                const b = nodeMap.get(e.to);
                if (!a || !b) return null;
                const col = getEdgeColor(e.status);
                const isOff = e.status === "offline";
                const dur = e.status === "warning" ? "3.5s" : "2s";

                return (
                  <g key={`e-${e.from}-${e.to}`}>
                    {/* Soft glow */}
                    {!isOff && (
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={col} strokeWidth={8} strokeOpacity={0.12}
                        strokeLinecap="round" filter="url(#edge-glow)"
                      />
                    )}
                    {/* Core line */}
                    <line
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={col}
                      strokeWidth={isOff ? 1.5 : 2.5}
                      strokeOpacity={isOff ? 0.45 : 0.85}
                      strokeDasharray={isOff ? "8 5" : undefined}
                      strokeLinecap="round"
                    />
                    {/* Flowing animated data packets */}
                    {!isOff && [0, 0.65, 1.3].map((delay, di) => (
                      <circle key={di} r={3.5} fill={col} opacity={0.9}>
                        <animateMotion dur={dur} begin={`${delay}s`} repeatCount="indefinite">
                          <mpath href={`#p-${e.from}-${e.to}`} />
                        </animateMotion>
                      </circle>
                    ))}
                  </g>
                );
              })}

              {/* ── Nodes ── */}
              {INITIAL_MAP_NODES.map(n => {
                const isDimmed = filterType !== "all" && n.type !== filterType;
                const r = NR[n.type];
                const fill = getNodeFill(n.type, n.status);
                const stroke = getNodeStroke(n.type, n.status);
                const badge = fmtBadge(n);
                const isSel = selected === n.id;
                const pulseDur = `${2.8 + (n.x % 5) * 0.3}s`;

                return (
                  <g
                    key={n.id}
                    style={{ cursor: "pointer", opacity: isDimmed ? 0.25 : 1, transition: "opacity 0.2s" }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(n.id);
                    }}
                  >
                    {/* Pulse ring for online nodes */}
                    {n.status === "online" && (
                      <circle cx={n.x} cy={n.y} r={r + 3} fill="none" stroke={stroke} strokeWidth="1.5">
                        <animate attributeName="r" values={`${r + 2};${r + 20};${r + 2}`} dur={pulseDur} repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur={pulseDur} repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Warning indicator */}
                    {n.status === "warning" && (
                      <circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3">
                        <animate attributeName="stroke-opacity" values="0.9;0.2;0.9" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Selection ring */}
                    {isSel && (
                      <circle
                        cx={n.x} cy={n.y} r={r + 9} fill="none"
                        stroke="#C43535" strokeWidth="2.5" strokeDasharray="6 3" strokeOpacity="0.9"
                      >
                        <animateTransform attributeName="transform" type="rotate" from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`} dur="8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Node Shadow */}
                    <circle cx={n.x} cy={n.y + 4} r={r} fill="rgba(0,0,0,0.15)" />

                    {/* Outer ring */}
                    <circle
                      cx={n.x} cy={n.y} r={r + 2} fill="none"
                      stroke={stroke} strokeWidth={n.status === "offline" ? 1.5 : 2}
                      strokeDasharray={n.status === "offline" ? "5 3.5" : undefined}
                    />

                    {/* Node Body */}
                    <circle cx={n.x} cy={n.y} r={r} fill={fill} />

                    {/* Highlight specular */}
                    <ellipse cx={n.x - r * 0.24} cy={n.y - r * 0.28} rx={r * 0.44} ry={r * 0.28} fill="rgba(255,255,255,0.2)" />

                    {/* Node Code Label */}
                    <text
                      x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize={n.type === "internet" ? 13 : 11} fontWeight="700"
                      fontFamily="monospace" letterSpacing="0.4"
                    >
                      {n.label}
                    </text>

                    {/* Name Label below */}
                    <text
                      x={n.x} y={n.y + r + 12} textAnchor="middle" dominantBaseline="hanging"
                      fill="var(--foreground)" fontSize={n.type === "olt" ? 9.5 : 11} fontWeight="600"
                    >
                      {n.name}
                    </text>

                    {/* Sub description */}
                    <text
                      x={n.x} y={n.y + r + 24} textAnchor="middle" dominantBaseline="hanging"
                      fill="var(--muted-foreground)" fontSize={8.5}
                    >
                      {n.sub}
                    </text>

                    {/* Session Count Pill Badge */}
                    {badge && (
                      <g>
                        <circle
                          cx={n.x + r * 0.68} cy={n.y - r * 0.65} r={12}
                          fill={n.status === "online" ? "#16A34A" : n.status === "warning" ? "#D97706" : "#DC2626"}
                        />
                        <text
                          x={n.x + r * 0.68} y={n.y - r * 0.65} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize={badge.length > 3 ? 6.5 : 7.5} fontWeight="700"
                          fontFamily="monospace"
                        >
                          {badge}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {INITIAL_MAP_NODES.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-primary/10 text-primary border border-primary/20">
                  <MapIcon size={28} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Network Topology Canvas Ready</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  No topology nodes mapped yet. Core MikroTik routers, GPON OLTs, and distribution zones will appear here once connected.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Node Details Inspector Drawer */}
          <div className="w-full lg:w-80 p-5 bg-card flex flex-col justify-between">
            {selNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      {selNode.type === "mikrotik" ? <Server size={18} className="text-primary" /> :
                       selNode.type === "olt" ? <Radio size={18} className="text-emerald-600" /> :
                       selNode.type === "zone" ? <MapPin size={18} className="text-purple-600" /> : <Zap size={18} className="text-blue-600" />}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                        {selNode.name}
                      </h3>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{selNode.sub}</p>
                    </div>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: selNode.status === "online" ? "#DCFCE7" : selNode.status === "warning" ? "#FEF3C7" : "#FEE2E2",
                      color: selNode.status === "online" ? "#16A34A" : selNode.status === "warning" ? "#D97706" : "#DC2626",
                    }}
                  >
                    {selNode.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">IP Address</span>
                    <span className="font-mono font-semibold text-foreground">{selNode.ip}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-mono font-medium text-foreground">{selNode.uptime}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Sessions / Subscriptions</span>
                    <span className="font-mono font-bold text-primary">{selNode.sessions.toLocaleString()}</span>
                  </div>
                  {selNode.cpu > 0 && (
                    <div className="py-1.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">CPU Utilization</span>
                        <span className="font-mono font-semibold text-foreground">{selNode.cpu}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${selNode.cpu}%`,
                            background: selNode.cpu > 75 ? "#DC2626" : "var(--primary)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick actions for this node */}
                <div className="pt-3 space-y-2">
                  {selNode.type === "mikrotik" && onNavigate && (
                    <button
                      onClick={() => onNavigate("mikrotik")}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-primary text-white flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <span>Open MikroTik Console</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {selNode.type === "olt" && onNavigate && (
                    <button
                      onClick={() => onNavigate("olt")}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <span>Manage OLT PON Ports</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {selNode.type === "zone" && onNavigate && (
                    <button
                      onClick={() => onNavigate("zones")}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-purple-600 text-white flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <span>Inspect Zone Customers</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                <MapIcon size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-foreground">No Node Selected</p>
                <p>Click on any network element in the topology diagram to inspect real-time metrics.</p>
              </div>
            )}

            <div className="pt-4 border-t border-border text-[11px] text-muted-foreground text-center">
              Auto-polled via SNMP v2/v3 · 10 Gbps BGP Transit
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast Notification ──────────────────────────────────────────────── */}
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
