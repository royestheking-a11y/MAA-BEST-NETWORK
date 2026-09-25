import { Customer } from "../context/CustomerContext";

export interface LaserStatus {
  powerDbm: number | null;
  rating: "excellent" | "good" | "warning" | "critical" | "no_signal";
  displayText: string;
  badgeClass: string;
}

export type OfflineReasonCode =
  | "active"
  | "overdue"
  | "fiber_critical"
  | "fiber_warning"
  | "onu_unpowered"
  | "admin_suspended"
  | "standby";

export interface SubscriberDiagnosis {
  isOnline: boolean;
  statusText: "Connected" | "Disconnected";
  reason: string;
  reasonCode: OfflineReasonCode;
  reasonBadgeClass: string;
  laserStatus: LaserStatus;
  macBinding: {
    boundMac: string;
    isBound: boolean;
    callingStationId: string;
  };
}

/**
 * Parses optical laser signal string (e.g. "-19.2 dBm" or -21.4) into numeric dBm
 */
export function parseOpticalPower(onuSignal?: string | number | null): number | null {
  if (onuSignal === undefined || onuSignal === null || onuSignal === "—" || onuSignal === "") {
    return null;
  }
  if (typeof onuSignal === "number") {
    return isNaN(onuSignal) ? null : onuSignal;
  }
  const clean = onuSignal.replace(/dBm/i, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Evaluates optical power against ITU-T GPON / EPON standard optical budget
 * Normal: -14.0 to -24.9 dBm
 * Warning: -25.0 to -26.9 dBm (Fiber bending / high connector loss)
 * Critical: < -27.0 dBm (Severe attenuation / impending link drop)
 * No Signal: <= -30.0 dBm or missing (Fiber cut / unplugged)
 */
export function evaluateLaserSignal(powerDbm: number | null): LaserStatus {
  if (powerDbm === null || powerDbm <= -30) {
    return {
      powerDbm,
      rating: "no_signal",
      displayText: powerDbm ? `${powerDbm.toFixed(1)} dBm (No Signal)` : "No Signal",
      badgeClass: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    };
  }

  if (powerDbm < -27) {
    return {
      powerDbm,
      rating: "critical",
      displayText: `${powerDbm.toFixed(1)} dBm (Critical Signal)`,
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    };
  }

  if (powerDbm < -25) {
    return {
      powerDbm,
      rating: "warning",
      displayText: `${powerDbm.toFixed(1)} dBm (Marginal)`,
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    };
  }

  if (powerDbm <= -14) {
    return {
      powerDbm,
      rating: "excellent",
      displayText: `${powerDbm.toFixed(1)} dBm (Optimal)`,
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    };
  }

  // Too strong (optical overload > -10 dBm)
  return {
    powerDbm,
    rating: "good",
    displayText: `${powerDbm.toFixed(1)} dBm (Normal)`,
    badgeClass: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
  };
}

/**
 * End-to-end diagnostic analyzer for subscriber network and billing state.
 * Accurately answers "Why is this user offline?"
 */
export function diagnoseSubscriberStatus(
  customer: Customer,
  liveMatch?: any
): SubscriberDiagnosis {
  const isOnline = liveMatch
    ? liveMatch.connection_status === "online"
    : (customer.netStatus === "online" && customer.status === "active");

  const rawPower = liveMatch?.onu_rx_power !== undefined && liveMatch.onu_rx_power !== null
    ? liveMatch.onu_rx_power
    : customer.onuSignal;

  const laserDbm = parseOpticalPower(rawPower);
  const laserStatus = evaluateLaserSignal(laserDbm);

  const boundMac = customer.mac || customer.boundMac || liveMatch?.live_mac || "—";
  const callingStationId = customer.callingStationId || liveMatch?.caller_id || boundMac;
  const isBound = customer.macBound !== false && boundMac !== "—";

  if (isOnline) {
    return {
      isOnline: true,
      statusText: "Connected",
      reason: "Active PPPoE Session (Normal)",
      reasonCode: "active",
      reasonBadgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      laserStatus,
      macBinding: {
        boundMac,
        isBound,
        callingStationId,
      },
    };
  }

  // User is OFFLINE: Determine specific root cause
  const isFreeOrUnlimited = customer.userType === "free" || customer.userType === "unlimited";
  const dueAmt = customer.dueAmount ?? (customer.status === "due" ? customer.price : 0);
  const isOverdue = !isFreeOrUnlimited && (customer.daysRemaining <= 0 || dueAmt > 0 || customer.status === "suspended");

  // 1. Bill Overdue / Auto-Suspended
  if (isOverdue && (customer.status === "suspended" || customer.daysRemaining <= 0)) {
    return {
      isOnline: false,
      statusText: "Disconnected",
      reason: "Bill Overdue / Auto-Suspended",
      reasonCode: "overdue",
      reasonBadgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
      laserStatus,
      macBinding: { boundMac, isBound, callingStationId },
    };
  }

  // 2. Administrative Manual Suspension
  if (customer.disabledInSystem || customer.disabledInMikrotik) {
    return {
      isOnline: false,
      statusText: "Disconnected",
      reason: "Admin Manual Suspension",
      reasonCode: "admin_suspended",
      reasonBadgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
      laserStatus,
      macBinding: { boundMac, isBound, callingStationId },
    };
  }

  // 3. Optical Signal Loss / Fiber Cut (< -27 dBm or no signal)
  if (laserStatus.rating === "no_signal" || laserStatus.rating === "critical") {
    return {
      isOnline: false,
      statusText: "Disconnected",
      reason: laserStatus.rating === "no_signal"
        ? "Optical Carrier Loss / Fiber Cut"
        : `Critical Laser Signal (${laserStatus.powerDbm?.toFixed(1)} dBm)`,
      reasonCode: "fiber_critical",
      reasonBadgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
      laserStatus,
      macBinding: { boundMac, isBound, callingStationId },
    };
  }

  // 4. Optical Warning (-25 to -27 dBm) with drop
  if (laserStatus.rating === "warning") {
    return {
      isOnline: false,
      statusText: "Disconnected",
      reason: `Degraded Laser Warning (${laserStatus.powerDbm?.toFixed(1)} dBm)`,
      reasonCode: "fiber_warning",
      reasonBadgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
      laserStatus,
      macBinding: { boundMac, isBound, callingStationId },
    };
  }

  // 5. ONU Powered Off / Standby
  return {
    isOnline: false,
    statusText: "Disconnected",
    reason: "ONU Powered Off / Router Standby",
    reasonCode: "onu_unpowered",
    reasonBadgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    laserStatus,
    macBinding: { boundMac, isBound, callingStationId },
  };
}
