// ─── Optical Fiber Splitter, PON Capacity & Core Ledger Data Store ───────────

export type PonStandard = "GPON" | "EPON" | "XG-PON";

export interface SplitterPort {
  portNumber: number;
  status: "connected" | "free" | "reserved" | "damaged";
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  rxPowerDbm?: number;
  signalStatus?: "stable" | "high" | "warning" | "critical";
  dropFiberMeters?: number;
  connectedAt?: string;
}

export interface SplitterBox {
  id: string;
  name: string;
  location: string;
  zone: string;
  oltId: string;
  oltName: string;
  ponPort: string;
  ponStandard: PonStandard; // GPON (128) vs EPON (64)
  ponCapacityLimit: number; // 128 or 64
  splitRatio: "1:2" | "1:4" | "1:8" | "1:16" | "1:32" | "1:64";
  totalPorts: number;
  feederCableName: string;
  feederCoreNumber: number;
  feederCoreColor: string;
  inputPowerDbm: number; // Optical power before split
  insertionLossDb: number; // e.g. ~10.5 dB for 1:8
  outputEstimatedPowerDbm: number; // estimated output power
  ports: SplitterPort[];
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface FiberCore {
  coreNumber: number;
  colorName: string;
  colorHex: string;
  status: "live_pon" | "dedicated_corporate" | "dark_spare" | "damaged";
  connectedTo: string;
  assignedSplitterId?: string;
  opticalLossDb: number;
}

export interface BackboneFiberCable {
  id: string;
  name: string;
  origin: string;
  destination: string;
  totalCores: 12 | 24 | 48 | 96;
  distanceKm: number;
  status: "healthy" | "warning" | "cut";
  cores: FiberCore[];
}

export const FIBER_COLOR_CODES: { name: string; hex: string }[] = [
  { name: "Blue", hex: "#2563EB" },
  { name: "Orange", hex: "#F97316" },
  { name: "Green", hex: "#16A34A" },
  { name: "Brown", hex: "#92400E" },
  { name: "Slate", hex: "#6B7280" },
  { name: "White", hex: "#E5E7EB" },
  { name: "Red", hex: "#DC2626" },
  { name: "Black", hex: "#1F2937" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Violet", hex: "#7C3AED" },
  { name: "Rose", hex: "#EC4899" },
  { name: "Aqua", hex: "#06B6D4" },
];

const INITIAL_SPLITTERS: SplitterBox[] = [];
const INITIAL_BACKBONES: BackboneFiberCable[] = [];

class SplitterLedgerStore {
  private splitters: SplitterBox[] = [];
  private cables: BackboneFiberCable[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const savedSplitters = localStorage.getItem("isp_splitter_ledger_v3");
      const savedCables = localStorage.getItem("isp_fiber_cables_v3");

      this.splitters = savedSplitters ? JSON.parse(savedSplitters) : INITIAL_SPLITTERS;
      this.cables = savedCables ? JSON.parse(savedCables) : INITIAL_BACKBONES;
    } catch {
      this.splitters = INITIAL_SPLITTERS;
      this.cables = INITIAL_BACKBONES;
    }
  }

  private save() {
    try {
      localStorage.setItem("isp_splitter_ledger_v3", JSON.stringify(this.splitters));
      localStorage.setItem("isp_fiber_cables_v3", JSON.stringify(this.cables));
    } catch (e) {
      console.error("Failed to save splitter data to localStorage", e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  public getSplitters(): SplitterBox[] {
    return [...this.splitters];
  }

  public getCables(): BackboneFiberCable[] {
    return [...this.cables];
  }

  public addSplitter(box: SplitterBox) {
    this.splitters = [box, ...this.splitters];
    this.save();
  }

  public updateSplitter(box: SplitterBox) {
    this.splitters = this.splitters.map(s => s.id === box.id ? box : s);
    this.save();
  }

  public deleteSplitter(id: string) {
    this.splitters = this.splitters.filter(s => s.id !== id);
    this.save();
  }

  // Assign a subscriber to a specific port on a splitter box
  public assignSubscriberToPort(
    splitterId: string,
    portNumber: number,
    subscriber: { id: string; name: string; phone: string; dropMeters?: number; rxPowerDbm?: number }
  ) {
    this.splitters = this.splitters.map(box => {
      if (box.id !== splitterId) return box;

      const estimatedRx = subscriber.rxPowerDbm ?? Number((box.outputEstimatedPowerDbm - ((subscriber.dropMeters || 50) * 0.003)).toFixed(1));
      const sigStatus: SplitterPort["signalStatus"] =
        estimatedRx > -14 ? "high" : estimatedRx >= -24.0 ? "stable" : estimatedRx >= -27.0 ? "warning" : "critical";

      const updatedPorts = box.ports.map(p => {
        if (p.portNumber !== portNumber) return p;
        return {
          ...p,
          status: "connected" as const,
          customerId: subscriber.id,
          customerName: subscriber.name,
          customerPhone: subscriber.phone,
          rxPowerDbm: estimatedRx,
          signalStatus: sigStatus,
          dropFiberMeters: subscriber.dropMeters || 50,
          connectedAt: new Date().toLocaleDateString("en-GB"),
        };
      });

      return { ...box, ports: updatedPorts };
    });

    this.save();
  }

  // Release / free up a port on a splitter box
  public releasePort(splitterId: string, portNumber: number) {
    this.splitters = this.splitters.map(box => {
      if (box.id !== splitterId) return box;

      const updatedPorts = box.ports.map(p => {
        if (p.portNumber !== portNumber) return p;
        return {
          portNumber: p.portNumber,
          status: "free" as const,
        };
      });

      return { ...box, ports: updatedPorts };
    });

    this.save();
  }
}

export const splitterStore = new SplitterLedgerStore();
