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
        const data = docSnap.data() as Customer;
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
    const docRef = doc(db, CUSTOMERS_COLLECTION, fixedCust.id);
    await setDoc(docRef, fixedCust, { merge: true });
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
        docs.push(docSnap.data() as PlanUpgradeRequest);
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
    const docRef = doc(db, UPGRADE_REQUESTS_COLLECTION, request.id);
    await setDoc(docRef, request, { merge: true });
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

    const needsPasscodeMigration = snapshot.docs.some(d => {
      const p = d.data().passcode;
      return typeof p === "string" && p.startsWith("isp@");
    });

    if (snapshot.size < seedCustomers.length || needsPasscodeMigration) {
      console.log(`☁️ Syncing/Migrating ${seedCustomers.length} subscribers with mbn@ passcodes to Cloud Firestore...`);
      const batch = writeBatch(db);

      // Seed Customers with mbn@ passcodes
      for (const cust of seedCustomers) {
        const cRef = doc(db, CUSTOMERS_COLLECTION, cust.id);
        const fixedCust = {
          ...cust,
          passcode: (cust.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(cust.clientCode || cust.id).replace(/\D/g, "")}`
        };
        batch.set(cRef, fixedCust, { merge: true });
      }

      // Seed Upgrade Requests
      for (const req of seedUpgradeRequests) {
        const uRef = doc(db, UPGRADE_REQUESTS_COLLECTION, req.id);
        batch.set(uRef, req, { merge: true });
      }

      await batch.commit();
      console.log("✓ Cloud Firestore migration with mbn@ passcodes complete!");
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Firestore batch sync note:", err);
    return false;
  }
}
