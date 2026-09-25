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
export const EMPLOYEES_COLLECTION = "employees";
export const ROLES_COLLECTION = "roles";

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
      // SAFE: Do not call onUpdate([]) on empty snapshot — it would wipe all customers.
      // An empty snapshot can occur briefly on first load or during a network hiccup.
      if (snapshot.empty) return;
      const docs: Customer[] = [];
      snapshot.forEach(docSnap => {
        const raw = docSnap.data() as any;
        if (!raw || !raw.id || raw.id.startsWith("CUST-")) return;
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
      if (docs.length === 0) return;
      // Sort numerically by clientCode or ID so order is always instant & consistent
      docs.sort((a, b) => {
        const numA = parseInt((a.clientCode || a.id).replace(/\D/g, ""), 10) || 0;
        const numB = parseInt((b.clientCode || b.id).replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });
      onUpdate(docs);
    },
    err => {
      // On error, preserve local state — do NOT call onUpdate([])
      console.warn("Firestore Customers sync fallback/warning (local state preserved):", err.message);
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
 * Saves multiple customer documents to Cloud Firestore in chunked atomic batches.
 */
export async function saveCustomersBatchToFirestore(customersList: Customer[]): Promise<void> {
  try {
    if (!customersList || customersList.length === 0) return;
    const CHUNK_SIZE = 400;
    for (let i = 0; i < customersList.length; i += CHUNK_SIZE) {
      const chunk = customersList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const cust of chunk) {
        const fixedCust = {
          ...cust,
          passcode: (cust.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(cust.clientCode || cust.id).replace(/\D/g, "")}`
        };
        const sanitized = sanitizeForFirestore(fixedCust);
        const docRef = doc(db, CUSTOMERS_COLLECTION, fixedCust.id);
        batch.set(docRef, sanitized, { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error("Failed to batch save customers to Firestore:", err);
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

// ── 4. EMPLOYEES & STAFF CREDENTIALS FIRESTORE SYNC ──────────────────────────

export function subscribeToEmployees(
  onUpdate: (employees: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, EMPLOYEES_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      // CRITICAL: Do NOT call onUpdate([]) when snapshot is empty.
      // An empty snapshot may be a temporary Firestore state (network delay,
      // first-time load before seeds). Calling onUpdate([]) would wipe
      // all locally-saved employees. Only push real documents.
      if (snapshot.empty) {
        // No-op: leave the local/localStorage state intact
        return;
      }
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) {
          docs.push(data);
        }
      });
      if (docs.length === 0) return; // extra guard
      // Sort by id so order is predictable
      docs.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      onUpdate(docs);
    },
    err => {
      // On error, do NOT overwrite local state — just warn
      console.warn("Firestore Employees sync warning (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveEmployeeToFirestore(employee: any): Promise<void> {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, sanitizeForFirestore(employee), { merge: true });
  } catch (err) {
    console.error("Failed to save employee to Firestore:", err);
  }
}

export async function deleteEmployeeFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete employee from Firestore:", err);
  }
}

export async function saveAllEmployeesToFirestore(employees: any[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const emp of employees) {
      const docRef = doc(db, EMPLOYEES_COLLECTION, emp.id);
      batch.set(docRef, sanitizeForFirestore(emp), { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error("Failed to batch save employees to Firestore:", err);
  }
}

export function subscribeToRoles(
  onUpdate: (roles: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, ROLES_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      // CRITICAL: Do NOT call onUpdate([]) on empty snapshots — it would wipe custom roles.
      if (snapshot.empty) {
        return; // Leave local/localStorage state intact
      }
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.name) {
          docs.push(data);
        }
      });
      if (docs.length === 0) return;
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Roles sync warning (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveRoleToFirestore(role: any): Promise<void> {
  try {
    const roleKey = role.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const docRef = doc(db, ROLES_COLLECTION, roleKey);
    await setDoc(docRef, sanitizeForFirestore(role), { merge: true });
  } catch (err) {
    console.error("Failed to save role to Firestore:", err);
  }
}

// ── 5. SYSTEM ADMIN AUTH REALTIME SYNC ─────────────────────────────────────────

export const SYSTEM_AUTH_COLLECTION = "system_auth";

export function subscribeToAdminAuth(
  onUpdate: (passwords: Record<string, string>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, SYSTEM_AUTH_COLLECTION, "admin_credentials");
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.passwords) {
          onUpdate(data.passwords);
        }
      }
    },
    err => {
      console.warn("Firestore Admin Auth sync warning:", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveAdminAuthToFirestore(passwords: Record<string, string>): Promise<void> {
  try {
    const docRef = doc(db, SYSTEM_AUTH_COLLECTION, "admin_credentials");
    await setDoc(
      docRef,
      sanitizeForFirestore({
        passwords,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save admin auth to Firestore:", err);
  }
}

// ── 6. MIKROTIK HARDWARE FLEET REALTIME SYNC ───────────────────────────────────

export const MIKROTIK_COLLECTION = "mikrotik";

export function subscribeToMikrotik(
  onUpdate: (servers: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, MIKROTIK_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore MikroTik sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveMikrotikToFirestore(server: any): Promise<void> {
  try {
    const docRef = doc(db, MIKROTIK_COLLECTION, server.id);
    await setDoc(docRef, sanitizeForFirestore(server), { merge: true });
  } catch (err) {
    console.error("Failed to save MikroTik router to Firestore:", err);
  }
}

export async function deleteMikrotikFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, MIKROTIK_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete MikroTik router from Firestore:", err);
  }
}

// ── 7. OLT HARDWARE CHASSIS REALTIME SYNC ─────────────────────────────────────

export const OLTS_COLLECTION = "olts";

export function subscribeToOlts(
  onUpdate: (olts: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, OLTS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore OLT sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveOltToFirestore(olt: any): Promise<void> {
  try {
    const docRef = doc(db, OLTS_COLLECTION, olt.id);
    await setDoc(docRef, sanitizeForFirestore(olt), { merge: true });
  } catch (err) {
    console.error("Failed to save OLT to Firestore:", err);
  }
}

export async function deleteOltFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, OLTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete OLT from Firestore:", err);
  }
}

// ── 8. SERVICE ZONES & INCIDENTS REALTIME SYNC ─────────────────────────────────

export const ZONES_COLLECTION = "zones";
export const INCIDENTS_COLLECTION = "network_incidents";

export function subscribeToZones(
  onUpdate: (zones: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, ZONES_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Zones sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveZoneToFirestore(zone: any): Promise<void> {
  try {
    const docRef = doc(db, ZONES_COLLECTION, zone.id);
    await setDoc(docRef, sanitizeForFirestore(zone), { merge: true });
  } catch (err) {
    console.error("Failed to save Zone to Firestore:", err);
  }
}

export async function deleteZoneFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, ZONES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete Zone from Firestore:", err);
  }
}

export function subscribeToIncidents(
  onUpdate: (incidents: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, INCIDENTS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Incidents sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveIncidentToFirestore(incident: any): Promise<void> {
  try {
    const docRef = doc(db, INCIDENTS_COLLECTION, incident.id);
    await setDoc(docRef, sanitizeForFirestore(incident), { merge: true });
  } catch (err) {
    console.error("Failed to save Incident to Firestore:", err);
  }
}

// ── 9. INVOICES REALTIME SYNC ─────────────────────────────────────────────────

export const INVOICES_COLLECTION = "invoices";

export function subscribeToInvoices(
  onUpdate: (invoices: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, INVOICES_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      // SAFE: Do not wipe local state on empty snapshot
      if (snapshot.empty) return;
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      if (docs.length === 0) return;
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Invoices sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveInvoiceToFirestore(invoice: any): Promise<void> {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, invoice.id);
    await setDoc(docRef, sanitizeForFirestore(invoice), { merge: true });
  } catch (err) {
    console.error("Failed to save Invoice to Firestore:", err);
  }
}

export async function saveInvoicesBatchToFirestore(invoices: any[]): Promise<void> {
  try {
    if (!invoices || invoices.length === 0) return;
    const CHUNK_SIZE = 400;
    for (let i = 0; i < invoices.length; i += CHUNK_SIZE) {
      const chunk = invoices.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const inv of chunk) {
        const docRef = doc(db, INVOICES_COLLECTION, inv.id);
        batch.set(docRef, sanitizeForFirestore(inv), { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error("Failed to batch save invoices to Firestore:", err);
  }
}

export const PACKAGES_COLLECTION = "packages";

// ── 10. PAYMENTS REALTIME SYNC ────────────────────────────────────────────────

export function subscribeToPayments(
  onUpdate: (payments: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, PAYMENTS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      // SAFE: Do not wipe local state on empty snapshot
      if (snapshot.empty) return;
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      if (docs.length === 0) return;
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Payments sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function savePaymentToFirestore(payment: any): Promise<void> {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, payment.id);
    await setDoc(docRef, sanitizeForFirestore(payment), { merge: true });
  } catch (err) {
    console.error("Failed to save Payment to Firestore:", err);
  }
}

export async function deletePaymentFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete Payment from Firestore:", err);
  }
}

// ── 11. ISP PACKAGES REALTIME SYNC ────────────────────────────────────────────

export function subscribeToPackages(
  onUpdate: (packages: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, PACKAGES_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Packages sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function savePackageToFirestore(pkg: any): Promise<void> {
  try {
    const docRef = doc(db, PACKAGES_COLLECTION, pkg.id);
    await setDoc(docRef, sanitizeForFirestore(pkg), { merge: true });
  } catch (err) {
    console.error("Failed to save Package to Firestore:", err);
  }
}

export async function deletePackageFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, PACKAGES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete Package from Firestore:", err);
  }
}

// ── 12. GATEWAY INTEGRATIONS REALTIME SYNC ─────────────────────────────────────

export const INTEGRATIONS_COLLECTION = "integrations";

export function subscribeToIntegrations(
  onUpdate: (integrations: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, INTEGRATIONS_COLLECTION);
  return onSnapshot(
    colRef,
    snapshot => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id) docs.push(data);
      });
      onUpdate(docs);
    },
    err => {
      console.warn("Firestore Integrations sync fallback (local state preserved):", err.message);
      if (onError) onError(err);
    }
  );
}

export async function saveIntegrationToFirestore(integration: any): Promise<void> {
  try {
    const docRef = doc(db, INTEGRATIONS_COLLECTION, integration.id);
    await setDoc(docRef, sanitizeForFirestore(integration), { merge: true });
  } catch (err) {
    console.error("Failed to save Integration to Firestore:", err);
  }
}

export async function deleteIntegrationFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, INTEGRATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete Integration from Firestore:", err);
  }
}



