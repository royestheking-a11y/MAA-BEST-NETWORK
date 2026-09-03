import { useState } from "react";
import {
  Wifi, Radio, RefreshCw, Search, CheckCircle2, AlertTriangle,
  Sliders, Shield, Power, Key, Smartphone, HardDrive, Eye,
  Lock, ArrowRight, X, Sparkles, Check, Activity, Laptop
} from "lucide-react";

interface Tr069AcsPageProps {
  onNavigate?: (page: string) => void;
}

interface CpeDevice {
  id: string;
  serial: string;
  manufacturer: string;
  model: string;
  hardwareVersion: string;
  firmwareVersion: string;
  customerName: string;
  customerId: string;
  pppoeUser: string;
  ipAddress: string;
  macAddress: string;
  wifiSsid24: string;
  wifiSsid5: string;
  wifiPass: string;
  wifiChannel24: number;
  wifiChannel5: number;
  connectedClients: number;
  uptime: string;
  lastInform: string;
  status: "online" | "offline";
}

const SAMPLE_CPES: CpeDevice[] = [];

export function Tr069AcsPage({ onNavigate }: Tr069AcsPageProps) {
  const [cpes, setCpes] = useState<CpeDevice[]>(SAMPLE_CPES);
  const [search, setSearch] = useState("");
  const [selectedCpe, setSelectedCpe] = useState<CpeDevice | null>(null);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [toast, setToast] = useState("");

  // Edit Wi-Fi state
  const [editWifi, setEditWifi] = useState({
    ssid24: "",
    ssid5: "",
    password: "",
    channel24: 6,
    channel5: 36
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleOpenWifiModal = (cpe: CpeDevice) => {
    setSelectedCpe(cpe);
    setEditWifi({
      ssid24: cpe.wifiSsid24,
      ssid5: cpe.wifiSsid5,
      password: cpe.wifiPass,
      channel24: cpe.wifiChannel24,
      channel5: cpe.wifiChannel5
    });
    setShowWifiModal(true);
  };

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCpe) return;

    const updated = cpes.map(c => c.id === selectedCpe.id ? {
      ...c,
      wifiSsid24: editWifi.ssid24,
      wifiSsid5: editWifi.ssid5,
      wifiPass: editWifi.password,
      wifiChannel24: editWifi.channel24,
      wifiChannel5: editWifi.channel5
    } : c);

    setCpes(updated);
    setShowWifiModal(false);
    showToast(`✓ TR-069 Parameter pushed! Wi-Fi SSID & Password updated remotely for ${selectedCpe.customerName} without physical visit!`);
  };

  const handleRemoteReboot = (cpe: CpeDevice) => {
    showToast(`✓ TR-069 RPC Reboot command sent to ${cpe.manufacturer} router (${cpe.serial}). Device restarting...`);
  };

  const handleChannelOptimize = (cpe: CpeDevice) => {
    showToast(`✓ Auto-switched ${cpe.customerName}'s Wi-Fi to optimal low-interference channel (Channel 6 for 2.4G, Channel 149 for 5G)!`);
  };

  const filtered = cpes.filter(c => {
    const q = search.toLowerCase();
    return !search ||
      c.customerName.toLowerCase().includes(q) ||
      c.pppoeUser.toLowerCase().includes(q) ||
      c.serial.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      c.ipAddress.includes(q);
  });

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Radio size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                TR-069 ACS Wi-Fi & CPE Remote Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACS Server: acs.maabestnetwork.com:7547 (CWMP Active)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Remotely configure subscriber Wi-Fi SSIDs, change passwords, perform laser reboots, and optimize radio channels without home visits.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast("Polled all subscriber CPEs via CWMP TR-069 protocol.")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
          <RefreshCw size={14} />
          <span>Inform Poll All CPEs</span>
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Connected TR-069 CPEs</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {cpes.filter(c => c.status === "online").length} / {cpes.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Dual-Band Wi-Fi ONUs & Routers</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Active Wi-Fi Devices</span>
          <p className="text-2xl font-black text-primary mt-1">
            {cpes.reduce((a, b) => a + b.connectedClients, 0)} Devices
          </p>
          <p className="text-[11px] text-muted-foreground">Laptops, Phones & Smart TVs connected</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Remote Actions Saved</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            184 Field Visits
          </p>
          <p className="text-[11px] text-muted-foreground">Resolved over cloud TR-069 this month</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">CWMP Protocol</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            TR-069 / TR-181
          </p>
          <p className="text-[11px] text-muted-foreground">Encrypted RPC over SSL</p>
        </div>
      </div>

      {/* ── CPE Devices Table ────────────────────────────────────────────────── */}
      <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-extrabold text-foreground">Subscriber Wi-Fi Router & ONT Fleet</h3>
            <p className="text-xs text-muted-foreground">Click 'Change Wi-Fi' to push instant remote SSID/Password modifications.</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-border bg-muted/40">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, IP, model..."
              className="bg-transparent outline-none text-xs text-foreground w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Subscriber / Customer</th>
                <th className="p-3.5">Router Model & Hardware</th>
                <th className="p-3.5">Framed IP & MAC</th>
                <th className="p-3.5">Wi-Fi SSIDs</th>
                <th className="p-3.5">Connected Clients</th>
                <th className="p-3.5">CWMP Status</th>
                <th className="p-3.5 text-right">Remote Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(cpe => (
                <tr key={cpe.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-foreground">{cpe.customerName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{cpe.pppoeUser} ({cpe.customerId})</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-foreground">{cpe.manufacturer} {cpe.model}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{cpe.firmwareVersion}</div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div className="text-foreground font-bold">{cpe.ipAddress}</div>
                    <div className="text-[10px] text-muted-foreground">{cpe.macAddress}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-primary font-bold">{cpe.wifiSsid24} (2.4G)</div>
                    <div className="text-[10px] text-muted-foreground">{cpe.wifiSsid5} (5G)</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                      {cpe.connectedClients} Active Devices
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      cpe.status === "online" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600"
                    }`}>
                      ● {cpe.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => handleRemoteReboot(cpe)}
                      className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remote Reboot Router">
                      <Power size={13} />
                    </button>
                    <button
                      onClick={() => handleChannelOptimize(cpe)}
                      className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Optimize Radio Channels">
                      <Sparkles size={13} className="text-amber-500" />
                    </button>
                    <button
                      onClick={() => handleOpenWifiModal(cpe)}
                      className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all cursor-pointer">
                      Change Wi-Fi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── REMOTE WI-FI CONFIGURATION MODAL ─────────────────────────────────── */}
      {showWifiModal && selectedCpe && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Wifi size={18} className="text-primary" />
                <h3 className="font-black text-base text-foreground">
                  Remote Wi-Fi Config ({selectedCpe.customerName})
                </h3>
              </div>
              <button onClick={() => setShowWifiModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWifi} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">2.4 GHz WI-FI SSID</label>
                <input
                  required
                  value={editWifi.ssid24}
                  onChange={e => setEditWifi({ ...editWifi, ssid24: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">5 GHz WI-FI SSID (HIGH SPEED)</label>
                <input
                  required
                  value={editWifi.ssid5}
                  onChange={e => setEditWifi({ ...editWifi, ssid5: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">WI-FI WPA2/WPA3 PASSWORD</label>
                <input
                  required
                  value={editWifi.password}
                  onChange={e => setEditWifi({ ...editWifi, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">2.4G CHANNEL</label>
                  <select
                    value={editWifi.channel24}
                    onChange={e => setEditWifi({ ...editWifi, channel24: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value={1}>Channel 1</option>
                    <option value={6}>Channel 6 (Recommended)</option>
                    <option value={11}>Channel 11</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">5G CHANNEL</label>
                  <select
                    value={editWifi.channel5}
                    onChange={e => setEditWifi({ ...editWifi, channel5: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value={36}>Channel 36</option>
                    <option value={44}>Channel 44</option>
                    <option value={149}>Channel 149 (Clean)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>Pushes TR-069 `InternetGatewayDevice.LANDevice` parameters over cloud SSL.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWifiModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold cursor-pointer">
                  Push to Router
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-semibold animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
