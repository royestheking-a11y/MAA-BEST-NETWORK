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

const makeDefaultPorts = (ratio: number, prefix: string, custs: Array<{ id: string; name: string; phone: string; rx: number }>) => {
  return Array.from({ length: ratio }, (_, i) => {
    const portNum = i + 1;
    const cust = custs[i];
    if (cust) {
      const sigStatus: SplitterPort["signalStatus"] =
        cust.rx > -14 ? "high" : cust.rx >= -24.0 ? "stable" : cust.rx >= -27.0 ? "warning" : "critical";
      return {
        portNumber: portNum,
        status: "connected" as const,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        rxPowerDbm: cust.rx,
        signalStatus: sigStatus,
        dropFiberMeters: 45 + (i * 12),
        connectedAt: "12/08/2026",
      };
    }
    return {
      portNumber: portNum,
      status: "free" as const,
    };
  });
};

const INITIAL_SPLITTERS: SplitterBox[] = [
  {
    id: "SP-01",
    name: "SOMITIR HAT BAZAR - Splitter 1 (1:8)",
    location: "Somitir Hat Central Pole #14",
    zone: "Kalkini",
    oltId: "OLT-01",
    oltName: "OLT1 (Somitir Hat EPON)",
    ponPort: "epon 0/1",
    ponStandard: "EPON",
    ponCapacityLimit: 64,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "MBN Core Trunk 48F (Red Tube)",
    feederCoreNumber: 1,
    feederCoreColor: "Blue",
    inputPowerDbm: 4.2,
    insertionLossDb: 10.3,
    outputEstimatedPowerDbm: -18.2,
    ports: makeDefaultPorts(8, "SP1", [
      { id: "MBN0001", name: "Md. Tanvir Hossain", phone: "01711-234567", rx: -18.4 },
      { id: "MBN0002", name: "Anisur Rahman", phone: "01819-876543", rx: -19.1 },
      { id: "MBN0003", name: "Kamrul Islam", phone: "01912-345678", rx: -18.8 },
      { id: "MBN0004", name: "Shorif Uddin", phone: "01678-901234", rx: -21.4 },
      { id: "MBN0005", name: "Nizam Chowdhury", phone: "01755-667788", rx: -19.6 },
      { id: "MBN0006", name: "Faruk Ahmed", phone: "01822-334455", rx: -22.1 },
      { id: "MBN0007", name: "Sujon Molla", phone: "01933-445566", rx: -18.9 },
    ]),
  },
  {
    id: "SP-02",
    name: "PURAN BAZAR - Splitter 2 (1:8)",
    location: "Puran Bazar Bridge Corner Pole #08",
    zone: "Madaripur Sadar",
    oltId: "OLT-01",
    oltName: "OLT1 (Somitir Hat EPON)",
    ponPort: "epon 0/2",
    ponStandard: "EPON",
    ponCapacityLimit: 64,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "Madaripur Feeder 24F",
    feederCoreNumber: 2,
    feederCoreColor: "Orange",
    inputPowerDbm: 3.8,
    insertionLossDb: 10.4,
    outputEstimatedPowerDbm: -18.6,
    ports: makeDefaultPorts(8, "SP2", [
      { id: "MBN0008", name: "Biplob Hawlader", phone: "01722-112233", rx: -18.2 },
      { id: "MBN0009", name: "Rashedul Karim", phone: "01833-223344", rx: -19.5 },
      { id: "MBN0010", name: "Zakir Hossain", phone: "01944-334455", rx: -20.1 },
      { id: "MBN0011", name: "Moniruzzaman", phone: "01655-445566", rx: -19.3 },
      { id: "MBN0012", name: "Hasan Mahmud", phone: "01766-556677", rx: -18.7 },
      { id: "MBN0013", name: "Abdur Rahim", phone: "01877-667788", rx: -24.8 },
    ]),
  },
  {
    id: "SP-03",
    name: "KALKINI GOPALPUR - Splitter 3 (1:8)",
    location: "Gopalpur High School Rd DP Box",
    zone: "Kalkini",
    oltId: "OLT-02",
    oltName: "OLT2 (Kalkini Hub GPON)",
    ponPort: "gpon 0/1",
    ponStandard: "GPON",
    ponCapacityLimit: 128,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "Kalkini Sub-Trunk 24F",
    feederCoreNumber: 3,
    feederCoreColor: "Green",
    inputPowerDbm: 4.5,
    insertionLossDb: 10.2,
    outputEstimatedPowerDbm: -17.9,
    ports: makeDefaultPorts(8, "SP3", [
      { id: "MBN0014", name: "Shafiqul Islam", phone: "01988-778899", rx: -18.1 },
      { id: "MBN0015", name: "Delwar Hossain", phone: "01699-889900", rx: -19.0 },
      { id: "MBN0016", name: "Mustafizur Rahman", phone: "01712-334455", rx: -18.4 },
      { id: "MBN0017", name: "Akram Khan", phone: "01823-445566", rx: -19.8 },
      { id: "MBN0018", name: "Liton Das", phone: "01934-556677", rx: -21.0 },
    ]),
  },
  {
    id: "SP-04",
    name: "SHIBCHAR PACHCHAR - Splitter 4 (1:8)",
    location: "Pachchar Bazar Roundabout Box #02",
    zone: "Shibchar",
    oltId: "OLT-01",
    oltName: "OLT1 (Somitir Hat EPON)",
    ponPort: "epon 0/3",
    ponStandard: "EPON",
    ponCapacityLimit: 64,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "Shibchar Highway Backbone 48F",
    feederCoreNumber: 4,
    feederCoreColor: "Brown",
    inputPowerDbm: 3.5,
    insertionLossDb: 10.5,
    outputEstimatedPowerDbm: -19.0,
    ports: makeDefaultPorts(8, "SP4", [
      { id: "MBN0019", name: "Jasim Uddin", phone: "01645-667788", rx: -19.2 },
      { id: "MBN0020", name: "Al Amin", phone: "01756-778899", rx: -18.6 },
      { id: "MBN0021", name: "Sabbir Ahmed", phone: "01867-889900", rx: -20.3 },
      { id: "MBN0022", name: "Golam Mostafa", phone: "01978-990011", rx: -19.4 },
      { id: "MBN0023", name: "Shahidul Alam", phone: "01689-001122", rx: -25.2 },
      { id: "MBN0024", name: "Tareq Aziz", phone: "01790-112233", rx: -18.8 },
      { id: "MBN0025", name: "Habibur Rahman", phone: "01801-223344", rx: -19.7 },
      { id: "MBN0026", name: "Rezaul Karim", phone: "01912-334455", rx: -20.0 },
    ]),
  },
  {
    id: "SP-05",
    name: "RAJOIR TEKERHAT - Splitter 5 (1:8)",
    location: "Tekerhat Bandar Gate DP Box #11",
    zone: "Rajoir",
    oltId: "OLT-02",
    oltName: "OLT2 (Kalkini Hub GPON)",
    ponPort: "gpon 0/2",
    ponStandard: "GPON",
    ponCapacityLimit: 128,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "Rajoir Trunk 24F",
    feederCoreNumber: 5,
    feederCoreColor: "Slate",
    inputPowerDbm: 4.0,
    insertionLossDb: 10.3,
    outputEstimatedPowerDbm: -18.3,
    ports: makeDefaultPorts(8, "SP5", [
      { id: "MBN0027", name: "Ashraful Haque", phone: "01623-445566", rx: -18.5 },
      { id: "MBN0028", name: "Mahmudul Hasan", phone: "01734-556677", rx: -19.1 },
      { id: "MBN0029", name: "Enamul Hoque", phone: "01845-667788", rx: -18.9 },
      { id: "MBN0030", name: "Nazmul Huda", phone: "01956-778899", rx: -21.5 },
    ]),
  },
  {
    id: "SP-06",
    name: "DASHAR NABAGRAM - Splitter 6 (1:8)",
    location: "Nabagram Bazar Road Side Pole #05",
    zone: "Dashar",
    oltId: "OLT-01",
    oltName: "OLT1 (Somitir Hat EPON)",
    ponPort: "epon 0/4",
    ponStandard: "EPON",
    ponCapacityLimit: 64,
    splitRatio: "1:8",
    totalPorts: 8,
    feederCableName: "Dashar Link 12F",
    feederCoreNumber: 6,
    feederCoreColor: "White",
    inputPowerDbm: 3.9,
    insertionLossDb: 10.4,
    outputEstimatedPowerDbm: -18.5,
    ports: makeDefaultPorts(8, "SP6", [
      { id: "MBN0031", name: "Mominul Islam", phone: "01667-889900", rx: -18.7 },
      { id: "MBN0032", name: "Mizanur Rahman", phone: "01778-990011", rx: -19.3 },
      { id: "MBN0033", name: "Kazi Nazrul", phone: "01889-001122", rx: -18.4 },
      { id: "MBN0034", name: "Selim Reza", phone: "01990-112233", rx: -22.3 },
      { id: "MBN0035", name: "Ferdous Ahmed", phone: "01601-223344", rx: -19.0 },
    ]),
  }
];

