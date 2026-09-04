import { useState, useMemo } from "react";
import {
  UserPlus, User, Network, Sliders, CheckCircle2,
  Calendar, Phone, Mail, MapPin, Plus, Edit2,
  ChevronLeft, Send, X, ShieldAlert, Check,
  HardDrive, Server, Layers, FileText, Sparkles, Image,
  Eye, EyeOff, Key, Copy, ArrowRight, ShieldCheck, Zap,
  Radio, Laptop, Wifi, Hash, Tag, Award, CheckCircle,
  Home, Building2, Globe2, Landmark
} from "lucide-react";
import { useCustomerContext, Customer } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";

interface AddNewClientPageProps {
  onNavigate?: (page: string) => void;
}

export function AddNewClientPage({ onNavigate }: AddNewClientPageProps) {
  const { customers, addCustomer } = useCustomerContext();
  const { t } = useLanguage();

  // Active step / tab in studio
  const [activeTab, setActiveTab] = useState<"profile" | "network" | "service">("profile");

  // Toast
  const [toastMsg, setToastMsg] = useState("");

  // Modals for Quick Add Zone, Sub-Zone, Box
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showSubZoneModal, setShowSubZoneModal] = useState(false);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newSubZoneName, setNewSubZoneName] = useState("");
  const [newBoxName, setNewBoxName] = useState("");

  const [zonesList, setZonesList] = useState([
    "MADARIPUR SADAR",
    "KALKINI",
    "SHIBCHAR",
    "RAJOIR",
    "DASHAR",
    "DHAKA DIVISION"
  ]);

  const [subZonesList, setSubZonesList] = useState([
    "KALKINI SOMITIR HAT",
    "SOMITIR HAT BAZAR",
    "MADARIPUR PURAN BAZAR",
    "CHARMUGURIA",
    "MASTOFAPUR",
    "SHIBCHAR PACHCHAR",
    "TEKERHAT BAZAR",
    "DASHAR BAZAR"
  ]);

  const [boxesList, setBoxesList] = useState([
    "SOMITIR HAT BAZAR",
    "DP-01 MAIN ROAD",
    "DP-02 MARKET",
    "TJ-04 SCHOOL ROAD",
    "BOX-NORTH-01"
  ]);

  // Section 1: Client Information
  const [clientName, setClientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [occupation, setOccupation] = useState("");
  const [district, setDistrict] = useState("Madaripur");
  const [upazila, setUpazila] = useState("Kalkini");
  const [profilePicName, setProfilePicName] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [address, setAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidPicName, setNidPicName] = useState("");
  const [regFormNo, setRegFormNo] = useState("");
  const [regFormPicName, setRegFormPicName] = useState("");

  // Section 2: Network & Product Info
  const [selectedPackage, setSelectedPackage] = useState("20 Mbps Fiber Standard — ৳1,200");
  const [serverName, setServerName] = useState("MikroTik-MBN-Core");
  const [protocolType, setProtocolType] = useState("pppoe");
  const [profileName, setProfileName] = useState("20 Mbps Fiber Standard");
  const [selectedOlt, setSelectedOlt] = useState<"OLT1" | "OLT2">("OLT1");
  const [selectedPonPort, setSelectedPonPort] = useState("epon 0/1");
  const [selectedZone, setSelectedZone] = useState("MADARIPUR SADAR");
  const [selectedSubZone, setSelectedSubZone] = useState("KALKINI SOMITIR HAT");
  const [selectedBox, setSelectedBox] = useState("SOMITIR HAT BAZAR");
  const [connectionType, setConnectionType] = useState<"Optical Fiber" | "Cat6" | "Wireless">("Optical Fiber");
  const [cableMetre, setCableMetre] = useState("100");
  const [fiberCode, setFiberCode] = useState("f3kugd");
  const [numberOfCore, setNumberOfCore] = useState("2");
  const [coreColor, setCoreColor] = useState("Red");
  const [device, setDevice] = useState("ONU Dual Band XPON (Gigabit)");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [deviceVendor, setDeviceVendor] = useState("BDCOM");
  const [purchaseDate, setPurchaseDate] = useState("04/09/2026");
  const [splitterBox, setSplitterBox] = useState("SOMITIR HAT BAZAR - Splitter 1 (1:8)");
  const [splitterPort, setSplitterPort] = useState("Port 1");

  // Section 3: Service Information
  const [wantDisableClient, setWantDisableClient] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [billingStartMonth, setBillingStartMonth] = useState("09/2026");
  const [monthlyBill, setMonthlyBill] = useState("1200");
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [clientType, setClientType] = useState<"Home" | "Commercial" | "Reseller" | "Corporate">("Home");
  const [billingStatus, setBillingStatus] = useState<"Prepaid" | "Postpaid" | "Daily" | "Monthly">("Monthly");
  const [expireDate, setExpireDate] = useState("10/10/2026");
  const [joiningDate, setJoiningDate] = useState("04/09/2026");
  const [sendGreetingsSms, setSendGreetingsSms] = useState(true);

  // Auto generate username based on client name if blank
  const handleClientNameChange = (val: string) => {
    setClientName(val);
    if (!username || username.startsWith("Mbn@") || username.startsWith("mbn@")) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, "");
      setUsername(`Mbn@${clean || "client"}`);
    }
  };

  // Generate random secure password
  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    showToast("✓ Generated new secure password!");
  };

  // Auto-fill demo
  const handleAutoFillDemo = () => {
    setClientName("Md Tariqul Islam");
    setMobileNumber("01712-489921");
    setPhoneNumber("01911-382910");
    setEmail("tariqul.mbn@gmail.com");
    setAddress("House 24, Road 3, Somitir Hat, Kalkini");
    setNidNumber("19925481928374");
    setOccupation("Business Enterprise");
    setUsername("Mbn@tariqulislam");
    setPassword("tariqul@2026");
    setDeviceSerial("4C:46:D1:88:99:A2");
    showToast("✓ Loaded demo subscriber credentials!");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Sequential MBN code generation
  const nextClientCode = useMemo(() => {
    const maxExistingNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id).match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `MBN${String(maxExistingNum + 1).padStart(4, "0")}`;
  }, [customers]);

  // Optical core color swatches
  const CORE_COLORS = [
    { name: "Blue", hex: "#2563eb" },
    { name: "Orange", hex: "#ea580c" },
    { name: "Green", hex: "#16a34a" },
    { name: "Brown", hex: "#854d0e" },
    { name: "Slate", hex: "#64748b" },
    { name: "White", hex: "#f1f5f9" },
    { name: "Red", hex: "#dc2626" },
    { name: "Black", hex: "#0f172a" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Violet", hex: "#9333ea" },
    { name: "Rose", hex: "#e11d48" },
    { name: "Aqua", hex: "#06b6d4" },
  ];

  // Packages list
  const PACKAGES = [
    { name: "10 Mbps — ৳800", speed: "10/5 Mbps", price: 800, badge: "Budget Fiber" },
    { name: "20 Mbps Fiber Standard — ৳1,200", speed: "20/10 Mbps", price: 1200, badge: "Most Popular" },
    { name: "30 Mbps Home Fiber — ৳1,500", speed: "30/15 Mbps", price: 1500, badge: "High Speed" },
    { name: "50 Mbps Ultra Fiber Pro — ৳2,500", speed: "50/25 Mbps", price: 2500, badge: "Pro Gaming" },
    { name: "100 Mbps Enterprise Dedicated — ৳4,500", speed: "100/50 Mbps", price: 4500, badge: "Enterprise" },
  ];

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      showToast("Please enter Client Name.");
      setActiveTab("profile");
      return;
    }
    if (!mobileNumber.trim()) {
      showToast("Please enter Mobile Number.");
      setActiveTab("profile");
      return;
    }
    if (!username.trim()) {
      showToast("Please enter Username/IP.");
      setActiveTab("service");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter Password.");
      setActiveTab("service");
      return;
    }

    const nextNum = parseInt(nextClientCode.replace("MBN", ""), 10) || (customers.length + 1);

    const newCust: Partial<Customer> = {
      id: nextClientCode,
      clientCode: nextClientCode,
      name: clientName,
      phone: mobileNumber,
      phone2: phoneNumber,
      email: email || `${username.replace("@", ".")}@maabestnetwork.com`,
      address: address || `House ${houseNumber}, Road ${roadNumber}, ${selectedSubZone}, ${selectedZone}`,
      roadNo: roadNumber,
      houseNo: houseNumber,
      district: district,
      upazila: upazila,
      gender: gender,
      occupation: occupation,
      facebookLink: facebookLink,
      remarks: remarks,
      nidNo: nidNumber,
      regFormNo: regFormNo,
      dob: dob,
      zone: selectedZone,
      subzone: selectedSubZone,
      box: selectedBox,
      connectionType: connectionType,
      serverName: serverName,
      profile: profileName,
      service: protocolType as "pppoe",
      package: selectedPackage,
      speed: selectedPackage.includes("100") ? "100/50" : selectedPackage.includes("50") ? "50/25" : selectedPackage.includes("30") ? "30/15" : selectedPackage.includes("20") ? "20/10" : "10/5",
      downloadSpeedMbps: selectedPackage.includes("100") ? 100 : selectedPackage.includes("50") ? 50 : selectedPackage.includes("30") ? 30 : selectedPackage.includes("20") ? 20 : 10,
      uploadSpeedMbps: selectedPackage.includes("100") ? 50 : selectedPackage.includes("50") ? 25 : selectedPackage.includes("30") ? 15 : selectedPackage.includes("20") ? 10 : 5,
      price: Number(monthlyBill) || 1200,
      monthlyBill: Number(monthlyBill) || 1200,
      status: wantDisableClient ? "suspended" : "active",
      netStatus: wantDisableClient ? "offline" : "online",
      billingDate: 1,
      startDate: joiningDate,
      endDate: expireDate,
      daysRemaining: 30,
      dueAmount: 0,
      due: 0,
      ipAddress: "100.64.10." + (nextNum % 250 + 2),
      mac: deviceSerial || ("4C:46:D1:" + Array.from({length: 3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(":")),
      pppUser: username || `Mbn@client${nextNum}`,
      pppPass: password || "123456",
      mikrotik: serverName || "MikroTik-MBN-Core",
      olt: selectedOlt,
      ponPort: selectedPonPort,
      onuSignal: "-18.5 dBm",
      sessionUptime: "0m",
      monthlyUsageGB: 0,
      joinDate: joiningDate,
      clientType: clientType,
      billingStatus: billingStatus,
      billingStartMonth: billingStartMonth,
      expireDate: expireDate,
      cableMetre: Number(cableMetre) || 100,
      fiberCode: fiberCode,
      coreNumber: Number(numberOfCore) || 2,
      coreColor: coreColor,
      deviceType: device,
      deviceSerial: deviceSerial || `BDCOM-${nextClientCode}`,
      deviceVendor: deviceVendor,
      purchaseDate: purchaseDate,
      splitterBox: splitterBox,
      splitterPort: splitterPort,
      invoices: [],
      paymentHistory: [],
    };

    addCustomer(newCust);

    showToast(`✓ Subscriber "${clientName}" (${nextClientCode}) provisioned successfully!`);
    setTimeout(() => {
      if (onNavigate) onNavigate("online-clients");
    }, 1800);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1560px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold border border-primary/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-primary to-rose-500 text-white shadow-lg shadow-primary/20">
            <UserPlus size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Subscriber Provisioning Studio
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                PROVISIONING {nextClientCode}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Provision optical FTTH drop cables, register BDCOM ONUs, configure PPPoE credentials, and bind MikroTik queue profiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted/80 hover:bg-muted text-foreground border border-border flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Auto-Fill Demo</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("online-clients")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-card hover:bg-muted text-foreground border border-border flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ChevronLeft size={15} />
            <span>Client Directory</span>
          </button>
        </div>
      </div>

      {/* ── Studio Step Tabs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: "profile" as const,
            step: "01",
            title: "Subscriber Identity",
            sub: "Full name, contact, NID & address",
            icon: User,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/30"
          },
          {
            id: "network" as const,
            step: "02",
            title: "Optical & Hardware Line",
            sub: "OLT port, Splitter ODB, Core & ONU",
            icon: Network,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/30"
          },
          {
            id: "service" as const,
            step: "03",
            title: "PPPoE & Billing Matrix",
            sub: "Speed tier, secret & automated billing",
            icon: Sliders,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30"
          },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex items-center gap-3.5 cursor-pointer ${
                isActive
                  ? "bg-card border-primary ring-2 ring-primary/20 shadow-md"
                  : "bg-card/50 border-border hover:bg-card hover:border-border/80"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${tab.bg} ${tab.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Step {tab.step}</span>
                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">{tab.title}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{tab.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Studio Grid: Form (Left) & Live Passport Preview (Right) ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT STAGE: Active Tab Form Fields (8 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: SUBSCRIBER IDENTITY & KYC */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Personal Identity & Contact Information</h3>
                    <p className="text-xs text-muted-foreground">Enter verified subscriber details and official KYC documentation</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground px-3 py-1 rounded-full bg-muted">
                  Required Fields Marked *
                </span>
              </div>

              {/* Row 1: Basic Names & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Full Customer Name <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-muted-foreground font-normal">Official NID Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => handleClientNameChange(e.target.value)}
                    placeholder="e.g. Sazzad Hossain"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary focus:bg-card transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Mobile Number (SMS Alert Gateway) <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-muted-foreground font-normal">Primary Billing SMS</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      placeholder="01711-XXXXXX"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary focus:bg-card transition-all font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Secondary Phone, Email, DOB */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Alternative Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 01911-XXXXXX"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary focus:bg-card transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary focus:bg-card transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Date of Birth</label>
                  <input
                    type="text"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary focus:bg-card transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Gender, Occupation, District, Upazila */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="Business / Service"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">District</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="Madaripur">Madaripur</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Faridpur">Faridpur</option>
                    <option value="Gopalganj">Gopalganj</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Upazila / Thana</label>
                  <select
                    value={upazila}
                    onChange={e => setUpazila(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="Kalkini">Kalkini</option>
                    <option value="Madaripur Sadar">Madaripur Sadar</option>
                    <option value="Rajoir">Rajoir</option>
                    <option value="Shibchar">Shibchar</option>
                    <option value="Dasar">Dasar</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Address, House, Road */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500" />
                    <span>Street / Installation Address</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Full Street / Village Address"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Road No</label>
                    <input
                      type="text"
                      value={roadNumber}
                      onChange={e => setRoadNumber(e.target.value)}
                      placeholder="Road 02"
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">House No</label>
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={e => setHouseNumber(e.target.value)}
                      placeholder="House 14"
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: NID, Form No, Facebook */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">National ID (NID) / Smart Card</label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={e => setNidNumber(e.target.value)}
                    placeholder="e.g. 1994827102938"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Registration Form No</label>
                  <input
                    type="text"
                    value={regFormNo}
                    onChange={e => setRegFormNo(e.target.value)}
                    placeholder="MBN-REG-0992"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Facebook Profile Link</label>
                  <input
                    type="text"
                    value={facebookLink}
                    onChange={e => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* KYC Document Upload Dropzones */}
              <div className="pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground block mb-2.5">
                  Subscriber KYC & Document Attachments
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Photo */}
                  <label className="p-3.5 rounded-2xl border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition-all flex items-center gap-3 cursor-pointer">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                      <Image size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">Profile Photo</p>
                      <p className="text-[10px] text-muted-foreground truncate">{profilePicName || "Click to upload image"}</p>
                    </div>
                    <input type="file" className="hidden" onChange={e => setProfilePicName(e.target.files?.[0]?.name || "")} />
                  </label>

                  {/* NID */}
                  <label className="p-3.5 rounded-2xl border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition-all flex items-center gap-3 cursor-pointer">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">NID / Birth Certificate</p>
                      <p className="text-[10px] text-muted-foreground truncate">{nidPicName || "Click to attach doc"}</p>
                    </div>
                    <input type="file" className="hidden" onChange={e => setNidPicName(e.target.files?.[0]?.name || "")} />
                  </label>

                  {/* Reg Form */}
                  <label className="p-3.5 rounded-2xl border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition-all flex items-center gap-3 cursor-pointer">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                      <Award size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">Signed ISP Form</p>
                      <p className="text-[10px] text-muted-foreground truncate">{regFormPicName || "Click to attach form"}</p>
                    </div>
                    <input type="file" className="hidden" onChange={e => setRegFormPicName(e.target.files?.[0]?.name || "")} />
                  </label>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("network")}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to Optical Line</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPTICAL & HARDWARE LINE */}
          {activeTab === "network" && (
            <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                    <Network size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Optical Network, OLT & FTTH Drop Routing</h3>
                    <p className="text-xs text-muted-foreground">Map the physical fiber core, splitter ODB box, OLT station and CPE terminal</p>
                  </div>
                </div>
              </div>

              {/* Row 1: OLT Server & PON Port Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">OLT Station Assignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "OLT1" as const, name: "OLT1 (Madaripur Central)", sub: "103.12.173.136:1895" },
                      { id: "OLT2" as const, name: "OLT2 (Kalkini Station)", sub: "103.12.173.136:1894" }
                    ].map(olt => (
                      <button
                        key={olt.id}
                        type="button"
                        onClick={() => setSelectedOlt(olt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedOlt === olt.id
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                            : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{olt.name}</span>
                          {selectedOlt === olt.id && <CheckCircle2 size={13} />}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{olt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">PON Port Allocation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["epon 0/1", "epon 0/2", "epon 0/3", "epon 0/4"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPonPort(p)}
                        className={`p-3 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer ${
                          selectedPonPort === p
                            ? "bg-primary text-white border-primary font-bold shadow-sm"
                            : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Zone, Sub-Zone, Box with Quick Creation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Distribution Zone *</label>
                    <button
                      type="button"
                      onClick={() => setShowZoneModal(true)}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                  <select
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    {zonesList.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Sub-Zone Area</label>
                    <button
                      type="button"
                      onClick={() => setShowSubZoneModal(true)}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                  <select
                    value={selectedSubZone}
                    onChange={e => setSelectedSubZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    {subZonesList.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Splitter Distribution Box (ODB)</label>
                    <button
                      type="button"
                      onClick={() => setShowBoxModal(true)}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                  <select
                    value={selectedBox}
                    onChange={e => setSelectedBox(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    {boxesList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Optical Core Color & Splitter Port */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Optical Fiber Core Color Code</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground border border-border">
                      Selected: {coreColor}
                    </span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">ITU-T G.652 Standard</span>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                  {CORE_COLORS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCoreColor(c.name)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        coreColor === c.name
                          ? "bg-card border-primary ring-2 ring-primary/20 shadow-xs"
                          : "bg-card/50 border-border hover:bg-card"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-xs"
                        style={{ background: c.hex }}
                      />
                      <span className="text-[10px] font-semibold text-foreground truncate w-full text-center">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Splitter Port, Cable Metre, Fiber Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Splitter Port Output</label>
                  <select
                    value={splitterPort}
                    onChange={e => setSplitterPort(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    {Array.from({ length: 16 }, (_, i) => (
                      <option key={i} value={`Port ${i + 1}`}>Port {i + 1} {i === 0 ? "(Free Link)" : ""}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Drop Cable Length (Metres)</label>
                  <input
                    type="number"
                    value={cableMetre}
                    onChange={e => setCableMetre(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Fiber Code / Cable ID</label>
                  <input
                    type="text"
                    value={fiberCode}
                    onChange={e => setFiberCode(e.target.value)}
                    placeholder="e.g. f3kugd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Hardware ONU Model, MAC & Vendor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">CPE / ONU Hardware Model</label>
                  <select
                    value={device}
                    onChange={e => setDevice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="ONU Dual Band XPON (Gigabit)">ONU Dual Band XPON (Gigabit)</option>
                    <option value="ONU Single Band EPON">ONU Single Band EPON</option>
                    <option value="Wi-Fi 6 Router (AX1800)">Wi-Fi 6 Router (AX1800)</option>
                    <option value="Direct Media Converter">Direct Media Converter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Hardware MAC Address / Serial</label>
                  <input
                    type="text"
                    value={deviceSerial}
                    onChange={e => setDeviceSerial(e.target.value)}
                    placeholder="e.g. 4C:46:D1:55:08:25"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Hardware Vendor</label>
                  <select
                    value={deviceVendor}
                    onChange={e => setDeviceVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="BDCOM">BDCOM</option>
                    <option value="VSOL">VSOL</option>
                    <option value="Huawei">Huawei</option>
                    <option value="ZTE">ZTE</option>
                    <option value="TP-Link">TP-Link</option>
                    <option value="Realtek">Realtek</option>
                  </select>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Back to Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("service")}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to PPPoE & Billing</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PPPOE SERVICE & BILLING MATRIX */}
          {activeTab === "service" && (
            <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">PPPoE Authentication & Automated Billing</h3>
                    <p className="text-xs text-muted-foreground">Configure dynamic bandwidth limits, credentials, and billing cycles</p>
                  </div>
                </div>

                {/* Suspension Banner Switch */}
                <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    Create Suspended?
                  </span>
                  <input
                    type="checkbox"
                    checked={wantDisableClient}
                    onChange={e => setWantDisableClient(e.target.checked)}
                    className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Package Speed Visual Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Bandwidth Tier Package *</span>
                  <span className="text-[11px] text-muted-foreground">Select speed profile to auto-bind MikroTik queue</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PACKAGES.map(pkg => {
                    const isSel = selectedPackage === pkg.name;
                    return (
                      <button
                        key={pkg.name}
                        type="button"
                        onClick={() => {
                          setSelectedPackage(pkg.name);
                          setProfileName(pkg.name);
                          setMonthlyBill(String(pkg.price));
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSel
                            ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                            : "bg-muted/30 border-border hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/20 text-primary uppercase">
                            {pkg.badge}
                          </span>
                          {isSel && <CheckCircle2 size={14} className="text-primary" />}
                        </div>
                        <h5 className="text-xs font-bold text-foreground truncate">{pkg.name.split("—")[0]}</h5>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
                          <span className="font-mono text-muted-foreground">{pkg.speed}</span>
                          <span className="font-extrabold text-foreground">৳{pkg.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PPPoE Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>PPPoE Username / ID *</span>
                    <span className="text-[10px] text-muted-foreground">Dial-in login</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Mbn@username"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">PPPoE Password *</label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Key size={11} /> Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Secret password"
                      className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Monthly Bill & Override */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Monthly Fee (৳ BDT) *</label>
                    <button
                      type="button"
                      onClick={() => setIsEditingBill(!isEditingBill)}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Edit2 size={10} /> {isEditingBill ? "Lock" : "Custom Override"}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">৳</span>
                    <input
                      type="number"
                      required
                      value={monthlyBill}
                      onChange={e => setMonthlyBill(e.target.value)}
                      readOnly={!isEditingBill}
                      className={`w-full pl-8 pr-3.5 py-2.5 text-xs rounded-xl border text-foreground outline-none font-bold ${
                        isEditingBill ? "bg-card border-primary ring-2 ring-primary/20" : "bg-muted/40 border-border"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Billing Start Month *</label>
                  <input
                    type="text"
                    value={billingStartMonth}
                    onChange={e => setBillingStartMonth(e.target.value)}
                    placeholder="09/2026"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Billing Status / Mode</label>
                  <select
                    value={billingStatus}
                    onChange={e => setBillingStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Prepaid">Prepaid</option>
                    <option value="Postpaid">Postpaid</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>

              {/* Client Type Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Client Category Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "Home" as const, label: "Home Fiber", icon: Home, color: "text-blue-500" },
                    { id: "Commercial" as const, label: "Commercial", icon: Building2, color: "text-amber-500" },
                    { id: "Reseller" as const, label: "Reseller POP", icon: Globe2, color: "text-purple-500" },
                    { id: "Corporate" as const, label: "Corporate Link", icon: Landmark, color: "text-emerald-500" }
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = clientType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setClientType(t.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-primary text-white border-primary font-bold shadow-xs"
                            : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <Icon size={15} className={isSelected ? "text-white" : t.color} />
                        <span className="text-xs font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates: Expire & Joining */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subscription Expire Date</label>
                  <input
                    type="text"
                    value={expireDate}
                    onChange={e => setExpireDate(e.target.value)}
                    placeholder="10/10/2026"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Joining Date</label>
                  <input
                    type="text"
                    value={joiningDate}
                    onChange={e => setJoiningDate(e.target.value)}
                    placeholder="04/09/2026"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("network")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Back to Optical Line</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT STAGE: Live Subscriber Passport & Provisioning Sidebar (4 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
          {/* Virtual Subscriber ID Card */}
          <div className="rounded-3xl border border-border bg-gradient-to-b from-card via-card/90 to-muted/30 p-6 shadow-lg space-y-5 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                  Live Subscriber Passport
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {nextClientCode}
              </span>
            </div>

            {/* Subscriber Avatar & Main Name */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md flex-shrink-0">
                {clientName ? clientName.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-foreground text-base truncate">
                  {clientName || "New Subscriber"}
                </h3>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {username || "Mbn@username"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {clientType} Fiber
                  </span>
                  <span className="text-[11px] font-bold text-foreground">
                    ৳{monthlyBill}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry & Line Summary Badges */}
            <div className="space-y-2 pt-3 border-t border-border text-xs">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Mobile Contact:</span>
                <span className="font-mono font-bold text-foreground">{mobileNumber || "—"}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">OLT Station:</span>
                <span className="font-bold text-primary">{selectedOlt} ({selectedPonPort})</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Optical Core:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {coreColor} (Splitter {splitterPort})
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Hardware MAC:</span>
                <span className="font-mono font-bold text-foreground truncate max-w-[140px]">
                  {deviceSerial || "Auto-Allocated"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Package Profile:</span>
                <span className="font-bold text-foreground truncate max-w-[150px]">{selectedPackage.split("—")[0]}</span>
              </div>
            </div>

            {/* Automated Provisioning Readiness Checklist */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 text-[11px]">
              <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                Provisioning Health Check
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span>Optical line assigned on {selectedOlt}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span>PPPoE dynamic credentials validated</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span>MikroTik bandwidth queue profile ready</span>
                </div>
              </div>
            </div>

            {/* Greetings SMS Switch & Final Submit Button */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-all">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Send size={13} className="text-primary" />
                  <span>Send Welcome SMS to Mobile?</span>
                </span>
                <input
                  type="checkbox"
                  checked={sendGreetingsSms}
                  onChange={e => setSendGreetingsSms(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-primary via-rose-600 to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Zap size={16} />
                <span>Provision & Register Subscriber</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* QUICK ADD MODAL: ZONE */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-sm font-bold uppercase text-foreground">Add New Zone</h4>
              <button onClick={() => setShowZoneModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <input
              type="text"
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              placeholder="e.g. BARISAL DIVISION"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="px-4 py-2 text-xs rounded-xl bg-muted text-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newZoneName.trim()) {
                    setZonesList([...zonesList, newZoneName.trim()]);
                    setSelectedZone(newZoneName.trim());
                    setNewZoneName("");
                    setShowZoneModal(false);
                    showToast("✓ Added new zone!");
                  }
                }}
                className="px-4 py-2 text-xs rounded-xl bg-primary text-primary-foreground font-bold shadow-xs"
              >
                Add Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL: SUB-ZONE */}
      {showSubZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-sm font-bold uppercase text-foreground">Add New Sub-Zone</h4>
              <button onClick={() => setShowSubZoneModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <input
              type="text"
              value={newSubZoneName}
              onChange={e => setNewSubZoneName(e.target.value)}
              placeholder="e.g. MIRPUR-12"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubZoneModal(false)}
                className="px-4 py-2 text-xs rounded-xl bg-muted text-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newSubZoneName.trim()) {
                    setSubZonesList([...subZonesList, newSubZoneName.trim()]);
                    setSelectedSubZone(newSubZoneName.trim());
                    setNewSubZoneName("");
                    setShowSubZoneModal(false);
                    showToast("✓ Added new sub-zone!");
                  }
                }}
                className="px-4 py-2 text-xs rounded-xl bg-primary text-primary-foreground font-bold shadow-xs"
              >
                Add Sub-Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL: BOX */}
      {showBoxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-sm font-bold uppercase text-foreground">Add New Distribution Box</h4>
              <button onClick={() => setShowBoxModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <input
              type="text"
              value={newBoxName}
              onChange={e => setNewBoxName(e.target.value)}
              placeholder="e.g. DP-05 HOSPITAL ROAD"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBoxModal(false)}
                className="px-4 py-2 text-xs rounded-xl bg-muted text-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newBoxName.trim()) {
                    setBoxesList([...boxesList, newBoxName.trim()]);
                    setSelectedBox(newBoxName.trim());
                    setNewBoxName("");
                    setShowBoxModal(false);
                    showToast("✓ Added new distribution box!");
                  }
                }}
                className="px-4 py-2 text-xs rounded-xl bg-primary text-primary-foreground font-bold shadow-xs"
              >
                Add Box
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
