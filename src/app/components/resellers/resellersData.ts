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

let sharedMacResellers = [...INITIAL_MAC_RESELLERS];
let sharedBwResellers = [...INITIAL_BW_RESELLERS];
let sharedWalletTrx = [...INITIAL_WALLET_TRX];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const resellersStore = {
  getMacResellers: () => sharedMacResellers,
  addMacReseller: (rsl: MacReseller) => { sharedMacResellers = [rsl, ...sharedMacResellers]; notify(); },
  
  getBwResellers: () => sharedBwResellers,
  addBwReseller: (bw: BandwidthReseller) => { sharedBwResellers = [bw, ...sharedBwResellers]; notify(); },

  getWalletTrx: () => sharedWalletTrx,
  addTopup: (trx: WalletTransaction) => {
    sharedWalletTrx = [trx, ...sharedWalletTrx];
    sharedMacResellers = sharedMacResellers.map(r => r.id === trx.resellerId ? { ...r, balance: r.balance + trx.amount, status: r.balance + trx.amount > 3000 ? "active" : r.status } : r);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
