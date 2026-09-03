import { useState, useMemo } from "react";
import {
  Radio, Activity, Search, Filter, Signal, AlertTriangle,
  CheckCircle2, XCircle, Clock, MapPin, Cpu, X, RefreshCw,
  ChevronDown, Circle, Download, AlertCircle, Wifi, WifiOff, Zap,
  Layers, Map as MapIcon, List, Eye, Server, HardDrive, Wrench,
  User, CheckCheck, Copy, Maximize2, Minimize2, ZoomIn, ZoomOut, LocateFixed,
  Cable, Compass, ShieldAlert, ArrowRight, ArrowUpRight, ChevronRight, Plus
} from "lucide-react";
import { useCustomerContext, Customer } from "../../context/CustomerContext";

interface ONUEventHistoryPageProps {
  onNavigate?: (page: string) => void;
}

type EventType = "online" | "offline" | "signal_change" | "reboot" | "auth_fail" | "los" | "lof";
type OnuHealth = "good" | "issue" | "warning";

interface OnuDevice {
  id: string;
  name: string;
  customer: string;
  customerId: string;
  phone: string;
  address: string;
  zone: string;
  olt: string;
  ponPort: string;
  splitterId: string;
  mac: string;
  serial: string;
  vendor: string;
  model: string;
  health: OnuHealth;
  rxPower: number; // dBm
  txPower: number;
  temperature: number;
  lastEvent: string;
  lastEventTime: string;
  mapX: number;
  mapY: number;
}

interface ONUEvent {
  id: string;
  onuId: string;
  onuName: string;
  olt: string;
  ponPort: string;
  mac: string;
  serial: string;
  customer: string;
  customerId: string;
  zone: string;
  eventType: EventType;
  timestamp: string;
  rxPower?: string;
  txPower?: string;
  description: string;
  duration?: string;
}

const EVENT_CONFIG: Record<EventType, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  online: { label: "Online", bg: "rgba(22,163,74,0.14)", text: "#16A34A", icon: Wifi },
  offline: { label: "Offline", bg: "rgba(220,38,38,0.14)", text: "#DC2626", icon: WifiOff },
  signal_change: { label: "Signal Changed", bg: "rgba(217,119,6,0.14)", text: "#D97706", icon: Signal },
  reboot: { label: "Rebooted", bg: "rgba(37,99,235,0.14)", text: "#2563EB", icon: RefreshCw },
  auth_fail: { label: "Auth Failed", bg: "rgba(220,38,38,0.14)", text: "#DC2626", icon: AlertCircle },
  los: { label: "LOS Alarm", bg: "rgba(220,38,38,0.14)", text: "#DC2626", icon: AlertTriangle },
  lof: { label: "LOF Alarm", bg: "rgba(217,119,6,0.14)", text: "#D97706", icon: AlertTriangle },
};

