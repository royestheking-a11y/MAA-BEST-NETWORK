// ─── ISP Store & POS Data Layer ──────────────────────────────────────────────

export type ProductCategory = "router" | "onu" | "cable" | "ups" | "switch" | "accessories" | "sfp";
export type OrderStatus = "pending" | "processing" | "delivered" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "partial";
export type PaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "on_bill";
export type StockMovementType = "IN" | "OUT";

export interface StoreProduct {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  sku: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  warrantyMonths: number;
  description: string;
  image?: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface OrderItem {
  productId: string;
  productName: string;
  model: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  warrantyMonths?: number;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  channel: "pos_walkin" | "portal_online" | "phone_booking";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  technicianAssigned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  reason: "supplier_purchase" | "customer_sale" | "tech_issued" | "damaged" | "return" | "inventory_audit";
  reference?: string;
  performedBy: string;
  date: string;
}

export interface StorePaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  trxId?: string;
  date: string;
  collectedBy: string;
}

// ─── Default Real ISP Hardware Catalog ────────────────────────────────────────

export const INITIAL_PRODUCTS: StoreProduct[] = [
  {
    id: "PRD-001",
    name: "TP-Link Archer C6 AC1200 Gigabit Router",
    category: "router",
    brand: "TP-Link",
    model: "Archer C6 (US) v3.2",
    sku: "TPL-C6-AC1200",
    buyingPrice: 2600,
    sellingPrice: 3250,
    stock: 28,
    lowStockThreshold: 5,
    warrantyMonths: 12,
    description: "Dual-Band Full Gigabit Wi-Fi Router, 4 external antennas with MU-MIMO & Beamforming for ISP fiber subscribers.",
    status: "in_stock"
  },
  {
    id: "PRD-002",
    name: "Huawei EG8145X6 Wi-Fi 6 GPON ONT / ONU",
    category: "onu",
    brand: "Huawei",
    model: "OptiXstar EG8145X6",
    sku: "HW-EG8145X6",
    buyingPrice: 3100,
    sellingPrice: 3950,
    stock: 19,
    lowStockThreshold: 4,
    warrantyMonths: 24,
    description: "Next-Gen Wi-Fi 6 AX3000 GPON Optical Terminal with 4 GE ports, 1 POTS, and dual-band high-gain coverage.",
    status: "in_stock"
  },
  {
    id: "PRD-003",
    name: "ZTE F670L Dual Band GPON ONU",
    category: "onu",
    brand: "ZTE",
    model: "ZXHN F670L",
    sku: "ZTE-F670L-V2",
    buyingPrice: 2150,
    sellingPrice: 2750,
    stock: 35,
    lowStockThreshold: 8,
    warrantyMonths: 12,
    description: "AC1200 Dual-Band GPON optical terminal with OMCI management and ISP firmware provisioning support.",
    status: "in_stock"
  },
  {
    id: "PRD-004",
    name: "Tenda AC10 1200Mbps Smart Wi-Fi Router",
    category: "router",
    brand: "Tenda",
    model: "AC10 AC1200",
    sku: "TND-AC10-1200",
    buyingPrice: 2100,
    sellingPrice: 2650,
    stock: 14,
    lowStockThreshold: 5,
    warrantyMonths: 12,
    description: "High-performance 1GHz CPU, 4x 6dBi omnidirectional antennas, and gigabit WAN/LAN ports.",
    status: "in_stock"
  },
  {
    id: "PRD-005",
    name: "WGP Mini DC UPS for Wi-Fi Router & ONU (8800mAh)",
    category: "ups",
    brand: "WGP",
    model: "WGP103-5V/9V/12V",
    sku: "WGP-UPS-8800",
    buyingPrice: 1450,
    sellingPrice: 1950,
    stock: 22,
    lowStockThreshold: 5,
    warrantyMonths: 12,
    description: "6 to 8 hours power backup for optical ONU & Wi-Fi router during electricity loadshedding.",
    status: "in_stock"
  },
  {
    id: "PRD-006",
    name: "Fiber Optic Patch Cord SC/APC to SC/UPC (3 Meter)",
    category: "accessories",
    brand: "CommScope",
    model: "SM Simplex 3.0mm",
    sku: "FIB-PTC-3M",
    buyingPrice: 90,
    sellingPrice: 180,
    stock: 85,
    lowStockThreshold: 15,
    warrantyMonths: 6,
    description: "Low-loss single-mode optical jumper cable with ceramic ferrule for ONU to TJ-box connections.",
    status: "in_stock"
  },
  {
    id: "PRD-007",
    name: "D-Link CAT6 UTP Pure Copper Patch Cord (5 Meter)",
    category: "cable",
    brand: "D-Link",
    model: "NCB-C6UGRYR-05",
    sku: "DLK-CAT6-5M",
    buyingPrice: 140,
    sellingPrice: 250,
    stock: 110,
    lowStockThreshold: 20,
    warrantyMonths: 12,
    description: "Unshielded twisted pair pure copper gigabit ethernet cable for PC, Smart TV & router links.",
    status: "in_stock"
  },
  {
    id: "PRD-008",
    name: "MikroTik hEX S 5-Port Gigabit Router (RB760iGS)",
    category: "router",
    brand: "MikroTik",
    model: "RB760iGS",
    sku: "MKT-HEX-S-760",
    buyingPrice: 5600,
    sellingPrice: 6800,
    stock: 8,
    lowStockThreshold: 3,
    warrantyMonths: 12,
    description: "Five Gigabit Ethernet ports, SFP port for optical fiber direct link, and RouterOS Level 4 license.",
    status: "in_stock"
  }
];

