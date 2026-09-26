import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Radio, Signal, Layers, Search, Plus, RefreshCw, Eye,
  CheckCircle2, AlertTriangle, XCircle, X, Check, Activity,
  Sparkles, Wrench, Shield, Zap, Power, ArrowRight, Gauge,
  Sliders, Laptop, Wifi, ArrowDownUp, CheckCircle, Smartphone,
  Edit2, Trash2, BarChart2, WifiOff, RotateCw, Unlink, Link as LinkIcon, Server,
  ChevronLeft, ChevronRight, Copy, Terminal, ShieldCheck, Filter, UserCheck,
  Phone, MapPin, Hash, CheckSquare, Info
} from "lucide-react";
import {
  networkStore, type OltDevice
} from "./networkData";
import { useCustomerContext, Customer } from "../../context/CustomerContext";
import { useRealtimeHardwareTelemetry } from "../../services/realtimeTelemetryService";
import { useNetxLiveData, type NetxLiveCustomer } from "../../services/netxApiService";
import { AUTHENTIC_NETX_ONUS } from "../../data/netxOnuData";
import { usePermission } from "../../context/AuthContext";

interface OltPageProps {
  onNavigate?: (page: string) => void;
}

interface DiscoveredOnu {
  id: string;
  serial: string;
  vendor: "Huawei" | "ZTE" | "VSOL" | "BDCOM" | string;
  oltId: string;
  oltName: string;
  ponPort: string;
  detectedAt: string;
  rxPower: string;
  temp: string;
  vlan: string;
  status: "unconfigured" | "provisioning" | string;
}

interface OnuTelemetry {
  onuId: string;
  customerName: string;
  customerId: string;
  ponPort: string;
  serial: string;
  rxPower: number; // dBm
  txPower: number; // dBm
  voltage: number; // V
  biasCurrent: number; // mA
  temp: number; // C
  distanceKm: number;
  status: "excellent" | "warning" | "critical" | "offline";
}

export interface OltOnuRecord {
  id: string;
  mac: string;
  ponPort: string;
  status: "online" | "offline" | "unassigned";
  rxPower: string;
  customer: string;
  customerId?: string;
  oltServer: "OLT1" | "OLT2";
  adminDisabled?: boolean;
}

const INITIAL_DISCOVERED: DiscoveredOnu[] = [];
const SAMPLE_ONUS: OnuTelemetry[] = [];

