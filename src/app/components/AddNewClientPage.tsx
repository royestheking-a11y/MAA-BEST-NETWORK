import { useState } from "react";
import {
  UserPlus, User, Network, Sliders, CheckCircle2,
  Calendar, Phone, Mail, MapPin, Plus, Edit2,
  ChevronLeft, Send, X, ShieldAlert, Check,
  HardDrive, Server, Layers, FileText, Sparkles, Image
} from "lucide-react";
import { useCustomerContext, Customer } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";

interface AddNewClientPageProps {
  onNavigate?: (page: string) => void;
}

export function AddNewClientPage({ onNavigate }: AddNewClientPageProps) {
  const { customers, addCustomer } = useCustomerContext();
  const { t } = useLanguage();

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
  const [selectedPackage, setSelectedPackage] = useState("PIONEER_HOME_20Mbps");
  const [serverName, setServerName] = useState("RETAIL_1");
  const [protocolType, setProtocolType] = useState("pppoe");
  const [profileName, setProfileName] = useState("PIONEER_HOME_20Mbps");
  const [selectedZone, setSelectedZone] = useState("DHAKA DIVISION");
  const [selectedSubZone, setSelectedSubZone] = useState("KALKINI SOMITIR HAT");
  const [selectedBox, setSelectedBox] = useState("SOMITIR HAT BAZAR");
  const [connectionType, setConnectionType] = useState<"Optical Fiber" | "Cat6" | "Wireless">("Optical Fiber");
  const [cableMetre, setCableMetre] = useState("100");
  const [fiberCode, setFiberCode] = useState("f3kugd");
  const [numberOfCore, setNumberOfCore] = useState("2");
  const [coreColor, setCoreColor] = useState("Red");
  const [device, setDevice] = useState("ONU Dual Band XPON (Gigabit)");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [deviceVendor, setDeviceVendor] = useState("VSOL");
  const [purchaseDate, setPurchaseDate] = useState("28/08/2026");
  const [splitterBox, setSplitterBox] = useState("SOMITIR HAT BAZAR - Splitter 1 (1:8)");
  const [splitterPort, setSplitterPort] = useState("Port 1");

  // Section 3: Service Information
  const [wantDisableClient, setWantDisableClient] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [billingStartMonth, setBillingStartMonth] = useState("08/2026");
  const [monthlyBill, setMonthlyBill] = useState("1200");
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [clientType, setClientType] = useState<"Home" | "Commercial" | "Reseller" | "Corporate">("Home");
  const [billingStatus, setBillingStatus] = useState<"Prepaid" | "Postpaid" | "Daily" | "Monthly">("Monthly");
  const [expireDate, setExpireDate] = useState("10/09/2026");
  const [joiningDate, setJoiningDate] = useState("28/08/2026");
  const [sendGreetingsSms, setSendGreetingsSms] = useState(true);

  // Auto generate username based on client name if blank
  const handleClientNameChange = (val: string) => {
    setClientName(val);
    if (!username || username.startsWith("mbn@")) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, "");
      setUsername(`mbn@${clean || "client"}`);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Please enter Client Name.");
      return;
    }
    if (!mobileNumber.trim()) {
      alert("Please enter Mobile Number.");
      return;
    }
    if (!username.trim()) {
      alert("Please enter Username/IP.");
      return;
    }
    if (!password.trim()) {
      alert("Please enter Password.");
      return;
    }

    // Sequential MBN code generation
    const maxExistingNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id).match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextNum = maxExistingNum + 1;
    const generatedClientCode = `MBN${String(nextNum).padStart(4, "0")}`;

    const newCust: Partial<Customer> = {
      id: generatedClientCode,
      clientCode: generatedClientCode,
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
      speed: "20/10",
      downloadSpeedMbps: 20,
      uploadSpeedMbps: 10,
      price: Number(monthlyBill) || 500,
      monthlyBill: Number(monthlyBill) || 500,
      status: wantDisableClient ? "suspended" : "active",
      netStatus: wantDisableClient ? "offline" : "online",
      billingDate: 1,
      startDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      daysRemaining: 30,
      dueAmount: 0,
      due: 0,
      ipAddress: "10.200.201." + (50 + nextNum),
      mac: "44:D9:E7:" + Array.from({length: 3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(":"),
      pppUser: username || `mbn@client${nextNum}`,
      pppPass: password || "123456",
      mikrotik: serverName || "MikroTik-01",
      olt: "OLT-Dhaka-01",
      onuSignal: "-18.5 dBm",
      sessionUptime: "0m",
      monthlyUsageGB: 0,
      joinDate: joiningDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      clientType: clientType,
      billingStatus: billingStatus,
      billingStartMonth: billingStartMonth,
      expireDate: expireDate,
      cableMetre: Number(cableMetre) || 100,
      fiberCode: fiberCode,
      coreNumber: Number(numberOfCore) || 2,
      coreColor: coreColor,
      deviceType: device,
      deviceSerial: deviceSerial,
      deviceVendor: deviceVendor,
      purchaseDate: purchaseDate,
      splitterBox: splitterBox,
      splitterPort: splitterPort,
      invoices: [],
      paymentHistory: [],
    };

    addCustomer(newCust);

    setToastMsg(`✓ Client "${clientName}" created successfully! PPPoE Secret & MikroTik queue configured.`);
    setTimeout(() => {
      if (onNavigate) onNavigate("online-clients");
    }, 1800);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-medium border border-teal-500/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <UserPlus size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Client Add New Client</h1>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Client Management</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Add New Subscriber</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.("online-clients")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-all cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft size={14} />
          <span>Back to Client List</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: Client information */}
        {/* ========================================================================= */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">Client information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* CLIENT NAME * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => handleClientNameChange(e.target.value)}
                placeholder="e.g. Sumon Bepari"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* MOBILE NUMBER * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="e.g. 01745739325"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="Alternative Phone"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* DATE OF BIRTH */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={dob}
                onChange={e => setDob(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* FACEBOOK ID LINK */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Facebook ID Link
              </label>
              <input
                type="text"
                value={facebookLink}
                onChange={e => setFacebookLink(e.target.value)}
                placeholder="https://facebook.com/profile"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* OCCUPATION */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                placeholder="Business / Service"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* DISTRICT */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                District
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="Madaripur">Madaripur</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Barisal">Barisal</option>
                <option value="Faridpur">Faridpur</option>
                <option value="Gopalganj">Gopalganj</option>
              </select>
            </div>

            {/* UPAZILA */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Upazila
              </label>
              <select
                value={upazila}
                onChange={e => setUpazila(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="Kalkini">Kalkini</option>
                <option value="Madaripur Sadar">Madaripur Sadar</option>
                <option value="Rajoir">Rajoir</option>
                <option value="Shibchar">Shibchar</option>
                <option value="Dasar">Dasar</option>
              </select>
            </div>

            {/* PROFILE PICTURE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Profile Picture
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 cursor-pointer font-medium whitespace-nowrap">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setProfilePicName(e.target.files?.[0]?.name || "")}
                  />
                </label>
                <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {profilePicName || "No file chosen"}
                </span>
              </div>
            </div>

            {/* ROAD NUMBER */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Road Number
              </label>
              <input
                type="text"
                value={roadNumber}
                onChange={e => setRoadNumber(e.target.value)}
                placeholder="e.g. Road 02"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* HOUSE NUMBER */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                House Number
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={e => setHouseNumber(e.target.value)}
                placeholder="e.g. House 14"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Full Street / Village Address"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* REMARKS/NOTE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Remarks/Note
              </label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Special notes or landmarks"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* NID/BIRTH CERTIFICATE NO */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                NID/Birth Certificate No
              </label>
              <input
                type="text"
                value={nidNumber}
                onChange={e => setNidNumber(e.target.value)}
                placeholder="e.g. 1994827102938"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* NID/BIRTH CERTIFICATE PICTURE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                NID/Birth Certificate Picture
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 cursor-pointer font-medium whitespace-nowrap">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setNidPicName(e.target.files?.[0]?.name || "")}
                  />
                </label>
                <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {nidPicName || "No file chosen"}
                </span>
              </div>
            </div>

            {/* REGISTRATION FORM NO */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Registration Form No
              </label>
              <input
                type="text"
                value={regFormNo}
                onChange={e => setRegFormNo(e.target.value)}
                placeholder="e.g. MBN-REG-0992"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* REGISTRATION FORM PICTURE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Registration Form Picture
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 cursor-pointer font-medium whitespace-nowrap">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setRegFormPicName(e.target.files?.[0]?.name || "")}
                  />
                </label>
                <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {regFormPicName || "No file chosen"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: Network & Product Info */}
        {/* ========================================================================= */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Network size={16} />
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">Network & Product Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* PACKAGE * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Package <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPackage}
                onChange={e => {
                  setSelectedPackage(e.target.value);
                  setProfileName(e.target.value);
                  if (e.target.value.includes("10 Mbps")) setMonthlyBill("800");
                  else if (e.target.value.includes("20 Mbps")) setMonthlyBill("1200");
                  else if (e.target.value.includes("30 Mbps")) setMonthlyBill("1500");
                  else if (e.target.value.includes("50 Mbps")) setMonthlyBill("2500");
                }}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="PIONEER_HOME_20Mbps">PIONEER_HOME_20Mbps (৳1,200)</option>
                <option value="10 Mbps — ৳800">10 Mbps — ৳800</option>
                <option value="20 Mbps Fiber Standard — ৳1,200">20 Mbps Fiber Standard — ৳1,200</option>
                <option value="30 Mbps Home Fiber — ৳1,500">30 Mbps Home Fiber — ৳1,500</option>
                <option value="50 Mbps Ultra Fiber Pro — ৳2,500">50 Mbps Ultra Fiber Pro — ৳2,500</option>
              </select>
            </div>

            {/* SERVER */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Server</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted/60 border border-border text-muted-foreground outline-none font-mono"
              />
            </div>

            {/* PROTOCOL TYPE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Protocol Type</label>
              <input
                type="text"
                value={protocolType}
                onChange={e => setProtocolType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted/60 border border-border text-muted-foreground outline-none font-mono"
              />
            </div>

            {/* PROFILE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Profile</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted/60 border border-border text-muted-foreground outline-none font-mono"
              />
            </div>

            {/* ZONE * + QUICK ADD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-foreground uppercase">
                  Zone <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowZoneModal(true)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#112233] text-white hover:bg-primary transition-all flex items-center gap-0.5"
                >
                  <Plus size={10} /> ZONE
                </button>
              </div>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                {zonesList.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* SUB ZONE + QUICK ADD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-foreground uppercase">Sub Zone</label>
                <button
                  type="button"
                  onClick={() => setShowSubZoneModal(true)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#112233] text-white hover:bg-primary transition-all flex items-center gap-0.5"
                >
                  <Plus size={10} /> SUB ZONE
                </button>
              </div>
              <select
                value={selectedSubZone}
                onChange={e => setSelectedSubZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                {subZonesList.map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            {/* BOX + QUICK ADD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-foreground uppercase">Box</label>
                <button
                  type="button"
                  onClick={() => setShowBoxModal(true)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#112233] text-white hover:bg-primary transition-all flex items-center gap-0.5"
                >
                  <Plus size={10} /> BOX
                </button>
              </div>
              <select
                value={selectedBox}
                onChange={e => setSelectedBox(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                {boxesList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* CONNECTION TYPE * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Connection Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={connectionType}
                onChange={e => setConnectionType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="Optical Fiber">Optical Fiber</option>
                <option value="Cat6">Cat6 Ethernet</option>
                <option value="Wireless">Wireless Bridge</option>
              </select>
            </div>

            {/* SPLITTER BOX / ODB */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Splitter Box / ODB
              </label>
              <input
                type="text"
                value={splitterBox}
                onChange={e => setSplitterBox(e.target.value)}
                placeholder="e.g. Splitter-01 (Somitir Hat 1:8)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* SPLITTER PORT */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Splitter Port / Core
              </label>
              <select
                value={splitterPort}
                onChange={e => setSplitterPort(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="Port 1">Port 1 (Free)</option>
                <option value="Port 2">Port 2</option>
                <option value="Port 3">Port 3</option>
                <option value="Port 4">Port 4</option>
                <option value="Port 5">Port 5</option>
                <option value="Port 6">Port 6</option>
                <option value="Port 7">Port 7</option>
                <option value="Port 8">Port 8</option>
                <option value="Port 9">Port 9 (1:16)</option>
                <option value="Port 10">Port 10 (1:16)</option>
                <option value="Port 11">Port 11 (1:16)</option>
                <option value="Port 12">Port 12 (1:16)</option>
                <option value="Port 13">Port 13 (1:16)</option>
                <option value="Port 14">Port 14 (1:16)</option>
                <option value="Port 15">Port 15 (1:16)</option>
                <option value="Port 16">Port 16 (1:16)</option>
              </select>
            </div>

            {/* CABLE REQUIRED IN METRE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Cable Required in Metre
              </label>
              <input
                type="number"
                value={cableMetre}
                onChange={e => setCableMetre(e.target.value)}
                placeholder="Example: 100"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* FIBER CODE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Fiber Code
              </label>
              <input
                type="text"
                value={fiberCode}
                onChange={e => setFiberCode(e.target.value)}
                placeholder="Example: f3kugd"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            {/* NUMBER OF CORE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Number of Core
              </label>
              <input
                type="text"
                value={numberOfCore}
                onChange={e => setNumberOfCore(e.target.value)}
                placeholder="Example: 2"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            {/* CORE COLOR */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Core Color
              </label>
              <input
                type="text"
                value={coreColor}
                onChange={e => setCoreColor(e.target.value)}
                placeholder="Example: Red"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* DEVICE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Device</label>
              <select
                value={device}
                onChange={e => setDevice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="ONU Dual Band XPON (Gigabit)">ONU Dual Band XPON (Gigabit)</option>
                <option value="ONU Single Band EPON">ONU Single Band EPON</option>
                <option value="Wi-Fi 6 Router (AX1800)">Wi-Fi 6 Router (AX1800)</option>
                <option value="Direct Media Converter">Direct Media Converter</option>
              </select>
            </div>

            {/* DEVICE MAC/SERIAL NO */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Device MAC/Serial No
              </label>
              <input
                type="text"
                value={deviceSerial}
                onChange={e => setDeviceSerial(e.target.value)}
                placeholder="e.g. VSOL-99882201"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            {/* VENDOR */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Vendor</label>
              <select
                value={deviceVendor}
                onChange={e => setDeviceVendor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              >
                <option value="VSOL">VSOL</option>
                <option value="Huawei">Huawei</option>
                <option value="ZTE">ZTE</option>
                <option value="BDCOM">BDCOM</option>
                <option value="TP-Link">TP-Link</option>
                <option value="Realtek">Realtek</option>
              </select>
            </div>

            {/* PURCHASE DATE */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Purchase Date</label>
              <input
                type="text"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: Service information */}
        {/* ========================================================================= */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">Service information</h2>
            </div>

            {/* Banner Toggle: WANT TO CREATE AS DISABLE CLIENT? */}
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                <ShieldAlert size={13} />
                WANT TO CREATE AS DISABLE CLIENT?
              </span>
              <input
                type="checkbox"
                checked={wantDisableClient}
                onChange={e => setWantDisableClient(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* USERNAME/IP * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Username/IP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. mbn@sumonbepari"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono font-medium"
              />
            </div>

            {/* PASSWORD * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Secret Password"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            {/* BILLING START MONTH * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Billing Start Month <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={billingStartMonth}
                onChange={e => setBillingStartMonth(e.target.value)}
                placeholder="08/2026"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            {/* MONTHLY BILL * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Monthly Bill <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={monthlyBill}
                  onChange={e => setMonthlyBill(e.target.value)}
                  readOnly={!isEditingBill}
                  className={`w-full px-3 py-2 pr-9 text-xs rounded-lg border text-foreground outline-none font-bold ${
                    isEditingBill ? "bg-card border-primary" : "bg-muted/80 border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingBill(!isEditingBill)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  title="Toggle Edit Amount"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            </div>

            {/* CLIENT TYPE * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Client Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={clientType}
                onChange={e => setClientType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="Home">Home</option>
                <option value="Commercial">Commercial</option>
                <option value="Reseller">Reseller</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            {/* BILLING STATUS * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Billing Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={billingStatus}
                onChange={e => setBillingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="Monthly">Monthly</option>
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
                <option value="Daily">Daily</option>
              </select>
            </div>

            {/* EXPIRE DATE * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Expire Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={expireDate}
                onChange={e => setExpireDate(e.target.value)}
                placeholder="10/09/2026"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* JOINING DATE (NO RELATION IN BILLING) * */}
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                Joining Date (No relation in billing) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS & SUBMIT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => onNavigate?.("online-clients")}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
              <span>Send Greetings SMS?</span>
              <input
                type="checkbox"
                checked={sendGreetingsSms}
                onChange={e => setSendGreetingsSms(e.target.checked)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
            </label>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#112d4e] text-white hover:bg-[#1a4270] dark:bg-teal-600 dark:hover:bg-teal-500 shadow-md transition-all flex items-center gap-2 cursor-pointer border border-teal-500/30"
            >
              <CheckCircle2 size={15} className="text-teal-400" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </form>

      {/* QUICK ADD MODAL: ZONE */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase text-foreground">Add New Zone</h4>
              <button onClick={() => setShowZoneModal(false)}><X size={14} /></button>
            </div>
            <input
              type="text"
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              placeholder="e.g. BARISAL DIVISION"
              className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-muted text-foreground"
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
                  }
                }}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground font-bold"
              >
                Add Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL: SUB-ZONE */}
      {showSubZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase text-foreground">Add New Sub-Zone</h4>
              <button onClick={() => setShowSubZoneModal(false)}><X size={14} /></button>
            </div>
            <input
              type="text"
              value={newSubZoneName}
              onChange={e => setNewSubZoneName(e.target.value)}
              placeholder="e.g. MIRPUR-12"
              className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubZoneModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-muted text-foreground"
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
                  }
                }}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground font-bold"
              >
                Add Sub-Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD MODAL: BOX */}
      {showBoxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase text-foreground">Add New Box</h4>
              <button onClick={() => setShowBoxModal(false)}><X size={14} /></button>
            </div>
            <input
              type="text"
              value={newBoxName}
              onChange={e => setNewBoxName(e.target.value)}
              placeholder="e.g. DP-05 HOSPITAL ROAD"
              className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBoxModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-muted text-foreground"
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
                  }
                }}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground font-bold"
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
