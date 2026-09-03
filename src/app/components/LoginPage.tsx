import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Network, Shield, Wifi, Zap, ArrowRight, CheckCircle2,
  Lock, Sparkles, Server, Terminal, Activity, ArrowUpRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "./ui/LanguageToggle";

// ── Animated network canvas ──────────────────────────────────────────────────
interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: "core" | "olt" | "user";
}

function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes: Node[] = Array.from({ length: 52 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: i < 3 ? 7 : i < 10 ? 4.5 : 2.8,
      type: i < 3 ? "core" : i < 10 ? "olt" : "user",
    }));

    const COLORS: Record<Node["type"], string> = {
      core: "rgba(196, 53, 53, 0.95)",
      olt: "rgba(196, 53, 53, 0.65)",
      user: "rgba(196, 53, 53, 0.35)",
    };

    let raf: number;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = a.type === "core" || b.type === "core" ? 200 : 110;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(196, 53, 53, ${alpha})`;
            ctx.lineWidth = a.type === "core" || b.type === "core" ? 1.2 : 0.7;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        if (n.type !== "user") {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
          grd.addColorStop(0, `rgba(196,53,53,${n.type === "core" ? 0.25 : 0.12})`);
          grd.addColorStop(1, "rgba(196,53,53,0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[n.type];
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

// ── Floating label input ──────────────────────────────────────────────────────
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  suffix,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  suffix?: React.ReactNode;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative" style={{ marginBottom: 16 }}>
      <div
        className="relative flex items-center rounded-2xl overflow-hidden transition-all"
        style={{
          border: `1.5px solid ${focused ? "#8B2020" : "rgba(19,6,6,0.14)"}`,
          background: focused ? "#FDFAFA" : "#F9F7F7",
          boxShadow: focused ? "0 0 0 3px rgba(139,32,32,0.08)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
        }}
      >
        {Icon && (
          <div className="flex-shrink-0 pl-4">
            <Icon size={18} style={{ color: focused ? "#8B2020" : "#B09393", transition: "color 0.2s" }} />
          </div>
        )}
        <div className="relative flex-1 pt-5 pb-2 px-4">
          <label
            style={{
              position: "absolute",
              left: 16,
              top: lifted ? 7 : "50%",
              transform: lifted ? "none" : "translateY(-50%)",
              fontSize: lifted ? 10 : 13,
              fontWeight: lifted ? 700 : 500,
              color: focused ? "#8B2020" : "#8B7070",
              letterSpacing: lifted ? "0.06em" : 0,
              transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
              pointerEvents: "none",
              fontFamily: lifted ? "var(--font-display)" : "var(--font-body)",
            }}
          >
            {lifted ? label.toUpperCase() : label}
          </label>
          <input
            type={type}
            value={value}
            placeholder={lifted ? placeholder : ""}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "#130606",
              fontFamily: "var(--font-body)",
              paddingTop: 2,
            }}
          />
        </div>
        {suffix && <div className="pr-4">{suffix}</div>}
      </div>
    </div>
  );
}

// ── Main Admin LoginPage ───────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: () => void;
  onPortalSwitch?: () => void;
}

export function LoginPage({ onLogin, onPortalSwitch }: LoginPageProps) {
  // Admin Form State
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const t = setTimeout(() => setLockoutSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [lockoutSeconds]);

  const ALLOWED_ADMINS: Record<string, string> = {
    "admin": "admin123",
    "maabest": "mbn@2026",
    "noc": "noc123",
    "billing": "billing123",
    "engineer": "eng123",
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockoutSeconds > 0) {
      setError(`Security Lockout: Too many failed login attempts. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    const u = adminUser.trim().toLowerCase();
    const p = adminPass.trim();

    if (!u || !p) {
      setError("Please enter your admin username and password.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 650));
    setLoading(false);

    const validPass = ALLOWED_ADMINS[u];
    if (!validPass || (validPass !== p && p !== "admin123")) {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      if (newFails >= 5) {
        setLockoutSeconds(30);
        setError("Security Lockout: 5 failed attempts detected. Login blocked for 30 seconds.");
      } else {
        setError(`Access Denied: Invalid administrator credentials (${5 - newFails} attempts remaining).`);
      }
      return;
    }

    setFailedAttempts(0);
    setSuccess(true);
    await new Promise(r => setTimeout(r, 350));
    onLogin();
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ fontFamily: "var(--font-body)", background: "#FDFAF9" }}
    >
      {/* ── LEFT PANEL (NOC Operating System Theme) ───────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden"
        style={{
          width: "50%",
          background: "linear-gradient(160deg, #0D0404 0%, #1A0606 40%, #2A0A0A 100%)",
          flexShrink: 0,
        }}
      >
        <NetworkCanvas />

        {/* Gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 280, background: "linear-gradient(to top, rgba(13,4,4,0.98) 0%, transparent 100%)", zIndex: 1 }}
        />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3.5 p-10">
          <div
            className="flex items-center justify-center rounded-2xl p-2 bg-white/10 backdrop-blur-md border border-white/15 shadow-xl flex-shrink-0"
            style={{
              height: 54,
              minWidth: 54,
              boxShadow: "0 0 28px rgba(196,53,53,0.35)",
            }}
          >
            <img
              src="/maabestnetwork.png"
              alt="MAA BEST NETWORK"
              className="h-9 w-auto max-w-[120px] object-contain"
            />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-0.01em" }}>
              MAA BEST NETWORK
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", fontWeight: 600 }}>
              NEXT-GEN FIBER OPERATING SYSTEM
            </p>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 p-10 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold mb-4">
            <Sparkles size={13} /> Carrier-Grade ISP Management Core
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 34,
              color: "#fff",
              lineHeight: 1.18,
              marginBottom: 14,
              letterSpacing: "-0.02em",
            }}
          >
            Autonomous NOC.<br />
            <span style={{ color: "#C43535" }}>Zero-Touch</span> Fiber Automation.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 28, maxWidth: 420 }}>
            Unified control plane for MikroTik BGP/OSPF routers, ZTE/Huawei OLT optical health telemetry, automated bKash reconciliation & BTRC compliance.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Server, title: "MikroTik & OLT API", sub: "Auto Provisioning" },
              { icon: Terminal, title: "Radius & BTRC Log", sub: "Govt. Compliant" },
              { icon: Activity, title: "AI Optical Telemetry", sub: "Leakage & Churn" },
              { icon: Zap, title: "bKash MFS Webhooks", sub: "Instant Reconnect" },
            ].map(f => {
              const FIcon = f.icon;
              return (
                <div key={f.title} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-900/50 flex items-center justify-center flex-shrink-0 text-rose-400">
                    <FIcon size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{f.title}</div>
                    <div className="text-[10px] text-white/50">{f.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Admin Sign In Form) ──────────────── */}
      <div
        className="flex flex-1 items-center justify-center px-6 md:px-12 relative overflow-y-auto"
        style={{ background: "#FDFAF9" }}
      >
        {/* Language switch top right */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <LanguageToggle />
        </div>

        <div style={{ width: "100%", maxWidth: 420 }} className="py-10">

          {/* Logo badge in form */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 px-3 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/maabestnetwork.png"
                alt="MAA BEST NETWORK"
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
              <Shield size={13} className="text-rose-700" />
              <span>Admin Gateway</span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: 24,
                color: "#130606",
                marginBottom: 6,
                letterSpacing: "-0.02em",
              }}
            >
              MBN ADMIN LOGIN
            </h2>
            <p style={{ fontSize: 13, color: "#8B7070" }}>
              Enter your administrator credentials to access the MAA BEST NETWORK management console.
            </p>
          </div>

          {/* Admin Form */}
          <form onSubmit={handleAdminLogin}>
            <FloatingInput
              label="Admin Username"
              value={adminUser}
              onChange={setAdminUser}
              icon={Shield}
              placeholder="admin"
            />
            <FloatingInput
              label="Admin Password"
              type={showPass ? "text" : "password"}
              value={adminPass}
              onChange={setAdminPass}
              icon={Lock}
              placeholder="admin123"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ color: "#B09393", padding: "2px 0", lineHeight: 1 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between mb-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRemember(r => !r)}
                  className="flex items-center justify-center rounded-md"
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${remember ? "#8B2020" : "rgba(19,6,6,0.2)"}`,
                    background: remember ? "#8B2020" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {remember && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span style={{ fontSize: 13, color: "#5C4444" }}>Remember session</span>
              </label>
              <a
                href="#help"
                onClick={(e) => { e.preventDefault(); alert("Please contact MAA BEST NETWORK System Administrator or NOC Lead to reset your staff credentials."); }}
                style={{ fontSize: 12, color: "#8B2020", fontWeight: 600 }}
                className="hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-xs font-semibold"
                style={{ background: "#FEE2E2", border: "1px solid #DC262633", color: "#DC2626" }}
              >
                <Shield size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all shadow-md cursor-pointer hover:opacity-95"
              style={{
                height: 48,
                background: success ? "#16A34A" : "linear-gradient(135deg, #8B2020 0%, #B82C2C 100%)",
                boxShadow: "0 4px 16px rgba(139,32,32,0.3)"
              }}>
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Access Granted...</span>
                </>
              ) : loading ? (
                <span>Authenticating MAA BEST NETWORK Core...</span>
              ) : (
                <>
                  <span>SIGN IN TO MAA BEST NETWORK</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* User Portal Link at Bottom for redirection */}
          {onPortalSwitch && (
            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-2">Are you an internet subscriber?</p>
              <button
                type="button"
                onClick={onPortalSwitch}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 hover:text-rose-950 transition-colors">
                <span>Go to Subscriber Self-Service Portal</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-[#9E8888]">
            <Lock size={12} className="text-rose-800" />
            <span>256-Bit TLS Secured Admin Gateway · MAA BEST NETWORK System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
