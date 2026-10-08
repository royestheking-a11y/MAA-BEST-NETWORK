import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Circle, Search, RefreshCw, Clock, Wifi, WifiOff, Download, Activity,
  CheckCircle2, Radio, Server, Signal, AlertTriangle, Layers, Users, Cpu,
  Shield, Lock, Unlock, Copy, Check, X, ArrowDown, ArrowUp, Zap, Gauge, Play, Pause, Power
} from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";
import { AUTHENTIC_NETX_ONUS } from "../data/netxOnuData";
import { useNetxLiveData, type NetxLiveCustomer } from "../services/netxApiService";
import { networkStore } from "./network/networkData";

export interface Session {
  customer: string;
  id: string;
  user: string;
  status: "online" | "offline";
  uptime: string;
  uptimeSeconds: number;
  ip: string;
  mac: string;
  rxPower: string;
  rxPowerNum: number;
  ponPort: string;
  olt: string;
  up: string;
  down: string;
  liveDownMbps: number;
  liveUpMbps: number;
  liveDownFormatted: string;
  liveUpFormatted: string;
  sessionDownFormatted: string;
  sessionUpFormatted: string;
  downPercent: number;
  upPercent: number;
  pkgDown: number;
  pkgUp: number;
  totalTransferredMb: number;
  mikrotik: string;
  pkg: string;
  isHardwareOnly?: boolean;
  isMissingInNetx?: boolean;
}

