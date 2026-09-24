export interface FinanceAccount {
  id: string;
  name: string;
  type: "bank" | "mfs" | "cash_counter" | "petty_cash";
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  lastReconciled: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  account: string;
  amount: number;
  reference: string;
  status: "reconciled" | "pending";
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: "upstream_bw" | "fiber_maintenance" | "office_rent" | "staff_salary" | "utilities" | "marketing";
  vendor: string;
  amount: number;
  paidFrom: string;
  invoiceNo: string;
  status: "paid" | "due";
}

export const INITIAL_ACCOUNTS: FinanceAccount[] = [];

export const INITIAL_TRANSACTIONS: FinanceTransaction[] = [];

export const INITIAL_EXPENSES: ExpenseItem[] = [];

const STORAGE_KEYS = {
  ACCOUNTS: "isp_finance_accounts_v3",
  TRX: "isp_finance_trx_v3",
  EXPENSES: "isp_finance_expenses_v3",
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed)) return parsed as unknown as T;
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

let sharedAccounts = loadStorage(STORAGE_KEYS.ACCOUNTS, [...INITIAL_ACCOUNTS]);
let sharedTrx = loadStorage(STORAGE_KEYS.TRX, [...INITIAL_TRANSACTIONS]);
let sharedExpenses = loadStorage(STORAGE_KEYS.EXPENSES, [...INITIAL_EXPENSES]);

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const financeStore = {
  getAccounts: () => sharedAccounts,
  addAccount: (acc: FinanceAccount) => {
    sharedAccounts = [...sharedAccounts, acc];
    saveStorage(STORAGE_KEYS.ACCOUNTS, sharedAccounts);
    notify();
  },

  getTransactions: () => sharedTrx,
  addTransaction: (trx: FinanceTransaction) => {
    sharedTrx = [trx, ...sharedTrx];
    saveStorage(STORAGE_KEYS.TRX, sharedTrx);
    notify();
  },

  getExpenses: () => sharedExpenses,
  addExpense: (exp: ExpenseItem) => {
    sharedExpenses = [exp, ...sharedExpenses];
    const newTrx: FinanceTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      date: exp.date,
      type: "expense",
      category: exp.category.replace("_", " "),
      description: `${exp.vendor} (${exp.invoiceNo})`,
      account: exp.paidFrom,
      amount: exp.amount,
      reference: exp.invoiceNo,
      status: "reconciled",
    };
    sharedTrx = [newTrx, ...sharedTrx];
    saveStorage(STORAGE_KEYS.EXPENSES, sharedExpenses);
    saveStorage(STORAGE_KEYS.TRX, sharedTrx);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
