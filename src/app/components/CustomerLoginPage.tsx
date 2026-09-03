import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Wifi, Shield, Smartphone, Zap, ArrowRight, CheckCircle2,
  Lock, Sparkles, User, HelpCircle, Activity, Gauge
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "./ui/LanguageToggle";
import { useCustomerContext } from "../context/CustomerContext";

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

// ── Main Customer LoginPage (Normal Link for Subscribers) ─────────────────────
interface CustomerLoginPageProps {
  onSuccess?: () => void;
  onAdminSwitch?: () => void;
}

export function CustomerLoginPage({ onSuccess, onAdminSwitch }: CustomerLoginPageProps) {
  const { customers, loginAsCustomer } = useCustomerContext();
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !passcode.trim()) {
      setError("Please enter your User ID or Phone Number and Passcode.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 650));

    const result = loginAsCustomer(identifier, passcode);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Invalid User ID or Passcode.");
      return;
    }

    setSuccess(true);
    await new Promise(r => setTimeout(r, 350));
    onSuccess?.();
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ fontFamily: "var(--font-body)", background: "#FDFAF9" }}
    >
      {/* ── LEFT PANEL (Subscriber Fiber Theme) ────────────── */}
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
              SUBSCRIBER SELF-SERVICE PORTAL
            </p>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 p-10 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold mb-4">
            <Sparkles size={13} /> High-Speed Gigabit Optical Network
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
            Seamless Connectivity.<br />
            <span style={{ color: "#C43535" }}>Direct bKash</span> Payments.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 28, maxWidth: 420 }}>
            Check your live download & upload speeds, review package validity, countdown to renewal, and pay bills directly in seconds.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Gauge, title: "Live Bandwidth Meter", sub: "Speed & Ping Test" },
              { icon: Smartphone, title: "1-Click bKash / Nagad", sub: "Auto Reconnection" },
              { icon: Shield, title: "Default Passcode", sub: "Encrypted Portal" },
              { icon: Zap, title: "Optical Rx Telemetry", sub: "Live Diagnostics" },
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

      {/* ── RIGHT PANEL (Subscriber Sign In Form) ─────────── */}
      <div
        className="flex flex-1 items-center justify-center px-6 md:px-12 relative overflow-y-auto"
        style={{ background: "#FDFAF9" }}
      >
        {/* Language switch top right */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <LanguageToggle />
        </div>

        <div style={{ width: "100%", maxWidth: 420 }} className="py-10">

          {/* Subscriber Portal Badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-12 px-3 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-center flex-shrink-0">
              <img
                src="/maabestnetwork.png"
                alt="MAA BEST NETWORK"
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
              <User size={13} className="text-rose-700" />
              <span>Subscriber Self-Service</span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: 26,
                color: "#130606",
                marginBottom: 6,
                letterSpacing: "-0.02em",
              }}
            >
              Subscriber Sign In
            </h2>
            <p style={{ fontSize: 13, color: "#8B7070" }}>
              Enter your Customer ID or Phone and Default Passcode
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <FloatingInput
              label="User ID / Phone / PPPoE"
              value={identifier}
              onChange={setIdentifier}
              icon={User}
              placeholder="e.g. MBN0001, 017XXXXXXXX, or PPPoE Username"
            />
            <FloatingInput
              label="Portal Passcode"
              type={showPass ? "text" : "password"}
              value={passcode}
              onChange={setPasscode}
              icon={Lock}
              placeholder="Enter your portal passcode"
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
                <span style={{ fontSize: 13, color: "#5C4444" }}>Remember login</span>
              </label>
              <a
                href="tel:09611223344"
                style={{ fontSize: 12, color: "#8B2020", fontWeight: 600 }}
                className="hover:underline">
                Forgot Passcode?
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
                  <span>Opening Subscriber Panel...</span>
                </>
              ) : loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Subscriber Panel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer branding */}
          <p style={{ fontSize: 12, color: "#C0A8A8", textAlign: "center", marginTop: 28 }}>
            © 2026 MAA BEST NETWORK · Ultra-Fast Fiber Broadband.
          </p>
        </div>
      </div>
    </div>
  );
}
