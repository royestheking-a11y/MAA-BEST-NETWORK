export interface MacReseller {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  zone: string;
  clients: number;
  maxClients: number;
  creditLimit: number;
  balance: number;
  commission: number; // percentage
  status: "active" | "suspended" | "low_balance";
  joinedDate: string;
}

export interface BandwidthReseller {
  id: string;
  name: string;
  company: string;
  allocatedBandwidth: number; // in Mbps
  currentUsage: number; // in Mbps
  ratePerMbps: number;
  monthlyBill: number;
  bgpPeerIp: string;
  vlanId: number;
  status: "active" | "warning" | "exceeded";
}

export interface WalletTransaction {
  id: string;
  resellerName: string;
  resellerId: string;
  amount: number;
  type: "topup" | "deduction" | "commission" | "refund";
  method: string;
  date: string;
  trxId: string;
  status: "completed" | "pending";
}

export const INITIAL_MAC_RESELLERS: MacReseller[] = [];

export const INITIAL_BW_RESELLERS: BandwidthReseller[] = [];

export const INITIAL_WALLET_TRX: WalletTransaction[] = [];

const STORAGE_KEYS = {
  MAC: "isp_resellers_mac_v3",
  BW: "isp_resellers_bw_v3",
  WALLET: "isp_resellers_wallet_v3",
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
        } else if (parsed && typeof parsed === "object") {
          return { ...fallback, ...parsed } as unknown as T;
        }
      }
    }
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
  }
  return fallback;
}

function saveStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

let sharedMacResellers = loadStorage(STORAGE_KEYS.MAC, [...INITIAL_MAC_RESELLERS]);
let sharedBwResellers = loadStorage(STORAGE_KEYS.BW, [...INITIAL_BW_RESELLERS]);
let sharedWalletTrx = loadStorage(STORAGE_KEYS.WALLET, [...INITIAL_WALLET_TRX]);

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const resellersStore = {
  getMacResellers: () => sharedMacResellers,
  addMacReseller: (rsl: MacReseller) => {
    sharedMacResellers = [rsl, ...sharedMacResellers];
    saveStorage(STORAGE_KEYS.MAC, sharedMacResellers);
    notify();
  },
  
  getBwResellers: () => sharedBwResellers,
  addBwReseller: (bw: BandwidthReseller) => {
    sharedBwResellers = [bw, ...sharedBwResellers];
    saveStorage(STORAGE_KEYS.BW, sharedBwResellers);
    notify();
  },

  getWalletTrx: () => sharedWalletTrx,
  addTopup: (trx: WalletTransaction) => {
    sharedWalletTrx = [trx, ...sharedWalletTrx];
    sharedMacResellers = sharedMacResellers.map(r => r.id === trx.resellerId ? { ...r, balance: r.balance + trx.amount, status: r.balance + trx.amount > 3000 ? "active" : r.status } : r);
    saveStorage(STORAGE_KEYS.WALLET, sharedWalletTrx);
    saveStorage(STORAGE_KEYS.MAC, sharedMacResellers);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