// ─── LocalStorage Persistence Keys ───────────────────────────────────────────

const STORAGE_KEYS = {
  PRODUCTS: "isp_store_products_v1",
  ORDERS: "isp_store_orders_v1",
  MOVEMENTS: "isp_store_movements_v1",
  PAYMENTS: "isp_store_payments_v1",
};

// ─── In-Memory Store & Subscribers ───────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

let sharedProducts: StoreProduct[] = loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
let sharedOrders: StoreOrder[] = loadFromStorage(STORAGE_KEYS.ORDERS, []);
let sharedMovements: StockMovement[] = loadFromStorage(STORAGE_KEYS.MOVEMENTS, []);
let sharedPayments: StorePaymentRecord[] = loadFromStorage(STORAGE_KEYS.PAYMENTS, []);

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

// ─── Public API Store ────────────────────────────────────────────────────────

export const storeService = {
  // Products
  getProducts: (): StoreProduct[] => sharedProducts,
  
  getProductById: (id: string): StoreProduct | undefined => {
    return sharedProducts.find(p => p.id === id);
  },

  addProduct: (productData: Omit<StoreProduct, "id" | "status">): StoreProduct => {
    const id = `PRD-${(sharedProducts.length + 1).toString().padStart(3, "0")}`;
    const status: StoreProduct["status"] =
      productData.stock <= 0
        ? "out_of_stock"
        : productData.stock <= productData.lowStockThreshold
        ? "low_stock"
        : "in_stock";

    const newProduct: StoreProduct = {
      ...productData,
      id,
      status,
    };

    sharedProducts = [newProduct, ...sharedProducts];
    saveToStorage(STORAGE_KEYS.PRODUCTS, sharedProducts);

    // Record initial stock movement
    if (newProduct.stock > 0) {
      storeService.recordStockMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: "IN",
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        unitCost: newProduct.buyingPrice,
        reason: "supplier_purchase",
        reference: "Initial Inventory Entry",
        performedBy: "Admin",
      });
    }

    notify();
    return newProduct;
  },

  updateProduct: (id: string, updates: Partial<StoreProduct>): void => {
    sharedProducts = sharedProducts.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        const status: StoreProduct["status"] =
          updated.stock <= 0
            ? "out_of_stock"
            : updated.stock <= updated.lowStockThreshold
            ? "low_stock"
            : "in_stock";
        return { ...updated, status };
      }
      return p;
    });
    saveToStorage(STORAGE_KEYS.PRODUCTS, sharedProducts);
    notify();
  },

  deleteProduct: (id: string): void => {
    sharedProducts = sharedProducts.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, sharedProducts);
    notify();
  },

  // Stock Adjustments (Stock In / Stock Out)
  adjustStock: (
    productId: string,
    type: StockMovementType,
    quantity: number,
    reason: StockMovement["reason"],
    reference?: string,
    performedBy = "Admin",
    unitCost?: number
  ): void => {
    const product = sharedProducts.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.stock;
    const newStock = type === "IN" ? previousStock + quantity : Math.max(0, previousStock - quantity);

    storeService.updateProduct(productId, { stock: newStock });

    storeService.recordStockMovement({
      productId,
      productName: product.name,
      sku: product.sku,
      type,
      quantity,
      previousStock,
      newStock,
      unitCost: unitCost || product.buyingPrice,
      reason,
      reference,
      performedBy,
    });
  },

  // Orders
  getOrders: (): StoreOrder[] => sharedOrders,

  createOrder: (orderInput: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    channel: StoreOrder["channel"];
    items: OrderItem[];
    discount?: number;
    deliveryFee?: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
    notes?: string;
  }): StoreOrder => {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const subtotal = orderInput.items.reduce((acc, item) => acc + item.total, 0);
    const discount = orderInput.discount || 0;
    const deliveryFee = orderInput.deliveryFee || 0;
    const total = Math.max(0, subtotal - discount + deliveryFee);
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newOrder: StoreOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerId: orderInput.customerId,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      customerAddress: orderInput.customerAddress,
      channel: orderInput.channel,
      items: orderInput.items,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentStatus || (orderInput.channel === "pos_walkin" ? "paid" : "unpaid"),
      orderStatus: orderInput.orderStatus || (orderInput.channel === "pos_walkin" ? "completed" : "pending"),
      notes: orderInput.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Deduct stock for all items
    orderInput.items.forEach(item => {
      const product = sharedProducts.find(p => p.id === item.productId);
      if (product) {
        storeService.adjustStock(
          item.productId,
          "OUT",
          item.quantity,
          "customer_sale",
          `Order #${orderNumber}`,
          "System",
          item.unitPrice
        );
      }
    });

    // Record payment if paid
    if (newOrder.paymentStatus === "paid") {
      storeService.recordPayment({
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        amount: newOrder.total,
        method: newOrder.paymentMethod,
        trxId: `TRX-${Date.now().toString().slice(-7)}`,
        collectedBy: orderInput.channel === "pos_walkin" ? "Desk Admin" : "Online Gateway",
      });
    }

    sharedOrders = [newOrder, ...sharedOrders];
    saveToStorage(STORAGE_KEYS.ORDERS, sharedOrders);
    notify();
    return newOrder;
  },

  updateOrderStatus: (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    notes?: string,
    technicianAssigned?: string
  ): void => {
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    sharedOrders = sharedOrders.map(o => {
      if (o.id === orderId) {
        const wasUnpaid = o.paymentStatus !== "paid";
        const isNowPaid = paymentStatus === "paid";

        if (wasUnpaid && isNowPaid) {
          storeService.recordPayment({
            orderId: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            amount: o.total,
            method: o.paymentMethod,
            trxId: `TRX-${Date.now().toString().slice(-7)}`,
            collectedBy: "Field / Admin",
          });
        }

        return {
          ...o,
          orderStatus,
          paymentStatus: paymentStatus || o.paymentStatus,
          notes: notes !== undefined ? notes : o.notes,
          technicianAssigned: technicianAssigned !== undefined ? technicianAssigned : o.technicianAssigned,
          updatedAt: now,
        };
      }
      return o;
    });

    saveToStorage(STORAGE_KEYS.ORDERS, sharedOrders);
    notify();
  },

  // Stock Movement Log
  getStockMovements: (): StockMovement[] => sharedMovements,

  recordStockMovement: (data: Omit<StockMovement, "id" | "date">): void => {
    const movement: StockMovement = {
      ...data,
      id: `MOV-${Date.now()}`,
      date: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
    };
    sharedMovements = [movement, ...sharedMovements];
    saveToStorage(STORAGE_KEYS.MOVEMENTS, sharedMovements);
    notify();
  },

  // Payments Log
  getPayments: (): StorePaymentRecord[] => sharedPayments,

  recordPayment: (data: Omit<StorePaymentRecord, "id" | "date">): void => {
    const payment: StorePaymentRecord = {
      ...data,
      id: `PMT-${Date.now()}`,
      date: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
    };
    sharedPayments = [payment, ...sharedPayments];
    saveToStorage(STORAGE_KEYS.PAYMENTS, sharedPayments);
    notify();
  },

  // Analytics Stats
  getStats: () => {
    const totalSales = sharedOrders
      .filter(o => o.orderStatus !== "cancelled")
      .reduce((acc, o) => acc + o.total, 0);

    const totalOrders = sharedOrders.length;
    const pendingOrders = sharedOrders.filter(o => o.orderStatus === "pending" || o.orderStatus === "processing").length;
    const completedOrders = sharedOrders.filter(o => o.orderStatus === "completed" || o.orderStatus === "delivered").length;
    
    const totalProductsCount = sharedProducts.length;
    const totalUnitsInStock = sharedProducts.reduce((acc, p) => acc + p.stock, 0);
    const totalStockValue = sharedProducts.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
    const lowStockCount = sharedProducts.filter(p => p.status === "low_stock" || p.status === "out_of_stock").length;

    const totalStockIn = sharedMovements
      .filter(m => m.type === "IN")
      .reduce((acc, m) => acc + m.quantity, 0);

    const totalStockOut = sharedMovements
      .filter(m => m.type === "OUT")
      .reduce((acc, m) => acc + m.quantity, 0);

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProductsCount,
      totalUnitsInStock,
      totalStockValue,
      lowStockCount,
      totalStockIn,
      totalStockOut,
    };
  },

  // Subscriber pattern
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};
