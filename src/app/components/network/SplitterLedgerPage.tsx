import { useState, useEffect, useMemo } from "react";
import {
  Share2, Network, Radio, Layers, Plus, Search, CheckCircle2,
  AlertTriangle, XCircle, Zap, Eye, Trash2, X, Check, ArrowRight,
  Activity, Shield, ShieldCheck, Wrench, RefreshCw, Cpu, Gauge,
  Sliders, Smartphone, MapPin, Cable, ArrowUpRight, HelpCircle
} from "lucide-react";
import {
  splitterStore, type SplitterBox, type SplitterPort,
  type BackboneFiberCable, type PonStandard
} from "../../data/splitterData";
import { useCustomerContext, Customer } from "../../context/CustomerContext";

interface SplitterLedgerPageProps {
  onNavigate?: (page: string) => void;
}

export function SplitterLedgerPage({ onNavigate }: SplitterLedgerPageProps) {
  const { customers } = useCustomerContext();
  const [splitters, setSplitters] = useState<SplitterBox[]>(splitterStore.getSplitters());
  const [cables, setCables] = useState<BackboneFiberCable[]>(splitterStore.getCables());
  const [activeTab, setActiveTab] = useState<"splitters" | "pon_capacity" | "cores" | "loss_guide">("splitters");
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [ratioFilter, setRatioFilter] = useState("all");
  const [toast, setToast] = useState("");

  // Modal states
  const [showAddSplitter, setShowAddSplitter] = useState(false);
  const [selectedSplitter, setSelectedSplitter] = useState<SplitterBox | null>(null);
  
  // Assign subscriber to port modal state
  const [assignModal, setAssignModal] = useState<{
    splitterId: string;
    splitterName: string;
    portNumber: number;
  } | null>(null);

  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [selectedCustForPort, setSelectedCustForPort] = useState<Customer | null>(null);
  const [dropDistance, setDropDistance] = useState("45");
  const [testRxPower, setTestRxPower] = useState("-20.5");

  // New Splitter Box Form state
  const [newBox, setNewBox] = useState({
    name: "",
    location: "",
    zone: "",
    oltName: "",
    ponPort: "",
    ponStandard: "GPON" as PonStandard,
    splitRatio: "1:8" as SplitterBox["splitRatio"],
    feederCableName: "",
    feederCoreNumber: 1,
    feederCoreColor: "Blue",
    inputPowerDbm: 3.0,
    notes: "",
  });

  useEffect(() => {
    return splitterStore.subscribe(() => {
      setSplitters(splitterStore.getSplitters());
      setCables(splitterStore.getCables());
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Aggregate Calculations
  const stats = useMemo(() => {
    const totalSplitters = splitters.length;
    let totalPorts = 0;
    let connectedPorts = 0;
    let freePorts = 0;
    let stableSignal = 0;
    let warningSignal = 0;
    let criticalSignal = 0;

    splitters.forEach(box => {
      totalPorts += box.totalPorts;
      box.ports.forEach(p => {
        if (p.status === "connected") {
          connectedPorts++;
          if (p.signalStatus === "stable") stableSignal++;
          else if (p.signalStatus === "warning" || p.signalStatus === "high") warningSignal++;
          else if (p.signalStatus === "critical") criticalSignal++;
        } else if (p.status === "free") {
          freePorts++;
        }
      });
    });

    const utilizationRate = totalPorts > 0 ? Math.round((connectedPorts / totalPorts) * 100) : 0;

    return {
      totalSplitters,
      totalPorts,
      connectedPorts,
      freePorts,
      utilizationRate,
      stableSignal,
      warningSignal,
      criticalSignal,
    };
  }, [splitters]);

  // Unique zones
  const zonesList = useMemo(() => {
    return Array.from(new Set(splitters.map(s => s.zone)));
  }, [splitters]);

  // Filtered Splitters
  const filteredSplitters = useMemo(() => {
    return splitters.filter(box => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        box.name.toLowerCase().includes(q) ||
        box.location.toLowerCase().includes(q) ||
        box.ponPort.toLowerCase().includes(q) ||
        box.zone.toLowerCase().includes(q) ||
        box.ports.some(p => p.customerId?.toLowerCase().includes(q) || p.customerName?.toLowerCase().includes(q));

      const matchZone = zoneFilter === "all" || box.zone === zoneFilter;
      const matchRatio = ratioFilter === "all" || box.splitRatio === ratioFilter;
      return matchSearch && matchZone && matchRatio;
    });
  }, [splitters, search, zoneFilter, ratioFilter]);

  // Grouped by PON Port for PON Capacity Tab
  const ponGroups = useMemo(() => {
    const map = new Map<string, {
      ponKey: string;
      oltName: string;
      ponPort: string;
      ponStandard: PonStandard;
      maxCapacity: number;
      splitters: SplitterBox[];
      totalConnected: number;
    }>();

    splitters.forEach(box => {
      const key = `${box.oltName} - ${box.ponPort}`;
      if (!map.has(key)) {
        map.set(key, {
          ponKey: key,
          oltName: box.oltName,
          ponPort: box.ponPort,
          ponStandard: box.ponStandard,
          maxCapacity: box.ponCapacityLimit || (box.ponStandard === "EPON" ? 64 : 128),
          splitters: [],
          totalConnected: 0,
        });
      }
      const group = map.get(key)!;
      group.splitters.push(box);
      group.totalConnected += box.ports.filter(p => p.status === "connected").length;
    });

    return Array.from(map.values());
  }, [splitters]);

  // Matching customers for port assignment
  const matchingCustomers = useMemo(() => {
    if (!custSearchQuery.trim()) return customers.slice(0, 8);
    const q = custSearchQuery.toLowerCase();
    return customers.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.pppUser.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [customers, custSearchQuery]);

  // Handle Assigning Customer to Port
  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal || !selectedCustForPort) return;

    splitterStore.assignSubscriberToPort(
      assignModal.splitterId,
      assignModal.portNumber,
      {
        id: selectedCustForPort.clientCode || selectedCustForPort.id,
        name: selectedCustForPort.name,
        phone: selectedCustForPort.phone,
        dropMeters: Number(dropDistance) || 50,
        rxPowerDbm: Number(testRxPower) || -20.5,
      }
    );

    showToast(`✓ Subscriber ${selectedCustForPort.name} connected to Port ${assignModal.portNumber} on ${assignModal.splitterName}!`);
    setAssignModal(null);
    setSelectedCustForPort(null);
    setCustSearchQuery("");
  };

  // Handle Releasing / Freeing Port
  const handleReleasePort = (splitterId: string, portNumber: number, custName?: string) => {
    if (confirm(`Are you sure you want to disconnect & free Port #${portNumber} (${custName || "Active line"})?`)) {
      splitterStore.releasePort(splitterId, portNumber);
      showToast(`Port #${portNumber} released & marked as Free space!`);
    }
  };

  // Handle Creating New Splitter Box
  const handleCreateSplitter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBox.name || !newBox.location) return;

    const totalPortsMap: Record<string, number> = {
      "1:2": 2, "1:4": 4, "1:8": 8, "1:16": 16, "1:32": 32, "1:64": 64
    };
    const totalP = totalPortsMap[newBox.splitRatio] || 8;
    const lossDbMap: Record<string, number> = {
      "1:2": 3.5, "1:4": 7.2, "1:8": 10.5, "1:16": 13.8, "1:32": 17.2, "1:64": 20.5
    };
    const loss = lossDbMap[newBox.splitRatio] || 10.5;
    const estOut = Number((newBox.inputPowerDbm - loss - 12.0).toFixed(1));

    const newSplitter: SplitterBox = {
      id: `SPL-${Date.now().toString().slice(-6)}`,
      name: newBox.name,
      location: newBox.location,
      zone: newBox.zone,
      oltId: "OLT-01",
      oltName: newBox.oltName,
      ponPort: newBox.ponPort,
      ponStandard: newBox.ponStandard,
      ponCapacityLimit: newBox.ponStandard === "EPON" ? 64 : 128,
      splitRatio: newBox.splitRatio,
      totalPorts: totalP,
      feederCableName: newBox.feederCableName,
      feederCoreNumber: Number(newBox.feederCoreNumber),
      feederCoreColor: newBox.feederCoreColor,
      inputPowerDbm: Number(newBox.inputPowerDbm),
      insertionLossDb: loss,
      outputEstimatedPowerDbm: estOut,
      ports: Array.from({ length: totalP }).map((_, i) => ({
        portNumber: i + 1,
        status: "free" as const,
      })),
      notes: newBox.notes,
    };

    splitterStore.addSplitter(newSplitter);
    setShowAddSplitter(false);
    showToast(`✓ New Splitter Box "${newSplitter.name}" (${newSplitter.splitRatio} - ${totalP} Ports) added!`);
    setNewBox({
      name: "", location: "", zone: "", oltName: "",
      ponPort: "", ponStandard: "GPON", splitRatio: "1:8", feederCableName: "",
      feederCoreNumber: 1, feederCoreColor: "Blue", inputPowerDbm: 3.0, notes: "",
    });
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 animate-fadeIn">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Share2 size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Optical Splitter & PON Capacity Ledger
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              FTTH ODN Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fiber split ratio ledger (1:8, 1:16), port line space calculation, EPON 64 & GPON 128 port limits, and optical dBm power health
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddSplitter(true)}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> Add Splitter Box
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Splitter Boxes */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">SPLITTER BOXES (TJ)</span>
            <Share2 size={16} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">{stats.totalSplitters}</span>
            <span className="text-xs text-muted-foreground">Units in field</span>
          </div>
          <p className="text-[10px] text-muted-foreground">1:2 to 1:16 PLC splitters</p>
        </div>

        {/* 2. Connected Lines vs Free Space */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">PORT LINE SPACE</span>
            <Network size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{stats.freePorts}</span>
            <span className="text-xs text-muted-foreground">Free Lines / {stats.totalPorts} Total</span>
          </div>
          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${stats.utilizationRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>{stats.connectedPorts} Connected</span>
            <span>{stats.utilizationRate}% Used</span>
          </div>
        </div>

        {/* 3. Optical Power Status */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">OPTICAL RX HEALTH</span>
            <Gauge size={16} className="text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{stats.stableSignal}</span>
            <span className="text-xs text-muted-foreground font-bold">Stable (-18~-24 dBm)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-amber-500 font-bold">{stats.warningSignal} Warning</span>
            <span>·</span>
            <span className="text-rose-500 font-bold">{stats.criticalSignal} Red LOS</span>
          </div>
        </div>

        {/* 4. PON Standard Limits */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">PON SPLIT LIMITS</span>
            <Radio size={16} className="text-purple-500" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">GPON Standard</span>
              <span className="font-mono font-black text-primary">Max 128 / port</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">EPON Standard</span>
              <span className="font-mono font-black text-purple-500">Max 64 / port</span>
            </div>
          </div>
        </div>

        {/* 5. Backbone Cores */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">BACKBONE CABLES</span>
            <Cable size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">{cables.length}</span>
            <span className="text-xs text-muted-foreground">Main Trunk Runs</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">24-Core & 12-Core ODF Spans</p>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: "splitters", label: "Splitter Boxes & Port Space", icon: Share2, count: splitters.length },
            { id: "pon_capacity", label: "PON Port Capacity (EPON 64 / GPON 128)", icon: Radio, count: ponGroups.length },
            { id: "cores", label: "Fiber Backbone Core Ledger", icon: Cable, count: cables.length },
            { id: "loss_guide", label: "Optical Signal & Loss Standards", icon: Gauge },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: SPLITTER BOXES & PORT SPACE LEDGER
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "splitters" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative max-w-sm w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search splitter, pole location, subscriber, or PON..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zone Filter */}
              <select
                value={zoneFilter}
                onChange={e => setZoneFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none shadow-xs"
              >
                <option value="all">All Operational Zones</option>
                {zonesList.map(z => <option key={z} value={z}>{z}</option>)}
              </select>

              {/* Split Ratio Filter */}
              <select
                value={ratioFilter}
                onChange={e => setRatioFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none shadow-xs"
              >
                <option value="all">All Split Ratios</option>
                <option value="1:4">1:4 Splitters</option>
                <option value="1:8">1:8 Splitters (Standard)</option>
                <option value="1:16">1:16 Splitters (High Density)</option>
              </select>
            </div>
          </div>

          {/* Splitter Boxes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSplitters.map(box => {
              const connectedCount = box.ports.filter(p => p.status === "connected").length;
              const freeCount = box.ports.filter(p => p.status === "free").length;
              const usagePct = Math.round((connectedCount / box.totalPorts) * 100);

              return (
                <div
                  key={box.id}
                  className="rounded-3xl bg-card border border-border shadow-md overflow-hidden flex flex-col justify-between"
                >
                  {/* Splitter Header */}
                  <div className="p-4 bg-muted/20 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-primary/10 text-primary border border-primary/20">
                          {box.splitRatio} PLC
                        </span>
                        <h3 className="font-extrabold text-sm text-foreground">{box.name}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-muted text-foreground border border-border">
                        {box.ponStandard} ({box.ponPort})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-primary flex-shrink-0" />
                        {box.location}
                      </span>
                      <span className="font-mono text-[11px] text-foreground">
                        Feeder: <strong className="text-primary">{box.feederCoreColor}</strong> (Core #{box.feederCoreNumber})
                      </span>
                    </div>

                    {/* Capacity and Free Space Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                          <span>{connectedCount} Connected</span>
                          <span className="text-muted-foreground font-normal">/ {box.totalPorts} Total</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                          freeCount > 0
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        }`}>
                          {freeCount > 0 ? `${freeCount} Free Ports` : "FULL (0 Free)"}
                        </span>
                      </div>
                      <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePct >= 100 ? "bg-rose-500" : usagePct >= 75 ? "bg-amber-500" : "bg-primary"
                          }`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optical Signal & Feeder Stats */}
                  <div className="px-4 py-2.5 bg-muted/10 border-b border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Input: <strong>+{box.inputPowerDbm} dBm</strong></span>
                    <span>Loss: <strong>-{box.insertionLossDb} dB</strong></span>
                    <span>Est. Output: <strong className="text-emerald-600">{box.outputEstimatedPowerDbm} dBm</strong></span>
                  </div>

                  {/* Interactive Port Matrix */}
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      OUTPUT PORTS STATUS ({box.totalPorts} Ports)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {box.ports.map(port => {
                        const isConnected = port.status === "connected";
                        return (
                          <div
                            key={port.portNumber}
                            className={`p-2.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                              isConnected
                                ? "bg-muted/30 border-border"
                                : "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isConnected) {
                                setAssignModal({
                                  splitterId: box.id,
                                  splitterName: box.name,
                                  portNumber: port.portNumber,
                                });
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-black text-[10px] text-muted-foreground">
                                Port #{port.portNumber}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${
                                isConnected ? "bg-primary animate-pulse" : "bg-emerald-500"
                              }`} />
                            </div>

                            {isConnected ? (
                              <div className="space-y-1">
                                <p className="font-bold text-foreground truncate text-[11px]" title={port.customerName}>
                                  {port.customerName}
                                </p>
                                <p className="font-mono text-[10px] text-primary font-bold truncate">
                                  {port.customerId}
                                </p>
                                <div className="flex items-center justify-between text-[10px] pt-1">
                                  <span className={`font-mono font-bold ${
                                    port.signalStatus === "stable" ? "text-emerald-600" : "text-amber-500"
                                  }`}>
                                    {port.rxPowerDbm} dBm
                                  </span>
                                  <button
                                    title="Disconnect & Free Line"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReleasePort(box.id, port.portNumber, port.customerName);
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-2 text-center text-emerald-600 space-y-0.5">
                                <Plus size={14} className="mx-auto" />
                                <span className="text-[10px] font-extrabold uppercase block">Free Port</span>
                                <span className="text-[9px] text-muted-foreground block">Click to Connect</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSplitters.length === 0 && (
            <div className="p-12 text-center bg-card border border-border rounded-3xl text-muted-foreground space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Share2 size={24} />
              </div>
              <div>
                <p className="font-extrabold text-base text-foreground">No Splitter Boxes Added Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start tracking your optical distribution network by adding your first TJ / FAT splitter box.</p>
              </div>
              <button
                onClick={() => setShowAddSplitter(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add First Splitter Box
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: PON PORT CAPACITY (EPON 64 / GPON 128)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "pon_capacity" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-primary flex-shrink-0" />
              <span>
                <strong>PON Split Ratio Engineering Standard:</strong> Each <strong>GPON</strong> PON port supports a max of <strong>128 ONUs</strong> (1:128 capacity), and <strong>EPON</strong> supports a max of <strong>64 ONUs</strong> (1:64 capacity).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ponGroups.map(group => {
              const freeSlots = Math.max(0, group.maxCapacity - group.totalConnected);
              const loadPct = Math.round((group.totalConnected / group.maxCapacity) * 100);

              return (
                <div key={group.ponKey} className="p-5 rounded-3xl bg-card border border-border shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black font-mono ${
                          group.ponStandard === "GPON"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                        }`}>
                          {group.ponStandard} ({group.maxCapacity} Max)
                        </span>
                        <h3 className="font-extrabold text-sm text-foreground">{group.ponPort}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{group.oltName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-primary">{group.totalConnected}</span>
                      <span className="text-xs text-muted-foreground"> / {group.maxCapacity} ONUs</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">PON Port Utilization</span>
                      <span className="font-mono text-emerald-600">{freeSlots} ONUs Space Remaining</span>
                    </div>
                    <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPct > 80 ? "bg-rose-500" : loadPct > 50 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${loadPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Connected Splitters List under this PON */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      Connected Splitter Boxes ({group.splitters.length})
                    </p>
                    <div className="space-y-1.5">
                      {group.splitters.map(spl => {
                        const splConnected = spl.ports.filter(p => p.status === "connected").length;
                        return (
                          <div key={spl.id} className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-foreground block">{spl.name}</span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {spl.splitRatio} Ratio · Feeder: {spl.feederCoreColor}
                              </span>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-bold text-foreground">{splConnected} / {spl.totalPorts} Ports</span>
                              <span className="block text-[10px] text-emerald-600 font-bold">
                                {spl.totalPorts - splConnected} Free Lines
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: FIBER BACKBONE CORE LEDGER (12 / 24 / 48 Cores)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "cores" && (
        <div className="space-y-6">
          {cables.map(cable => (
            <div key={cable.id} className="p-5 rounded-3xl bg-card border border-border shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Cable size={18} className="text-amber-500" />
                    <h3 className="font-extrabold text-base text-foreground">{cable.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-primary/10 text-primary border border-primary/20">
                      {cable.totalCores} Core Fiber
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Route: <strong>{cable.origin}</strong> ➔ <strong>{cable.destination}</strong> ({cable.distanceKm} km span)
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <span className="text-emerald-600 font-bold">
                    {cable.cores.filter(c => c.status === "live_pon").length} Live PON Feeder Cores
                  </span>
                  <span className="block text-muted-foreground">
                    {cable.cores.filter(c => c.status === "dark_spare").length} Dark Cores (Spare)
                  </span>
                </div>
              </div>

              {/* Core Grid with standard fiber color codes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {cable.cores.map(core => (
                  <div
                    key={core.coreNumber}
                    className="p-3 rounded-2xl border border-border bg-muted/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: core.colorHex }}
                        />
                        <span className="font-mono font-black text-foreground">Core #{core.coreNumber}</span>
                      </div>
                      <span className={`px-2 py-0.2 rounded-md text-[10px] font-black uppercase font-mono ${
                        core.status === "live_pon"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : core.status === "dedicated_corporate"
                          ? "bg-purple-500/10 text-purple-600"
                          : core.status === "damaged"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {core.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-mono truncate" title={core.connectedTo}>
                      {core.connectedTo}
                    </p>
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>{core.colorName}</span>
                      <span className="font-mono">Loss: {core.opticalLossDb.toFixed(2)} dB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: OPTICAL SIGNAL & LOSS REFERENCE GUIDE
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "loss_guide" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Splitter Insertion Loss Reference */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-md space-y-4">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Share2 size={16} className="text-primary" />
              PLC Optical Splitter Theoretical Insertion Loss
            </h3>
            <p className="text-xs text-muted-foreground">
              Standard optical signal drop calculation when passing through PLC splitters:
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground font-bold border-b border-border">
                  <th className="p-2.5">SPLIT RATIO</th>
                  <th className="p-2.5">PORTS</th>
                  <th className="p-2.5">THEORETICAL LOSS</th>
                  <th className="p-2.5">TYPICAL INSERTION LOSS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-foreground">1:2</td>
                  <td className="p-2.5">2 Ports</td>
                  <td className="p-2.5">3.01 dB</td>
                  <td className="p-2.5 text-emerald-600 font-bold">~3.5 dB</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">1:4</td>
                  <td className="p-2.5">4 Ports</td>
                  <td className="p-2.5">6.02 dB</td>
                  <td className="p-2.5 text-emerald-600 font-bold">~7.2 dB</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="p-2.5 font-bold text-primary">1:8 (Standard)</td>
                  <td className="p-2.5 text-primary font-bold">8 Ports</td>
                  <td className="p-2.5">9.03 dB</td>
                  <td className="p-2.5 text-primary font-bold">~10.5 dB</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">1:16 (High Density)</td>
                  <td className="p-2.5">16 Ports</td>
                  <td className="p-2.5">12.04 dB</td>
                  <td className="p-2.5 text-amber-600 font-bold">~13.8 dB</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">1:32</td>
                  <td className="p-2.5">32 Ports</td>
                  <td className="p-2.5">15.05 dB</td>
                  <td className="p-2.5 text-amber-600 font-bold">~17.2 dB</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-foreground">1:64</td>
                  <td className="p-2.5">64 Ports</td>
                  <td className="p-2.5">18.06 dB</td>
                  <td className="p-2.5 text-rose-600 font-bold">~20.5 dB</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Optical RX Power Health Guide */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-md space-y-4">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Gauge size={16} className="text-emerald-500" />
              ONU Received Optical Power (dBm) Health Standards
            </h3>
            <p className="text-xs text-muted-foreground">
              FTTH GPON & EPON Optical RX Power standards for field technicians:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex justify-between font-black items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs inline-block" />
                    <span>-18.0 dBm to -24.0 dBm</span>
                  </span>
                  <span>STABLE / OPTIMAL SIGNAL</span>
                </div>
                <p className="text-[11px]">Ideal target power for 100% gigabit optical throughput and low latency.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex justify-between font-black items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs inline-block" />
                    <span>-24.1 dBm to -27.0 dBm</span>
                  </span>
                  <span>MARGINAL / HIGH LOSS</span>
                </div>
                <p className="text-[11px]">Clean fiber SC/APC connector or verify splice quality at pole TJ box.</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 space-y-1">
                <div className="flex justify-between font-black items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs inline-block animate-pulse" />
                    <span>Worse than -27.5 dBm or Red LOS</span>
                  </span>
                  <span>CRITICAL / LINK DOWN</span>
                </div>
                <p className="text-[11px]">Fiber cut or severe bend. Dispatch field splicer for OTDR test.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN SUBSCRIBER TO FREE PORT ────────────────────────────── */}
      {assignModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-emerald-500" />
                <h3 className="font-black text-base text-foreground">
                  Connect Subscriber to Port #{assignModal.portNumber}
                </h3>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground font-mono">
              Splitter Box: <strong>{assignModal.splitterName}</strong>
            </p>

            <form onSubmit={handleConfirmAssign} className="space-y-3.5 text-xs">
              {/* Search Subscriber */}
              <div className="space-y-1 relative">
                <label className="font-extrabold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Search size={12} className="text-primary" />
                  <span>SEARCH SUBSCRIBER (USER ID / PHONE / NAME)</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search User ID (e.g. MBN0001), Phone, or Name..."
                    value={custSearchQuery}
                    onChange={e => {
                      setCustSearchQuery(e.target.value);
                      setShowCustSuggestions(true);
                    }}
                    onFocus={() => setShowCustSuggestions(true)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-500/40 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                {/* Auto-suggest dropdown */}
                {showCustSuggestions && matchingCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold text-muted-foreground uppercase border-b border-border">
                      Select Subscriber ({matchingCustomers.length} Found)
                    </div>
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustForPort(cust);
                          setCustSearchQuery(`${cust.name} (${cust.clientCode || cust.id})`);
                          setShowCustSuggestions(false);
                        }}
                        className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {cust.clientCode || cust.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {cust.phone} · {cust.package}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          {cust.zone}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Customer Verification */}
              {selectedCustForPort && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ {selectedCustForPort.name} ({selectedCustForPort.clientCode || selectedCustForPort.id})
                    </span>
                    <span className="font-mono text-[10px] text-emerald-600 font-bold">{selectedCustForPort.phone}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Zone: {selectedCustForPort.subzone || selectedCustForPort.zone} · Plan: {selectedCustForPort.package}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">DROP FIBER DISTANCE (M)</label>
                  <input
                    type="number"
                    value={dropDistance}
                    onChange={e => setDropDistance(e.target.value)}
                    placeholder="45"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-bold text-foreground text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">OPTICAL RX TEST (dBm)</label>
                  <input
                    type="text"
                    value={testRxPower}
                    onChange={e => setTestRxPower(e.target.value)}
                    placeholder="-20.5"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-black text-emerald-600 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCustForPort}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <Check size={14} /> Connect Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW SPLITTER BOX ──────────────────────────────────────── */}
      {showAddSplitter && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                <h3 className="font-black text-base text-foreground">
                  Add New Optical Splitter Box (TJ Box)
                </h3>
              </div>
              <button onClick={() => setShowAddSplitter(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSplitter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SPLITTER BOX TAG / NAME *</label>
                  <input
                    type="text"
                    required
                    value={newBox.name}
                    onChange={e => setNewBox({ ...newBox, name: e.target.value })}
                    placeholder="e.g. TJ-M10-D (Road 12 Pole)"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-bold text-foreground text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">ZONE / AREA</label>
                  <input
                    type="text"
                    value={newBox.zone}
                    onChange={e => setNewBox({ ...newBox, zone: e.target.value })}
                    placeholder="Mirpur-10"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">LOCATION & POLE DETAILS *</label>
                <input
                  type="text"
                  required
                  value={newBox.location}
                  onChange={e => setNewBox({ ...newBox, location: e.target.value })}
                  placeholder="e.g. Mirpur Section-10, Block-D, Pole #24 (Opposite Mosque)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SPLIT RATIO</label>
                  <select
                    value={newBox.splitRatio}
                    onChange={e => setNewBox({ ...newBox, splitRatio: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-bold text-primary text-xs outline-none"
                  >
                    <option value="1:2">1:2 (2 Ports)</option>
                    <option value="1:4">1:4 (4 Ports)</option>
                    <option value="1:8">1:8 (8 Ports - Standard)</option>
                    <option value="1:16">1:16 (16 Ports)</option>
                    <option value="1:32">1:32 (32 Ports)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PON TECH</label>
                  <select
                    value={newBox.ponStandard}
                    onChange={e => setNewBox({ ...newBox, ponStandard: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-bold text-foreground text-xs outline-none"
                  >
                    <option value="GPON">GPON (128 Limit)</option>
                    <option value="EPON">EPON (64 Limit)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PON PORT</label>
                  <input
                    type="text"
                    value={newBox.ponPort}
                    onChange={e => setNewBox({ ...newBox, ponPort: e.target.value })}
                    placeholder="PON 0/1"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-bold text-foreground text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">FEEDER CORE NUMBER</label>
                  <input
                    type="number"
                    min="1"
                    max="96"
                    value={newBox.feederCoreNumber}
                    onChange={e => setNewBox({ ...newBox, feederCoreNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-bold text-foreground text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">FEEDER CORE COLOR</label>
                  <select
                    value={newBox.feederCoreColor}
                    onChange={e => setNewBox({ ...newBox, feederCoreColor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-bold text-foreground text-xs outline-none"
                  >
                    <option value="Blue">Blue</option>
                    <option value="Orange">Orange</option>
                    <option value="Green">Green</option>
                    <option value="Brown">Brown</option>
                    <option value="Slate">Slate</option>
                    <option value="White">White</option>
                    <option value="Red">Red</option>
                    <option value="Yellow">Yellow</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddSplitter(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                  <Check size={14} /> Create Splitter Box
                </button>
              </div>
            </form>
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