const INITIAL_BACKBONES: BackboneFiberCable[] = [
  {
    id: "CBL-01",
    name: "MBN Core POP -> Kalkini Highway 48F Trunk",
    origin: "Core NOC Room (Somitir Hat)",
    destination: "Kalkini Main Distribution Point",
    totalCores: 48,
    distanceKm: 4.8,
    status: "healthy",
    cores: [
      { coreNumber: 1, colorName: "Blue", colorHex: "#2563EB", status: "live_pon", connectedTo: "OLT1 epon 0/1 -> Splitter 1", opticalLossDb: 1.4 },
      { coreNumber: 2, colorName: "Orange", colorHex: "#F97316", status: "live_pon", connectedTo: "OLT1 epon 0/2 -> Splitter 2", opticalLossDb: 1.6 },
      { coreNumber: 3, colorName: "Green", colorHex: "#16A34A", status: "live_pon", connectedTo: "OLT2 gpon 0/1 -> Splitter 3", opticalLossDb: 1.5 },
      { coreNumber: 4, colorName: "Brown", colorHex: "#92400E", status: "live_pon", connectedTo: "OLT1 epon 0/3 -> Splitter 4", opticalLossDb: 1.8 },
      { coreNumber: 5, colorName: "Slate", colorHex: "#6B7280", status: "live_pon", connectedTo: "OLT2 gpon 0/2 -> Splitter 5", opticalLossDb: 1.7 },
      { coreNumber: 6, colorName: "White", colorHex: "#E5E7EB", status: "live_pon", connectedTo: "OLT1 epon 0/4 -> Splitter 6", opticalLossDb: 1.5 },
      { coreNumber: 7, colorName: "Red", colorHex: "#DC2626", status: "dark_spare", connectedTo: "Spare Tube 2", opticalLossDb: 1.4 },
      { coreNumber: 8, colorName: "Black", colorHex: "#1F2937", status: "dark_spare", connectedTo: "Spare Tube 2", opticalLossDb: 1.4 },
      { coreNumber: 9, colorName: "Yellow", colorHex: "#EAB308", status: "dedicated_corporate", connectedTo: "Kalkini Bank Link", opticalLossDb: 1.2 },
      { coreNumber: 10, colorName: "Violet", colorHex: "#7C3AED", status: "dark_spare", connectedTo: "Spare Tube 3", opticalLossDb: 1.3 },
      { coreNumber: 11, colorName: "Rose", colorHex: "#EC4899", status: "dark_spare", connectedTo: "Spare Tube 3", opticalLossDb: 1.3 },
      { coreNumber: 12, colorName: "Aqua", colorHex: "#06B6D4", status: "dark_spare", connectedTo: "Spare Tube 3", opticalLossDb: 1.4 },
    ],
  },
  {
    id: "CBL-02",
    name: "Shibchar Inter-Upazila Feeder 24F",
    origin: "Somitir Hat Core POP",
    destination: "Shibchar Pachchar Sub-Station",
    totalCores: 24,
    distanceKm: 8.2,
    status: "healthy",
    cores: [
      { coreNumber: 1, colorName: "Blue", colorHex: "#2563EB", status: "live_pon", connectedTo: "OLT1 epon 0/3 Feeder", opticalLossDb: 2.8 },
      { coreNumber: 2, colorName: "Orange", colorHex: "#F97316", status: "dedicated_corporate", connectedTo: "Pachchar Hospital Link", opticalLossDb: 2.7 },
      { coreNumber: 3, colorName: "Green", colorHex: "#16A34A", status: "dark_spare", connectedTo: "Spare Dark Core", opticalLossDb: 2.9 },
      { coreNumber: 4, colorName: "Brown", colorHex: "#92400E", status: "dark_spare", connectedTo: "Spare Dark Core", opticalLossDb: 2.8 },
    ],
  }
];

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

      this.splitters = (savedSplitters && JSON.parse(savedSplitters).length > 0) ? JSON.parse(savedSplitters) : INITIAL_SPLITTERS;
      this.cables = (savedCables && JSON.parse(savedCables).length > 0) ? JSON.parse(savedCables) : INITIAL_BACKBONES;
    } catch {
      this.splitters = INITIAL_SPLITTERS;
      this.cables = INITIAL_BACKBONES;
    }
  }

  private save() {
    try {
      if (this.splitters && this.splitters.length > 0) {
        localStorage.setItem("isp_splitter_ledger_v3", JSON.stringify(this.splitters));
      }
      if (this.cables && this.cables.length > 0) {
        localStorage.setItem("isp_fiber_cables_v3", JSON.stringify(this.cables));
      }
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
