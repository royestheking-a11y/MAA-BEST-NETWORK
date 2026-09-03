import { useState } from "react";
import {
  CheckCircle2, Building2, Palette, Globe, Server, Radio, Package,
  CreditCard, MessageSquare, Upload, Users, Zap, ChevronRight,
  ChevronLeft, Check, Circle, Wifi, ArrowRight, X, AlertCircle,
  Phone, Mail, Image, Lock, DollarSign, Bell, Star
} from "lucide-react";

interface OnboardingWizardProps {
  onNavigate?: (page: string) => void;
  onComplete?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const STEPS = [
  { id: 1, label: "Company", icon: Building2, desc: "Basic company information" },
  { id: 2, label: "Branding", icon: Palette, desc: "Logo, colors & white-label" },
  { id: 3, label: "Domain", icon: Globe, desc: "Custom domain setup" },
  { id: 4, label: "MikroTik", icon: Server, desc: "Connect your MikroTik" },
  { id: 5, label: "OLT", icon: Radio, desc: "OLT configuration" },
  { id: 6, label: "Packages", icon: Package, desc: "Internet packages" },
  { id: 7, label: "Payment", icon: CreditCard, desc: "Payment gateways" },
  { id: 8, label: "SMS", icon: MessageSquare, desc: "SMS gateway" },
  { id: 9, label: "Import", icon: Upload, desc: "Import customers" },
  { id: 10, label: "Go Live", icon: Zap, desc: "Review and launch" },
];

const inputStyle = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--foreground)",
};

