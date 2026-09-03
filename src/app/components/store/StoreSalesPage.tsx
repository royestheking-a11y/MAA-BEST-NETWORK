import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Store, Plus, Search, Filter, Printer, CheckCircle2,
  Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, Package,
  DollarSign, CreditCard, User, Phone, MapPin, Tag, RefreshCw,
  Eye, Check, X, ShieldCheck, Truck, ChevronRight, Layers,
  Trash2, Edit3, ArrowRight, Smartphone, Calendar, FileText,
  TrendingUp, BarChart2, CheckCircle, HelpCircle, HardDrive
} from "lucide-react";
import {
  storeService, StoreProduct, StoreOrder, OrderItem,
  StockMovement, StorePaymentRecord, ProductCategory,
  OrderStatus, PaymentStatus, PaymentMethod, StockMovementType
} from "../../data/storeData";
import { useCustomerContext } from "../../context/CustomerContext";
import { useLanguage } from "../../context/LanguageContext";

interface StoreSalesPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "dashboard" | "pos" | "products" | "orders" | "stock_ledger" | "payments";

export function StoreSalesPage({ onNavigate }: StoreSalesPageProps) {
  const { customers } = useCustomerContext();
  const { t, bnNum } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [products, setProducts] = useState<StoreProduct[]>(storeService.getProducts());
  const [orders, setOrders] = useState<StoreOrder[]>(storeService.getOrders());
  const [movements, setMovements] = useState<StockMovement[]>(storeService.getStockMovements());
  const [payments, setPayments] = useState<StorePaymentRecord[]>(storeService.getPayments());
  const [stats, setStats] = useState(storeService.getStats());

  // POS State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [posCustomerType, setPosCustomerType] = useState<"walkin" | "subscriber">("walkin");
  const [selectedSubscriberId, setSelectedSubscriberId] = useState("");
  const [posCustomerName, setPosCustomerName] = useState("Walk-in Office Customer");
  const [posCustomerPhone, setPosCustomerPhone] = useState("01700-000000");
  const [posCustomerAddress, setPosCustomerAddress] = useState("MBN Office Counter");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posDeliveryFee, setPosDeliveryFee] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>("cash");
  const [posNotes, setPosNotes] = useState("");
  const [posSearchProduct, setPosSearchProduct] = useState("");
  const [posCategoryFilter, setPosCategoryFilter] = useState<string>("all");

  // Receipt / Invoice Modal State
  const [printedOrder, setPrintedOrder] = useState<StoreOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "router" as ProductCategory,
    brand: "",
    model: "",
    sku: "",
    buyingPrice: 0,
    sellingPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    warrantyMonths: 12,
    description: "",
  });

  // Stock In / Out Adjustment Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState<StoreProduct | null>(null);
  const [stockAdjustmentType, setStockAdjustmentType] = useState<StockMovementType>("IN");
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [stockReason, setStockReason] = useState<StockMovement["reason"]>("supplier_purchase");
  const [stockReference, setStockReference] = useState("");

  // Order Details Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<StoreOrder | null>(null);

  // Search & Filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Sync with storeService
  const refreshData = () => {
    setProducts([...storeService.getProducts()]);
    setOrders([...storeService.getOrders()]);
    setMovements([...storeService.getStockMovements()]);
    setPayments([...storeService.getPayments()]);
    setStats(storeService.getStats());
  };

  useEffect(() => {
    const unsub = storeService.subscribe(refreshData);
    return () => unsub();
  }, []);

  // When subscriber selected in POS
  const handleSubscriberSelect = (subscriberId: string) => {
    setSelectedSubscriberId(subscriberId);
    if (!subscriberId) {
      setPosCustomerName("Walk-in Office Customer");
      setPosCustomerPhone("01700-000000");
      setPosCustomerAddress("MBN Office Counter");
      return;
    }
    const sub = customers.find(c => c.id === subscriberId || c.clientCode === subscriberId);
    if (sub) {
      setPosCustomerName(sub.name);
      setPosCustomerPhone(sub.phone);
      setPosCustomerAddress(sub.address || sub.zone || "Dhaka");
    }
  };

  // Cart operations
  const addToCart = (product: StoreProduct) => {
    if (product.stock <= 0) {
      showToast(`⚠️ ${product.name} is currently OUT OF STOCK!`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        showToast(`⚠️ Only ${product.stock} units available in stock!`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].total = updatedCart[existingIndex].quantity * updatedCart[existingIndex].unitPrice;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          model: product.model,
          sku: product.sku,
          unitPrice: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
          warrantyMonths: product.warrantyMonths,
        }
      ]);
    }
    showToast(`✓ Added ${product.name} to POS Cart`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    const updated = cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (product && newQty > product.stock) {
          showToast(`⚠️ Maximum ${product.stock} units in stock!`);
          return item;
        }
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.unitPrice,
        };
      }
      return item;
    }).filter(Boolean) as OrderItem[];

    setCart(updated);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const cartTotal = Math.max(0, cartSubtotal - posDiscount + posDeliveryFee);

  // Complete POS Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      showToast("⚠️ Please add at least one product to the POS bill!");
      return;
    }

    const newOrder = storeService.createOrder({
      customerId: posCustomerType === "subscriber" ? selectedSubscriberId : undefined,
      customerName: posCustomerName.trim() || "Walk-in Customer",
      customerPhone: posCustomerPhone.trim() || "N/A",
      customerAddress: posCustomerAddress.trim() || "Office Counter",
      channel: "pos_walkin",
      items: cart,
      discount: Number(posDiscount) || 0,
      deliveryFee: Number(posDeliveryFee) || 0,
      paymentMethod: posPaymentMethod,
      paymentStatus: "paid",
      orderStatus: "completed",
      notes: posNotes,
    });

    // Reset POS form
    setCart([]);
    setPosDiscount(0);
    setPosDeliveryFee(0);
    setPosNotes("");
    if (posCustomerType === "walkin") {
      setPosCustomerName("Walk-in Office Customer");
      setPosCustomerPhone("01700-000000");
    }

    setPrintedOrder(newOrder);
    setShowReceiptModal(true);
    showToast(`✓ Order #${newOrder.orderNumber} successfully completed & recorded!`);
  };

  // Product Create/Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.sellingPrice <= 0) {
      showToast("⚠️ Please enter a valid product name and selling price!");
      return;
    }

    if (editingProduct) {
      storeService.updateProduct(editingProduct.id, {
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        model: productForm.model,
        sku: productForm.sku,
        buyingPrice: Number(productForm.buyingPrice),
        sellingPrice: Number(productForm.sellingPrice),
        stock: Number(productForm.stock),
        lowStockThreshold: Number(productForm.lowStockThreshold),
        warrantyMonths: Number(productForm.warrantyMonths),
        description: productForm.description,
      });
      showToast(`✓ Product "${productForm.name}" updated!`);
    } else {
      storeService.addProduct({
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        model: productForm.model,
        sku: productForm.sku || `SKU-${Date.now().toString().slice(-4)}`,
        buyingPrice: Number(productForm.buyingPrice),
        sellingPrice: Number(productForm.sellingPrice),
        stock: Number(productForm.stock),
        lowStockThreshold: Number(productForm.lowStockThreshold),
        warrantyMonths: Number(productForm.warrantyMonths),
        description: productForm.description,
      });
      showToast(`✓ New product "${productForm.name}" added to catalog!`);
    }

    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Stock Adjustment Submit
  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTargetProduct || stockQuantity <= 0) return;

    storeService.adjustStock(
      stockTargetProduct.id,
      stockAdjustmentType,
      Number(stockQuantity),
      stockReason,
      stockReference || (stockAdjustmentType === "IN" ? "Supplier Restock" : "Manual Adjustment"),
      "Super Admin"
    );

    showToast(`✓ Stock ${stockAdjustmentType === "IN" ? "replenished" : "deducted"} for ${stockTargetProduct.name}!`);
    setShowStockModal(false);
    setStockTargetProduct(null);
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    const matchQ = !productSearch || p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
    return matchQ && matchCat;
  });

  const filteredPosProducts = products.filter(p => {
    const q = posSearchProduct.toLowerCase();
    const matchQ = !posSearchProduct || p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = posCategoryFilter === "all" || p.category === posCategoryFilter;
    return matchQ && matchCat;
  });

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchQ = !orderSearch || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
    const matchStatus = orderStatusFilter === "all" || o.orderStatus === orderStatusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: "linear-gradient(135deg, #8B2020, #DC2626)" }}>
              <ShoppingBag size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              ISP Hardware Store & POS Counter
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
              SELLER HUB
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Manage product inventory, walk-in office POS billing, online subscriber hardware orders, stock in/out ledger & payments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setCart([]);
              setActiveTab("pos");
            }}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 transition-all cursor-pointer">
            <Store size={14} /> Open POS Register
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: "",
                category: "router",
                brand: "",
                model: "",
                sku: `SKU-${Date.now().toString().slice(-4)}`,
                buyingPrice: 1500,
                sellingPrice: 2200,
                stock: 10,
                lowStockThreshold: 3,
                warrantyMonths: 12,
                description: "",
              });
              setShowProductModal(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-border hover:bg-muted font-bold text-xs text-foreground flex items-center gap-1.5 transition-all cursor-pointer">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Top Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin border-b border-border">
        {[
          { id: "dashboard", label: "Store Dashboard", icon: BarChart2, badge: undefined },
          { id: "pos", label: "POS Walk-in Billing", icon: Store, badge: cart.length > 0 ? `${cart.length} items` : undefined },
          { id: "products", label: "Hardware Inventory", icon: Package, badge: `${products.length}` },
          { id: "orders", label: "Sales & Orders", icon: FileText, badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} new` : undefined },
          { id: "stock_ledger", label: "Stock In / Out Ledger", icon: Layers, badge: undefined },
          { id: "payments", label: "Sales Payments", icon: CreditCard, badge: undefined },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DASHBOARD ─────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <span>Total Product Sales</span>
                <DollarSign size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                ৳ {stats.totalSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">
                From {stats.totalOrders} total completed orders
              </p>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <span>Stock Units in Store</span>
                <Package size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {stats.totalUnitsInStock} <span className="text-xs font-normal text-muted-foreground">units</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Worth ৳ {stats.totalStockValue.toLocaleString()} across {stats.totalProductsCount} SKUs
              </p>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <span>Pending Delivery</span>
                <Truck size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {stats.pendingOrders} <span className="text-xs font-normal text-muted-foreground">orders</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Online portal & field install orders
              </p>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <span>Stock In / Out</span>
                <Layers size={16} className="text-purple-500" />
              </div>
              <div className="flex items-center gap-3 text-sm font-bold font-mono">
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <ArrowDownRight size={14} /> +{stats.totalStockIn} IN
                </span>
                <span className="text-rose-500 flex items-center gap-0.5">
                  <ArrowUpRight size={14} /> -{stats.totalStockOut} OUT
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.lowStockCount > 0 ? `${stats.lowStockCount} items need restock` : "All stocks healthy"}
              </p>
            </div>
          </div>

          {/* Quick Actions & Recent Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Product Cards */}
            <div className="lg:col-span-2 bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <Package size={16} className="text-primary" /> Popular Hardware Items (1-Click POS Sell)
                </h3>
                <button
                  onClick={() => setActiveTab("products")}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View Catalog ({products.length}) <ChevronRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 6).map(product => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-card border border-border text-muted-foreground">
                          {product.category}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          product.stock <= 0 ? "text-rose-500" : product.stock <= product.lowStockThreshold ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                      <p className="text-xs font-mono font-black text-primary mt-1">৳ {product.sellingPrice.toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(product);
                        setActiveTab("pos");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-xs">
                      <Plus size={13} /> Sell
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recent Orders Feed */}
            <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" /> Recent Sales Feed
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-primary hover:underline">
                  All Orders ({orders.length})
                </button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                    <ShoppingBag size={28} className="mx-auto opacity-30 text-primary" />
                    <p className="font-bold text-foreground">No Sales Yet</p>
                    <p>Open POS Counter to bill your first hardware sale.</p>
                  </div>
                ) : (
                  orders.slice(0, 5).map(order => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderDetails(order);
                      }}
                      className="p-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.orderStatus === "completed" || order.orderStatus === "delivered" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                          order.orderStatus === "processing" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                          order.orderStatus === "cancelled" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground truncate">{order.customerName}</span>
                        <span className="font-mono font-bold text-primary">৳ {order.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{order.items.length} item(s)</span>
                        <span>{order.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: POS WALK-IN BILLING ───────────────────────────────────────── */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Product Catalog & Selector */}
          <div className="lg:col-span-2 bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-foreground flex items-center gap-2">
                  <Store size={18} className="text-primary" /> Select Hardware to Sell
                </h3>
                <p className="text-xs text-muted-foreground">Click on any product to add to the customer's POS register.</p>
              </div>

              {/* POS Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["all", "router", "onu", "ups", "cable", "accessories"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPosCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      posCategoryFilter === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product name, model (e.g. Archer C6, EG8145X6), SKU..."
                value={posSearchProduct}
                onChange={e => setPosSearchProduct(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-border bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredPosProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isOutOfStock
                        ? "opacity-50 bg-muted/20 border-border cursor-not-allowed"
                        : "bg-card border-border hover:border-primary hover:shadow-sm"
                    }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-muted text-muted-foreground">
                          {product.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isOutOfStock ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                          product.stock <= product.lowStockThreshold ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{product.brand} · {product.model}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                      <span className="font-mono text-sm font-black text-primary">
                        ৳ {product.sellingPrice.toLocaleString()}
                      </span>
                      <button
                        disabled={isOutOfStock}
                        className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: POS Register / Cart / Invoice Confirmation */}
          <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-primary" />
                  <h3 className="font-black text-sm text-foreground">POS Sales Register</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer">
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">CUSTOMER TYPE</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="pos_cust_type"
                        checked={posCustomerType === "walkin"}
                        onChange={() => {
                          setPosCustomerType("walkin");
                          handleSubscriberSelect("");
                        }}
                      />
                      <span>Walk-in</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="pos_cust_type"
                        checked={posCustomerType === "subscriber"}
                        onChange={() => setPosCustomerType("subscriber")}
                      />
                      <span>ISP Client</span>
                    </label>
                  </div>
                </div>

                {posCustomerType === "subscriber" ? (
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">SELECT EXISTING SUBSCRIBER</label>
                    <select
                      value={selectedSubscriberId}
                      onChange={e => handleSubscriberSelect(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none">
                      <option value="">-- Choose Subscriber (190 Connected) --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.clientCode || c.id} - {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={posCustomerName}
                      onChange={e => setPosCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Customer Phone"
                      value={posCustomerPhone}
                      onChange={e => setPosCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                    <ShoppingBag size={24} className="mx-auto opacity-30 text-primary" />
                    <p className="font-bold text-foreground">Cart is Empty</p>
                    <p>Select products from the left to begin.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className="p-2.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground truncate">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          ৳ {item.unitPrice.toLocaleString()} × {item.quantity} = <strong>৳ {item.total.toLocaleString()}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.productId, -1)}
                          className="w-6 h-6 rounded-lg bg-muted border border-border font-black text-foreground flex items-center justify-center hover:bg-muted/80">
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, 1)}
                          className="w-6 h-6 rounded-lg bg-muted border border-border font-black text-foreground flex items-center justify-center hover:bg-muted/80">
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 ml-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Billing Computations */}
              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-foreground">৳ {cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Discount (৳)</span>
                  <input
                    type="number"
                    min="0"
                    value={posDiscount || ""}
                    onChange={e => setPosDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-24 px-2 py-1 rounded-lg border border-border bg-muted/40 text-right font-mono font-bold text-foreground outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Delivery / Setup Fee (৳)</span>
                  <input
                    type="number"
                    min="0"
                    value={posDeliveryFee || ""}
                    onChange={e => setPosDeliveryFee(Number(e.target.value))}
                    placeholder="0"
                    className="w-24 px-2 py-1 rounded-lg border border-border bg-muted/40 text-right font-mono font-bold text-foreground outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-border text-foreground">
                  <span>Payable Total</span>
                  <span className="font-mono text-base text-primary">৳ {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="font-bold text-muted-foreground block text-[11px] mb-1.5">PAYMENT METHOD</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: "cash", label: "Cash Desk", icon: DollarSign },
                    { id: "bkash", label: "bKash Merchant", icon: Smartphone },
                    { id: "nagad", label: "Nagad Pay", icon: Smartphone },
                    { id: "bank", label: "Card / Bank", icon: CreditCard },
                    { id: "on_bill", label: "Add to ISP Bill", icon: FileText },
                  ].map(m => {
                    const isSel = posPaymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPosPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSel
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                        }`}>
                        <Icon size={13} />
                        <span className="truncate text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirm & Complete POS Button */}
            <button
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer mt-4">
              <Printer size={15} /> Confirm & Print Invoice (৳ {cartTotal.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: HARDWARE INVENTORY CATALOG ────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by model, brand, SKU..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none">
                <option value="all">All Hardware Categories</option>
                <option value="router">Wi-Fi Routers</option>
                <option value="onu">GPON / EPON ONUs</option>
                <option value="ups">DC Mini UPS & Power</option>
                <option value="cable">CAT6 Ethernet Cables</option>
                <option value="accessories">Optical Patch Cords & Tools</option>
              </select>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    category: "router",
                    brand: "",
                    model: "",
                    sku: `SKU-${Date.now().toString().slice(-4)}`,
                    buyingPrice: 1500,
                    sellingPrice: 2200,
                    stock: 10,
                    lowStockThreshold: 3,
                    warrantyMonths: 12,
                    description: "",
                  });
                  setShowProductModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
                <Plus size={14} /> Add Product
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Product Name & Model</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">SKU / Code</th>
                  <th className="p-3.5">Buying Cost</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Warranty</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{p.brand} · {p.model}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-muted text-muted-foreground border border-border">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground font-bold">{p.sku}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">৳ {p.buyingPrice.toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-black text-primary">৳ {p.sellingPrice.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.stock <= 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                        p.stock <= p.lowStockThreshold ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {p.stock} units ({p.status.replace("_", " ")})
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{p.warrantyMonths} Months</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setStockTargetProduct(p);
                            setStockAdjustmentType("IN");
                            setStockQuantity(10);
                            setStockReason("supplier_purchase");
                            setShowStockModal(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Restock / Stock In">
                          <Plus size={12} /> Stock In
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              category: p.category,
                              brand: p.brand,
                              model: p.model,
                              sku: p.sku,
                              buyingPrice: p.buyingPrice,
                              sellingPrice: p.sellingPrice,
                              stock: p.stock,
                              lowStockThreshold: p.lowStockThreshold,
                              warrantyMonths: p.warrantyMonths,
                              description: p.description,
                            });
                            setShowProductModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: SALES & ORDERS ────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders by order #, customer name, phone..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none">
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer Details</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total (৳)</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Order Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-xs text-muted-foreground">
                      No sales orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-muted text-muted-foreground">
                          {order.channel === "pos_walkin" ? "POS Counter" : order.channel === "portal_online" ? "Customer Portal" : "Phone"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-foreground">{order.items.length} item(s)</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {order.items.map(i => `${i.productName} (${i.quantity})`).join(", ")}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-black text-primary">
                        ৳ {order.total.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          order.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                          "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        }`}>
                          {order.paymentStatus} ({order.paymentMethod})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={order.orderStatus}
                          onChange={e => {
                            storeService.updateOrderStatus(order.id, e.target.value as OrderStatus, order.paymentStatus);
                            showToast(`✓ Order #${order.orderNumber} status updated to ${e.target.value}!`);
                          }}
                          className="px-2 py-1 rounded-xl border border-border bg-card text-[11px] font-bold text-foreground outline-none cursor-pointer">
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-muted-foreground text-[11px]">
                        {order.createdAt}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setPrintedOrder(order);
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 ml-auto cursor-pointer">
                          <Printer size={13} /> Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: STOCK IN / OUT LEDGER ─────────────────────────────────────── */}
      {activeTab === "stock_ledger" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-foreground">Stock Movement Audit Trail</h3>
              <p className="text-xs text-muted-foreground">Complete ledger of supplier purchases, customer sales, and technician dispatches.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Previous → New Stock</th>
                  <th className="p-3.5">Reason / Ref</th>
                  <th className="p-3.5 text-right">By User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-xs text-muted-foreground">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 text-muted-foreground font-mono">{m.date}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{m.productName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{m.sku}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          m.type === "IN"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        }`}>
                          {m.type === "IN" ? "+ STOCK IN" : "- STOCK OUT"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-foreground">
                        {m.type === "IN" ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {m.previousStock} units → <strong className="text-foreground">{m.newStock} units</strong>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-foreground uppercase text-[10px]">{m.reason.replace("_", " ")}</span>
                        {m.reference && <div className="text-[10px] text-muted-foreground">{m.reference}</div>}
                      </td>
                      <td className="p-3.5 text-right font-bold text-muted-foreground">
                        {m.performedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: SALES PAYMENTS ────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-foreground">Hardware Sales Payment Receipts</h3>
              <p className="text-xs text-muted-foreground">Cash desk and digital gateway collections for hardware and accessory sales.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount (৳)</th>
                  <th className="p-3.5 text-right">Collected By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-xs text-muted-foreground">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(pmt => (
                    <tr key={pmt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 text-muted-foreground font-mono">{pmt.date}</td>
                      <td className="p-3.5 font-mono font-bold text-foreground">{pmt.id}</td>
                      <td className="p-3.5 font-mono text-primary font-bold">{pmt.orderNumber}</td>
                      <td className="p-3.5 font-bold text-foreground">{pmt.customerName}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-muted text-muted-foreground border border-border">
                          {pmt.method}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ৳ {pmt.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right text-muted-foreground font-bold">
                        {pmt.collectedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: PRINTABLE RECEIPT / TAX INVOICE ───────────────────────────── */}
      {showReceiptModal && printedOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border print:hidden">
              <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" /> Sales Invoice Ready
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs">
                  <Printer size={13} /> Print Invoice
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-pos-invoice" className="p-4 rounded-2xl border border-border/80 bg-white text-black space-y-4 font-sans text-xs shadow-inner">
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-neutral-300 space-y-1">
                <h2 className="font-black text-base text-neutral-900 tracking-tight">MAA BEST NETWORK</h2>
                <p className="text-[10px] text-neutral-600">Hardware Sales & Broadband Solutions</p>
                <p className="text-[10px] text-neutral-500">Dhaka, Bangladesh · Hotline: 01700-000000</p>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-neutral-100 text-neutral-800 border border-neutral-300 mt-1">
                  OFFICIAL CASH / SALES MEMO
                </div>
              </div>

              {/* Order Meta */}
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-neutral-200">
                <div>
                  <p><strong>Order #:</strong> {printedOrder.orderNumber}</p>
                  <p><strong>Customer:</strong> {printedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {printedOrder.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {printedOrder.createdAt}</p>
                  <p><strong>Payment:</strong> <span className="uppercase font-bold text-emerald-700">{printedOrder.paymentMethod} (PAID)</span></p>
                  <p><strong>Channel:</strong> {printedOrder.channel === "pos_walkin" ? "Counter POS" : "Online Order"}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] text-neutral-500 uppercase border-b border-neutral-200 pb-1">
                  <span>Item Description</span>
                  <span className="w-12 text-center">Qty</span>
                  <span className="w-16 text-right">Price</span>
                  <span className="w-16 text-right">Total</span>
                </div>

                {printedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-neutral-100 text-[11px]">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-neutral-900">{item.productName}</p>
                      <p className="text-[10px] text-neutral-500">{item.warrantyMonths || 12}M Warranty</p>
                    </div>
                    <span className="w-12 text-center font-mono">{item.quantity}</span>
                    <span className="w-16 text-right font-mono">৳{item.unitPrice}</span>
                    <span className="w-16 text-right font-mono font-bold">৳{item.total}</span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1 text-[11px]">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳ {printedOrder.subtotal.toLocaleString()}</span>
                </div>
                {printedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono">- ৳ {printedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                {printedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery / Installation Fee:</span>
                    <span className="font-mono">+ ৳ {printedOrder.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-neutral-900 pt-1 border-t border-neutral-300">
                  <span>Total Paid:</span>
                  <span className="font-mono text-emerald-800">৳ {printedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 border-t border-dashed border-neutral-300 text-[10px] text-neutral-500 space-y-1">
                <p>Thank you for purchasing with MAA BEST NETWORK!</p>
                <p>Please keep this invoice safely for warranty claims.</p>
                <p className="font-mono text-[9px] text-neutral-400">Software Generated Receipt · No Signature Required</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 print:hidden">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-foreground font-bold text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PRODUCT ─────────────────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                <Package size={18} className="text-primary" />
                {editingProduct ? "Edit Hardware Product" : "Add New Hardware Product"}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">PRODUCT NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TP-Link Archer C6 AC1200 Gigabit Router"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CATEGORY</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none">
                    <option value="router">Wi-Fi Router</option>
                    <option value="onu">GPON / EPON ONU</option>
                    <option value="ups">DC Mini UPS & Power</option>
                    <option value="cable">CAT6 Cable</option>
                    <option value="switch">Ethernet Switch</option>
                    <option value="accessories">Optical Patch Cord & Tools</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">BRAND</label>
                  <input
                    type="text"
                    placeholder="e.g. TP-Link, Huawei, ZTE, WGP"
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">MODEL</label>
                  <input
                    type="text"
                    placeholder="e.g. Archer C6 v3.2"
                    value={productForm.model}
                    onChange={e => setProductForm({ ...productForm, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SKU / ITEM CODE</label>
                  <input
                    type="text"
                    placeholder="e.g. TPL-C6-AC1200"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">BUYING COST (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2600"
                    value={productForm.buyingPrice || ""}
                    onChange={e => setProductForm({ ...productForm, buyingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SELLING PRICE (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="3250"
                    value={productForm.sellingPrice || ""}
                    onChange={e => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 outline-none font-mono font-bold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">INITIAL STOCK</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">LOW STOCK ALERT</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.lowStockThreshold}
                    onChange={e => setProductForm({ ...productForm, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">WARRANTY (M)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.warrantyMonths}
                    onChange={e => setProductForm({ ...productForm, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Key features, specifications, and subscriber compatibility..."
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-xs">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: STOCK IN / STOCK OUT ADJUSTMENT ───────────────────────────── */}
      {showStockModal && stockTargetProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                Adjust Stock: {stockTargetProduct.name}
              </h3>
              <button onClick={() => setShowStockModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{stockTargetProduct.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">SKU: {stockTargetProduct.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">CURRENT STOCK</p>
                  <p className="text-base font-black text-primary font-mono">{stockTargetProduct.stock} units</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">MOVEMENT TYPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStockAdjustmentType("IN");
                      setStockReason("supplier_purchase");
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      stockAdjustmentType === "IN"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-muted/30 border-border text-muted-foreground"
                    }`}>
                    + Stock In (Add Units)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockAdjustmentType("OUT");
                      setStockReason("tech_issued");
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      stockAdjustmentType === "OUT"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-muted/30 border-border text-muted-foreground"
                    }`}>
                    - Stock Out (Deduct Units)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">QUANTITY *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQuantity}
                    onChange={e => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">REASON</label>
                  <select
                    value={stockReason}
                    onChange={e => setStockReason(e.target.value as StockMovement["reason"])}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none">
                    {stockAdjustmentType === "IN" ? (
                      <>
                        <option value="supplier_purchase">Supplier Purchase Restock</option>
                        <option value="return">Customer Return / Replacement</option>
                        <option value="inventory_audit">Inventory Audit Correction</option>
                      </>
                    ) : (
                      <>
                        <option value="tech_issued">Issued to Field Technician</option>
                        <option value="damaged">Damaged / Defective Loss</option>
                        <option value="inventory_audit">Inventory Audit Correction</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">INVOICE / PO REFERENCE</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-0814 or Tech Rakib Issue"
                  value={stockReference}
                  onChange={e => setStockReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-xs">
                  Record Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
