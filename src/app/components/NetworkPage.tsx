import { useState, useCallback } from "react";
import {
  Server, Radio, Layers, Circle, Cpu, MemoryStick, Clock, Users,
  Activity, RefreshCw, ChevronRight, AlertTriangle, CheckCircle2,
  Zap, Signal, MapPin, Plus, Eye, X, TerminalSquare
} from "lucide-react";

type NetTab = "mikrotik" | "olt" | "network-map" | "zones" | "incidents";

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background: "#130606", color: "#fff", fontSize: 13, fontWeight: 500, animation: "toastIn 0.2s ease" }}>
      <style>{`@keyframes toastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes spin2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />{msg}
      <button onClick={onClose} className="ml-2"><X size={14} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
    </div>
  );
}

// ─── Network Map Data ─────────────────────────────────────────────────────────
type MapNodeType   = "internet"|"mikrotik"|"olt"|"zone";
type MapNodeStatus = "online"|"warning"|"offline";

const MAP_NODES = [
  { id:"INT",  label:"INT",  name:"INTERNET",       sub:"10 Gbps · BGP Upstream",  type:"internet" as MapNodeType, x:530, y:65,  status:"online"  as MapNodeStatus, sessions:12840, cpu:45, ip:"203.0.113.1",  uptime:"99.4%" },
  { id:"MK1",  label:"MK",   name:"MikroTik-01",    sub:"Mirpur DC · CCR2004",     type:"mikrotik" as MapNodeType, x:130, y:210, status:"online"  as MapNodeStatus, sessions:1300,  cpu:23, ip:"10.10.1.1",    uptime:"18d 4h"},
  { id:"MK2",  label:"MK",   name:"MikroTik-02",    sub:"Uttara DC · CCR2016",     type:"mikrotik" as MapNodeType, x:375, y:210, status:"online"  as MapNodeStatus, sessions:987,   cpu:47, ip:"10.10.2.1",    uptime:"12d 8h"},
  { id:"MK3",  label:"MK",   name:"MikroTik-03",    sub:"Dhanmondi · CCR1009",     type:"mikrotik" as MapNodeType, x:635, y:210, status:"warning" as MapNodeStatus, sessions:812,   cpu:81, ip:"10.10.3.1",    uptime:"4d 2h" },
  { id:"MK4",  label:"MK",   name:"MikroTik-04",    sub:"Gulshan POP",             type:"mikrotik" as MapNodeType, x:895, y:210, status:"offline" as MapNodeStatus, sessions:0,     cpu:0,  ip:"10.10.4.1",    uptime:"—"     },
  { id:"OLT1", label:"OLT",  name:"OLT-Mirpur-01",  sub:"421 ONU active",          type:"olt"      as MapNodeType, x:65,  y:345, status:"online"  as MapNodeStatus, sessions:421,   cpu:0,  ip:"10.20.1.1",    uptime:"22d 3h"},
  { id:"OLT2", label:"OLT",  name:"OLT-Mirpur-02",  sub:"241 ONU active",          type:"olt"      as MapNodeType, x:250, y:345, status:"online"  as MapNodeStatus, sessions:241,   cpu:0,  ip:"10.20.1.2",    uptime:"15d 6h"},
  { id:"OLT3", label:"OLT",  name:"OLT-Uttara-01",  sub:"214 ONU active",          type:"olt"      as MapNodeType, x:455, y:345, status:"online"  as MapNodeStatus, sessions:214,   cpu:0,  ip:"10.20.2.1",    uptime:"11d 7h"},
  { id:"OLT4", label:"OLT",  name:"OLT-Banani-01",  sub:"LINK DOWN",              type:"olt"      as MapNodeType, x:710, y:345, status:"offline" as MapNodeStatus, sessions:0,     cpu:0,  ip:"10.20.3.1",    uptime:"—"     },
  { id:"Z1",   label:"ZONE", name:"Mirpur Zone",     sub:"3,240 customers",         type:"zone"     as MapNodeType, x:190, y:468, status:"online"  as MapNodeStatus, sessions:3240,  cpu:0,  ip:"—",           uptime:"—"     },
  { id:"Z2",   label:"ZONE", name:"Uttara Zone",     sub:"2,810 customers",         type:"zone"     as MapNodeType, x:455, y:468, status:"online"  as MapNodeStatus, sessions:2810,  cpu:0,  ip:"—",           uptime:"—"     },
  { id:"Z3",   label:"ZONE", name:"Dhanmondi",       sub:"2,190 customers",         type:"zone"     as MapNodeType, x:710, y:468, status:"warning" as MapNodeStatus, sessions:2190,  cpu:0,  ip:"—",           uptime:"—"     },
  { id:"Z4",   label:"ZONE", name:"Gulshan",         sub:"1,890 customers",         type:"zone"     as MapNodeType, x:895, y:468, status:"offline" as MapNodeStatus, sessions:1890,  cpu:0,  ip:"—",           uptime:"—"     },
];

const MAP_EDGES = [
  { from:"INT",  to:"MK1",  status:"online"  as MapNodeStatus, speed:"2.4 Gbps" },
  { from:"INT",  to:"MK2",  status:"online"  as MapNodeStatus, speed:"1.8 Gbps" },
  { from:"INT",  to:"MK3",  status:"warning" as MapNodeStatus, speed:"0.4 Gbps" },
  { from:"INT",  to:"MK4",  status:"offline" as MapNodeStatus, speed:"—"        },
  { from:"MK1",  to:"OLT1", status:"online"  as MapNodeStatus, speed:"1.2 Gbps" },
  { from:"MK1",  to:"OLT2", status:"online"  as MapNodeStatus, speed:"0.8 Gbps" },
  { from:"MK2",  to:"OLT3", status:"online"  as MapNodeStatus, speed:"0.9 Gbps" },
  { from:"MK3",  to:"OLT4", status:"offline" as MapNodeStatus, speed:"—"        },
  { from:"OLT1", to:"Z1",   status:"online"  as MapNodeStatus, speed:"—"        },
  { from:"OLT2", to:"Z1",   status:"online"  as MapNodeStatus, speed:"—"        },
  { from:"OLT3", to:"Z2",   status:"online"  as MapNodeStatus, speed:"—"        },
  { from:"MK3",  to:"Z3",   status:"warning" as MapNodeStatus, speed:"0.2 Gbps" },
  { from:"MK4",  to:"Z4",   status:"offline" as MapNodeStatus, speed:"—"        },
];

const NR: Record<MapNodeType, number> = { internet:38, mikrotik:31, olt:25, zone:31 };

function getNodeFill(type: MapNodeType, status: MapNodeStatus) {
  if (status === "offline") return type === "zone" ? "#78350F" : "#991B1B";
  return { internet:"#1E40AF", mikrotik:"#7B1111", olt:"#065F46", zone:"#4C1D95" }[type];
}
function getNodeStroke(type: MapNodeType, status: MapNodeStatus) {
  if (status === "offline") return type === "zone" ? "#D97706" : "#FCA5A5";
  if (status === "warning") return "#FBBF24";
  return { internet:"#60A5FA", mikrotik:"#F87171", olt:"#34D399", zone:"#A78BFA" }[type];
}
function getEdgeColor(status: MapNodeStatus) {
  return { online:"#2DD4BF", warning:"#FBBF24", offline:"#F87171" }[status];
}
function fmtBadge(n: typeof MAP_NODES[0]) {
  if (!n.sessions) return null;
  return n.sessions >= 1000 ? `${(n.sessions/1000).toFixed(1)}k` : String(n.sessions);
}

function NetworkMapView({ onToast }: { onToast: (m: string) => void }) {
  const [zoom, setZoom] = useState(85);
  const [selected, setSelected] = useState<string | null>(null);

  const VW = 1020, VH = 530;
  const nodeMap = new Map(MAP_NODES.map(n => [n.id, n]));
  const selNode  = selected ? MAP_NODES.find(n => n.id === selected) : null;
  const hasIssues = MAP_NODES.some(n => n.status !== "online");

  return (
    <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom:"1px solid var(--border)" }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:"var(--foreground)" }}>Network Map</h3>
            {hasIssues && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                style={{ background:"#DC2626", color:"#fff", fontSize:11, fontWeight:600 }}>
                ● Network Issues Detected
              </span>
            )}
          </div>
          <p style={{ fontSize:12, color:"var(--muted-foreground)" }}>Interactive topology — click any node for details</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(55, z-10))}
            style={{ width:30, height:30, border:"1px solid var(--border)", borderRadius:8, background:"var(--muted)", fontSize:18, cursor:"pointer", color:"var(--foreground)", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"var(--foreground)", minWidth:40, textAlign:"center" }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(150, z+10))}
            style={{ width:30, height:30, border:"1px solid var(--border)", borderRadius:8, background:"var(--muted)", fontSize:18, cursor:"pointer", color:"var(--foreground)", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          <button onClick={() => { setSelected(null); onToast("Topology refreshed"); }}
            style={{ width:30, height:30, border:"1px solid var(--border)", borderRadius:8, background:"var(--muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <RefreshCw size={14} style={{ color:"var(--muted-foreground)" }}/>
          </button>
          <button onClick={() => onToast("Fullscreen — open in new tab for best view")}
            style={{ width:30, height:30, border:"1px solid var(--border)", borderRadius:8, background:"var(--muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Activity size={14} style={{ color:"var(--muted-foreground)" }}/>
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center flex-wrap gap-x-5 gap-y-1 px-5 py-2.5"
        style={{ borderBottom:"1px solid var(--border)", background:"var(--muted)" }}>
        {[
          { dot:"#22C55E",  label:"Online",   filled:false },
          { dot:"#EF4444",  label:"Offline",  filled:false },
          { dot:"#F59E0B",  label:"Warning",  filled:false },
          { dot:"#7B1111",  label:"MikroTik", filled:true  },
          { dot:"#065F46",  label:"OLT",      filled:true  },
          { dot:"#4C1D95",  label:"Zone",     filled:true  },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div style={{ width:10, height:10, borderRadius:"50%",
              background: l.filled ? l.dot : "transparent",
              border: l.filled ? "none" : `2.5px solid ${l.dot}`, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Map + Detail ── */}
      <div className="flex" style={{ minHeight:520 }}>
        {/* SVG map */}
        <div style={{ flex:1, overflow:"auto", background:"#FAFAF9", position:"relative" }}>
          <svg
            width={VW * zoom / 100}
            height={VH * zoom / 100}
            viewBox={`0 0 ${VW} ${VH}`}
            style={{ display:"block", cursor:"default" }}
            onClick={() => setSelected(null)}
          >
            <defs>
              {/* Glow filters */}
              {(["glow-blue","glow-teal","glow-maroon","glow-purple"] as const).map(id => (
                <filter key={id} id={id} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              ))}
              <filter id="edge-glow" x="-20%" y="-200%" width="140%" height="500%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Edge paths for animateMotion */}
              {MAP_EDGES.map(e => {
                const a = nodeMap.get(e.from)!, b = nodeMap.get(e.to)!;
                return <path key={`p-${e.from}-${e.to}`} id={`p-${e.from}-${e.to}`}
                  d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" stroke="none"/>;
              })}
              {/* Dot grid pattern */}
              <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.1" fill="#CBD5E1" opacity="0.55"/>
              </pattern>
            </defs>

            {/* Background dot grid */}
            <rect width={VW} height={VH} fill="url(#dotgrid)"/>

            {/* ── Edges ── */}
            {MAP_EDGES.map(e => {
              const a = nodeMap.get(e.from)!, b = nodeMap.get(e.to)!;
              const col = getEdgeColor(e.status);
              const isOff = e.status === "offline";
              const dur   = e.status === "warning" ? "3.5s" : "2s";
              return (
                <g key={`e-${e.from}-${e.to}`}>
                  {/* Soft glow */}
                  {!isOff && (
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={col} strokeWidth={9} strokeOpacity={0.10}
                      strokeLinecap="round" filter="url(#edge-glow)"/>
                  )}
                  {/* Core line */}
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={col}
                    strokeWidth={isOff ? 1.5 : 2}
                    strokeOpacity={isOff ? 0.45 : 0.85}
                    strokeDasharray={isOff ? "8 5" : undefined}
                    strokeLinecap="round"/>
                  {/* Flowing data dots */}
                  {!isOff && [0, 0.65, 1.3].map((delay, di) => (
                    <circle key={di} r={3.5} fill={col} opacity={0.88}>
                      <animateMotion dur={dur} begin={`${delay}s`} repeatCount="indefinite">
                        <mpath href={`#p-${e.from}-${e.to}`}/>
                      </animateMotion>
                    </circle>
                  ))}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {MAP_NODES.map(n => {
              const r      = NR[n.type];
              const fill   = getNodeFill(n.type, n.status);
              const stroke = getNodeStroke(n.type, n.status);
              const badge  = fmtBadge(n);
              const isSel  = selected === n.id;
              const glowId = { internet:"glow-blue", mikrotik:"glow-maroon", olt:"glow-teal", zone:"glow-purple" }[n.type];
              const pulseDur = `${2.8 + (n.x % 5)*0.3}s`;

              return (
                <g key={n.id} style={{ cursor:"pointer" }}
                  onClick={ev => { ev.stopPropagation(); setSelected(n.id === selected ? null : n.id); }}>

                  {/* Pulse ring — online only */}
                  {n.status === "online" && (
                    <circle cx={n.x} cy={n.y} r={r+3} fill="none" stroke={stroke} strokeWidth="1.5">
                      <animate attributeName="r" values={`${r+2};${r+22};${r+2}`} dur={pulseDur} repeatCount="indefinite"/>
                      <animate attributeName="stroke-opacity" values="0.65;0;0.65" dur={pulseDur} repeatCount="indefinite"/>
                    </circle>
                  )}

                  {/* Warning double-ring */}
                  {n.status === "warning" && (
                    <circle cx={n.x} cy={n.y} r={r+5} fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3">
                      <animate attributeName="stroke-opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite"/>
                    </circle>
                  )}

                  {/* Selected dashed rotation ring */}
                  {isSel && (
                    <circle cx={n.x} cy={n.y} r={r+9} fill="none"
                      stroke="#8B2020" strokeWidth="2.5" strokeDasharray="6 3" strokeOpacity="0.85">
                      <animateTransform attributeName="transform" type="rotate"
                        from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`} dur="8s" repeatCount="indefinite"/>
                    </circle>
                  )}

                  {/* Drop shadow */}
                  <circle cx={n.x} cy={n.y+4} r={r} fill="rgba(0,0,0,0.12)"/>

                  {/* Outer ring */}
                  <circle cx={n.x} cy={n.y} r={r+2} fill="none"
                    stroke={stroke} strokeWidth={n.status==="offline" ? 1.5 : 2}
                    strokeDasharray={n.status==="offline" ? "5 3.5" : undefined}
                    strokeOpacity={n.status==="offline" ? 0.6 : 0.8}
                    filter={n.status==="online" ? `url(#${glowId})` : undefined}/>

                  {/* Main fill */}
                  <circle cx={n.x} cy={n.y} r={r} fill={fill}/>

                  {/* Specular highlight */}
                  <ellipse cx={n.x - r*0.24} cy={n.y - r*0.28}
                    rx={r*0.44} ry={r*0.28} fill="rgba(255,255,255,0.18)"/>

                  {/* Node label */}
                  <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={n.type==="internet" ? 13 : 11} fontWeight="700"
                    fontFamily="'JetBrains Mono',monospace" letterSpacing="0.4">
                    {n.label}
                  </text>

                  {/* Name below node */}
                  <text x={n.x} y={n.y + r + 12} textAnchor="middle" dominantBaseline="hanging"
                    fill="#1E293B" fontSize={n.type==="olt" ? 9 : 10} fontWeight="600"
                    fontFamily="Manrope,sans-serif">
                    {n.name}
                  </text>

                  {/* Sub label */}
                  <text x={n.x} y={n.y + r + 24} textAnchor="middle" dominantBaseline="hanging"
                    fill="#94A3B8" fontSize={8.5} fontFamily="Inter,sans-serif">
                    {n.sub}
                  </text>

                  {/* Session badge */}
                  {badge && (
                    <g>
                      <circle cx={n.x + r*0.68} cy={n.y - r*0.65} r={12}
                        fill={n.status==="online" ? "#16A34A" : n.status==="warning" ? "#D97706" : "#DC2626"}/>
                      <text x={n.x + r*0.68} y={n.y - r*0.65} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize={badge.length > 3 ? 6.5 : 7.5} fontWeight="700"
                        fontFamily="monospace">
                        {badge}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Detail Panel ── */}
        {selNode && (
          <div style={{ width:228, borderLeft:"1px solid var(--border)", background:"var(--card)", display:"flex", flexDirection:"column" }}>
            {/* Panel header */}
            <div className="px-4 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize:10, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  {selNode.type}
                </span>
                <span className="px-2 py-0.5 rounded-full"
                  style={{ fontSize:10, fontWeight:700, color:"#fff",
                    background: selNode.status==="online" ? "#16A34A" : selNode.status==="warning" ? "#D97706" : "#DC2626" }}>
                  {selNode.status.toUpperCase()}
                </span>
              </div>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:14, color:"var(--foreground)" }}>{selNode.name}</p>
              <p style={{ fontSize:11, color:"var(--muted-foreground)", marginTop:2 }}>{selNode.sub}</p>
            </div>

            {/* Info rows */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {[
                ["IP Address",  selNode.ip,     true ],
                ["Sessions",    selNode.sessions > 0 ? selNode.sessions.toLocaleString() : "—", false],
                ["CPU Load",    selNode.cpu > 0 ? `${selNode.cpu}%` : "—", false],
                ["Uptime",      selNode.uptime, false],
              ].map(([lbl, val, mono]) => (
                <div key={String(lbl)} className="flex justify-between py-2.5"
                  style={{ borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>{lbl}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--foreground)",
                    fontFamily: mono ? "var(--font-mono)" : undefined }}>
                    {String(val)}
                  </span>
                </div>
              ))}

              {/* Connected edges */}
              <div className="mt-3 mb-2">
                <p style={{ fontSize:10, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>CONNECTIONS</p>
                {MAP_EDGES.filter(e => e.from===selNode.id || e.to===selNode.id).map(e => {
                  const otherId = e.from===selNode.id ? e.to : e.from;
                  const other   = nodeMap.get(otherId)!;
                  return (
                    <div key={otherId} className="flex items-center justify-between py-1.5">
                      <span style={{ fontSize:11, color:"var(--foreground)" }}>{other.name}</span>
                      <span className="px-1.5 py-0.5 rounded"
                        style={{ fontSize:9, fontWeight:600, color:"#fff",
                          background: e.status==="online" ? "#16A34A" : e.status==="warning" ? "#D97706" : "#DC2626" }}>
                        {e.status==="offline" ? "DOWN" : e.speed}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4" style={{ borderTop:"1px solid var(--border)" }}>
              <p style={{ fontSize:10, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>ACTIONS</p>
              {[
                { label:"Sync Device",   msg:`Syncing ${selNode.name}...`    },
                { label:"View Sessions", msg:`Opening sessions for ${selNode.name}` },
                { label:"Ping Test",     msg:`Pinging ${selNode.ip}...`      },
              ].map(a => (
                <button key={a.label} onClick={() => onToast(a.msg)}
                  className="w-full mb-1.5 py-2 px-3 rounded-lg text-left"
                  style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12, color:"var(--foreground)", cursor:"pointer" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const mikrotikServers = [
  {
    name: "MikroTik-01",
    location: "Dhaka Main DC",
    ip: "192.168.1.1",
    model: "CCR2004-1G-12S+2XS",
    uptime: "27d 14h",
    cpu: 23,
    ram: 41,
    sessions: 972,
    activeUsers: 944,
    status: "online",
    version: "7.12.1",
    lastSync: "2m ago",
  },
  {
    name: "MikroTik-02",
    location: "Mirpur DC",
    ip: "192.168.2.1",
    model: "CCR2016-1G-12S+2XS",
    uptime: "14d 7h",
    cpu: 47,
    ram: 58,
    sessions: 1284,
    activeUsers: 1201,
    status: "online",
    version: "7.12.1",
    lastSync: "1m ago",
  },
  {
    name: "MikroTik-03",
    location: "Chittagong POP",
    ip: "10.0.3.1",
    model: "CCR1009-7G-1C-1S+",
    uptime: "3d 2h",
    cpu: 61,
    ram: 72,
    sessions: 488,
    activeUsers: 431,
    status: "warning",
    version: "7.11.3",
    lastSync: "4m ago",
  },
  {
    name: "MikroTik-04",
    location: "Sylhet POP",
    ip: "10.0.4.1",
    model: "RB4011iGS+5HacQ2HnD",
    uptime: "44d 1h",
    cpu: 18,
    ram: 34,
    sessions: 312,
    activeUsers: 298,
    status: "online",
    version: "7.12.1",
    lastSync: "3m ago",
  },
];

const oltDevices = [
  {
    name: "OLT-Dhaka-01",
    vendor: "Huawei",
    model: "MA5800-X17",
    ip: "172.16.1.1",
    location: "Dhaka Main",
    totalOnu: 648,
    activeOnu: 622,
    offlineOnu: 26,
    ponPorts: 8,
    usedPorts: 8,
    status: "online",
    rxPower: -18.4,
    uptime: "41d 9h",
    lastSync: "1m ago",
  },
  {
    name: "OLT-Dhaka-02",
    vendor: "ZTE",
    model: "C320",
    ip: "172.16.1.2",
    location: "Uttara Zone",
    totalOnu: 284,
    activeOnu: 278,
    offlineOnu: 6,
    ponPorts: 6,
    usedPorts: 5,
    status: "online",
    rxPower: -19.2,
    uptime: "62d 3h",
    lastSync: "2m ago",
  },
  {
    name: "OLT-Ctg-01",
    vendor: "Huawei",
    model: "MA5608T",
    ip: "172.16.2.1",
    location: "Chittagong Agrabad",
    totalOnu: 312,
    activeOnu: 0,
    offlineOnu: 312,
    ponPorts: 4,
    usedPorts: 4,
    status: "offline",
    rxPower: null,
    uptime: "0m",
    lastSync: "18m ago",
  },
];

const incidents = [
  { id: "INC-0041", title: "OLT-Ctg-01 Offline", severity: "critical", zone: "Chittagong", affectedCustomers: 312, time: "18m ago", status: "open", assignee: "Network Team" },
  { id: "INC-0040", title: "High CPU on MikroTik-03", severity: "warning", zone: "Chittagong", affectedCustomers: 0, time: "1h ago", status: "investigating", assignee: "Rafiqul Islam" },
  { id: "INC-0039", title: "ONU Signal Degraded — PON-05", severity: "warning", zone: "Mirpur", affectedCustomers: 14, time: "3h ago", status: "resolved", assignee: "Tanvir Ahmed" },
  { id: "INC-0038", title: "Bandwidth Spike — Gulshan Zone", severity: "info", zone: "Gulshan", affectedCustomers: 0, time: "5h ago", status: "resolved", assignee: "System" },
];

const zones = [
  { name: "Mirpur", subzones: 14, customers: 3840, active: 3520, due: 230, mikrotik: "MikroTik-01, MikroTik-02", olt: "OLT-Dhaka-01" },
  { name: "Uttara", subzones: 9, customers: 2640, active: 2490, due: 110, mikrotik: "MikroTik-02", olt: "OLT-Dhaka-02" },
  { name: "Dhanmondi", subzones: 11, customers: 1980, active: 1820, due: 88, mikrotik: "MikroTik-01", olt: "OLT-Dhaka-01" },
  { name: "Gulshan", subzones: 5, customers: 1440, active: 1380, due: 42, mikrotik: "MikroTik-01", olt: "OLT-Dhaka-01" },
  { name: "Chittagong", subzones: 8, customers: 1840, active: 0, due: 280, mikrotik: "MikroTik-03", olt: "OLT-Ctg-01" },
  { name: "Sylhet", subzones: 6, customers: 1100, active: 1030, due: 97, mikrotik: "MikroTik-04", olt: "—" },
];

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = pct > 80 ? "#DC2626" : pct > 60 ? "#D97706" : color;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: pct > 80 ? "#DC2626" : pct > 60 ? "#D97706" : "var(--muted-foreground)", minWidth: 30, textAlign: "right" }}>
        {value}%
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    online: { bg: "#DCFCE7", color: "#16A34A", label: "Online" },
    offline: { bg: "#FEE2E2", color: "#DC2626", label: "Offline" },
    warning: { bg: "#FEF3C7", color: "#D97706", label: "Warning" },
    open: { bg: "#FEE2E2", color: "#DC2626", label: "Open" },
    investigating: { bg: "#FEF3C7", color: "#D97706", label: "Investigating" },
    resolved: { bg: "#DCFCE7", color: "#16A34A", label: "Resolved" },
    critical: { bg: "#FEE2E2", color: "#DC2626", label: "Critical" },
    info: { bg: "#DBEAFE", color: "#2563EB", label: "Info" },
  };
  const cfg = map[status] ?? map.online;
  return (
    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export function NetworkPage({ initialTab = "mikrotik" }: { initialTab?: NetTab }) {
  const [tab, setTab] = useState<NetTab>(initialTab);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ name:"", type:"MikroTik", ip:"", location:"", model:"", user:"admin", pass:"" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const syncMikrotik = useCallback((name: string) => {
    setSyncingId(name);
    setTimeout(() => { setSyncingId(null); showToast(`${name} synced successfully`); }, 1500);
  }, []);

  const addDevice = () => {
    if (!newDevice.name || !newDevice.ip) return;
    setShowAddDevice(false);
    setNewDevice({ name:"",type:"MikroTik",ip:"",location:"",model:"",user:"admin",pass:"" });
    showToast(`Device ${newDevice.name} added — pending connection`);
  };

  const inputStyle = { background:"var(--muted)", border:"1px solid var(--border)", fontSize:13, color:"var(--foreground)" } as const;

  const tabs: { id: NetTab; label: string; icon: React.ElementType }[] = [
    { id: "mikrotik", label: "MikroTik", icon: Server },
    { id: "olt", label: "OLT / ONT", icon: Radio },
    { id: "zones", label: "Zones", icon: Layers },
    { id: "incidents", label: "Incidents", icon: Zap },
    { id: "network-map", label: "Network Map", icon: Activity },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>
            Network Management
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            4 MikroTik servers · 3 OLT devices · 1 active incident
          </p>
        </div>
        <button onClick={() => setShowAddDevice(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ background: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
          <Plus size={14} /> Add Device
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)", width: "fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                background: tab === t.id ? "var(--primary)" : "transparent",
                color: tab === t.id ? "white" : "var(--muted-foreground)",
                fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* MikroTik */}
      {tab === "mikrotik" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {mikrotikServers.map((srv, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: `1px solid ${srv.status === "offline" ? "#FECACA" : srv.status === "warning" ? "#FDE68A" : "var(--border)"}` }}>
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: "var(--muted)" }}>
                    <Server size={18} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>{srv.name}</h3>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{srv.location} · {srv.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={srv.status} />
                  <button onClick={() => syncMikrotik(srv.name)} disabled={!!syncingId} className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <RefreshCw size={13} style={{ color: syncingId===srv.name?"var(--primary)":"var(--muted-foreground)", animation: syncingId===srv.name?"spin2 0.8s linear infinite":"none" }} />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="px-5 py-4 grid gap-3">
                <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {[
                    { label: "CPU", value: `${srv.cpu}%`, icon: Cpu },
                    { label: "RAM", value: `${srv.ram}%`, icon: MemoryStick },
                    { label: "Uptime", value: srv.uptime, icon: Clock },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: "var(--muted)" }}>
                        <Icon size={14} style={{ color: "var(--muted-foreground)", margin: "0 auto 4px" }} />
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{m.value}</p>
                        <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{m.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>CPU Usage</span>
                  </div>
                  <ProgressBar value={srv.cpu} max={100} color="#8B2020" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>RAM Usage</span>
                  </div>
                  <ProgressBar value={srv.ram} max={100} color="#2563EB" />
                </div>

                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{srv.sessions.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>PPP sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} style={{ color: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Synced {srv.lastSync}</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex" style={{ borderTop: "1px solid var(--border)" }}>
                {[
                  { label: "Sessions", icon: Activity, fn: () => showToast(`${srv.sessions.toLocaleString()} PPP sessions on ${srv.name}`) },
                  { label: "Sync", icon: RefreshCw, fn: () => syncMikrotik(srv.name) },
                  { label: "Terminal", icon: TerminalSquare, fn: () => showToast(`SSH terminal — requires direct access to ${srv.ip}`) },
                ].map((a, ai) => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label} onClick={a.fn}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors"
                      style={{ borderRight: ai < 2 ? "1px solid var(--border)" : "none", fontSize: 12, color: "var(--muted-foreground)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Icon size={12} />{a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OLT */}
      {tab === "olt" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {oltDevices.map((olt, i) => {
            const isOffline = olt.status === "offline";
            const onuPct = olt.totalOnu > 0 ? Math.round((olt.activeOnu / olt.totalOnu) * 100) : 0;
            return (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: `1px solid ${isOffline ? "#FECACA" : "var(--border)"}` }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <StatusPill status={olt.status} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      Synced {olt.lastSync}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: isOffline ? "#DC2626" : "var(--foreground)", marginBottom: 2 }}>
                    {olt.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    {olt.vendor} {olt.model} · {olt.location}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", marginTop: 3 }}>
                    {olt.ip}
                  </p>
                </div>

                <div className="px-5 py-4 grid gap-3">
                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="rounded-lg p-3" style={{ background: isOffline ? "#FEF2F2" : "#DCFCE7" }}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: isOffline ? "#DC2626" : "#16A34A" }}>
                        {olt.activeOnu}
                      </p>
                      <p style={{ fontSize: 11, color: isOffline ? "#DC2626" : "#16A34A", opacity: 0.8 }}>Online ONU</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: olt.offlineOnu > 0 ? "#FEF3C7" : "var(--muted)" }}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: olt.offlineOnu > 0 ? "#D97706" : "var(--muted-foreground)" }}>
                        {olt.offlineOnu}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Offline ONU</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>ONU Online Rate</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: onuPct > 90 ? "#16A34A" : "#D97706" }}>{onuPct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "var(--muted)" }}>
                      <div className="h-full rounded-full" style={{ width: `${onuPct}%`, background: onuPct > 90 ? "#16A34A" : onuPct > 50 ? "#D97706" : "#DC2626" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Signal size={13} style={{ color: "var(--muted-foreground)" }} />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        {olt.rxPower !== null ? `${olt.rxPower} dBm` : "No signal"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} style={{ color: "var(--muted-foreground)" }} />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        {olt.usedPorts}/{olt.ponPorts} PON
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex" style={{ borderTop: "1px solid var(--border)" }}>
                  {[{ label: "ONU List", icon: Eye, fn: () => showToast(`${olt.totalOnu} ONU devices on ${olt.name}`) },
                    { label: "Events", icon: Activity, fn: () => showToast(`Viewing event log for ${olt.name}`) }].map((a, ai) => {
                    const Icon = a.icon;
                    return (
                      <button key={a.label} onClick={a.fn} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors" style={{ borderRight: ai < 1 ? "1px solid var(--border)" : "none", fontSize: 12, color: "var(--muted-foreground)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Icon size={12} />{a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zones */}
      {tab === "zones" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Zone", "Sub-zones", "Customers", "Active", "Due", "MikroTik", "OLT", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => {
                const activePct = Math.round((z.active / z.customers) * 100);
                const hasIssue = z.active === 0;
                return (
                  <tr key={i} style={{ borderBottom: i < zones.length - 1 ? "1px solid var(--border)" : "none", background: hasIssue ? "#FEF2F2" : "transparent" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: hasIssue ? "#DC2626" : "var(--primary)" }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: hasIssue ? "#DC2626" : "var(--foreground)" }}>{z.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--foreground)" }}>{z.subzones}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{z.customers.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: hasIssue ? "#DC2626" : "#16A34A" }}>
                          {z.active.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>({activePct}%)</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: z.due > 0 ? 600 : 400, color: z.due > 100 ? "#DC2626" : "var(--muted-foreground)" }}>
                        {z.due}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontSize: 12, color: "var(--foreground)" }}>{z.mikrotik}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontSize: 12, color: hasIssue ? "#DC2626" : "var(--foreground)" }}>{z.olt}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                        View <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Incidents */}
      {tab === "incidents" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { label: "Open", value: 2, color: "#DC2626", bg: "#FEE2E2" },
              { label: "Investigating", value: 1, color: "#D97706", bg: "#FEF3C7" },
              { label: "Resolved Today", value: 2, color: "#16A34A", bg: "#DCFCE7" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{s.label} Incidents</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {incidents.map((inc, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 transition-colors" style={{ borderBottom: i < incidents.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex-shrink-0">
                  <StatusPill status={inc.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{inc.title}</p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    {inc.id} · {inc.zone} zone
                    {inc.affectedCustomers > 0 && ` · ${inc.affectedCustomers} customers affected`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{inc.assignee}</span>
                  <StatusPill status={inc.status} />
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{inc.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Map */}
      {tab === "network-map" && <NetworkMapView onToast={showToast} />}

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>Add Network Device</h3>
              <button onClick={() => setShowAddDevice(false)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>DEVICE TYPE</label>
                  <select value={newDevice.type} onChange={e => setNewDevice(p=>({...p,type:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                    <option>MikroTik</option><option>OLT Huawei</option><option>OLT ZTE</option><option>Switch</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>DEVICE NAME</label>
                  <input value={newDevice.name} onChange={e => setNewDevice(p=>({...p,name:e.target.value}))} placeholder="e.g. MikroTik-05" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                </div>
              </div>
              {([["IP Address","ip","e.g. 192.168.5.1"],["Location","location","e.g. Sylhet POP"],["Model","model","e.g. CCR2004-1G-12S"],["API Username","user","admin"],["API Password","pass",""]] as const).map(([label,key,ph]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>{label.toUpperCase()}</label>
                  <input type={key==="pass"?"password":"text"} value={(newDevice as any)[key]} onChange={e => setNewDevice(p=>({...p,[key]:e.target.value}))} placeholder={ph} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ ...inputStyle, fontFamily: key==="ip"||key==="pass"?"var(--font-mono)":undefined }} />
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowAddDevice(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
                <button onClick={addDevice} disabled={!newDevice.name||!newDevice.ip} className="flex-1 py-2.5 rounded-lg text-white" style={{ background: !newDevice.name||!newDevice.ip?"#ccc":"var(--primary)", fontSize: 13, fontWeight: 500 }}>
                  Add Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}