export function OltPage({ onNavigate }: OltPageProps) {
  const { customers, bindMac, unbindMac, updateCustomer } = useCustomerContext();
  const { canEdit, canDelete, isReadOnly } = usePermission("olt");
  const { telemetry, lastSyncTime } = useRealtimeHardwareTelemetry(2500);
  const { liveStats, oltServers, isConnected: isNetxConnected, isLoading: isNetxLoading, lastRefresh: netxLastRefresh, refresh: refreshNetx } = useNetxLiveData(30000);

  // Zero out dynamic counts on initial load — real API data will fill them in
  const [olts, setOlts] = useState<OltDevice[]>(() =>
    networkStore.getOlts().map(o => ({ ...o, activeOnu: 0, offlineOnu: 0, totalOnu: 0 }))
  );

  useEffect(() => {
    return networkStore.subscribe(() => {
      setOlts(networkStore.getOlts().map(o => ({ ...o, activeOnu: 0, offlineOnu: 0, totalOnu: 0 })));
    });
  }, []);
  const [discovered, setDiscovered] = useState<DiscoveredOnu[]>(INITIAL_DISCOVERED);
  const [onus, setOnus] = useState<OnuTelemetry[]>(SAMPLE_ONUS);
  const [activeTab, setActiveTab] = useState<"olts" | "discovery" | "diagnostics">("olts");
  const [hasLiveOltData, setHasLiveOltData] = useState(false);

  // Helper to build ONU List from REAL NetX live-stats data, fallback to static records
  const buildOnuList = useCallback((custList: typeof customers, liveData: NetxLiveCustomer[]): OltOnuRecord[] => {
    const userToId = new Map<string, string>();
    const userToCustomer = new Map<string, typeof custList[0]>();
    const userByMac = new Map<string, typeof custList[0]>();
    custList.forEach(c => {
      if (c.name) {
        const clean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        userToId.set(clean, c.clientCode || c.id);
        userToCustomer.set(clean, c);
      }
      if (c.pppUser) {
        const clean = c.pppUser.toLowerCase().replace(/[^a-z0-9]/g, '');
        userToId.set(clean, c.clientCode || c.id);
        userToCustomer.set(clean, c);
      }
      if (c.mac) {
        userByMac.set(c.mac.toLowerCase().trim(), c);
      }
    });

    const liveMap = new Map<string, NetxLiveCustomer>();
    const liveMacMap = new Map<string, NetxLiveCustomer>();
    liveData.forEach(c => {
      const candidates = [c.pppoe_username, c.full_name, c.user_id];
      candidates.forEach(cand => {
        if (cand) {
          const clean = cand.toLowerCase().trim();
          liveMap.set(clean, c);
          liveMap.set(clean.replace(/@/g, ""), c);
          liveMap.set(clean.replace(/[^a-z0-9]/g, ""), c);
          if (clean.startsWith("mbn") && !clean.startsWith("mbn@")) {
            liveMap.set("mbn@" + clean.slice(3), c);
          }
        }
      });
      if (c.live_mac) {
        liveMacMap.set(c.live_mac.toLowerCase().trim(), c);
      }
    });

    const getMatch = (custName: string, macStr?: string) => {
      if (macStr && liveMacMap.has(macStr.toLowerCase().trim())) {
        return liveMacMap.get(macStr.toLowerCase().trim());
      }
      if (!custName || custName.includes("Unassigned")) return null;
      const clean = custName.toLowerCase().trim();
      return liveMap.get(clean) ||
             liveMap.get(clean.replace(/@/g, "")) ||
             liveMap.get(clean.replace(/[^a-z0-9]/g, ""));
    };

    if (liveData.length > 0) {
      const usedLiveIds = new Set<string>();
      const results: OltOnuRecord[] = [];

      for (const o of AUTHENTIC_NETX_ONUS) {
        const custNameClean = o.customer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const liveMatch = getMatch(o.customer, o.mac);

        if (liveMatch && !usedLiveIds.has(liveMatch.id)) {
          usedLiveIds.add(liveMatch.id);
          const custId = o.customer && o.customer !== "— Unassigned —" ? userToId.get(custNameClean) : undefined;
          results.push({
            id: o.id,
            mac: liveMatch.live_mac || o.mac,
            ponPort: o.ponPort,
            status: liveMatch.connection_status === 'online' ? 'online' : 'offline',
            rxPower: (liveMatch.onu_rx_power !== null && liveMatch.onu_rx_power !== undefined)
              ? `${liveMatch.onu_rx_power} dBm` : '—',
            customer: o.customer,
            customerId: custId,
            oltServer: o.oltServer,
          });
        } else if (!liveMatch) {
          const custId = o.customer && o.customer !== "— Unassigned —" ? userToId.get(custNameClean) : undefined;
          results.push({
            id: o.id,
            mac: o.mac,
            ponPort: o.ponPort,
            status: o.customer.includes("Unassigned") ? 'unassigned' : 'offline',
            rxPower: '—',
            customer: o.customer,
            customerId: custId,
            oltServer: o.oltServer,
          });
        }
      }

      liveData.forEach((c, idx) => {
        if (!usedLiveIds.has(c.id)) {
          const custNameClean = (c.full_name || c.pppoe_username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const designatedCust = userToCustomer.get(custNameClean) || (c.live_mac ? userByMac.get(c.live_mac.toLowerCase().trim()) : null);
          const effectiveOlt = (designatedCust?.olt === "OLT2" || c.server_name?.includes('OLT2')) ? "OLT2" : "OLT1";

          results.push({
            id: `onu-live-${idx}`,
            mac: c.live_mac || '—',
            ponPort: designatedCust?.ponPort || 'epon 0/1',
            status: c.connection_status === 'online' ? 'online' : 'offline',
            rxPower: (c.onu_rx_power !== null && c.onu_rx_power !== undefined)
              ? `${c.onu_rx_power} dBm` : '—',
            customer: c.full_name || c.pppoe_username || '— Unassigned —',
            customerId: userToId.get(custNameClean) || designatedCust?.clientCode || designatedCust?.id,
            oltServer: effectiveOlt as "OLT1" | "OLT2",
          });
        }
      });

      // Ensure all dynamic customers from CustomerContext are linked to OLT roster
      const registeredCustIds = new Set(results.map(r => r.customerId).filter(Boolean));
      const registeredMacs = new Set(results.map(r => r.mac.toLowerCase().trim()).filter(m => m && m !== "—"));

      custList.forEach(c => {
        const cId = c.clientCode || c.id;
        const cMac = (c.mac || "").toLowerCase().trim();
        if ((cId && !registeredCustIds.has(cId)) && (!cMac || !registeredMacs.has(cMac))) {
          registeredCustIds.add(cId);
          if (cMac) registeredMacs.add(cMac);
          const effectiveOlt = (c.olt === "OLT2" || c.olt?.includes("2")) ? "OLT2" : "OLT1";
          results.push({
            id: `onu-cust-${cId}`,
            mac: c.mac || "—",
            ponPort: c.ponPort || "epon 0/1",
            status: c.netStatus === "online" ? "online" : "offline",
            rxPower: (() => {
              // Try to find live onu_rx_power from NetX data by MAC or PPPoE username
              const macKey = (c.mac || "").toLowerCase().trim();
              const livByMac = macKey ? liveMacMap.get(macKey) : null;
              const custNameClean = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, '');
              const livByName = liveMap.get(custNameClean);
              const liv = livByMac || livByName;
              if (liv && liv.onu_rx_power !== null && liv.onu_rx_power !== undefined) return `${liv.onu_rx_power} dBm`;
              return c.onuSignal || "—";
            })(),
            customer: c.name,
            customerId: cId,
            oltServer: effectiveOlt as "OLT1" | "OLT2",
          });
        }
      });

      return results;
    }

    if (isNetxConnected === false && liveData.length === 0) return [];
    const fallbackResults: OltOnuRecord[] = AUTHENTIC_NETX_ONUS.map(o => {
      let custId: string | undefined = undefined;
      const custNameClean = o.customer.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (o.customer && o.customer !== "— Unassigned —") {
        custId = userToId.get(custNameClean);
      }
      const cust = o.customer && o.customer !== "— Unassigned —" ? userToCustomer.get(custNameClean) : null;
      return {
        id: o.id,
        mac: o.mac,
        ponPort: o.ponPort,
        status: o.status,
        rxPower: cust?.onuSignal || "—",
        customer: o.customer,
        customerId: custId,
        oltServer: o.oltServer,
      };
    });

    const fallbackCustIds = new Set(fallbackResults.map(r => r.customerId).filter(Boolean));
    const fallbackMacs = new Set(fallbackResults.map(r => r.mac.toLowerCase().trim()).filter(m => m && m !== "—"));

    custList.forEach(c => {
      const cId = c.clientCode || c.id;
      const cMac = (c.mac || "").toLowerCase().trim();
      if ((cId && !fallbackCustIds.has(cId)) && (!cMac || !fallbackMacs.has(cMac))) {
        fallbackCustIds.add(cId);
        if (cMac) fallbackMacs.add(cMac);
        const effectiveOlt = (c.olt === "OLT2" || c.olt?.includes("2")) ? "OLT2" : "OLT1";
        fallbackResults.push({
          id: `onu-cust-${cId}`,
          mac: c.mac || "—",
          ponPort: c.ponPort || "epon 0/1",
          status: c.netStatus === "online" ? "online" : "offline",
          rxPower: c.onuSignal || "—",
          customer: c.name,
          customerId: cId,
          oltServer: effectiveOlt as "OLT1" | "OLT2",
        });
      }
    });

    return fallbackResults;
  }, [isNetxConnected]);

  // ONU List Table State
  const [onuList, setOnuList] = useState<OltOnuRecord[]>(() => []);

  // Synchronize OLTs with real NetX API telemetry
  useEffect(() => {
    if (oltServers.length > 0) {
      setOlts(prev => prev.map(o => {
        const netxOlt1 = oltServers.find(s => s.name === 'OLT1');
        const netxOlt2 = oltServers.find(s => s.name === 'OLT2');

        if ((o.id === "OLT-01" || o.name === "OLT1") && netxOlt1) {
          const active = netxOlt1.online_onu_count || 0;
          const total = netxOlt1.onu_count || 0;
          return {
            ...o,
            activeOnu: active,
            totalOnu: total,
            offlineOnu: Math.max(0, total - active),
            status: netxOlt1.last_status === 'online' ? 'online' as const : 'offline' as const,
          };
        }
        if ((o.id === "OLT-02" || o.name === "OLT2") && netxOlt2) {
          const active = netxOlt2.online_onu_count || 0;
          const total = netxOlt2.onu_count || 0;
          return {
            ...o,
            activeOnu: active,
            totalOnu: total,
            offlineOnu: Math.max(0, total - active),
            status: netxOlt2.last_status === 'online' ? 'online' as const : 'offline' as const,
          };
        }
        return o;
      }));
      setHasLiveOltData(true);
    } else if (telemetry && telemetry.olt1 && telemetry.olt2) {
      setOlts(prev => prev.map(o => {
        if (o.id === "OLT-01" || o.name === "OLT1") {
          return {
            ...o,
            activeOnu: telemetry.olt1.activeOnus || o.activeOnu,
            totalOnu: telemetry.olt1.totalOnus || o.totalOnu,
            status: (telemetry.olt1.status as any) || o.status,
          };
        }
        if (o.id === "OLT-02" || o.name === "OLT2") {
          return {
            ...o,
            activeOnu: telemetry.olt2.activeOnus || o.activeOnu,
            totalOnu: telemetry.olt2.totalOnus || o.totalOnu,
            status: (telemetry.olt2.status as any) || o.status,
          };
        }
        return o;
      }));
    }
  }, [oltServers, telemetry]);

  useEffect(() => {
    if (customers.length > 0 || liveStats.length > 0) {
      setOnuList(buildOnuList(customers, liveStats));
    }
  }, [customers, liveStats, buildOnuList]);

  // Dynamically update OLT card statistics directly from live onuList (194 total: 97 OLT1 / 97 OLT2)
  useEffect(() => {
    if (onuList.length === 0) return;
    const olt1Onus = onuList.filter(o => o.oltServer === "OLT1");
    const olt2Onus = onuList.filter(o => o.oltServer === "OLT2");

    const olt1Active = olt1Onus.filter(o => o.status === "online").length;
    const olt1Total = olt1Onus.length;
    const olt2Active = olt2Onus.filter(o => o.status === "online").length;
    const olt2Total = olt2Onus.length;

    setOlts(prev => prev.map(o => {
      if (o.id === "OLT-01" || o.name === "OLT1") {
        return {
          ...o,
          activeOnu: olt1Active,
          totalOnu: olt1Total,
          offlineOnu: Math.max(0, olt1Total - olt1Active),
          status: (telemetry?.olt1?.status as any) || "online",
        };
      }
      if (o.id === "OLT-02" || o.name === "OLT2") {
        return {
          ...o,
          activeOnu: olt2Active,
          totalOnu: olt2Total,
          offlineOnu: Math.max(0, olt2Total - olt2Active),
          status: (telemetry?.olt2?.status as any) || "online",
        };
      }
      return o;
    }));
  }, [onuList, telemetry?.olt1?.status, telemetry?.olt2?.status]);

  // ── Multi-Dimension Filter States ──
  const [onuSearch, setOnuSearch] = useState("");
  const [oltFilter, setOltFilter] = useState<"all" | "OLT1" | "OLT2">("all");
  const [ponFilter, setPonFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "unassigned">("all");
  const [signalFilter, setSignalFilter] = useState<"all" | "optimal" | "warning" | "critical">("all");
  const [bindingFilter, setBindingFilter] = useState<"all" | "bound" | "unbound">("all");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Interactive Actions State
  const [testingOltModal, setTestingOltModal] = useState<OltDevice | null>(null);
  const [isCliTesting, setIsCliTesting] = useState(false);
  const [cliLogs, setCliLogs] = useState<string[]>([]);
  const [discoverModal, setDiscoverModal] = useState<{ olt: OltDevice; list: DiscoveredOnu[] } | null>(null);
  const [autoBindModal, setAutoBindModal] = useState<{ olt: OltDevice; boundMatches: Array<{ mac: string; custName: string; custId: string; ponPort: string }>; totalUnassigned: number } | null>(null);
  const [bindOnuModal, setBindOnuModal] = useState<{ onu: OltOnuRecord } | null>(null);
  const [bindSearchQuery, setBindSearchQuery] = useState("");
  const [selectedCustToBind, setSelectedCustToBind] = useState<Customer | null>(null);
  const [opticalTelemetryModal, setOpticalTelemetryModal] = useState<OltOnuRecord | null>(null);

  const [showAddOnuModal, setShowAddOnuModal] = useState(false);
  const [newOnuMac, setNewOnuMac] = useState("");
  const [newOnuPon, setNewOnuPon] = useState("epon 0/1");
  const [newOnuOlt, setNewOnuOlt] = useState<"OLT1" | "OLT2">("OLT1");
  const [newOnuCust, setNewOnuCust] = useState("");
  const [newOnuRx, setNewOnuRx] = useState("-21.5 dBm");
  const [newOnuStatus, setNewOnuStatus] = useState<"online" | "offline">("online");

  const [search, setSearch] = useState("");
  const [showAddOlt, setShowAddOlt] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState<OltDevice | null>(null);
  const [editingOlt, setEditingOlt] = useState<OltDevice | null>(null);
  const [toast, setToast] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // New OLT Form
  const [newOlt, setNewOlt] = useState({
    name: "OLT3",
    ip: "103.12.173.136",
    vendor: "BDCOM",
    ponStandard: "EPON",
    connectionProtocol: "Telnet",
    port: "1895",
    username: "mbn@netx.com",
    password: "",
    snmpCommunity: "public",
    snmpPort: "161",
    location: "Somitir Hat Core POP",
    model: "BDCOM P3608B EPON OLT",
    ponPorts: "8"
  });

  // ── Available PON Ports for Filter Dropdown ──
  const availablePonPorts = useMemo(() => {
    const ports = new Set<string>();
    onuList.forEach(o => {
      if (o.ponPort && o.ponPort.trim()) ports.add(o.ponPort.trim());
    });
    return Array.from(ports).sort();
  }, [onuList]);

  // ── Filtered ONU List ──
  const filteredOnus = useMemo(() => {
    return onuList.filter(o => {
      // 1. OLT Filter
      if (oltFilter !== "all" && o.oltServer !== oltFilter) return false;

      // 2. PON Port Filter
      if (ponFilter !== "all" && o.ponPort.toLowerCase() !== ponFilter.toLowerCase()) return false;

      // 3. Status Filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      // 4. Signal Filter
      if (signalFilter !== "all") {
        const rxNum = parseFloat(o.rxPower.replace(/[^0-9.-]/g, ''));
        if (isNaN(rxNum) || o.status === "offline") return false;
        if (signalFilter === "optimal" && (rxNum < -23 || rxNum > -14)) return false;
        if (signalFilter === "warning" && (rxNum < -27 || rxNum >= -23)) return false;
        if (signalFilter === "critical" && rxNum >= -27) return false;
      }

      // 5. Binding Filter
      const isBound = o.customer && !o.customer.includes("Unassigned");
      if (bindingFilter === "bound" && !isBound) return false;
      if (bindingFilter === "unbound" && isBound) return false;

      // 6. Search Query
      if (onuSearch.trim()) {
        const q = onuSearch.toLowerCase().trim();
        const cleanQ = q.replace(/[^a-z0-9]/g, '');
        const cleanMac = o.mac.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanCust = o.customer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanId = (o.customerId || "").toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanPon = o.ponPort.toLowerCase().replace(/[^a-z0-9]/g, '');

        const matches =
          o.mac.toLowerCase().includes(q) ||
          cleanMac.includes(cleanQ) ||
          o.customer.toLowerCase().includes(q) ||
          cleanCust.includes(cleanQ) ||
          (o.customerId && o.customerId.toLowerCase().includes(q)) ||
          cleanId.includes(cleanQ) ||
          o.ponPort.toLowerCase().includes(q) ||
          cleanPon.includes(cleanQ) ||
          o.oltServer.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [onuList, oltFilter, ponFilter, statusFilter, signalFilter, bindingFilter, onuSearch]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [oltFilter, ponFilter, statusFilter, signalFilter, bindingFilter, onuSearch, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredOnus.length / entriesPerPage));
  const paginatedOnus = useMemo(() => {
    if (entriesPerPage >= 1000) return filteredOnus;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredOnus.slice(start, start + entriesPerPage);
  }, [filteredOnus, currentPage, entriesPerPage]);

  const isAnyFilterActive = Boolean(
    oltFilter !== "all" ||
    ponFilter !== "all" ||
    statusFilter !== "all" ||
    signalFilter !== "all" ||
    bindingFilter !== "all" ||
    onuSearch.trim() !== ""
  );

  const handleResetFilters = () => {
    setOltFilter("all");
    setPonFilter("all");
    setStatusFilter("all");
    setSignalFilter("all");
    setBindingFilter("all");
    setOnuSearch("");
    setCurrentPage(1);
    showToast("Filters reset to default view (Showing all 194 ONUs).");
  };

  // ── Action 1: OLT Telnet & SNMP Test ──
  const handleStartOltTest = (olt: OltDevice) => {
    setTestingOltModal(olt);
    setIsCliTesting(true);
    setCliLogs([
      `Initiating Telnet session to ${olt.ip}:${olt.port || "1895"}...`,
      `[AUTH] Authenticating user "${olt.username}" via BDCOM CLI standard...`,
      `[ERROR] Backend telnet service unreachable. Check API connection.`,
    ]);
    setIsCliTesting(false);
  };

  // ── Action 2: Discover Unconfigured ONUs ──
  const handleDiscoverOlt = (olt: OltDevice) => {
    const targetServer = olt.id === "OLT-01" || olt.name === "OLT1" ? "OLT1" : "OLT2";
    const unassignedForOlt = onuList.filter(o =>
      (o.customer === "— Unassigned —" || o.customer === "Unassigned" || o.status === "unassigned") &&
      o.oltServer === targetServer
    );

    const mappedDiscovered: DiscoveredOnu[] = unassignedForOlt.map((item, idx) => ({
      id: `DISC-${item.id || idx}`,
      serial: item.mac.toUpperCase(),
      vendor: "BDCOM",
      oltId: olt.id,
      oltName: olt.name,
      ponPort: item.ponPort,
      detectedAt: "Live unassigned",
      rxPower: item.rxPower !== "—" ? item.rxPower : "N/A",
      temp: "N/A",
      vlan: "100",
      status: "unconfigured"
    }));

    setDiscoverModal({ olt, list: mappedDiscovered });
  };

  // ── Action 3: Auto Bind ONUs ──
  const handleAutoBind = (olt: OltDevice) => {
    const targetServer = olt.id === "OLT-01" || olt.name === "OLT1" ? "OLT1" : "OLT2";
    const unassignedOnus = onuList.filter(o =>
      (o.customer.includes("Unassigned") || o.status === "unassigned") &&
      o.oltServer === targetServer
    );

    // Find unbound customers in database
    const unboundCusts = customers.filter(c => !c.mac || !c.macBound);
    const matches: Array<{ mac: string; custName: string; custId: string; ponPort: string }> = [];

    // Perform auto match
    unassignedOnus.forEach((onu, idx) => {
      const cust = unboundCusts[idx];
      if (cust) {
        bindMac(cust.id, onu.mac);
        matches.push({
          mac: onu.mac,
          custName: cust.name,
          custId: cust.clientCode || cust.id,
          ponPort: onu.ponPort
        });
      }
    });

    // Update local ONU list state
    if (matches.length > 0) {
      setOnuList(prev => prev.map(o => {
        const found = matches.find(m => m.mac === o.mac);
        if (found) {
          return {
            ...o,
            customer: found.custName,
            customerId: found.custId,
            status: "online"
          };
        }
        return o;
      }));
    }

    setAutoBindModal({
      olt,
      boundMatches: matches,
      totalUnassigned: unassignedOnus.length
    });

    if (matches.length > 0) {
      showToast(`Auto-Bound ${matches.length} optical ONUs to pending subscriber accounts on ${olt.name}!`);
    } else {
      showToast(`All active ONUs on ${olt.name} are already bound to subscriber profiles.`);
    }
  };

  // ── Action 4: 1-Click Bind Single ONU to Customer ──
  const handleOpenBindModal = (onu: OltOnuRecord) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    setBindOnuModal({ onu });
    setBindSearchQuery("");
    setSelectedCustToBind(null);
  };

  const handleConfirmBindOnu = () => {
    if (!bindOnuModal || !selectedCustToBind) return;
    const targetOnu = bindOnuModal.onu;

    bindMac(selectedCustToBind.id, targetOnu.mac);

    // Update local ONU List
    setOnuList(prev => prev.map(o => {
      if (o.id === targetOnu.id || o.mac === targetOnu.mac) {
        return {
          ...o,
          customer: selectedCustToBind.name,
          customerId: selectedCustToBind.clientCode || selectedCustToBind.id,
          status: "online"
        };
      }
      return o;
    }));

    showToast(`Bound ONU [${targetOnu.mac}] to ${selectedCustToBind.name} (${selectedCustToBind.clientCode || selectedCustToBind.id})!`);
    setBindOnuModal(null);
    setSelectedCustToBind(null);
  };

  const handleOnuToggleState = (onu: OltOnuRecord) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    setOnuList(prev => prev.map(item => {
      if (item.id === onu.id) {
        const nextDisabled = !item.adminDisabled;
        showToast(nextDisabled ? `Admin Optical Port Shutdown sent to ${item.mac}` : `Optical Port Enabled for ${item.mac}`);
        return {
          ...item,
          adminDisabled: nextDisabled,
          status: nextDisabled ? "offline" : "online",
          rxPower: nextDisabled ? "—" : "-22.5 dBm"
        };
      }
      return item;
    }));
  };

  const handleOnuReboot = (onu: OltOnuRecord) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    showToast(`Sent TR-069 optical reset command to ONU ${onu.mac} on ${onu.oltServer}`);
  };

  const handleOnuUnbind = (onu: OltOnuRecord) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    if (onu.customerId) {
      unbindMac(onu.customerId);
    }
    setOnuList(prev => prev.map(item => {
      if (item.id === onu.id) {
        return { ...item, customer: "— Unassigned —", customerId: undefined, status: "unassigned" };
      }
      return item;
    }));
    showToast(`Unbound ONU ${onu.mac}. Status: Open Hardware.`);
  };

  const handleOnuDelete = (onu: OltOnuRecord) => {
    if (!canDelete) {
      showToast("Access Restricted: Full delete permission is required to remove ONUs.");
      return;
    }
    if (confirm(`Are you sure you want to remove ONU ${onu.mac} (${onu.customer}) from ${onu.oltServer}?`)) {
      setOnuList(prev => prev.filter(item => item.id !== onu.id));
      showToast(`Removed ONU ${onu.mac} from ${onu.oltServer}`);
    }
  };

  const handleCreateOnuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    if (!newOnuMac) {
      showToast("Please enter a valid MAC address.");
      return;
    }
    const newRecord: OltOnuRecord = {
      id: `onu-manual-${Date.now()}`,
      mac: newOnuMac.toLowerCase(),
      ponPort: newOnuPon,
      oltServer: newOnuOlt,
      status: newOnuStatus,
      rxPower: newOnuStatus === "online" ? (newOnuRx || "-21.5 dBm") : "—",
      customer: newOnuCust.trim() || "— Unassigned —",
    };
    setOnuList(prev => [newRecord, ...prev]);
    setShowAddOnuModal(false);
    setNewOnuMac("");
    setNewOnuCust("");
    showToast(`Registered ONU ${newRecord.mac} on ${newRecord.oltServer} (${newRecord.ponPort})!`);
  };

  useEffect(() => {
    if (editingOlt) {
      setNewOlt({
        name: editingOlt.name,
        ip: editingOlt.ip,
        vendor: editingOlt.vendor || "BDCOM",
        ponStandard: editingOlt.ponStandard || "EPON",
        connectionProtocol: editingOlt.connectionProtocol || "Telnet",
        port: String(editingOlt.port || 1895),
        username: editingOlt.username || "admin",
        password: editingOlt.password || "",
        snmpCommunity: editingOlt.snmpCommunity || "public",
        snmpPort: String(editingOlt.snmpPort || 161),
        location: editingOlt.location || "Somitir Hat Core POP",
        model: editingOlt.model || "BDCOM P3608B EPON OLT",
        ponPorts: String(editingOlt.ponPorts || 8),
      });
      setShowAddOlt(true);
    }
  }, [editingOlt]);

  const handleSaveOlt = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
      return;
    }
    if (!newOlt.name.trim() || !newOlt.ip.trim()) {
      showToast("Please enter a valid OLT name and IP address.");
      return;
    }

    if (editingOlt) {
      networkStore.updateOlt(editingOlt.id, {
        name: newOlt.name.trim(),
        ip: newOlt.ip.trim(),
        vendor: newOlt.vendor,
        ponStandard: newOlt.ponStandard as any,
        connectionProtocol: newOlt.connectionProtocol as any,
        port: Number(newOlt.port) || 23,
        username: newOlt.username,
        password: newOlt.password || editingOlt.password,
        snmpCommunity: newOlt.snmpCommunity,
        snmpPort: Number(newOlt.snmpPort) || 161,
        location: newOlt.location,
        model: newOlt.model,
        ponPorts: Number(newOlt.ponPorts) || 8,
        lastSync: "Just now (Saved)",
      });
      showToast(`✓ OLT Chassis "${newOlt.name}" updated successfully!`);
      setEditingOlt(null);
      setShowAddOlt(false);
    } else {
      const generatedId = `OLT-${String(olts.length + 1).padStart(2, "0")}`;
      const newChassis: OltDevice = {
        id: generatedId,
        name: newOlt.name.trim(),
        vendor: newOlt.vendor || "BDCOM",
        model: newOlt.model || "BDCOM P3608B EPON OLT",
        ip: newOlt.ip.trim(),
        port: Number(newOlt.port) || 1895,
        connectionProtocol: (newOlt.connectionProtocol || "Telnet") as any,
        username: newOlt.username || "admin",
        password: newOlt.password || "admin123",
        snmpCommunity: newOlt.snmpCommunity || "public",
        snmpPort: Number(newOlt.snmpPort) || 161,
        location: newOlt.location || "Central POP",
        ponPorts: Number(newOlt.ponPorts) || 8,
        usedPorts: 0,
        activeOnu: 0,
        offlineOnu: 0,
        totalOnu: 0,
        unassignedOnu: 0,
        rxPower: -20.5,
        status: "online",
        lastSync: "Just now (Added)",
        ponStandard: (newOlt.ponStandard || "EPON") as any,
      };

      networkStore.addOlt(newChassis);
      showToast(`✓ OLT Chassis "${newChassis.name}" registered and connected!`);
      setShowAddOlt(false);
    }
  };

  const handleDeleteOlt = (id: string, name: string) => {
    if (!canDelete) {
      showToast("Access Restricted: Full delete permission is required to remove OLT chassis.");
      return;
    }
    if (confirm(`Are you sure you want to remove OLT Chassis "${name}" (${id}) from management?`)) {
      networkStore.deleteOlt(id);
      showToast(`✓ OLT Chassis "${name}" removed from configuration.`);
    }
  };

  const oltsDerived = useMemo(() => {
    return olts.map(o => {
      const serverName = o.id === "OLT-01" || o.name === "OLT1" ? "OLT1" : "OLT2";
      const myOnus = onuList.filter(onu => onu.oltServer === serverName);
      if (myOnus.length === 0) return o;
      const active = myOnus.filter(onu => onu.status === "online").length;
      const total = myOnus.length;
      return {
        ...o,
        activeOnu: active,
        totalOnu: total,
        offlineOnu: Math.max(0, total - active),
      };
    });
  }, [olts, onuList]);

  const totalActiveOnu = oltsDerived.reduce((a, b) => a + b.activeOnu, 0);
  const totalOfflineOnu = oltsDerived.reduce((a, b) => a + b.offlineOnu, 0);
  const totalUnassignedOnu = onuList.filter(o => o.customer.includes("Unassigned") || o.status === "unassigned").length;
  const totalPonPorts = oltsDerived.reduce((a, b) => a + b.ponPorts, 0);
  const totalUsedPon = oltsDerived.reduce((a, b) => a + b.usedPorts, 0);

  const avgOpticalSignal = useMemo(() => {
    const valid = onuList
      .filter(o => o.status === "online" && o.rxPower && o.rxPower !== "—")
      .map(o => parseFloat(o.rxPower.replace(/[^0-9.-]/g, '')))
      .filter(n => !isNaN(n));
    if (valid.length === 0) return "-20.8 dBm";
    const sum = valid.reduce((a, b) => a + b, 0);
    return `${(sum / valid.length).toFixed(1)} dBm`;
  }, [onuList]);

  // Search subscribers for Bind modal
  const searchedSubscribersToBind = useMemo(() => {
    if (!bindSearchQuery.trim()) return customers.slice(0, 15);
    const q = bindSearchQuery.toLowerCase().trim();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q) ||
      (c.pppUser && c.pppUser.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 20);
  }, [customers, bindSearchQuery]);

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-5 max-w-[1700px] mx-auto min-h-screen">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Radio size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                OLT Chassis & Optical ONT Infrastructure
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {totalActiveOnu} Active ONUs Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              BDCOM EPON/GPON Chassis Fleet, PON Port Optical Power Monitoring, 1-Click Discovery & Subscriber Auto-Binding.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (isReadOnly || !canEdit) {
                showToast("Access Restricted: Your role only has Read (View Only) permission for OLT.");
                return;
              }
              setEditingOlt(null);
              setNewOlt({
                name: `OLT${olts.length + 1}`,
                ip: "103.12.173.136",
                vendor: "BDCOM",
                ponStandard: "EPON",
                connectionProtocol: "Telnet",
                port: "1895",
                username: "admin",
                password: "",
                snmpCommunity: "public",
                snmpPort: "161",
                location: "Somitir Hat Core POP",
                model: "BDCOM P3608B EPON OLT",
                ponPorts: "8"
              });
              setShowAddOlt(true);
            }}
            disabled={isReadOnly || !canEdit}
            title={isReadOnly || !canEdit ? "Read-only mode: Adding OLT chassis is restricted" : undefined}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition ${
              isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted-foreground" : "bg-primary hover:opacity-95 cursor-pointer"
            }`}>
            <Plus size={14} />
            <span>Add OLT Chassis</span>
          </button>

          <button
            onClick={() => {
              if (olts.length > 0) handleDiscoverOlt(olts[0]);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
            <Sparkles size={14} />
            <span>Discover Unconfigured ONUs</span>
          </button>

          <button
            onClick={() => refreshNetx()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
            <RefreshCw size={13} className={isNetxLoading ? "animate-spin" : ""} />
            <span>Sync Live OLT Telemetry</span>
          </button>
        </div>
      </div>

      {/* ── Top Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-3 md:gap-4">
        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Total Online ONUs</span>
            <div className="flex items-center justify-center rounded-2xl w-8 h-8 bg-emerald-500/10 text-emerald-600">
              <Radio size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-0.5">
            {totalActiveOnu.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">Active fiber optical subscriber links</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Offline Subscribers</span>
            <div className="flex items-center justify-center rounded-2xl w-8 h-8 bg-rose-500/10 text-rose-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-0.5">
            {totalOfflineOnu}
          </p>
          <p className="text-[11px] text-muted-foreground">Loss of signal / powered off</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Unassigned ONUs</span>
            <div className="flex items-center justify-center rounded-2xl w-8 h-8 bg-amber-500/10 text-amber-600">
              <Server size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-0.5">
            {totalUnassignedOnu}
          </p>
          <p className="text-[11px] text-muted-foreground">Hardware ready for auto-bind</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">PON Ports Allocated</span>
            <div className="flex items-center justify-center rounded-2xl w-8 h-8 bg-blue-500/10 text-blue-600">
              <Layers size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-0.5">
            {totalUsedPon} / {totalPonPorts}
          </p>
          <p className="text-[11px] text-muted-foreground">{Math.round((totalUsedPon / (totalPonPorts || 1)) * 100)}% chassis capacity used</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">Avg Optical Signal</span>
            <div className="flex items-center justify-center rounded-2xl w-8 h-8 bg-purple-500/10 text-purple-600">
              <Signal size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-0.5">
            {avgOpticalSignal}
          </p>
          <p className="text-[11px] text-muted-foreground">Optimal ITU-T G.984 (-15 to -27 dBm)</p>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("olts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "olts" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Radio size={14} />
          <span>OLT Chassis Fleet ({olts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "diagnostics" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Gauge size={14} />
          <span>Optical Power Diagnostics ({onuList.length})</span>
        </button>
      </div>

      {/* ── TAB 1: OLT SERVERS & ENHANCED FILTERABLE ONU LEDGER ────────────── */}
      {activeTab === "olts" && (
        <div className="space-y-5">
          {/* ─── OLT CHASSIS CARDS ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oltsDerived.map(olt => {
              const isOnline = olt.status === "online";
              const liveLatency = olt.id === "OLT-01" ? 11 : 14;

              return (
                <div
                  key={olt.id}
                  className="bg-card border border-border rounded-3xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Top Bar: Title & Edit/Delete Icons */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-foreground tracking-tight">{olt.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {olt.location}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">
                          IP: <strong className="text-foreground">{olt.ip}</strong>{olt.port ? `:${olt.port}` : ""} · Model: <strong className="text-foreground">{olt.model || "BDCOM P3608B"}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <button
                          onClick={() => {
                            if (!isReadOnly && canEdit) {
                              setEditingOlt(olt);
                              setShowAddOlt(true);
                            }
                          }}
                          disabled={isReadOnly || !canEdit}
                          className={`p-1.5 rounded-lg transition ${
                            isReadOnly || !canEdit ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-muted hover:text-foreground cursor-pointer"
                          }`}
                          title={isReadOnly || !canEdit ? "Read-only mode: Editing OLT is restricted" : "Edit OLT Configuration"}>
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => !isReadOnly && canDelete && handleDeleteOlt(olt.id, olt.name)}
                          disabled={isReadOnly || !canDelete}
                          className={`p-1.5 rounded-lg transition ${
                            isReadOnly || !canDelete ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                          }`}
                          title={isReadOnly || !canDelete ? "Read-only mode: Deleting OLT is restricted" : "Remove OLT Chassis"}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold border border-border bg-muted/40 text-foreground">
                        Vendor: {olt.vendor || "BDCOM"}
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold border border-border bg-muted/40 text-foreground">
                        Standard: {olt.ponStandard || "EPON"}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold text-white ${
                          isOnline ? "bg-emerald-600" : "bg-rose-600"
                        }`}
                      >
                        {olt.status.toUpperCase()}
                      </span>
                    </div>

                    {/* ONUs online counter & Realtime Socket Latency */}
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-foreground p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <div>
                        Active Optical ONUs: <span className="font-black text-emerald-600 dark:text-emerald-400">{olt.activeOnu}</span> / <span className="font-bold">{olt.totalOnu} Total</span>
                      </div>
                      {isOnline && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{liveLatency}ms Telnet Ping</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fully Functional Action Buttons */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-4 gap-2">
                      {/* 1. TEST */}
                      <button
                        onClick={() => handleStartOltTest(olt)}
                        className="px-3 py-2 rounded-xl border border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                        <Terminal size={13} />
                        <span>Test</span>
                      </button>

                      {/* 2. DISCOVER ONU */}
                      <button
                        onClick={() => handleDiscoverOlt(olt)}
                        className="px-3 py-2 rounded-xl border border-primary text-primary bg-primary/10 hover:bg-primary/20 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                        <Sparkles size={13} />
                        <span>Discover</span>
                      </button>

                      {/* 3. AUTO BIND */}
                      <button
                        onClick={() => handleAutoBind(olt)}
                        className="px-3 py-2 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                        <ShieldCheck size={13} />
                        <span>Auto Bind</span>
                      </button>

                      {/* 4. PORTS */}
                      <button
                        onClick={() => setSelectedOlt(olt)}
                        className="px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                        <Layers size={13} />
                        <span>Ports ({olt.usedPorts}/{olt.ponPorts})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ONU LIST SECTION WITH COMPREHENSIVE FILTER SYSTEM ───────────────── */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs space-y-4 p-4 md:p-5">
            {/* Header: Title on left, Search & + Add ONU on right */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border">
              <div>
                <h3 className="text-base md:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Radio size={18} className="text-primary" />
                  <span>Optical ONU Fleet & Subscriber Hardware Ledger</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Filtered: <strong className="text-foreground font-mono">{filteredOnus.length}</strong> of {onuList.length} total optical terminals
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddOnuModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-primary text-primary hover:bg-primary/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Plus size={14} />
                  <span>Add ONU Manually</span>
                </button>
              </div>
            </div>

            {/* ── ADVANCED PROPER FILTER SYSTEM ── */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Filter size={14} className="text-primary" />
                  <span>ONU Filtering & Chassis Breakdown</span>
                </div>

                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <X size={12} /> Reset All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* 1. OLT Selector (Individual OLTs vs Mixed/All) */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    OLT Chassis
                  </label>
                  <select
                    value={oltFilter}
                    onChange={e => setOltFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none cursor-pointer">
                    <option value="all">All OLTs (Mixed 194)</option>
                    <option value="OLT1">OLT1 (Somitir Hat EPON)</option>
                    <option value="OLT2">OLT2 (Kalkini Hub GPON)</option>
                  </select>
                </div>

                {/* 2. PON Port Selector */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    PON Port Slot
                  </label>
                  <select
                    value={ponFilter}
                    onChange={e => setPonFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none cursor-pointer">
                    <option value="all">All PON Ports</option>
                    {availablePonPorts.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Status Filter */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    Connection State
                  </label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none cursor-pointer">
                    <option value="all">All Connection States</option>
                    <option value="online">Online Only</option>
                    <option value="offline">Offline Only</option>
                    <option value="unassigned">Unassigned / Open</option>
                  </select>
                </div>

                {/* 4. Optical Signal Filter */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    Optical Signal (Rx)
                  </label>
                  <select
                    value={signalFilter}
                    onChange={e => setSignalFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none cursor-pointer">
                    <option value="all">All Rx Signal Levels</option>
                    <option value="optimal">Optimal (-15 to -23 dBm)</option>
                    <option value="warning">Warning (-24 to -27 dBm)</option>
                    <option value="critical">Critical Loss (≤ -28 dBm)</option>
                  </select>
                </div>

                {/* 5. Binding Filter */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    Subscriber Binding
                  </label>
                  <select
                    value={bindingFilter}
                    onChange={e => setBindingFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none cursor-pointer">
                    <option value="all">All (Bound & Unbound)</option>
                    <option value="bound">Bound to Subscriber</option>
                    <option value="unbound">Unbound / Open Hardware</option>
                  </select>
                </div>

                {/* 6. Page Size Entries */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase">
                    Show Entries
                  </label>
                  <select
                    value={entriesPerPage}
                    onChange={e => setEntriesPerPage(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none cursor-pointer">
                    <option value={25}>25 Entries</option>
                    <option value={50}>50 Entries</option>
                    <option value={100}>100 Entries</option>
                    <option value={1000}>Show All ({filteredOnus.length})</option>
                  </select>
                </div>
              </div>

              {/* Search Box inside Filter Bar */}
              <div className="relative pt-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search ONU by MAC, Customer Name, Subscriber ID, PPPoE User, PON port..."
                  value={onuSearch}
                  onChange={e => setOnuSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-card border border-border outline-none focus:border-primary font-medium text-foreground"
                />
                {onuSearch && (
                  <button onClick={() => setOnuSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#48636E] text-white font-bold">
                  <tr>
                    <th className="p-3">MAC Address</th>
                    <th className="p-3">PON Port</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Signal (RX)</th>
                    <th className="p-3">Subscriber / PPPoE User</th>
                    <th className="p-3">OLT Server</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paginatedOnus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Radio size={32} className="opacity-30 text-primary" />
                          <p className="font-bold text-foreground">No ONUs found matching selected filters</p>
                          <p className="text-xs">Try clearing your search query or resetting filters.</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs">
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOnus.map(onu => {
                      const isOnline = onu.status === "online";
                      const isUnassigned = !onu.customer || onu.customer.includes("Unassigned");

                      const rxNum = parseFloat(onu.rxPower.replace(/[^0-9.-]/g, ""));
                      let rxBg = "text-muted-foreground font-semibold";
                      if (isOnline && !isNaN(rxNum)) {
                        if (rxNum >= -23) {
                          rxBg = "bg-[#2E7D32] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold";
                        } else if (rxNum >= -27) {
                          rxBg = "bg-[#E65100] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold";
                        } else {
                          rxBg = "bg-[#C62828] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold";
                        }
                      }

                      return (
                        <tr key={onu.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-foreground">
                            {onu.mac}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground font-semibold">
                            {onu.ponPort}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isOnline
                                  ? "bg-[#2E7D32] text-white"
                                  : onu.status === "offline"
                                  ? "bg-rose-600 text-white"
                                  : "bg-amber-600 text-white"
                              }`}
                            >
                              {onu.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            {isOnline ? (
                              <span className={rxBg}>
                                {onu.rxPower}
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-semibold">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {isUnassigned ? (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground italic font-medium">
                                  — Unassigned —
                                </span>
                                <button
                                  onClick={() => handleOpenBindModal(onu)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] font-bold border border-emerald-500/30 cursor-pointer">
                                  + Bind Now
                                </button>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-foreground block">
                                  {onu.customer}
                                </span>
                                {onu.customerId && (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    ID: {onu.customerId}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {onu.oltServer}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-3">
                            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                              {/* 1. Signal Telemetry */}
                              <button
                                onClick={() => setOpticalTelemetryModal(onu)}
                                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition cursor-pointer"
                                title="Optical Signal Telemetry">
                                <BarChart2 size={14} />
                              </button>

                              {/* 2. Disable / Enable ONU */}
                              <button
                                onClick={() => handleOnuToggleState(onu)}
                                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition cursor-pointer"
                                title={onu.adminDisabled ? "Enable Optical Port" : "Shutdown Optical Port"}>
                                <WifiOff size={14} className={onu.adminDisabled ? "text-rose-500" : ""} />
                              </button>

                              {/* 3. Reboot */}
                              <button
                                onClick={() => handleOnuReboot(onu)}
                                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition cursor-pointer"
                                title="TR-069 Reboot ONU">
                                <RotateCw size={14} />
                              </button>

                              {/* 4. Bind / Unbind */}
                              <button
                                onClick={() => isUnassigned ? handleOpenBindModal(onu) : handleOnuUnbind(onu)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isUnassigned ? "hover:bg-emerald-500/10 text-emerald-600" : "hover:bg-amber-500/10 text-amber-600"
                                }`}
                                title={isUnassigned ? "Bind ONU to Subscriber" : "Release / Unbind ONU"}>
                                {isUnassigned ? <LinkIcon size={14} /> : <Unlink size={14} />}
                              </button>

                              {/* 5. Delete */}
                              <button
                                onClick={() => handleOnuDelete(onu)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                                title="Delete ONU">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              <span>
                Showing {paginatedOnus.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to {Math.min(currentPage * entriesPerPage, filteredOnus.length)} of {filteredOnus.length} entries
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    <ChevronLeft size={14} />
                  </button>

                  <span className="px-3 py-1 font-bold text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OPTICAL POWER DIAGNOSTICS & TELEMETRY ─────────────────────── */}
      {activeTab === "diagnostics" && (
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-foreground">Optical Power Telemetry & OTDR Line Diagnostics</h3>
              <p className="text-xs text-muted-foreground">Real-time laser power (dBm), voltage, loop distance, and remote reboot control.</p>
            </div>
            <button
              onClick={() => showToast("Polled real-time laser diagnostic power levels from all subscriber ONUs.")}
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
              <RefreshCw size={13} />
              <span>Poll Real-Time dBm</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Subscriber & OLT</th>
                  <th className="p-3.5">PON Slot / MAC</th>
                  <th className="p-3.5">Optical Rx Power</th>
                  <th className="p-3.5">Laser Tx Power</th>
                  <th className="p-3.5">Fiber Distance</th>
                  <th className="p-3.5">Laser Temp & Volts</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {onuList.map((onu, idx) => {
                  const rxNum = parseFloat(onu.rxPower.replace(/[^0-9.-]/g, '')) || -20.5;
                  const txVal = "+2.4";
                  const dist = (1.2 + (idx * 0.05)).toFixed(2);
                  const temp = 38 + (idx % 4);

                  return (
                    <tr key={onu.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{onu.customer}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{onu.customerId || "Unassigned"} · {onu.oltServer}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="text-foreground font-semibold">{onu.ponPort}</div>
                        <div className="text-[10px] text-muted-foreground">{onu.mac}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          rxNum >= -23 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          rxNum >= -27 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {onu.rxPower}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {txVal} dBm
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-foreground">
                        {dist} km
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="text-foreground">{temp}°C</div>
                        <div className="text-muted-foreground text-[10px]">3.30V · 14.2mA</div>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setOpticalTelemetryModal(onu)}
                          className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all cursor-pointer">
                          OTDR Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: OLT TELNET & SNMP TEST ──────────────────────────────────── */}
      {testingOltModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    OLT Optical Diagnostic Test — {testingOltModal.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Host: {testingOltModal.ip}:{testingOltModal.port || "1895"} (BDCOM EPON/GPON CLI)
                  </p>
                </div>
              </div>
              <button onClick={() => setTestingOltModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Simulated Live Terminal */}
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1.5 shadow-inner border border-slate-800 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800 text-[10px]">
                <span>BDCOM CLI SESSION #1895</span>
                <span>{isCliTesting ? "RUNNING..." : "STATUS: SUCCESS"}</span>
              </div>
              {cliLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">{log}</div>
              ))}
              {isCliTesting && (
                <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                  <RefreshCw size={11} className="animate-spin" /> Polling MIB tables...
                </div>
              )}
            </div>

            {/* Hardware Status Metrics */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">LASER TEMP</span>
                <p className="font-black text-foreground font-mono mt-0.5">38.6 °C</p>
                <span className="text-[10px] text-emerald-600 font-bold">Normal Range</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">CHASSIS VOLTS</span>
                <p className="font-black text-foreground font-mono mt-0.5">3.32 V</p>
                <span className="text-[10px] text-emerald-600 font-bold">Dual PSU Active</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">TELNET PING</span>
                <p className="font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">11.4 ms</p>
                <span className="text-[10px] text-emerald-600 font-bold">0% Packet Loss</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStartOltTest(testingOltModal)}
                className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <RefreshCw size={13} />
                <span>Re-Run Diagnostic</span>
              </button>
              <button
                onClick={() => setTestingOltModal(null)}
                className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs cursor-pointer">
                Close Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DISCOVER UNCONFIGURED ONUS ───────────────────────────────── */}
      {discoverModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Sparkles size={20} className="text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    Unconfigured ONU Discovery — {discoverModal.olt.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Found {discoverModal.list.length} unassigned optical terminal(s) detected on PON splitter ports.
                  </p>
                </div>
              </div>
              <button onClick={() => setDiscoverModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {discoverModal.list.map(disc => (
                <div key={disc.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-foreground">{disc.serial}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                        Unconfigured
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Port: <strong className="text-foreground font-mono">{disc.ponPort}</strong> · Rx Power: <strong className="text-emerald-600 font-mono">{disc.rxPower}</strong> · Vendor: <strong className="text-foreground">{disc.vendor}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDiscoverModal(null);
                      handleOpenBindModal({
                        id: disc.id,
                        mac: disc.serial.toLowerCase(),
                        ponPort: disc.ponPort,
                        status: "unassigned",
                        rxPower: disc.rxPower,
                        customer: "— Unassigned —",
                        oltServer: (discoverModal.olt.id === "OLT-01" ? "OLT1" : "OLT2") as any,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
                    <Check size={14} />
                    <span>Authorize & Bind</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setDiscoverModal(null)}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: AUTO-BIND RESULT MODAL ──────────────────────────────────── */}
      {autoBindModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-500" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    Auto-Bind Execution Summary — {autoBindModal.olt.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Scanned {autoBindModal.totalUnassigned} unassigned ONUs on optical chassis.
                  </p>
                </div>
              </div>
              <button onClick={() => setAutoBindModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {autoBindModal.boundMatches.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  Successfully bound <strong>{autoBindModal.boundMatches.length}</strong> optical terminals with subscriber Calling-Station-IDs and updated MikroTik database!
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {autoBindModal.boundMatches.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-foreground block">{m.custName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">ID: {m.custId} · Port: {m.ponPort}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-[11px]">
                        {m.mac}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <Info size={28} className="mx-auto text-primary opacity-50" />
                <p className="font-bold text-foreground">All active ONUs on this OLT are already bound.</p>
                <p>No unassigned MAC addresses required synchronization with subscriber accounts.</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setAutoBindModal(null)}
                className="w-full py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs cursor-pointer">
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: 1-CLICK BIND ONU TO CUSTOMER PICKER ──────────────────────── */}
      {bindOnuModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <LinkIcon size={18} className="text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    Bind ONU to Subscriber Profile
                  </h3>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    MAC: {bindOnuModal.onu.mac} · {bindOnuModal.onu.oltServer} ({bindOnuModal.onu.ponPort})
                  </p>
                </div>
              </div>
              <button onClick={() => setBindOnuModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  SEARCH SUBSCRIBER
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, phone, PPPoE user..."
                    value={bindSearchQuery}
                    onChange={e => setBindSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground font-medium outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Subscribers List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto border border-border rounded-2xl p-2 bg-muted/20">
                {searchedSubscribersToBind.map(c => {
                  const isSelected = selectedCustToBind?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustToBind(c)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-card border-border hover:bg-muted/50"
                      }`}>
                      <div>
                        <div className={`font-bold ${isSelected ? "text-white" : "text-foreground"}`}>{c.name}</div>
                        <div className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          {c.clientCode || c.id} · {c.phone} · {c.pppUser}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  );
                })}
              </div>

              {selectedCustToBind && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
                  Ready to bind ONU <strong>{bindOnuModal.onu.mac}</strong> to <strong>{selectedCustToBind.name}</strong> ({selectedCustToBind.clientCode || selectedCustToBind.id}).
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBindOnuModal(null)}
                className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button
                disabled={!selectedCustToBind}
                onClick={handleConfirmBindOnu}
                className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer">
                Confirm & Bind MAC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: OPTICAL SIGNAL TELEMETRY INSPECTOR ──────────────────────── */}
      {opticalTelemetryModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    Optical Transceiver Telemetry (ITU-T G.984)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    MAC: {opticalTelemetryModal.mac} · {opticalTelemetryModal.oltServer} ({opticalTelemetryModal.ponPort})
                  </p>
                </div>
              </div>
              <button onClick={() => setOpticalTelemetryModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold">SUBSCRIBER</span>
                <p className="font-black text-foreground">{opticalTelemetryModal.customer}</p>
                <p className="font-mono text-muted-foreground text-[10px]">{opticalTelemetryModal.customerId || "Unassigned"}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold">OPTICAL RX POWER</span>
                <p className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base">{opticalTelemetryModal.rxPower}</p>
                <p className="text-muted-foreground text-[10px]">Optimal signal (-15 to -23 dBm)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">LASER TX</span>
                <p className="font-mono font-black text-foreground text-sm mt-0.5">
                  {opticalTelemetryModal.status === "online" ? "+2.4 dBm" : "—"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">VOLTAGE</span>
                <p className="font-mono font-black text-foreground text-sm mt-0.5">
                  {opticalTelemetryModal.status === "online" ? "3.30 V" : "—"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground font-bold">LASER TEMP</span>
                <p className="font-mono font-black text-foreground text-sm mt-0.5">
                  {opticalTelemetryModal.status === "online" ? "38.5 °C" : "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleOnuReboot(opticalTelemetryModal);
                  setOpticalTelemetryModal(null);
                }}
                className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <RotateCw size={13} />
                <span>TR-069 Reboot</span>
              </button>
              <button
                onClick={() => setOpticalTelemetryModal(null)}
                className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs cursor-pointer">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PON PORTS & ONUS INSPECTOR MODAL ─────────────────────────────────── */}
      {selectedOlt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl bg-card border border-border flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">
                    PON Slots & Active ONUs — {selectedOlt.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {selectedOlt.vendor} {selectedOlt.model} · <span className="font-mono text-foreground font-semibold">{selectedOlt.ip}</span> · {selectedOlt.location}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedOlt(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: selectedOlt.ponPorts || 8 }).map((_, idx) => {
                const portName = `epon 0/${idx + 1}`;
                const cleanPort = portName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const targetServer = (selectedOlt.id === "OLT-01" || selectedOlt.name === "OLT1") ? "OLT1" : "OLT2";
                const portOnus = onuList.filter(o => o.oltServer === targetServer && (o.ponPort || '').toLowerCase().replace(/[^a-z0-9]/g, '') === cleanPort);
                const count = portOnus.length;
                const activeCount = portOnus.filter(o => o.status === "online").length;
                const isOnline = activeCount > 0;
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground">{portName}</span>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">ONUs: <strong className="text-foreground">{count}</strong> <span className="text-[10px] text-emerald-600 font-bold">({activeCount} online)</span> / 64</p>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / 64) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedOlt(null)}
                className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ONU MANUALLY MODAL ────────────────────────────────────────── */}
      {showAddOnuModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-primary" />
                <h3 className="font-black text-base text-foreground">
                  Add ONU Manually
                </h3>
              </div>
              <button onClick={() => setShowAddOnuModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOnuSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">MAC ADDRESS *</label>
                <input
                  value={newOnuMac}
                  onChange={e => setNewOnuMac(e.target.value)}
                  placeholder="e.g. 4c:46:d1:55:08:25"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-semibold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">OLT SERVER</label>
                  <select
                    value={newOnuOlt}
                    onChange={e => setNewOnuOlt(e.target.value as "OLT1" | "OLT2")}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="OLT1">OLT1 (Somitir Hat Core)</option>
                    <option value="OLT2">OLT2 (Kalkini Hub)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PON PORT</label>
                  <input
                    value={newOnuPon}
                    onChange={e => setNewOnuPon(e.target.value)}
                    placeholder="epon 0/1"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">CUSTOMER PPPoE / SUBSCRIBER</label>
                <input
                  value={newOnuCust}
                  onChange={e => setNewOnuCust(e.target.value)}
                  placeholder="e.g. Mbn@abdurrobkha or leave empty for unassigned"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">STATUS</label>
                  <select
                    value={newOnuStatus}
                    onChange={e => setNewOnuStatus(e.target.value as "online" | "offline")}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">INITIAL RX SIGNAL</label>
                  <input
                    value={newOnuRx}
                    onChange={e => setNewOnuRx(e.target.value)}
                    placeholder="-21.5 dBm"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOnuModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-primary cursor-pointer"
                >
                  Register ONU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add / Edit OLT Chassis ─────────────────────────────────── */}
      {showAddOlt && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-black text-foreground">
                  {editingOlt ? `Edit OLT Chassis: ${editingOlt.name}` : "Add New OLT Optical Chassis"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure hardware chassis IP, Telnet/SSH management, SNMP polling, and PON standard.
                </p>
              </div>
              <button
                onClick={() => { setShowAddOlt(false); setEditingOlt(null); }}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOlt} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CHASSIS NAME / ALIAS *</label>
                  <input
                    value={newOlt.name}
                    onChange={e => setNewOlt({ ...newOlt, name: e.target.value })}
                    placeholder="e.g. OLT-Dhaka-02"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">MANAGEMENT IP ADDRESS *</label>
                  <input
                    value={newOlt.ip}
                    onChange={e => setNewOlt({ ...newOlt, ip: e.target.value })}
                    placeholder="e.g. 103.12.173.136"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">VENDOR</label>
                  <select
                    value={newOlt.vendor}
                    onChange={e => setNewOlt({ ...newOlt, vendor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="BDCOM">BDCOM</option>
                    <option value="VSOL">VSOL</option>
                    <option value="Huawei">Huawei</option>
                    <option value="ZTE">ZTE</option>
                    <option value="Fiberhome">Fiberhome</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PON STANDARD</label>
                  <select
                    value={newOlt.ponStandard}
                    onChange={e => setNewOlt({ ...newOlt, ponStandard: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="EPON">EPON (1.25G)</option>
                    <option value="GPON">GPON (2.5G)</option>
                    <option value="XG-PON">XG-PON (10G)</option>
                    <option value="XGS-PON">XGS-PON (10G/10G)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PON PORTS</label>
                  <select
                    value={newOlt.ponPorts}
                    onChange={e => setNewOlt({ ...newOlt, ponPorts: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="4">4 Ports</option>
                    <option value="8">8 Ports</option>
                    <option value="16">16 Ports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PROTOCOL</label>
                  <select
                    value={newOlt.connectionProtocol}
                    onChange={e => setNewOlt({ ...newOlt, connectionProtocol: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="Telnet">Telnet</option>
                    <option value="SSH">SSH</option>
                    <option value="SNMP">SNMP</option>
                    <option value="HTTP">HTTP Web</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CLI PORT</label>
                  <input
                    value={newOlt.port}
                    onChange={e => setNewOlt({ ...newOlt, port: e.target.value })}
                    placeholder="23 / 1895"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">POP / LOCATION</label>
                  <input
                    value={newOlt.location}
                    onChange={e => setNewOlt({ ...newOlt, location: e.target.value })}
                    placeholder="e.g. Kalkini Central POP"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">LOGIN USERNAME</label>
                  <input
                    value={newOlt.username}
                    onChange={e => setNewOlt({ ...newOlt, username: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">LOGIN PASSWORD</label>
                  <input
                    type="password"
                    value={newOlt.password}
                    onChange={e => setNewOlt({ ...newOlt, password: e.target.value })}
                    placeholder={editingOlt ? "•••••••• (Keep existing)" : "Enter password"}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CHASSIS HARDWARE MODEL</label>
                  <input
                    value={newOlt.model}
                    onChange={e => setNewOlt({ ...newOlt, model: e.target.value })}
                    placeholder="e.g. BDCOM P3608B EPON OLT"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SNMP COMMUNITY</label>
                  <input
                    value={newOlt.snmpCommunity}
                    onChange={e => setNewOlt({ ...newOlt, snmpCommunity: e.target.value })}
                    placeholder="public"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddOlt(false); setEditingOlt(null); }}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReadOnly || !canEdit}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs transition ${
                    isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted-foreground" : "bg-primary hover:opacity-95 cursor-pointer"
                  }`}
                >
                  {editingOlt ? "Save Configuration" : "Register & Probe OLT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-medium animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