export function OnboardingWizardPage({ onNavigate, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState("");

  // Step data
  const [company, setCompany] = useState({ name: "", displayName: "", phone: "", email: "", address: "", website: "", license: "" });
  const [branding, setBranding] = useState({ primaryColor: "#8B2020", tagline: "", loginBg: "gradient" });
  const [domain, setDomain] = useState({ customDomain: "", usePlatformDomain: true });
  const [mikrotik, setMikrotik] = useState({ name: "", ip: "", port: "8728", username: "admin", password: "", connected: false });
  const [olt, setOlt] = useState({ name: "", ip: "", vendor: "Huawei", snmpCommunity: "public", skip: false });
  const [packages, setPackages] = useState([
    { name: "10 Mbps Fiber", download: 10, upload: 5, price: 800 },
    { name: "20 Mbps Fiber", download: 20, upload: 10, price: 1200 },
  ]);
  const [payment, setPayment] = useState({ bkash: false, nagad: false, sslcommerz: false, cash: true });
  const [sms, setSms] = useState({ provider: "ssl", senderId: "", apiKey: "", skip: false });
  const [importStep, setImportStep] = useState({ skip: true });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const completeStep = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    if (step < 10) setCurrentStep((step + 1) as Step);
  };

  const progress = ((completedSteps.size) / 10) * 100;

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </label>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="rounded-2xl flex items-center justify-center" style={{ width: 48, height: 48, background: "linear-gradient(135deg, #8B2020, #C43535)" }}>
              <Wifi size={24} color="#fff" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--foreground)" }}>IPS BD</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--foreground)" }}>
            Welcome to IPS BD
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6 }}>
            Set up your ISP platform in 10 easy steps. This takes about 10 minutes.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>Setup Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{Math.round(progress)}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 8, background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #8B2020, #C43535)" }} />
          </div>
        </div>

        {/* Steps */}
        <div className="overflow-x-auto pb-2 mb-6">
          <div className="flex items-center gap-1 min-w-max">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id as Step)}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: isCurrent ? "rgba(139,32,32,0.1)" : "transparent",
                      minWidth: 72,
                    }}
                  >
                    <div
                      className="rounded-xl flex items-center justify-center"
                      style={{
                        width: 36, height: 36,
                        background: isCompleted ? "#16A34A" : isCurrent ? "var(--primary)" : "var(--muted)",
                        border: `2px solid ${isCompleted ? "#16A34A" : isCurrent ? "var(--primary)" : "var(--border)"}`,
                      }}
                    >
                      {isCompleted ? <Check size={16} color="#fff" /> : <Icon size={16} color={isCurrent ? "#fff" : "var(--muted-foreground)"} />}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "var(--primary)" : isCompleted ? "#16A34A" : "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      {step.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-shrink-0 mx-0.5" style={{ width: 24, height: 1, background: completedSteps.has(step.id) ? "#16A34A" : "var(--border)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl p-8 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Building2 size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Company Information</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>This will appear on invoices, SMS, and customer portal</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Legal Company Name *</Label>
                  <input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="MAA BEST NETWORK Ltd." />
                </div>
                <div>
                  <Label>Display Name *</Label>
                  <input value={company.displayName} onChange={e => setCompany(c => ({ ...c, displayName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="MAA BEST NETWORK" />
                </div>
                <div>
                  <Label>Support Phone *</Label>
                  <input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="09611-XXXXXX" />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <input value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="support@yourisp.com" />
                </div>
                <div>
                  <Label>Company Website</Label>
                  <input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="https://yourisp.com" />
                </div>
                <div>
                  <Label>BTRC License No.</Label>
                  <input value={company.license} onChange={e => setCompany(c => ({ ...c, license: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="BTRC/ISP-NAT-XXXX/XXX" />
                </div>
              </div>
              <div>
                <Label>Registered Address</Label>
                <textarea className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }}
                  value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
                  placeholder="Full office address" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Palette size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Branding & White-Label</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Your customers will see your brand everywhere, not IPS BD</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <Label>Company Logo</Label>
                    <div className="border-2 border-dashed rounded-2xl p-8 text-center" style={{ borderColor: "var(--border)" }}>
                      <Image size={32} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
                      <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 8 }}>Drop your logo here or</div>
                      <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>Browse File</button>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 8 }}>PNG, SVG, Max 2MB, Transparent preferred</div>
                    </div>
                  </div>
                  <div>
                    <Label>Brand Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                        className="rounded-xl cursor-pointer" style={{ width: 44, height: 44 }} />
                      <input value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                        className="flex-1 px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <input value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="Fast. Reliable. Always Connected." />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label>Login Page Preview</Label>
                  <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: "#F7F5F4", border: "1px solid var(--border)" }}>
                    <div className="p-6 text-center">
                      <div className="mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ width: 48, height: 48, background: branding.primaryColor }}>
                        <Wifi size={20} color="#fff" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#1A0A0A" }}>{company.displayName || "Your ISP Name"}</div>
                      <div style={{ fontSize: 12, color: "#8A7070", marginBottom: 4 }}>{branding.tagline || "Your tagline here"}</div>
                      <div style={{ fontSize: 12, color: "#8A7070", marginBottom: 16 }}>Welcome Back</div>
                      <div className="space-y-2 text-left">
                        <div className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>Username / Email</div>
                        <div className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>Password</div>
                        <div className="rounded-lg px-3 py-2 text-center text-xs text-white font-semibold" style={{ background: branding.primaryColor }}>Sign In</div>
                      </div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 16 }}>© 2026 {company.displayName || "Your ISP"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Globe size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Custom Domain</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Give your customers a branded portal URL</p>
                </div>
              </div>
              <div className="flex gap-3 mb-5">
                {[
                  { val: true, label: "Use My Custom Domain", desc: "billing.yourisp.com" },
                  { val: false, label: "Use IPS BD Subdomain", desc: "yourisp.ipsbd.io" },
                ].map(opt => (
                  <button key={String(opt.val)}
                    onClick={() => setDomain(d => ({ ...d, usePlatformDomain: !opt.val }))}
                    className="flex-1 p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: domain.usePlatformDomain === opt.val ? "var(--primary)" : "var(--border)",
                      background: domain.usePlatformDomain === opt.val ? "rgba(139,32,32,0.05)" : "var(--muted)",
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {domain.usePlatformDomain && (
                <div className="space-y-4">
                  <div>
                    <Label>Your Custom Domain</Label>
                    <input value={domain.customDomain} onChange={e => setDomain(d => ({ ...d, customDomain: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="billing.yourisp.com" />
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>DNS Configuration Required</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "monospace", lineHeight: 1.8 }}>
                      <div>Type: <strong>CNAME</strong></div>
                      <div>Name: <strong>billing</strong> (or your subdomain)</div>
                      <div>Value: <strong style={{ color: "var(--primary)" }}>app.ipsbd.io</strong></div>
                      <div>TTL: <strong>3600</strong></div>
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <AlertCircle size={14} style={{ color: "#D97706", marginTop: 1, flexShrink: 0 }} />
                      <div style={{ fontSize: 11, color: "#D97706" }}>DNS changes may take up to 48 hours to propagate. SSL certificate will be auto-issued once verified.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Server size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>MikroTik Server</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Connect your MikroTik router for PPPoE management</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Server Name *</Label>
                  <input value={mikrotik.name} onChange={e => setMikrotik(m => ({ ...m, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="MikroTik-01 (Dhaka)" /></div>
                <div><Label>IP Address *</Label>
                  <input value={mikrotik.ip} onChange={e => setMikrotik(m => ({ ...m, ip: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="192.168.1.1" /></div>
                <div><Label>API Port</Label>
                  <input value={mikrotik.port} onChange={e => setMikrotik(m => ({ ...m, port: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} /></div>
                <div><Label>Username</Label>
                  <input value={mikrotik.username} onChange={e => setMikrotik(m => ({ ...m, username: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} /></div>
                <div className="col-span-2"><Label>Password</Label>
                  <input type="password" value={mikrotik.password} onChange={e => setMikrotik(m => ({ ...m, password: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="•••••••••" /></div>
              </div>
              <button
                onClick={() => { setMikrotik(m => ({ ...m, connected: true })); showToast("MikroTik connected! CPU 23%, 972 active sessions."); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--primary)" }}>
                <Zap size={14} /> Test Connection
              </button>
              {mikrotik.connected && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)" }}>
                  <CheckCircle2 size={18} style={{ color: "#16A34A" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>Connected Successfully!</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>CPU: 23% | RAM: 41% | Sessions: 972</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Radio size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>OLT Configuration</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Connect your GPON/EPON OLT (optional, skip if not applicable)</p>
                </div>
              </div>
              {!olt.skip ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>OLT Name</Label>
                      <input value={olt.name} onChange={e => setOlt(o => ({ ...o, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="OLT-Dhaka-01" /></div>
                    <div><Label>IP Address</Label>
                      <input value={olt.ip} onChange={e => setOlt(o => ({ ...o, ip: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="192.168.1.100" /></div>
                    <div><Label>Vendor</Label>
                      <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} value={olt.vendor} onChange={e => setOlt(o => ({ ...o, vendor: e.target.value }))}>
                        <option>Huawei</option><option>ZTE</option><option>FiberHome</option><option>VSOL</option><option>Other</option>
                      </select></div>
                    <div><Label>SNMP Community</Label>
                      <input value={olt.snmpCommunity} onChange={e => setOlt(o => ({ ...o, snmpCommunity: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} /></div>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}
                    onClick={() => setOlt(o => ({ ...o, skip: true }))}>
                    <X size={14} /> Skip OLT setup for now
                  </button>
                </div>
              ) : (
                <div className="rounded-xl p-5 text-center border-2 border-dashed" style={{ borderColor: "var(--border)" }}>
                  <Radio size={32} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>OLT setup skipped. You can add OLTs from <strong>Network → OLT</strong> anytime.</div>
                  <button className="mt-3 text-sm font-medium" style={{ color: "var(--primary)" }} onClick={() => setOlt(o => ({ ...o, skip: false }))}>Set up OLT</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Package size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Internet Packages</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Create your service packages (you can add more later)</p>
                </div>
              </div>
              <div className="space-y-3">
                {packages.map((pkg, i) => (
                  <div key={i} className="grid grid-cols-4 gap-3 items-center p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                    <input value={pkg.name} onChange={e => setPackages(p => p.map((pp, ii) => ii === i ? { ...pp, name: e.target.value } : pp))}
                      className="px-3 py-2 rounded-lg outline-none" style={inputStyle} placeholder="Package name" />
                    <div className="flex items-center gap-2">
                      <input type="number" value={pkg.download} onChange={e => setPackages(p => p.map((pp, ii) => ii === i ? { ...pp, download: Number(e.target.value) } : pp))}
                        className="w-full px-3 py-2 rounded-lg outline-none" style={inputStyle} placeholder="DL Mbps" />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)", flexShrink: 0 }}>Mbps</span>
                    </div>
                    <input type="number" value={pkg.price} onChange={e => setPackages(p => p.map((pp, ii) => ii === i ? { ...pp, price: Number(e.target.value) } : pp))}
                      className="px-3 py-2 rounded-lg outline-none" style={inputStyle} placeholder="Price ৳" />
                    <button onClick={() => setPackages(p => p.filter((_, ii) => ii !== i))} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setPackages(p => [...p, { name: "", download: 10, upload: 5, price: 0 }])}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                + Add Package
              </button>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <CreditCard size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Payment Gateways</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Select which payment methods you want to enable</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "bkash", label: "bKash", desc: "Mobile banking payments", color: "#E2136E" },
                  { key: "nagad", label: "Nagad", desc: "Nagad mobile payments", color: "#F7941D" },
                  { key: "sslcommerz", label: "SSLCommerz", desc: "Cards, banks, mobile banking", color: "#2563EB" },
                  { key: "cash", label: "Cash / Manual", desc: "Record manual collections", color: "#16A34A" },
                ].map(gw => (
                  <button key={gw.key}
                    onClick={() => setPayment(p => ({ ...p, [gw.key]: !(p as any)[gw.key] }))}
                    className="p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3"
                    style={{
                      borderColor: (payment as any)[gw.key] ? gw.color : "var(--border)",
                      background: (payment as any)[gw.key] ? `${gw.color}10` : "var(--muted)",
                    }}>
                    <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: gw.color }}>
                      <CreditCard size={16} color="#fff" />
                    </div>
                    <div className="flex-1">
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>{gw.label}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{gw.desc}</div>
                    </div>
                    {(payment as any)[gw.key] && <Check size={16} style={{ color: gw.color, flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <MessageSquare size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>SMS Gateway</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Configure SMS for billing reminders and notifications</p>
                </div>
              </div>
              {!sms.skip ? (
                <div className="space-y-4">
                  <div><Label>SMS Provider</Label>
                    <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} value={sms.provider} onChange={e => setSms(s => ({ ...s, provider: e.target.value }))}>
                      <option value="ssl">SSLCommerz SMS</option><option value="infobip">Infobip</option><option value="twilio">Twilio</option><option value="custom">Custom API</option>
                    </select></div>
                  <div><Label>Sender ID</Label>
                    <input value={sms.senderId} onChange={e => setSms(s => ({ ...s, senderId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="MAA_BEST (max 11 chars)" maxLength={11} /></div>
                  <div><Label>API Key</Label>
                    <input type="password" value={sms.apiKey} onChange={e => setSms(s => ({ ...s, apiKey: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="•••••••••••••" /></div>
                  <button className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}
                    onClick={() => setSms(s => ({ ...s, skip: true }))}>
                    <X size={14} /> Skip SMS setup for now
                  </button>
                </div>
              ) : (
                <div className="rounded-xl p-5 text-center border-2 border-dashed" style={{ borderColor: "var(--border)" }}>
                  <MessageSquare size={32} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>SMS gateway skipped. Configure from <strong>Automation → SMS</strong> later.</div>
                  <button className="mt-3 text-sm font-medium" style={{ color: "var(--primary)" }} onClick={() => setSms(s => ({ ...s, skip: false }))}>Set up SMS</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 9 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: "rgba(139,32,32,0.1)" }}>
                  <Upload size={20} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>Import Customers</h2>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Import your existing customer database (optional)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-dashed text-center" style={{ borderColor: "var(--border)" }}>
                  <Upload size={32} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Upload CSV File</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>Max 10,000 customers per file</div>
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>Choose File</button>
                  <div className="mt-3">
                    <button className="text-sm font-medium" style={{ color: "var(--primary)" }}>⬇ Download Template</button>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 12 }}>CSV must include:</div>
                  <div className="space-y-1.5">
                    {["Name", "Phone", "Zone", "Package", "PPPoE Username", "PPPoE Password", "IP Address (optional)", "Billing Date (optional)"].map(f => (
                      <div key={f} className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        <Check size={11} style={{ color: "#16A34A" }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}
                onClick={() => setImportStep({ skip: true })}>
                <X size={14} /> Skip import — I'll add customers manually
              </button>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ width: 64, height: 64, background: "linear-gradient(135deg, #8B2020, #C43535)" }}>
                  <Zap size={30} color="#fff" />
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--foreground)" }}>Ready to Go Live!</h2>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6 }}>Review your setup summary and launch your ISP platform</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Company Profile", status: company.name ? "complete" : "skipped", icon: Building2 },
                  { label: "Branding & White-Label", status: "complete", icon: Palette },
                  { label: "Custom Domain", status: domain.customDomain ? "complete" : "pending", icon: Globe },
                  { label: "MikroTik", status: mikrotik.connected ? "complete" : "pending", icon: Server },
                  { label: "OLT", status: olt.skip ? "skipped" : "complete", icon: Radio },
                  { label: "Packages", status: packages.length > 0 ? "complete" : "pending", icon: Package },
                  { label: "Payment Gateways", status: "complete", icon: CreditCard },
                  { label: "SMS Gateway", status: sms.skip ? "skipped" : "complete", icon: MessageSquare },
                  { label: "Customer Import", status: importStep.skip ? "skipped" : "complete", icon: Upload },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                      <Icon size={16} style={{ color: item.status === "complete" ? "#16A34A" : item.status === "skipped" ? "#D97706" : "var(--muted-foreground)" }} />
                      <div className="flex-1" style={{ fontSize: 13, color: "var(--foreground)" }}>{item.label}</div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: item.status === "complete" ? "rgba(22,163,74,0.1)" : item.status === "skipped" ? "rgba(217,119,6,0.1)" : "rgba(107,114,128,0.1)",
                          color: item.status === "complete" ? "#16A34A" : item.status === "skipped" ? "#D97706" : "#6B7280",
                        }}
                      >
                        {item.status === "complete" ? "✓ Done" : item.status === "skipped" ? "Skipped" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { onNavigate?.("dashboard"); }}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all"
                style={{ background: "linear-gradient(135deg, #8B2020, #C43535)" }}
              >
                <Zap size={22} /> Launch My ISP Platform
              </button>
              <p className="text-center" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                You can complete skipped steps anytime from Settings
              </p>
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as Step)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: currentStep === 1 ? "var(--muted-foreground)" : "var(--foreground)" }}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={15} /> Back
            </button>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Step {currentStep} of {STEPS.length}
            </div>
            <button
              onClick={() => completeStep(currentStep)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--primary)" }}
            >
              {currentStep === 10 ? "Complete Setup" : "Continue"} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
