import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  variant?: "pill" | "button" | "dropdown";
  className?: string;
}

export function LanguageToggle({ variant = "pill", className = "" }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, isBangla } = useLanguage();

  if (variant === "button") {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${className}`}
        style={{
          background: "var(--muted)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
        title="Toggle English / বাংলা"
      >
        <Globe size={14} style={{ color: "var(--primary)" }} />
        <span>{isBangla ? "বাংলা (BN)" : "English (EN)"}</span>
      </button>
    );
  }

  return (
    <div
      className={`flex items-center rounded-xl p-0.5 border ${className}`}
      style={{
        background: "var(--muted)",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={() => setLanguage("en")}
        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
        style={{
          background: !isBangla ? "var(--primary)" : "transparent",
          color: !isBangla ? "#ffffff" : "var(--muted-foreground)",
          boxShadow: !isBangla ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
        }}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("bn")}
        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
        style={{
          background: isBangla ? "var(--primary)" : "transparent",
          color: isBangla ? "#ffffff" : "var(--muted-foreground)",
          boxShadow: isBangla ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
        }}
      >
        বাং
      </button>
    </div>
  );
}