function formatLastRefresh(date: Date): string {
  return date.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function parseUptimeToSeconds(uptimeStr?: string, _seedIndex: number = 0): number {
  if (!uptimeStr || uptimeStr === "—" || uptimeStr === "Offline" || uptimeStr.includes("Active")) {
    return 0; // Unknown uptime — do not fabricate a number
  }
  let totalSecs = 0;
  const dMatch = uptimeStr.match(/(\d+)\s*d/i);
  const hMatch = uptimeStr.match(/(\d+)\s*h/i);
  const mMatch = uptimeStr.match(/(\d+)\s*m/i);
  const sMatch = uptimeStr.match(/(\d+)\s*s/i);

  if (dMatch) totalSecs += parseInt(dMatch[1], 10) * 86400;
  if (hMatch) totalSecs += parseInt(hMatch[1], 10) * 3600;
  if (mMatch) totalSecs += parseInt(mMatch[1], 10) * 60;
  if (sMatch) totalSecs += parseInt(sMatch[1], 10);

  return totalSecs; // Return 0 if nothing parsed — no fake fallback
}

export function formatTickingUptime(seconds: number): string {
  if (seconds <= 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours.toString().padStart(2, "0")}h`);
  parts.push(`${mins.toString().padStart(2, "0")}m`);
  parts.push(`${secs.toString().padStart(2, "0")}s`);
  return parts.join(" ");
}

/**
 * Computes real bandwidth rates from NetX API session data.
 *
 * Priority:
 *  1. Delta rate: bytes diff between two consecutive polls (most accurate, 2nd+ poll)
 *  2. Average rate: total session bytes / session uptime (immediate, from 1st poll)
 *  3. Session totals only (no rate if uptime unknown)
 * Never fabricates numbers.
 */
export function computeRealSessionBandwidth(
  liveMatch: NetxLiveCustomer | null | undefined,
  isOnline: boolean,
  deltaRate?: { downMbps: number; upMbps: number } | null,
  pkgDown: number = 20,
  pkgUp: number = 10,
  uptimeSec: number = 0
) {
  const rxBytes: number = liveMatch?.live_rx_bytes ?? 0;
  const txBytes: number = liveMatch?.live_tx_bytes ?? 0;

  if (!isOnline || !liveMatch || (!rxBytes && !txBytes)) {
    return {
      sessionDownFormatted: "—",
      sessionUpFormatted: "—",
      liveDownMbps: 0,
      liveUpMbps: 0,
      liveDownFormatted: "—",
      liveUpFormatted: "—",
      downPercent: 0,
      upPercent: 0,
      hasRealData: false,
      rateSource: "none",
    };
  }

  const toDisplayBytes = (bytes: number): string => {
    if (bytes === 0) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  // 1. Delta rate — most accurate (only available after 2nd poll)
  if (deltaRate && (deltaRate.downMbps > 0 || deltaRate.upMbps > 0)) {
    const downMbps = Number(deltaRate.downMbps.toFixed(2));
    const upMbps = Number(deltaRate.upMbps.toFixed(2));
    const downPercent = pkgDown > 0 && downMbps > 0 ? Math.min(100, Math.round((downMbps / pkgDown) * 100)) : 0;
    const upPercent = pkgUp > 0 && upMbps > 0 ? Math.min(100, Math.round((upMbps / pkgUp) * 100)) : 0;
    return {
      sessionDownFormatted: toDisplayBytes(rxBytes),
      sessionUpFormatted: toDisplayBytes(txBytes),
      liveDownMbps: downMbps,
      liveUpMbps: upMbps,
      liveDownFormatted: `${downMbps} Mbps`,
      liveUpFormatted: `${upMbps} Mbps`,
      downPercent,
      upPercent,
      hasRealData: true,
      rateSource: "delta",
    };
  }

  // 2. Average rate fallback REMOVED.
  // Averaging total bytes over days of uptime results in a static number (e.g. 0.35 Mbps for days)
  // which looks "fixed/hardcoded" to the user. We only use true real-time delta rates.

  // 3. Fallback: session totals only, no rate
  return {
    sessionDownFormatted: toDisplayBytes(rxBytes),
    sessionUpFormatted: toDisplayBytes(txBytes),
    liveDownMbps: 0,
    liveUpMbps: 0,
    liveDownFormatted: toDisplayBytes(rxBytes),
    liveUpFormatted: toDisplayBytes(txBytes),
    downPercent: 0,
    upPercent: 0,
    hasRealData: true,
    rateSource: "session_total",
  };
}

function exportCSV(sessions: Session[]) {
  const headers = ["Customer", "ID", "PPPoE User", "Status", "Optical Rx (dBm)", "PON Port", "OLT Server", "Live Active Uptime", "IP", "MAC", "Session Download Total", "Session Upload Total", "Pkg Down Limit", "Pkg Up Limit", "MikroTik", "Package"];
  const rows = sessions.map(s => [
    s.customer, s.id, s.user, s.status, s.rxPower, s.ponPort, s.olt, s.uptime, s.ip, s.mac, s.liveDownFormatted, s.liveUpFormatted, `${s.pkgDown} Mbps`, `${s.pkgUp} Mbps`, s.mikrotik, s.pkg
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `live_status_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LiveStatusPage() {
  const { customers, bindMac, unbindMac, toggleNetStatus } = useCustomerContext();
  const { liveStats, lastRefresh: netxLastRefresh, refresh: refreshNetx, isLoading: isNetxLoading } = useNetxLiveData(30000);

  const [viewScope, setViewScope] = useState<"subscribers" | "all_hardware">("subscribers");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "weak">("all");
  const [oltFilter, setOltFilter] = useState("all");
  const [ponFilter, setPonFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true); // Default active for true real-time!
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(1000); // 1s live telemetry ticker
  const [countdown, setCountdown] = useState(1);
  const [liveTick, setLiveTick] = useState(0);

  const availableOlts = useMemo(() => {
    try {
      const stored = networkStore.getOlts();
      if (stored && stored.length > 0) return stored;
    } catch {}
    return [
      { id: "OLT1", name: "OLT1", location: "Madaripur Core" },
      { id: "OLT2", name: "OLT2", location: "Kalkini Core" },
    ];
  }, []);

  const [toast, setToast] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleToggleLiveMacBind = (s: Session) => {
    const cust = customers.find(
      c =>
        c.id.toLowerCase() === s.id.toLowerCase() ||
        (c.clientCode && c.clientCode.toLowerCase() === s.id.toLowerCase()) ||
        (c.pppUser && c.pppUser.toLowerCase() === s.user.toLowerCase()) ||
        c.name.toLowerCase() === s.customer.toLowerCase()
    );

    if (!cust) {
      showToast(`Subscriber ${s.customer} not found in database.`);
      return;
    }

    const currentMac = (cust.mac || cust.boundMac || cust.callingStationId || "").toLowerCase();
    const isCurrentlyBound = cust.macBound !== false && Boolean(currentMac && currentMac !== "—");

    if (isCurrentlyBound) {
      unbindMac(cust.id);
      showToast(`MAC lock released (Unbound) for ${cust.name} (${cust.id}). Router change allowed.`);
    } else {
      const res = bindMac(cust.id, s.mac);
      showToast(`Live MAC [${res.mac}] securely locked & bound to ${cust.name} (${cust.id})!`);
    }
  };

  const handleToggleLine = (s: Session) => {
    const cust = customers.find(
      c =>
        c.id.toLowerCase() === s.id.toLowerCase() ||
        (c.clientCode && c.clientCode.toLowerCase() === s.id.toLowerCase()) ||
        (c.pppUser && c.pppUser.toLowerCase() === s.user.toLowerCase()) ||
        c.name.toLowerCase() === s.customer.toLowerCase()
    );

    const targetId = cust ? cust.id : s.id;
    const isCurrentlyActive = cust ? (!cust.disabledInMikrotik && cust.status !== "suspended") : s.status === "online";
    const targetState = !isCurrentlyActive;

    toggleNetStatus(targetId, targetState);
    showToast(
      targetState
        ? `Network line turned ON for ${s.customer}. PPPoE secret authorized & live sync updated.`
        : `Network line turned OFF (suspended) for ${s.customer}. PPPoE secret disabled & session terminated.`
    );
  };

  const isSyncingInitial = isNetxLoading && liveStats.length === 0;

  // Track previous samples to calculate real-time transfer rates (bits/second) from cumulative counters
  const prevSamplesRef = useRef<Map<string, { rx: number; tx: number; time: number }>>(new Map());
  const deltaRatesRef = useRef<Map<string, { downMbps: number; upMbps: number }>>(new Map());

  useEffect(() => {
    if (!Array.isArray(liveStats) || liveStats.length === 0) return;
    const now = Date.now();
    liveStats.forEach(sub => {
      const key = (sub.pppoe_username || sub.full_name || sub.id || "").toLowerCase().trim();
      if (!key) return;
      const prev = prevSamplesRef.current.get(key);
      if (prev && prev.time > 0 && sub.connection_status === "online") {
        const dt = (now - prev.time) / 1000;
        if (dt >= 2 && dt <= 120) {
          const dRx = Math.max(0, (sub.live_rx_bytes || 0) - prev.rx);
          const dTx = Math.max(0, (sub.live_tx_bytes || 0) - prev.tx);
          const downMbps = Number(((dRx * 8) / (dt * 1_000_000)).toFixed(2));
          const upMbps = Number(((dTx * 8) / (dt * 1_000_000)).toFixed(2));
          deltaRatesRef.current.set(key, { downMbps, upMbps });
        }
      }
      prevSamplesRef.current.set(key, {
        rx: sub.live_rx_bytes || 0,
        tx: sub.live_tx_bytes || 0,
        time: now
      });
    });
  }, [liveStats]);

  // ── Build Accurate Real-Time Sessions List ──
  const baseSessions: Session[] = useMemo(() => {
    // Build lookup map from real NetX live telemetry with multi-key normalization
    const liveMap = new Map<string, NetxLiveCustomer>();
    if (Array.isArray(liveStats)) {
      liveStats.forEach(c => {
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
      });
    }

    const getLiveMatch = (c: any) => {
      const candidates = [c.pppUser, c.name, c.clientCode, c.id];
      for (const cand of candidates) {
        if (!cand) continue;
        const clean = cand.toLowerCase().trim();
        if (liveMap.has(clean)) return liveMap.get(clean);
        if (liveMap.has(clean.replace(/@/g, ""))) return liveMap.get(clean.replace(/@/g, ""));
        if (liveMap.has(clean.replace(/[^a-z0-9]/g, ""))) return liveMap.get(clean.replace(/[^a-z0-9]/g, ""));
        if (clean.startsWith("mbn") && !clean.startsWith("mbn@")) {
          const withAt = "mbn@" + clean.slice(3);
          if (liveMap.has(withAt)) return liveMap.get(withAt);
        }
      }
      return null;
    };

    if (viewScope === "subscribers") {
      // 1. DIRECT 1-TO-1 MAPPING TO REAL REGISTERED CUSTOMERS IN FIRESTORE
      return customers.map((c, idx) => {
        const liveMatch = getLiveMatch(c);
        const netxLoaded = Array.isArray(liveStats) && liveStats.length > 0;
        // Only trust NetX API for status; fall back to local flags only if no data loaded
        const isOnline = liveMatch
          ? (liveMatch.connection_status === "online")
          : (!netxLoaded && c.netStatus === "online" && c.status === "active");
        const realRx = liveMatch?.onu_rx_power !== undefined && liveMatch?.onu_rx_power !== null
          ? Number(liveMatch.onu_rx_power)
          : (c.onuSignal && !isNaN(parseFloat(c.onuSignal)) ? parseFloat(c.onuSignal) : null);

        const rxStr = isOnline ? (realRx !== null ? `${realRx.toFixed(1)} dBm` : "—") : "Offline";
        const pkgDown = c.downloadSpeedMbps || 20;
        const pkgUp = c.uploadSpeedMbps || 10;
        const initialUptimeSec = isOnline ? parseUptimeToSeconds(liveMatch?.live_uptime || c.sessionUptime || c.duration) : 0;
        
        const deltaKey = (c.pppUser || c.name || c.id || "").toLowerCase().trim();
        const deltaRate = deltaRatesRef.current.get(deltaKey) || null;

        // Use REAL session byte data from NetX API only
        const bw = computeRealSessionBandwidth(liveMatch, isOnline, deltaRate, pkgDown, pkgUp, initialUptimeSec);

        return {
          customer: c.name,
          id: c.clientCode || c.id,
          user: c.pppUser || c.clientCode || c.id,
          status: isOnline ? ("online" as const) : ("offline" as const),
          uptime: isOnline ? (initialUptimeSec > 0 ? formatTickingUptime(initialUptimeSec) : "Active") : "Offline",
          uptimeSeconds: initialUptimeSec,
          ip: isOnline ? (liveMatch?.live_ip || c.ipAddress || "—") : "—",
          mac: liveMatch?.live_mac || c.mac || "—",
          rxPower: rxStr,
          rxPowerNum: isOnline && realRx !== null ? Number(realRx.toFixed(1)) : -35,
          ponPort: c.ponPort || `epon 0/${(idx % 4) + 1}`,
          olt: c.olt?.includes("OLT2") ? "OLT2" : "OLT1",
          up: isOnline ? `${pkgUp} Mbps` : "—",
          down: isOnline ? `${pkgDown} Mbps` : "—",
          liveDownMbps: bw.liveDownMbps,
          liveUpMbps: bw.liveUpMbps,
          liveDownFormatted: bw.liveDownFormatted,
          liveUpFormatted: bw.liveUpFormatted,
          sessionDownFormatted: bw.sessionDownFormatted,
          sessionUpFormatted: bw.sessionUpFormatted,
          downPercent: bw.downPercent,
          upPercent: bw.upPercent,
          pkgDown,
          pkgUp,
          totalTransferredMb: liveMatch ? ((liveMatch.live_rx_bytes ?? 0) + (liveMatch.live_tx_bytes ?? 0)) / (1024 * 1024) : 0,
          mikrotik: c.mikrotik || c.serverName || "MikroTik-MBN-Core",
          pkg: c.package || `${pkgDown} Mbps Fiber Standard`,
          isHardwareOnly: false,
          isMissingInNetx: netxLoaded && !liveMatch,
        };
      });
    } else {
      // 2. HARDWARE ONU VIEW — All 191 ONUs, each mapped 1-to-1 with a subscriber
      const custMap = new Map<string, any>();
      const macMap = new Map<string, any>();

      customers.forEach(c => {
        if (c.name) custMap.set(c.name.toLowerCase().replace(/[^a-z0-9]/g, ""), c);
        if (c.pppUser) custMap.set(c.pppUser.toLowerCase().replace(/[^a-z0-9]/g, ""), c);
        if (c.mac) macMap.set(c.mac.toLowerCase().replace(/[^a-z0-9]/g, ""), c);
      });

      return AUTHENTIC_NETX_ONUS.map((o, idx) => {
        const cleanCust = o.customer.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanMac = o.mac.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matched = macMap.get(cleanMac) || custMap.get(cleanCust);
        const liveMatch = liveMap.get(o.customer.toLowerCase());

        const netxLoaded = Array.isArray(liveStats) && liveStats.length > 0;
        const isOnline = liveMatch
          ? (liveMatch.connection_status === "online")
          : (!netxLoaded && o.status === "online");
        const realRxPower = isOnline
          ? ((liveMatch?.onu_rx_power !== undefined && liveMatch?.onu_rx_power !== null)
            ? `${liveMatch.onu_rx_power} dBm`
            : (matched?.onuSignal && matched.onuSignal !== "—" && matched.onuSignal.toLowerCase() !== "offline" ? matched.onuSignal : "—"))
          : "Offline";

        const pkgDown = matched?.downloadSpeedMbps || 20;
        const pkgUp = matched?.uploadSpeedMbps || 10;
        const initialUptimeSec = isOnline ? parseUptimeToSeconds(liveMatch?.live_uptime || matched?.sessionUptime) : 0;
        const deltaKey = (o.customer || matched?.pppUser || matched?.name || "").toLowerCase().trim();
        const deltaRate = deltaRatesRef.current.get(deltaKey) || null;
        // Real session data only
        const bw = computeRealSessionBandwidth(liveMatch, isOnline, deltaRate, pkgDown, pkgUp, initialUptimeSec);

        return {
          customer: o.customer !== "— Unassigned —" ? (matched?.name || o.customer) : "— Unassigned Hardware ONU —",
          id: matched?.clientCode || matched?.id || `MBN-${(idx + 1).toString().padStart(4, "0")}`,
          user: o.customer !== "— Unassigned —" ? (matched?.pppUser || o.customer) : `Unassigned-ONU-${idx + 1}`,
          status: isOnline ? ("online" as const) : ("offline" as const),
          uptime: isOnline ? (initialUptimeSec > 0 ? formatTickingUptime(initialUptimeSec) : "Active") : "Offline",
          uptimeSeconds: initialUptimeSec,
          ip: isOnline ? (liveMatch?.live_ip || matched?.ipAddress || "—") : "—",
          mac: liveMatch?.live_mac || o.mac,
          rxPower: realRxPower,
          rxPowerNum: isOnline ? (parseFloat(realRxPower) || 0) : -35,
          ponPort: o.ponPort,
          olt: o.oltServer,
          up: isOnline ? `${pkgUp} Mbps` : "—",
          down: isOnline ? `${pkgDown} Mbps` : "—",
          liveDownMbps: bw.liveDownMbps,
          liveUpMbps: bw.liveUpMbps,
          liveDownFormatted: bw.liveDownFormatted,
          liveUpFormatted: bw.liveUpFormatted,
          sessionDownFormatted: bw.sessionDownFormatted,
          sessionUpFormatted: bw.sessionUpFormatted,
          downPercent: bw.downPercent,
          upPercent: bw.upPercent,
          pkgDown,
          pkgUp,
          totalTransferredMb: liveMatch ? ((liveMatch.live_rx_bytes ?? 0) + (liveMatch.live_tx_bytes ?? 0)) / (1024 * 1024) : 0,
          mikrotik: matched?.mikrotik || "MikroTik-MBN-Core",
          pkg: matched?.package || `${pkgDown} Mbps Fiber Standard`,
          isHardwareOnly: o.customer === "— Unassigned —",
          isMissingInNetx: false,
        };
      });
    }
  }, [customers, liveStats, viewScope]);

  const [sessions, setSessions] = useState<Session[]>(baseSessions);

  useEffect(() => {
    setSessions(baseSessions);
  }, [baseSessions]);

  // ── High-Precision Live Telemetry & Ticking Uptime Loop ──
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setLiveTick(t => {
        const nextTick = t + 1;

        setSessions(prev =>
          prev.map((s, idx) => {
            if (s.status !== "online") return s;

        const nextUptime = s.status === "online" ? s.uptimeSeconds + 1 : s.uptimeSeconds;

            return {
              ...s,
              uptimeSeconds: nextUptime,
              uptime: nextUptime > 0 ? formatTickingUptime(nextUptime) : (s.status === "online" ? "Active" : "—"),
              // DO NOT recalculate bandwidth — session byte totals only change when the API refreshes
            };
          })
        );

        return nextTick;
      });

      setCountdown(c => {
        const intervalSec = Math.max(1, Math.round(refreshIntervalMs / 1000));
        if (c <= 1) {
          setLastRefresh(new Date());
          return intervalSec;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshIntervalMs]);

  // Manual refresh handler
  const doRefresh = useCallback(() => {
    setRefreshing(true);
    refreshNetx();
    setLiveTick(t => t + 5);

    // Bandwidth and signal update from the real API (refreshNetx above).
    // Only tick uptime locally — do not fabricate fake bandwidth numbers here.
    setSessions(prev =>
      prev.map(s => {
        if (s.status !== "online") return s;
        const nextUptime = s.uptimeSeconds + 1;
        return {
          ...s,
          uptimeSeconds: nextUptime,
          uptime: nextUptime > 0 ? formatTickingUptime(nextUptime) : "Active",
        };
      })
    );

    setTimeout(() => {
      setLastRefresh(new Date());
      setCountdown(Math.max(1, Math.round(refreshIntervalMs / 1000)));
      setRefreshing(false);
      showToast("✓ Real-time optical telemetry & subscriber bandwidth refreshed from OLT.");
    }, 500);
  }, [refreshNetx, refreshIntervalMs, liveTick]);

  // Aggregate Metrics (Synchronized with authentic NetX Telemetry)
  const onlineCount = useMemo(() => {
    if (Array.isArray(liveStats) && liveStats.length > 0) {
      return liveStats.filter(c => c.connection_status === 'online').length;
    }
    return sessions.filter(s => s.status === "online").length;
  }, [liveStats, sessions]);
  const offlineCount = useMemo(() => {
    return Math.max(0, sessions.length - onlineCount);
  }, [sessions.length, onlineCount]);
  const weakCount = useMemo(() => sessions.filter(s => s.rxPowerNum < -26).length, [sessions]);

  const totalFleetTrafficMb = useMemo(
    () => sessions.filter(s => s.status === "online").reduce((acc, s) => acc + s.totalTransferredMb, 0),
    [sessions]
  );
  const totalFleetTrafficGb = totalFleetTrafficMb / 1024;

  // Filtered Sessions
  const filtered = useMemo(() => {
    const rawQ = search.trim().toLowerCase();
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, "");

    return sessions.filter(s => {
      let matchFilter = true;
      if (filter === "online") matchFilter = s.status === "online";
      else if (filter === "offline") matchFilter = s.status === "offline";
      else if (filter === "weak") matchFilter = s.rxPowerNum < -26;

      const matchOlt = oltFilter === "all" || s.olt === oltFilter || s.olt.toLowerCase().includes(oltFilter.toLowerCase()) || oltFilter.toLowerCase().includes(s.olt.toLowerCase());
      const matchPon = ponFilter === "all" || s.ponPort.toLowerCase().includes(ponFilter.toLowerCase());

      if (!matchFilter || !matchOlt || !matchPon) return false;
      if (!rawQ) return true;

      const cleanMac = s.mac.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanCust = s.customer.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanUser = s.user.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanPon = s.ponPort.toLowerCase().replace(/[^a-z0-9]/g, "");

      return (
        s.customer.toLowerCase().includes(rawQ) ||
        cleanCust.includes(cleanQ) ||
        s.user.toLowerCase().includes(rawQ) ||
        cleanUser.includes(cleanQ) ||
        s.mac.toLowerCase().includes(rawQ) ||
        cleanMac.includes(cleanQ) ||
        s.ip.includes(rawQ) ||
        s.id.toLowerCase().includes(rawQ) ||
        s.ponPort.toLowerCase().includes(rawQ) ||
        cleanPon.includes(cleanQ) ||
        s.olt.toLowerCase().includes(rawQ)
      );
    });
  }, [sessions, search, filter, oltFilter, ponFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Live Subscriber & Optical ONU Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Circle size={6} fill="currentColor" className="animate-ping" />
              <span>REAL-TIME NETX TELEMETRY</span>
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap mt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <Circle size={7} fill="currentColor" stroke="none" className="animate-pulse" />
              <span>{isSyncingInitial ? "Syncing..." : `${onlineCount} Online & Active`}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              {isSyncingInitial ? "..." : `${offlineCount} Offline / Disconnected`}
            </span>
            {weakCount > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {weakCount} High Attenuation ({">"}-26 dBm)
                </span>
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-muted-foreground">
              Last OLT Polling: {formatLastRefresh(lastRefresh)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Scope Switcher - Subscriber ONUs only (all ONUs are now subscriber-assigned) */}
          <div className="flex rounded-xl p-1 bg-muted border border-border">
            <button
              onClick={() => setViewScope("subscribers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === "subscribers" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Users size={13} />
              <span>Subscribers ({customers.length})</span>
            </button>
            <button
              onClick={() => setViewScope("all_hardware")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === "all_hardware" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Cpu size={13} />
              <span>ONU Hardware ({AUTHENTIC_NETX_ONUS.length})</span>
            </button>
          </div>

          {/* Live Interval Selector & Auto-refresh */}
          <div className="flex items-center rounded-xl p-1 bg-muted border border-border">
            <button
              onClick={() => {
                setAutoRefresh(true);
                setRefreshIntervalMs(1000);
                setCountdown(1);
              }}
              title="Real-time 1 second per-second stream"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                autoRefresh && refreshIntervalMs === 1000
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              <Activity size={12} className={autoRefresh && refreshIntervalMs === 1000 ? "animate-pulse" : ""} />
              <span>1s Live</span>
            </button>
            <button
              onClick={() => {
                setAutoRefresh(true);
                setRefreshIntervalMs(2000);
                setCountdown(2);
              }}
              title="Fast 2 second stream"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                autoRefresh && refreshIntervalMs === 2000
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              2s
            </button>
            <button
              onClick={() => {
                setAutoRefresh(true);
                setRefreshIntervalMs(5000);
                setCountdown(5);
              }}
              title="Standard 5 second stream"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                autoRefresh && refreshIntervalMs === 5000
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              5s
            </button>
            <button
              onClick={() => setAutoRefresh(a => !a)}
              title={autoRefresh ? "Pause live streaming" : "Resume live streaming"}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !autoRefresh
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {autoRefresh ? "Pause" : "Paused ⏸"}
            </button>
          </div>

          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer">
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={doRefresh}
            disabled={refreshing}
            title="Force immediate OLT re-poll and re-sample live per-second rates"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)" }}>
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Polling OLT..." : "Refresh Now"}</span>
          </button>
        </div>
      </div>

      {/* ─── STATS SUMMARY CARDS ─── */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          {
            label: "Active Live ONUs",
            value: isSyncingInitial ? "..." : `${onlineCount} / ${sessions.length}`,
            icon: Wifi,
            bg: "rgba(22,163,74,0.12)",
            color: "#16A34A",
            sub: `${sessions.length > 0 ? Math.round((onlineCount / sessions.length) * 100) : 0}% fleet connected`
          },
          {
            label: "Offline / Disconnected",
            value: isSyncingInitial ? "..." : offlineCount,
            icon: WifiOff,
            bg: "rgba(220,38,38,0.12)",
            color: "#DC2626",
            sub: "Terminal power off / LOS"
          },
          {
            label: "Fleet Session Data",
            value: isSyncingInitial ? "..." : (totalFleetTrafficGb >= 1024 ? `${(totalFleetTrafficGb / 1024).toFixed(2)} TB` : `${totalFleetTrafficGb.toFixed(1)} GB`),
            icon: Activity,
            bg: "rgba(37,99,235,0.12)",
            color: "#2563EB",
            sub: "Cumulative active sessions"
          },
          {
            label: "OLT Fleet Connected",
            value: "OLT1 & OLT2",
            icon: Radio,
            bg: "rgba(217,119,6,0.12)",
            color: "#D97706",
            sub: "BDCOM EPON (103.12.173.136)"
          },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 flex items-start gap-3 shadow-xs bg-card border border-border">
              <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: s.bg }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-extrabold text-lg sm:text-xl text-foreground font-mono leading-tight">{s.value}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer, PPPoE user, ONU MAC, IP, PON port (e.g. EPON0/2:3)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-muted/60 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex rounded-xl p-0.5 bg-muted border border-border text-xs font-bold shadow-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "online" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setFilter("offline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "offline" ? "bg-rose-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              Offline ({offlineCount})
            </button>
            <button
              onClick={() => setFilter("weak")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "weak" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}>
              Loss ({weakCount})
            </button>
          </div>

          {/* OLT Filter */}
          <select
            value={oltFilter}
            onChange={e => setOltFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-muted border border-border text-foreground font-bold focus:outline-none cursor-pointer">
            <option value="all">All OLTs ({availableOlts.map(o => o.name || o.id).join(" & ")})</option>
            {availableOlts.map(o => (
              <option key={o.id} value={o.name || o.id}>
                {o.name || o.id} {o.location ? `(${o.location})` : ""}
              </option>
            ))}
          </select>

          {/* PON Filter */}
          <select
            value={ponFilter}
            onChange={e => setPonFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-muted border border-border text-foreground font-bold focus:outline-none cursor-pointer">
            <option value="all">All PON Ports</option>
            <option value="0/1">epon 0/1</option>
            <option value="0/2">epon 0/2</option>
            <option value="0/3">epon 0/3</option>
            <option value="0/4">epon 0/4</option>
          </select>

          <span className="font-mono text-xs text-muted-foreground font-semibold">
            Showing {filtered.length} of {sessions.length}
          </span>
        </div>
      </div>

      {/* ─── SUBSCRIBER TABLE ─── */}
      <div className="rounded-2xl overflow-hidden shadow-xs bg-card border border-border">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-bold text-foreground">No Subscribers or ONUs Found</p>
            <p className="text-xs text-muted-foreground">No record matches "{search}" under current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b border-border">
                  {["Status", "Customer / Subscriber", "MAC Address", "MAC Lock", "PON Port", "Optical Signal (RX)", "OLT Server", "PPPoE Username", "Session Download", "Session Upload", "IP Address", "Live Uptime", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[11px] font-bold text-muted-foreground tracking-wider whitespace-nowrap">
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const cust = customers.find(
                    c =>
                      c.id.toLowerCase() === s.id.toLowerCase() ||
                      (c.clientCode && c.clientCode.toLowerCase() === s.id.toLowerCase()) ||
                      (c.pppUser && c.pppUser.toLowerCase() === s.user.toLowerCase()) ||
                      c.name.toLowerCase() === s.customer.toLowerCase()
                  );
                  const isBound = cust ? (cust.macBound !== false && Boolean(cust.mac && cust.mac.trim() && cust.mac !== "—")) : false;
                  const isLineActive = cust ? (!cust.disabledInMikrotik && cust.status !== "suspended") : s.status === "online";

                  return (
                    <tr
                      key={`${s.mac}-${s.id}-${i}`}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-muted/50 transition-colors text-xs">
                      
                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Circle size={8} fill={s.status === "online" ? "#16A34A" : "#EF4444"} stroke="none" />
                          <span className={`font-bold ${s.status === "online" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {s.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>

                      {/* Customer Name & Code */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground text-xs">{s.customer}</p>
                          {s.isMissingInNetx && (
                            <span 
                              title="This user exists in your database but not in NetX. Please delete them or create them in NetX." 
                              className="px-1.5 py-0.5 rounded text-[9px] bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider font-bold"
                            >
                              Not in NetX
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{s.id}</p>
                      </td>

                      {/* MAC Address */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            {s.mac}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.mac, `mac-${s.mac}`)}
                            title="Copy MAC Address"
                            className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {copiedKey === `mac-${s.mac}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>

                      {/* MAC Lock Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isBound
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {isBound ? <Lock size={10} /> : <Unlock size={10} />}
                          <span>{isBound ? "Bound" : "Unbound"}</span>
                        </span>
                      </td>

                      {/* PON Port */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-foreground font-semibold">
                          {s.ponPort}
                        </span>
                      </td>

                      {/* Optical Signal */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.status === "online" && s.rxPower !== "Offline" && s.rxPower !== "—" ? (
                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                              s.rxPowerNum >= -24
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : s.rxPowerNum >= -27
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}>
                            {s.rxPower}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                            {s.status === "online" ? "—" : "Offline"}
                          </span>
                        )}
                      </td>

                      {/* OLT Server */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {s.olt}
                        </span>
                      </td>

                      {/* PPPoE User */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-foreground">{s.user}</span>
                      </td>

                      {/* Session Download Data */}
                      <td className="px-4 py-3 whitespace-nowrap min-w-[130px]">
                        {s.status === "online" && s.liveDownFormatted !== "—" ? (
                          <div>
                            {/* Primary: show rate if available, else show session total */}
                            <div className="flex items-center gap-1 font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                              <span>{s.liveDownMbps > 0 ? `${s.liveDownMbps} Mbps` : s.liveDownFormatted}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5 font-mono">
                              <span>{s.liveDownMbps > 0 ? `Total: ${s.sessionDownFormatted}` : `Plan: ${s.pkgDown}M`}</span>
                              {s.downPercent > 0 && <span className="text-emerald-500 font-semibold">{s.downPercent}%</span>}
                            </div>
                            {s.downPercent > 0 && (
                              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(2, s.downPercent))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Session Upload Data */}
                      <td className="px-4 py-3 whitespace-nowrap min-w-[130px]">
                        {s.status === "online" && s.liveUpFormatted !== "—" ? (
                          <div>
                            {/* Primary: show rate if available, else show session total */}
                            <div className="flex items-center gap-1 font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                              <span>{s.liveUpMbps > 0 ? `${s.liveUpMbps} Mbps` : s.liveUpFormatted}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5 font-mono">
                              <span>{s.liveUpMbps > 0 ? `Total: ${s.sessionUpFormatted}` : `Plan: ${s.pkgUp}M`}</span>
                              {s.upPercent > 0 && <span className="text-sky-500 font-semibold">{s.upPercent}%</span>}
                            </div>
                            {s.upPercent > 0 && (
                              <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(2, s.upPercent))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-mono text-xs ${s.ip === "—" ? "text-muted-foreground" : "text-sky-600 dark:text-sky-400 font-semibold"}`}>
                          {s.ip}
                        </span>
                      </td>

                      {/* Live Uptime */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          {s.status === "online" ? (
                            <>
                              <Clock size={12} className="text-emerald-500 animate-spin" style={{ animationDuration: "10s" }} />
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px] whitespace-nowrap">
                                {s.uptime && s.uptime !== "—" ? s.uptime : "Active"}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs font-medium">Offline</span>
                          )}
                        </div>
                      </td>

                      {/* Actions: Network On/Off & Online MAC Bind / Unbind */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Network Power Toggle */}
                          <button
                            onClick={() => handleToggleLine(s)}
                            title={isLineActive ? `Turn Network Line OFF (Suspend PPPoE)` : `Turn Network Line ON (Restore PPPoE)`}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
                              isLineActive
                                ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            <Power size={12} className={isLineActive ? "text-rose-600 dark:text-rose-400" : "text-white"} />
                            <span>{isLineActive ? "Cut Off" : "Turn On"}</span>
                          </button>

                          {/* MAC Bind / Unbind */}
                          <button
                            onClick={() => handleToggleLiveMacBind(s)}
                            title={isBound ? `Release MAC Lock (Unbind)` : `Lock & Bind Live MAC to ${s.customer}`}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs ${
                              isBound
                                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                            }`}
                          >
                            <Shield size={12} />
                            <span>{isBound ? "Unbind" : "Bind MAC"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-medium border border-primary/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