export function ONUEventHistoryPage({ onNavigate }: ONUEventHistoryPageProps) {
  const { customers, addCustomer } = useCustomerContext();

  const [viewMode, setViewMode] = useState<"map" | "timeline" | "split">("split");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState<"all" | "good" | "issue" | "warning">("all");
  const [selectedOnuId, setSelectedOnuId] = useState<string | null>(null);
  const [hoveredOnuId, setHoveredOnuId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New ONU registration form state
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newOnuSerial, setNewOnuSerial] = useState("");
  const [newOnuMac, setNewOnuMac] = useState("");
  const [newVendor, setNewVendor] = useState("Huawei");
  const [newModel, setNewModel] = useState("EG8145X6 Dual-Band Gigabit");
  const [newZone, setNewZone] = useState("Somitir Hat");
  const [newSplitter, setNewSplitter] = useState("TJ-SOMITIR-01");
  const [newOlt, setNewOlt] = useState("OLT-SomitirHat-01");
  const [newPonPort, setNewPonPort] = useState("PON 1/1/1");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Convert real customers into rich ONU devices
  const onuDevices: OnuDevice[] = useMemo(() => {
    return customers.map((c, i) => {
      const isOffline = c.status === "offline" || (c.status as string) === "disconnected";
      const isSuspended = c.status === "suspended";
      const isWeak = i % 37 === 0;

      let health: OnuHealth = "good";
      let rxPower = -18.2 - ((i % 8) * 0.45);
      let lastEvent = "Link Operational / Normal Light";
      let lastEventTime = "Connected now";

      if (isOffline) {
        health = "issue";
        rxPower = -40.0;
        lastEvent = "LOS Alarm (Fiber Drop Disconnected)";
        lastEventTime = "24 mins ago";
      } else if (isSuspended) {
        health = "issue";
        rxPower = -38.5;
        lastEvent = "Power Off / Service Suspended";
        lastEventTime = "1 hour ago";
      } else if (isWeak) {
        health = "warning";
        rxPower = -28.4;
        lastEvent = "Signal Degraded (-28.4 dBm)";
        lastEventTime = "12 mins ago";
      }

      return {
        id: `ONU-${c.clientCode || c.id}`,
        name: `${c.name} (${c.clientCode || c.id})`,
        customer: c.name,
        customerId: c.clientCode || c.id,
        phone: c.phone,
        address: c.address || `${c.subzone || c.zone}, Madaripur`,
        zone: c.zone || "Somitir Hat",
        olt: c.olt || "OLT-SomitirHat-01",
        ponPort: c.ponPort || `PON 1/1/${(i % 8) + 1}`,
        splitterId: c.splitterBox || (c.zone?.includes("Kalkini") ? "TJ-KALKINI-02" : "TJ-SOMITIR-01"),
        mac: c.mac || `44:D9:E7:${(i + 10).toString(16).padStart(2, '0').toUpperCase()}:12:05`,
        serial: c.deviceSerial || `MBN-ONU-${c.clientCode || c.id}`,
        vendor: c.deviceVendor || "Huawei",
        model: c.deviceType || "Huawei EG8145X6",
        health,
        rxPower: Number(rxPower.toFixed(1)),
        txPower: 2.3,
        temperature: 38 + (i % 10),
        lastEvent,
        lastEventTime,
        mapX: 200 + ((i * 35) % 600),
        mapY: 100 + ((i * 25) % 450),
      };
    });
  }, [customers]);

  // Generate live optical events log
  const events: ONUEvent[] = useMemo(() => {
    const list: ONUEvent[] = [];
    onuDevices.slice(0, 50).forEach((d, idx) => {
      if (d.health === "issue") {
        list.push({
          id: `EVT-${1000 + idx}`,
          onuId: d.id,
          onuName: d.name,
          olt: d.olt,
          ponPort: d.ponPort,
          mac: d.mac,
          serial: d.serial,
          customer: d.customer,
          customerId: d.customerId,
          zone: d.zone,
          eventType: "los",
          timestamp: "12 mins ago",
          rxPower: `${d.rxPower} dBm`,
          txPower: "+2.3 dBm",
          description: "Optical Loss of Signal (LOS) detected. Attenuation > 38 dB.",
          duration: "12m",
        });
      } else if (d.health === "warning") {
        list.push({
          id: `EVT-${2000 + idx}`,
          onuId: d.id,
          onuName: d.name,
          olt: d.olt,
          ponPort: d.ponPort,
          mac: d.mac,
          serial: d.serial,
          customer: d.customer,
          customerId: d.customerId,
          zone: d.zone,
          eventType: "signal_change",
          timestamp: "28 mins ago",
          rxPower: `${d.rxPower} dBm`,
          txPower: "+2.3 dBm",
          description: "Optical power degraded below -27 dBm threshold. Splice inspection required.",
        });
      } else {
        if (idx % 3 === 0) {
          list.push({
            id: `EVT-${3000 + idx}`,
            onuId: d.id,
            onuName: d.name,
            olt: d.olt,
            ponPort: d.ponPort,
            mac: d.mac,
            serial: d.serial,
            customer: d.customer,
            customerId: d.customerId,
            zone: d.zone,
            eventType: "online",
            timestamp: `${idx * 4 + 2}m ago`,
            rxPower: `${d.rxPower} dBm`,
            txPower: "+2.3 dBm",
            description: `GPON O5 State Reached. Link operational at ${d.rxPower} dBm on ${d.ponPort}.`,
          });
        }
      }
    });
    return list;
  }, [onuDevices]);

  const selectedDevice = useMemo(() => {
    return onuDevices.find(d => d.id === selectedOnuId) || null;
  }, [onuDevices, selectedOnuId]);

  const filteredDevices = useMemo(() => {
    return onuDevices.filter(d => {
      const matchHealth = healthFilter === "all" || d.health === healthFilter;
      const matchSearch =
        !search ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.customer.toLowerCase().includes(search.toLowerCase()) ||
        d.mac.includes(search) ||
        d.serial.toLowerCase().includes(search.toLowerCase()) ||
        d.zone.toLowerCase().includes(search.toLowerCase());
      return matchHealth && matchSearch;
    });
  }, [onuDevices, healthFilter, search]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch =
        !search ||
        e.onuId.toLowerCase().includes(search.toLowerCase()) ||
        e.customer.toLowerCase().includes(search.toLowerCase()) ||
        e.mac.includes(search) ||
        e.serial.includes(search);
      const matchEvent = eventFilter === "all" || e.eventType === eventFilter;
      const matchOnu = !selectedOnuId || e.onuId === selectedOnuId;
      return matchSearch && matchEvent && matchOnu;
    });
  }, [events, search, eventFilter, selectedOnuId]);

  const stats = useMemo(() => {
    const total = onuDevices.length;
    const good = onuDevices.filter(d => d.health === "good").length;
    const issues = onuDevices.filter(d => d.health === "issue").length;
    const warnings = onuDevices.filter(d => d.health === "warning").length;
    return { total, good, issues, warnings };
  }, [onuDevices]);

  const handleRegisterOnu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      showToast("Please enter customer name and phone.");
      return;
    }

    const newCustCode = `MBN${String(customers.length + 1).padStart(4, '0')}`;
    const generatedSerial = newOnuSerial || `MBN-ONU-${newCustCode}`;
    const generatedMac = newOnuMac || `44:D9:E7:${Math.floor(Math.random()*89+10)}:12:05`;

    await addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: `${newZone}, Madaripur`,
      zone: newZone,
      subzone: newZone,
      package: "20 Mbps Fiber Standard",
      price: 800,
      billingStatus: "Monthly",
      status: "active",
      netStatus: "online",
      deviceSerial: generatedSerial,
      deviceVendor: newVendor,
      deviceType: newModel,
      mac: generatedMac,
      olt: newOlt,
      ponPort: newPonPort,
      splitterBox: newSplitter,
    });

    setShowAddModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewOnuSerial("");
    setNewOnuMac("");
    showToast(`Successfully registered new ONU ${generatedSerial} for ${newCustName}!`);
  };

  // Shared Map Component
  const renderMapCanvas = (isCompact = false) => (
    <div className="w-full h-full relative rounded-3xl border border-border overflow-hidden bg-[#0E1626] shadow-lg flex">
      {/* Top Map Floating HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
        <div className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
          <Compass size={14} className="text-emerald-400" />
          <span>Dhaka Metro GPON GIS Map</span>
        </div>

        {selectedOnuId && (
          <button
            onClick={() => setSelectedOnuId(null)}
            className="px-3 py-1.5 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer">
            <X size={13} /> Clear Focus
          </button>
        )}
      </div>

      {/* Top Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.2, 2.0))}
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer">
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.7))}
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer">
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer">
          <LocateFixed size={16} />
        </button>
      </div>

      {/* Bottom Right Map Legend */}
      {!isCompact && (
        <div className="absolute bottom-4 right-4 z-20 rounded-2xl p-3 border border-white/10 bg-[#0A101D]/90 backdrop-blur-md hidden sm:block text-[11px] text-white/80 space-y-1.5">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 border-b border-white/10 pb-0.5">
            ONU Node Status
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>Good & Normal Light (-15 to -22 dBm)</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>Active Issue / LOS / Outage Alarm</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Warning / Optical Attenuation</span>
          </div>
        </div>
      )}

      {/* SVG Interactive Canvas */}
      <div
        className="w-full h-full flex-1 cursor-crosshair overflow-hidden flex items-center justify-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.25s ease-out",
          minHeight: isCompact ? 520 : 620
        }}>
        <svg viewBox="0 0 1000 650" className="w-full h-full select-none" style={{ minHeight: isCompact ? 520 : 620 }}>
          <defs>
            <pattern id="onuMapGridUnique" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="650" fill="url(#onuMapGridUnique)" />

          {/* Major Zone Boxes */}
          <g opacity="0.6">
            <rect x="50" y="220" width="220" height="400" rx="16" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" strokeDasharray="4,4" />
            <text x="65" y="245" fill="#3B82F6" fontSize="11" fontWeight="bold">MIRPUR REGION</text>

            <rect x="250" y="40" width="500" height="150" rx="16" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeDasharray="4,4" />
            <text x="265" y="65" fill="#8B5CF6" fontSize="11" fontWeight="bold">UTTARA SECTOR 4 & 7</text>

            <rect x="730" y="220" width="220" height="260" rx="16" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.2)" strokeDasharray="4,4" />
            <text x="745" y="245" fill="#06B6D4" fontSize="11" fontWeight="bold">GULSHAN & BANANI</text>

            <rect x="360" y="480" width="280" height="140" rx="16" fill="rgba(249,115,22,0.05)" stroke="rgba(249,115,22,0.2)" strokeDasharray="4,4" />
            <text x="375" y="505" fill="#F97316" fontSize="11" fontWeight="bold">DHANMONDI RESIDENTIAL</text>
          </g>

          {/* Central NOC Hub */}
          <g transform="translate(500, 325)">
            <circle cx="0" cy="0" r="38" fill="none" stroke="rgba(225, 29, 72, 0.3)" strokeWidth="1.5">
              <animate attributeName="r" values="30;46;30" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="24" fill="#1E293B" stroke="var(--primary)" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">NOC</text>
          </g>

          {/* Fiber Trunks from NOC */}
          <g stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6">
            <line x1="500" y1="325" x2="160" y2="420" />
            <line x1="500" y1="325" x2="340" y2="105" />
            <line x1="500" y1="325" x2="680" y2="110" />
            <line x1="500" y1="325" x2="830" y2="270" />
            <line x1="500" y1="325" x2="470" y2="560" />
          </g>

          {/* ONU Device Pins */}
          {filteredDevices.map(d => {
            const isSelected = selectedOnuId === d.id;
            const isHovered = hoveredOnuId === d.id;
            const isIssue = d.health === "issue";
            const isWarning = d.health === "warning";
            const pinColor = isIssue ? "#DC2626" : isWarning ? "#F59E0B" : "#10B981";

            return (
              <g
                key={d.id}
                transform={`translate(${d.mapX}, ${d.mapY})`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedOnuId(isSelected ? null : d.id)}
                onMouseEnter={() => setHoveredOnuId(d.id)}
                onMouseLeave={() => setHoveredOnuId(null)}>
                
                {/* Pulse Ring for Issues */}
                {isIssue && (
                  <circle cx="0" cy="0" r="26" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="10;28;10" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Selected Halo */}
                {(isSelected || isHovered) && (
                  <circle cx="0" cy="0" r="20" fill="none" stroke={pinColor} strokeWidth="2.5" opacity="0.9" />
                )}

                {/* Core Node Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 11 : isIssue ? 9 : 8}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2.5 : 1.8}
                />

                {/* Exclamation for issues */}
                {isIssue && (
                  <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">!</text>
                )}

                {/* ONU ID Tag */}
                <text
                  x="0"
                  y="18"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="700"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                  {d.id}
                </text>

                {/* Hover Tooltip */}
                {isHovered && !isSelected && (
                  <g transform="translate(-75, -52)">
                    <rect x="0" y="0" width="150" height="44" rx="8" fill="rgba(10, 15, 25, 0.98)" stroke={pinColor} strokeWidth="1.2" />
                    <text x="10" y="14" fill="#FFFFFF" fontSize="10.5" fontWeight="bold">{d.customer}</text>
                    <text x="10" y="27" fill={pinColor} fontSize="9.5" fontWeight="semibold">
                      {d.health.toUpperCase()} · Rx: {d.rxPower} dBm
                    </text>
                    <text x="10" y="38" fill="rgba(255,255,255,0.6)" fontSize="8.5">{d.zone} · {d.model}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slide-out Selected ONU Diagnostics Inspector */}
      {selectedDevice && (
        <div className="absolute right-4 top-4 bottom-4 w-[340px] max-w-[calc(100%-32px)] z-30 flex flex-col rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-slideInRight">
          <div className="p-4 border-b border-border flex items-center justify-between"
            style={{ background: selectedDevice.health === "issue" ? "rgba(220,38,38,0.15)" : selectedDevice.health === "warning" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)" }}>
            <div className="flex items-center gap-2">
              <Radio size={16} className={selectedDevice.health === "issue" ? "text-rose-600" : selectedDevice.health === "warning" ? "text-amber-600" : "text-emerald-600"} />
              <div>
                <div className="text-xs font-black text-foreground">{selectedDevice.id} Telemetry</div>
                <div className="text-[10px] text-muted-foreground">{selectedDevice.model} ({selectedDevice.vendor})</div>
              </div>
            </div>
            <button onClick={() => setSelectedOnuId(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
            {/* Customer Info */}
            <div>
              <div className="font-bold text-foreground text-sm">{selectedDevice.customer}</div>
              <div className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {selectedDevice.address}
              </div>
            </div>

            {/* Optical RX Power */}
            <div className="p-3 rounded-2xl border border-border bg-muted/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground">Optical RX Level</div>
                <div className="text-[10px] text-muted-foreground">{selectedDevice.health === "good" ? "Normal Signal" : "Attenuation / Loss"}</div>
              </div>
              <div className="font-mono font-black text-sm" style={{ color: selectedDevice.rxPower > -24 ? "#10B981" : "#DC2626" }}>
                {selectedDevice.rxPower} dBm
              </div>
            </div>

            {/* Hardware details */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OLT / Port:</span>
                <span className="text-foreground font-semibold">{selectedDevice.olt} · {selectedDevice.ponPort}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Serial:</span>
                <span className="text-foreground font-semibold">{selectedDevice.serial}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">MAC:</span>
                <span className="text-foreground font-semibold">{selectedDevice.mac}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Splitter:</span>
                <span className="text-foreground font-semibold">{selectedDevice.splitterId}</span>
              </div>
            </div>

            {/* Recent Event Message */}
            <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px]">
              <div className="text-[10px] font-bold text-muted-foreground mb-0.5">LATEST REGISTERED EVENT:</div>
              <div className="font-semibold text-foreground">{selectedDevice.lastEvent}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{selectedDevice.lastEventTime}</div>
            </div>

            {/* Quick Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => showToast(`Sent TR-069 optical diagnostic query to ${selectedDevice.id}`)}
                className="w-full py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                <Zap size={13} className="text-amber-500" /> Run Line Test
              </button>
              <button
                onClick={() => onNavigate?.("customers")}
                className="w-full py-2 rounded-xl text-white bg-primary hover:opacity-95 font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                <User size={13} /> View Customer Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Shared Event Feed Component
  const renderEventList = (isCompact = false) => (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      {/* Search & Event Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-40 px-3 py-2 rounded-2xl border border-border bg-card">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent text-xs text-foreground"
            placeholder="Search events, ONU, customer..."
          />
        </div>

        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="px-3 py-2 rounded-2xl border border-border bg-card text-xs text-foreground outline-none font-medium cursor-pointer">
          <option value="all">All Events</option>
          {Object.entries(EVENT_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Event Cards Scrollable Feed */}
      <div className={`overflow-y-auto space-y-2.5 pr-1 ${isCompact ? "max-h-[580px]" : "flex-1"}`}>
        {filteredEvents.map(event => {
          const ec = EVENT_CONFIG[event.eventType];
          const Icon = ec.icon;
          const isSelected = selectedOnuId === event.onuId;

          return (
            <div
              key={event.id}
              onClick={() => setSelectedOnuId(event.onuId)}
              className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20"
                  : "bg-card border-border hover:border-muted-foreground/40"
              }`}>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, background: ec.bg }}>
                  <Icon size={16} style={{ color: ec.text }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-foreground">{event.onuId}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: ec.bg, color: ec.text }}>
                          {ec.label}
                        </span>
                        {event.duration && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground font-medium">
                            <Clock size={9} /> {event.duration}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{event.timestamp}</div>
                    </div>

                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                      {event.customerId}
                      <ChevronRight size={12} />
                    </span>
                  </div>

                  <p className="text-[11px] text-foreground mt-1.5 leading-relaxed">{event.description}</p>

                  <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
                    <div>
                      <strong className="text-foreground">OLT:</strong> {event.olt} · {event.ponPort}
                    </div>
                    {event.rxPower && event.rxPower !== "—" && event.rxPower !== "N/A" && (
                      <div>
                        <strong className="text-foreground">RX:</strong>{" "}
                        <span className="font-bold" style={{ color: Number(event.rxPower) < -24 ? "#DC2626" : "#10B981" }}>{event.rxPower}</span>
                      </div>
                    )}
                    <div>
                      <strong className="text-foreground">Customer:</strong> {event.customer} ({event.zone})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 rounded-3xl border border-border bg-card text-xs text-muted-foreground">
            No events found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-64px)]">
      
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Radio size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                ONU / ONT Event History & Optical GIS Map
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {stats.issues} Active Faults Detected
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live spatial topology map of customer ONUs with optical health indicators (Good vs Issues) and event logs.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-2xl border border-border p-1 bg-muted/30">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "map" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              <MapIcon size={14} />
              <span>Full Spatial Map</span>
            </button>

            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "split" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Layers size={14} />
              <span>Split (Map + Events)</span>
            </button>

            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "timeline" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              <List size={14} />
              <span>Full Event Logs</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition-all">
            <Plus size={14} />
            <span>Register New ONU</span>
          </button>

          <button
            onClick={() => showToast("Exporting optical event log as CSV/PDF...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
            <Download size={14} />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* ── Status KPI Counters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setHealthFilter("all")}
          className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-all cursor-pointer text-left ${
            healthFilter === "all" ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm" : "bg-card border-border hover:border-muted-foreground/40"
          }`}>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Radio size={18} />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{stats.total}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Total Monitored ONUs</div>
          </div>
        </button>

        <button
          onClick={() => setHealthFilter("good")}
          className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-all cursor-pointer text-left ${
            healthFilter === "good" ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm" : "bg-card border-border hover:border-emerald-500/40"
          }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.good}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Good & Healthy Light</div>
          </div>
        </button>

        <button
          onClick={() => setHealthFilter("issue")}
          className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-all cursor-pointer text-left ${
            healthFilter === "issue" ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20 shadow-sm" : "bg-card border-border hover:border-rose-500/40"
          }`}>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.issues}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">LOS / Outage Issues</div>
          </div>
        </button>

        <button
          onClick={() => setHealthFilter("warning")}
          className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-all cursor-pointer text-left ${
            healthFilter === "warning" ? "bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-sm" : "bg-card border-border hover:border-amber-500/40"
          }`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Signal size={18} />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.warnings}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Signal Drop Warnings</div>
          </div>
        </button>
      </div>

      {/* ── Dynamic Layout based on Selected View Mode ──────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* MODE 1: FULL SPATIAL MAP (100% Canvas, Slide-out Drawer on click) */}
        {viewMode === "map" && (
          <div className="flex-1 min-h-[620px] h-[calc(100vh-210px)]">
            {renderMapCanvas(false)}
          </div>
        )}

        {/* MODE 2: SPLIT OVERVIEW (Side-by-Side: 58% Map + 42% Live Event Stream) */}
        {viewMode === "split" && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[580px]">
            {/* Left 58%: Interactive Map */}
            <div className="w-full lg:w-[58%] min-h-[480px] lg:min-h-0 flex-1">
              {renderMapCanvas(true)}
            </div>

            {/* Right 42%: Interactive Live Event Logs */}
            <div className="w-full lg:w-[42%] flex flex-col rounded-3xl border border-border bg-card p-4 shadow-sm flex-shrink-0">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  <h3 className="font-extrabold text-sm text-foreground">Live ONU Event Stream</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {filteredEvents.length} events
                </span>
              </div>
              {renderEventList(true)}
            </div>
          </div>
        )}

        {/* MODE 3: FULL EVENT LOGS TABLE */}
        {viewMode === "timeline" && (
          <div className="flex-1 bg-card rounded-3xl border border-border p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground">Complete Optical Audit Trail</h3>
                <p className="text-xs text-muted-foreground">Chronological record of all online/offline transitions, signal degradation, and alarms.</p>
              </div>
            </div>
            {renderEventList(false)}
          </div>
        )}

      </div>

      {/* ── Register New ONU / ONT Modal ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Radio size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Register New ONU / ONT Modem</h3>
                  <p className="text-[11px] text-muted-foreground">Assign device serial, MAC, OLT port, and optical splitter box</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterOnu} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sazzad Hossain"
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="01711-XXXXXX"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">ONU Serial Number</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newOnuSerial}
                    onChange={e => setNewOnuSerial(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">MAC Address</label>
                  <input
                    type="text"
                    placeholder="44:D9:E7:XX:XX:XX"
                    value={newOnuMac}
                    onChange={e => setNewOnuMac(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Device Vendor</label>
                  <select
                    value={newVendor}
                    onChange={e => setNewVendor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary">
                    <option value="Huawei">Huawei</option>
                    <option value="ZTE">ZTE</option>
                    <option value="BDCOM">BDCOM</option>
                    <option value="VSOL">VSOL</option>
                    <option value="TP-Link">TP-Link</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Zone Area</label>
                  <select
                    value={newZone}
                    onChange={e => setNewZone(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary">
                    <option value="Somitir Hat">Somitir Hat</option>
                    <option value="Kalkini">Kalkini</option>
                    <option value="Madaripur Sadar">Madaripur Sadar</option>
                    <option value="Shibchar">Shibchar</option>
                    <option value="Rajoir">Rajoir</option>
                    <option value="Dashar">Dashar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">OLT Gateway</label>
                  <select
                    value={newOlt}
                    onChange={e => setNewOlt(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary">
                    <option value="OLT-SomitirHat-01">OLT-SomitirHat-01</option>
                    <option value="OLT-Kalkini-01">OLT-Kalkini-01</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Splitter Box</label>
                  <select
                    value={newSplitter}
                    onChange={e => setNewSplitter(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl bg-muted/50 border border-border outline-none focus:border-primary">
                    <option value="TJ-SOMITIR-01">TJ-SOMITIR-01</option>
                    <option value="TJ-KALKINI-02">TJ-KALKINI-02</option>
                    <option value="TJ-SADAR-03">TJ-SADAR-03</option>
                    <option value="TJ-SHIBCHAR-04">TJ-SHIBCHAR-04</option>
                    <option value="TJ-RAJOIR-05">TJ-RAJOIR-05</option>
                    <option value="TJ-DASHAR-06">TJ-DASHAR-06</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-xl bg-primary hover:opacity-95 text-white font-bold shadow-md">
                  Register ONU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-medium animate-slideUp">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
