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

let sharedAccounts = [...INITIAL_ACCOUNTS];
let sharedTrx = [...INITIAL_TRANSACTIONS];
let sharedExpenses = [...INITIAL_EXPENSES];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const financeStore = {
  getAccounts: () => sharedAccounts,
  addAccount: (acc: FinanceAccount) => { sharedAccounts = [...sharedAccounts, acc]; notify(); },

  getTransactions: () => sharedTrx,
  addTransaction: (trx: FinanceTransaction) => {
    sharedTrx = [trx, ...sharedTrx];
    notify();
  },

  getExpenses: () => sharedExpenses,
  addExpense: (exp: ExpenseItem) => {
    sharedExpenses = [exp, ...sharedExpenses];
    sharedTrx = [{
      id: `TRX-${Date.now().toString().slice(-4)}`,
      date: exp.date,
      type: "expense",
      category: exp.category.replace("_", " "),
      description: `${exp.vendor} (${exp.invoiceNo})`,
      account: exp.paidFrom,
      amount: exp.amount,
      reference: exp.invoiceNo,
      status: "reconciled",
    }, ...sharedTrx];
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
