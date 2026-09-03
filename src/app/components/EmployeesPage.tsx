import { useState } from "react";
import { Plus, Search, UserCog, Shield, CheckCircle2, X } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  zone: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

const employees: Employee[] = [];

const roles = [
  { name: "ISP Admin", color: "#8B2020", bg: "#FDF3F3", perms: ["All modules", "All zones", "Settings", "Employees", "Reports"] },
  { name: "Manager", color: "#7C3AED", bg: "#EDE9FE", perms: ["Customers", "Billing", "Network", "Finance", "Reports"] },
  { name: "Billing Officer", color: "#2563EB", bg: "#DBEAFE", perms: ["Customers (view)", "Invoices", "Payments", "Packages"] },
  { name: "Support Agent", color: "#16A34A", bg: "#DCFCE7", perms: ["Customers", "Tickets", "CRM", "Timeline"] },
  { name: "Network Engineer", color: "#0891B2", bg: "#CFFAFE", perms: ["MikroTik", "OLT", "Live Status", "Network Map", "Incidents"] },
  { name: "Collector", color: "#D97706", bg: "#FEF3C7", perms: ["Due Customers (zone)", "Payments", "Collection report"] },
];

const roleColors: Record<string, { color: string; bg: string }> = {
  "ISP Admin":      { color: "#8B2020", bg: "#FDF3F3" },
  "Manager":        { color: "#7C3AED", bg: "#EDE9FE" },
  "Billing Officer":{ color: "#2563EB", bg: "#DBEAFE" },
  "Support Agent":  { color: "#16A34A", bg: "#DCFCE7" },
  "Network Engineer":{ color: "#0891B2", bg: "#CFFAFE" },
  "Collector":      { color: "#D97706", bg: "#FEF3C7" },
};

type Tab = "list" | "roles";

export function EmployeesPage() {
  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = employees.filter(e =>
    search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>Employee Management</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Staff, roles, zone permissions, and access control</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer" style={{ background: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
          <Plus size={14} /> Add Employee
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Staff", value: `${employees.length}`, sub: "All roles", color: "#8B2020", bg: "#FDF3F3" },
          { label: "Active", value: `${employees.filter(e => e.status === "active").length}`, sub: "Currently active", color: "#16A34A", bg: "#DCFCE7" },
          { label: "Roles", value: `${roles.length}`, sub: "Permission roles", color: "#7C3AED", bg: "#EDE9FE" },
          { label: "Zones Covered", value: "8", sub: "Service zones", color: "#2563EB", bg: "#DBEAFE" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-center rounded-lg mb-3" style={{ width: 34, height: 34, background: k.bg }}>
              <UserCog size={16} style={{ color: k.color }} />
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>{k.value}</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 1 }}>{k.label}</p>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)", width: "fit-content" }}>
        {[{ id: "list" as Tab, label: "Employees" }, { id: "roles" as Tab, label: "Roles & Permissions" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg transition-all"
            style={{ background: tab === t.id ? "var(--card)" : "transparent", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["Employee", "Role", "Zone", "Status", "Last Login", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const rc = roleColors[e.role] ?? { color: "#6B7280", bg: "#F3F4F6" };
                  return (
                    <tr key={e.id} style={{ borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = "var(--muted)")}
                      onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: "#FDF3F3", color: "#8B2020", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-display)" }}>
                            {e.avatar}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{e.name}</p>
                            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color }}>{e.role}</span>
                      </td>
                      <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{e.zone}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full" style={{ width: 7, height: 7, background: e.status === "active" ? "#16A34A" : "#6B7280", display: "inline-block" }} />
                          <span style={{ fontSize: 12, color: e.status === "active" ? "#16A34A" : "var(--muted-foreground)", fontWeight: 500, textTransform: "capitalize" }}>{e.status}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{e.lastLogin}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button className="px-2.5 py-1 rounded-md" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 11 }}>Edit</button>
                          <button className="px-2.5 py-1 rounded-md" style={{ background: "#FEE2E2", border: "1px solid #DC262620", fontSize: 11, color: "#DC2626" }}>Suspend</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.name} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: r.bg }}>
                  <Shield size={17} style={{ color: r.color }} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{employees.filter(e => e.role === r.name).length} employees</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {r.perms.map(p => (
                  <div key={p} className="flex items-center gap-2">
                    <CheckCircle2 size={13} style={{ color: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--foreground)" }}>{p}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
                Edit Permissions
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>Add New Employee</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="grid gap-3">
              {[["Full Name", "text", "Md. Abdullah Al Mamun"], ["Email", "email", "employee@myisp.bd"], ["Phone", "text", "01712-XXXXXX"]].map(([label, type, ph]) => (
                <div key={label as string}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>{(label as string).toUpperCase()}</label>
                  <input type={type as string} placeholder={ph as string} className="w-full px-3 py-2.5 rounded-lg outline-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>ROLE</label>
                <select className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
                  {roles.map(r => <option key={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>ZONE</label>
                <select className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
                  {["All Zones", "Madaripur Sadar", "Kalkini", "Shibchar", "Rajoir", "Dashar", "Somitir Hat"].map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-lg text-white" style={{ background: "#8B2020", fontSize: 13, fontWeight: 500 }}>Create Employee</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
