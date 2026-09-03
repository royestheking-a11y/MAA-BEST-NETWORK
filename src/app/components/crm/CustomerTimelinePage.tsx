import { useState, useEffect } from "react";
import {
  Clock, Search, User, CreditCard, TicketCheck, WifiOff,
  Zap, ArrowUpRight, CheckCircle2, Shield, Filter, RefreshCw
} from "lucide-react";
import {
  crmStore, type TimelineEvent
} from "./crmData";

interface CustomerTimelinePageProps {
  onNavigate?: (page: string) => void;
}

export function CustomerTimelinePage({ onNavigate }: CustomerTimelinePageProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(crmStore.getTimeline());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    return crmStore.subscribe(() => {
      setEvents(crmStore.getTimeline());
    });
  }, []);

  const filtered = events.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      e.customerName.toLowerCase().includes(q) ||
      e.custId.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || e.eventType === typeFilter;
    return matchSearch && matchType;
  });

  const getEventIcon = (type: TimelineEvent["eventType"]) => {
    switch (type) {
      case "payment": return <CreditCard size={15} className="text-emerald-600" />;
      case "ticket": return <TicketCheck size={15} className="text-amber-600" />;
      case "disconnection": return <WifiOff size={15} className="text-red-600" />;
      case "package_change": return <ArrowUpRight size={15} className="text-blue-600" />;
      default: return <Clock size={15} className="text-purple-600" />;
    }
  };

  const getEventBg = (type: TimelineEvent["eventType"]) => {
    switch (type) {
      case "payment": return "#DCFCE7";
      case "ticket": return "#FEF3C7";
      case "disconnection": return "#FEE2E2";
      case "package_change": return "#DBEAFE";
      default: return "#EDE9FE";
    }
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer 360° Activity Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              Chronological Audit Trail
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Real-time customer journey — payments, plan upgrades, automated line suspensions, and support tickets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvents(crmStore.getTimeline())}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} /> Refresh Logs
          </button>
        </div>
      </div>

      {/* ── Filters Toolbar ─────────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 mb-5 border border-border bg-card shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="relative w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name, ID, or activity..."
            className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "payment", "ticket", "disconnection", "package_change"] as const).map(k => (
            <button
              key={k}
              onClick={() => setTypeFilter(k)}
              className="px-3 py-1.5 rounded-lg capitalize transition-colors text-xs font-medium"
              style={{
                background: typeFilter === k ? "var(--primary)" : "var(--muted)",
                color: typeFilter === k ? "white" : "var(--muted-foreground)",
              }}
            >
              {k.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vertical Timeline Stream ─────────────────────────────────────────── */}
      <div className="rounded-xl p-6 border border-border bg-card shadow-sm">
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {filtered.map(item => (
            <div key={item.id} className="relative flex items-start gap-4 group">
              {/* Dot Icon */}
              <div
                className="absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-card shadow-sm z-10"
                style={{ background: getEventBg(item.eventType) }}
              >
                {getEventIcon(item.eventType)}
              </div>

              <div className="flex-1 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                      {item.title}
                    </h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                      {item.eventType.replace("_", " ")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{item.timestamp}</span>
                </div>

                <p style={{ fontSize: 12, color: "var(--foreground)", marginBottom: 4 }}>
                  {item.details}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span>Customer: <strong className="text-foreground">{item.customerName}</strong> ({item.custId})</span>
                  <span>Triggered by: <span className="font-medium text-foreground">{item.author}</span></span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No timeline activities matched your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
