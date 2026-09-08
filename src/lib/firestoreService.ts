import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
  Unsubscribe
} from "firebase/firestore";
import { db } from "./firebase";
import { Customer, PlanUpgradeRequest } from "../app/context/CustomerContext";

// Collection References
export const CUSTOMERS_COLLECTION = "customers";
export const UPGRADE_REQUESTS_COLLECTION = "upgradeRequests";
export const PAYMENTS_COLLECTION = "payments";

/**
 * Deep sanitization for Firestore: strips undefined properties so setDoc never throws.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result;
  }
  return data;
}

// ── 1. CUSTOMERS REALTIME SYNC & CRUD ──────────────────────────────────────────

/**
 * Subscribes to realtime updates of the customers collection in Cloud Firestore.
 */
export function subscribeToCustomers(
  onUpdate: (customers: Customer[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      if (snapshot.empty) return;
      const docs: Customer[] = [];
      snapshot.forEach(docSnap => {
        const raw = docSnap.data() as any;
        const data: Customer = {
          ...raw,
          price: typeof raw.price === "number" ? raw.price : (Number(raw.price) || 0),
          monthlyBill: typeof raw.monthlyBill === "number" ? raw.monthlyBill : (typeof raw.price === "number" ? raw.price : (Number(raw.monthlyBill) || 0)),
          dueAmount: typeof raw.dueAmount === "number" ? raw.dueAmount : (Number(raw.dueAmount) || 0),
          due: typeof raw.due === "number" ? raw.due : (typeof raw.dueAmount === "number" ? raw.dueAmount : 0),
          speed: typeof raw.speed === "string" ? raw.speed : (typeof raw.speed === "number" ? `${raw.speed}/${Math.round(raw.speed / 2)}` : "20/10"),
          downloadSpeedMbps: typeof raw.downloadSpeedMbps === "number" ? raw.downloadSpeedMbps : 20,
          uploadSpeedMbps: typeof raw.uploadSpeedMbps === "number" ? raw.uploadSpeedMbps : 10,
          invoices: Array.isArray(raw.invoices) ? raw.invoices : [],
          paymentHistory: Array.isArray(raw.paymentHistory) ? raw.paymentHistory : (Array.isArray(raw.payments) ? raw.payments : []),
        };
        // Guarantee mbn@ passcode standard
        if (data.passcode && data.passcode.startsWith("isp@")) {
          data.passcode = data.passcode.replace(/^isp@/i, "mbn@");
        } else if (!data.passcode) {
          data.passcode = `mbn@${(data.clientCode || data.id).replace(/\D/g, "")}`;
        }
        docs.push(data);
      });
      // Sort numerically by clientCode or ID so order is always instant & consistent
      docs.sort((a, b) => {
        const numA = parseInt((a.clientCode || a.id).replace(/\D/g, ""), 10) || 0;
        const numB = parseInt((b.clientCode || b.id).replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Customers sync fallback/warning:", err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Saves or updates a customer document in Cloud Firestore.
 */
export async function saveCustomerToFirestore(customer: Customer): Promise<void> {
  try {
    const fixedCust = {
      ...customer,
      passcode: (customer.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(customer.clientCode || customer.id).replace(/\D/g, "")}`
    };
    const sanitized = sanitizeForFirestore(fixedCust);
    const docRef = doc(db, CUSTOMERS_COLLECTION, fixedCust.id);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error("Failed to save customer to Firestore:", err);
  }
}

/**
 * Deletes a customer document from Cloud Firestore.
 */
export async function deleteCustomerFromFirestore(customerId: string): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete customer from Firestore:", err);
  }
}

// ── 2. PLAN UPGRADE REQUESTS REALTIME SYNC & CRUD ─────────────────────────────

/**
 * Subscribes to realtime updates of plan upgrade requests.
 */
export function subscribeToUpgradeRequests(
  onUpdate: (requests: PlanUpgradeRequest[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, UPGRADE_REQUESTS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: PlanUpgradeRequest[] = [];
      snapshot.forEach(docSnap => {
        const raw = docSnap.data() as any;
        docs.push({
          ...raw,
          currentPrice: typeof raw.currentPrice === "number" ? raw.currentPrice : (Number(raw.currentPrice) || 0),
          requestedPrice: typeof raw.requestedPrice === "number" ? raw.requestedPrice : (Number(raw.requestedPrice) || 0),
          priceDifference: typeof raw.priceDifference === "number" ? raw.priceDifference : (Number(raw.priceDifference) || 0),
        } as PlanUpgradeRequest);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Upgrade Requests sync fallback/warning:", err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Saves a new plan upgrade request to Cloud Firestore.
 */
export async function saveUpgradeRequestToFirestore(request: PlanUpgradeRequest): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore(request);
    const docRef = doc(db, UPGRADE_REQUESTS_COLLECTION, request.id);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.error("Failed to save upgrade request to Firestore:", err);
  }
}

// ── 3. ATOMIC SEED & BATCH SYNC ───────────────────────────────────────────────

/**
 * Seeds initial customer roster to Cloud Firestore using an atomic batch commit
 * and migrates any existing documents to the mbn@ passcode standard.
 */
export async function seedInitialFirestoreDataIfEmpty(
  seedCustomers: Customer[],
  seedUpgradeRequests: PlanUpgradeRequest[]
): Promise<boolean> {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const snapshot = await getDocs(colRef);

    // Only seed if the collection is completely empty
    if (snapshot.empty || snapshot.size === 0) {
      console.log(`☁️ Initializing Cloud Firestore with initial customer roster...`);
      const batch = writeBatch(db);

      // Seed Customers with mbn@ passcodes
      for (const cust of seedCustomers) {
        const cRef = doc(db, CUSTOMERS_COLLECTION, cust.id);
        const fixedCust = {
          ...cust,
          passcode: (cust.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(cust.clientCode || cust.id).replace(/\D/g, "")}`
        };
        batch.set(cRef, sanitizeForFirestore(fixedCust), { merge: true });
      }

      // Seed Upgrade Requests
      for (const req of seedUpgradeRequests) {
        const uRef = doc(db, UPGRADE_REQUESTS_COLLECTION, req.id);
        batch.set(uRef, sanitizeForFirestore(req), { merge: true });
      }

      await batch.commit();
      console.log("✓ Cloud Firestore initial setup complete!");
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Firestore batch sync note:", err);
    return false;
  }
}
