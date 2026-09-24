import { useState, useMemo } from "react";
import {
  Search, UserCog, Shield, CheckCircle2, X, Edit2, Trash2,
  Check, Phone, Mail, MapPin, DollarSign, Clock, AlertTriangle,
  Sliders, Lock, Unlock, ShieldCheck, UserPlus, Sparkles,
  Power, KeyRound, Eye, EyeOff, Copy, ExternalLink, RefreshCw,
  AtSign, Layers, Filter, CheckSquare, Sparkle, Globe, FileText,
  ChevronDown, ChevronUp, Zap, Ban, Edit3
} from "lucide-react";
import {
  useAuth,
  usePermission,
  type Employee,
  type RoleDefinition,
  type PermissionLevel,
  SYSTEM_SECTIONS,
  getDefaultRoleSectionPerms,
  SUPER_ADMIN_SECTION_PERMS,
  ALL_SYSTEM_PERMISSIONS,
} from "../context/AuthContext";

export { type Employee, type RoleDefinition, type PermissionLevel, ALL_SYSTEM_PERMISSIONS, SYSTEM_SECTIONS };

type Tab = "list" | "roles";

// Helper to generate strong friendly password
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const specials = "@#$!";
  let pass = "";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pass += specials.charAt(Math.floor(Math.random() * specials.length));
  pass += Math.floor(10 + Math.random() * 89);
  return pass;
}

interface PermissionsMatrixEditorProps {
  matrix: Record<string, PermissionLevel>;
  onChange: (sectionId: string, level: PermissionLevel) => void;
  onBatchSet: (level: PermissionLevel) => void;
  onApplyTemplate?: (roleName: string) => void;
}

function PermissionsMatrixEditor({
  matrix,
  onChange,
  onBatchSet,
  onApplyTemplate,
}: PermissionsMatrixEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    SYSTEM_SECTIONS.forEach(s => set.add(s.category));
    return Array.from(set);
  }, []);

  const counts = useMemo(() => {
    let all = 0, readWrite = 0, read = 0, none = 0;
    SYSTEM_SECTIONS.forEach(s => {
      const lvl = matrix[s.id] || "none";
      if (lvl === "all") all++;
      else if (lvl === "read_write") readWrite++;
      else if (lvl === "read") read++;
      else none++;
    });
    return { all, readWrite, read, none, total: SYSTEM_SECTIONS.length };
  }, [matrix]);

  const filteredSections = useMemo(() => {
    return SYSTEM_SECTIONS.filter(s => {
      const matchCat = selectedCategory === "all" || s.category === selectedCategory;
      const matchSearch =
        !searchTerm.trim() ||
        s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-3">
      {/* Batch toolbar and template selector */}
      <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sliders size={14} className="text-primary" />
            <span>Batch Permission Quick Actions</span>
          </div>

          {onApplyTemplate && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold">Load Template:</span>
              <select
                onChange={e => {
                  if (e.target.value) {
                    onApplyTemplate(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1 text-[11px] rounded-lg bg-card border border-border text-foreground font-semibold outline-none cursor-pointer"
              >
                <option value="" disabled>Choose Preset Role...</option>
                <option value="ISP Admin">Super Admin (Full Access)</option>
                <option value="Manager">Operations Manager</option>
                <option value="Billing Officer">Billing & Cashier</option>
                <option value="Network Engineer">NOC & Network Engineer</option>
                <option value="Support Agent">Customer Support CRM</option>
                <option value="Field Collector">Zone Field Collector</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onBatchSet("all")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Zap size={12} className="fill-current text-emerald-600 dark:text-emerald-400" />
            <span>Full Access All</span>
          </button>
          <button
            type="button"
            onClick={() => onBatchSet("read_write")}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Edit3 size={12} className="text-amber-600 dark:text-amber-400" />
            <span>View & Edit All</span>
          </button>
          <button
            type="button"
            onClick={() => onBatchSet("read")}
            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Eye size={12} className="text-blue-600 dark:text-blue-400" />
            <span>View Only All</span>
          </button>
          <button
            type="button"
            onClick={() => onBatchSet("none")}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Ban size={12} className="text-rose-600 dark:text-rose-400" />
            <span>Clear All (None)</span>
          </button>
        </div>

        {/* Live Metrics Counter */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px] font-bold">
          <span className="text-muted-foreground">Current Access:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Zap size={11} className="fill-current text-emerald-500" />
            <span>{counts.all} Full Access</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Edit3 size={11} className="text-amber-500" />
            <span>{counts.readWrite} View & Edit</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Eye size={11} className="text-blue-500" />
            <span>{counts.read} View Only</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            <Ban size={11} className="text-muted-foreground" />
            <span>{counts.none} No Access</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search sections (e.g. mikrotik, invoices, whatsapp, clients)..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg bg-card border border-border text-foreground outline-none focus:border-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 text-[11px] rounded-lg bg-card border border-border text-foreground font-semibold outline-none cursor-pointer"
        >
          <option value="all">All Categories ({SYSTEM_SECTIONS.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Sections List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredSections.map(sec => {
          const currentLevel: PermissionLevel = matrix[sec.id] || "none";

          return (
            <div
              key={sec.id}
              className="p-3 rounded-xl bg-card border border-border hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-foreground tracking-tight">{sec.label}</h4>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-bold border border-border">
                    {sec.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{sec.description}</p>
              </div>

              {/* 4-way Segmented Button */}
              <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl border border-border shrink-0 self-start sm:self-center">
                {/* None Option */}
                <button
                  type="button"
                  onClick={() => onChange(sec.id, "none")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentLevel === "none"
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 shadow-xs border border-rose-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="No access to this section"
                >
                  <Ban size={11} className={currentLevel === "none" ? "text-rose-600 dark:text-rose-300" : "text-muted-foreground"} />
                  <span>None</span>
                </button>

                {/* View Only Option */}
                <button
                  type="button"
                  onClick={() => onChange(sec.id, "read")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentLevel === "read"
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="View only - cannot edit, add, or delete"
                >
                  <Eye size={11} className={currentLevel === "read" ? "text-blue-600 dark:text-blue-300" : "text-muted-foreground"} />
                  <span>View</span>
                </button>

                {/* View & Edit Option */}
                <button
                  type="button"
                  onClick={() => onChange(sec.id, "read_write")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentLevel === "read_write"
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="View & Edit - can add and modify, but cannot delete"
                >
                  <Edit3 size={11} className={currentLevel === "read_write" ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"} />
                  <span>Edit</span>
                </button>

                {/* Full Access Option */}
                <button
                  type="button"
                  onClick={() => onChange(sec.id, "all")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentLevel === "all"
                      ? "bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 shadow-xs border border-emerald-500/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Full access - full view, edit, add, and delete control"
                >
                  <Zap size={11} className={currentLevel === "all" ? "text-emerald-600 dark:text-emerald-300 fill-current" : "text-muted-foreground"} />
                  <span>Full</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EmployeesPage() {
  const {
    employees,
    roles,
    createEmployee,
    updateEmployee,
    updateEmployeePassword,
    updateEmployeePermissions,
    toggleEmployeeStatus,
    deleteEmployee,
    setRoles,
  } = useAuth();

  const { canEdit, canDelete, isReadOnly } = usePermission("employees");

  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);
  const [showAddCustomPerms, setShowAddCustomPerms] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: generateSecurePassword(),
    role: "Billing Officer",
    zone: "Madaripur Sadar",
    salary: 20000,
    designation: "Staff Member",
    status: "active" as Employee["status"],
    sectionPerms: getDefaultRoleSectionPerms("Billing Officer"),
  });

  // Dedicated User Granular Permissions Modal
  const [userPermsModalEmp, setUserPermsModalEmp] = useState<Employee | null>(null);
  const [userPermsMatrix, setUserPermsMatrix] = useState<Record<string, PermissionLevel>>({});

  // Created Credential Notification Modal
  const [createdCredential, setCreatedCredential] = useState<{
    emp: Employee;
    copied: boolean;
  } | null>(null);

  // Manage Credentials Modal
  const [credentialEmp, setCredentialEmp] = useState<Employee | null>(null);
  const [showCredPass, setShowCredPass] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showNewPassInput, setShowNewPassInput] = useState(false);

  // Edit Employee Modal
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);
  const [showEditEmpPerms, setShowEditEmpPerms] = useState(false);
  const [editEmpPermsMatrix, setEditEmpPermsMatrix] = useState<Record<string, PermissionLevel>>({});

  // Delete confirmation
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState<Employee | null>(null);

  // Edit Permissions Modal
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editPermsList, setEditPermsList] = useState<string[]>([]);

  // Add Custom Role Modal
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    description: "",
    color: "#2563EB",
    bg: "#DBEAFE",
    perms: [] as string[],
  });

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // Filtered employees
  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q);

      const matchRole = roleFilter === "all" || e.role === roleFilter;
      const matchZone = zoneFilter === "all" || e.zone === zoneFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;

      return matchSearch && matchRole && matchZone && matchStatus;
    });
  }, [employees, search, roleFilter, zoneFilter, statusFilter]);

  // Open Dedicated User Permissions Modal
  const openUserPermissionsModal = (emp: Employee) => {
    const initialMatrix = emp.sectionPerms && Object.keys(emp.sectionPerms).length > 0
      ? { ...emp.sectionPerms }
      : getDefaultRoleSectionPerms(emp.role);
    setUserPermsMatrix(initialMatrix);
    setUserPermsModalEmp(emp);
  };

  // Save Dedicated User Permissions Modal
  const handleSaveUserPermissionsModal = () => {
    if (!userPermsModalEmp) return;
    updateEmployeePermissions(userPermsModalEmp.id, userPermsMatrix);
    showToast(`Live permissions updated for ${userPermsModalEmp.name}! System auto-synced.`);
    setUserPermsModalEmp(null);
  };

  // Handle Add Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Adding new employees is restricted.");
      return;
    }
    if (!newEmpForm.name.trim()) return;

    const email =
      newEmpForm.email.trim().toLowerCase() ||
      `${newEmpForm.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@maabestnetwork.com`;

    // Check duplicate email
    const exists = employees.some(em => em.email.toLowerCase() === email);
    if (exists) {
      alert(`An employee with email "${email}" already exists. Please enter a unique email address.`);
      return;
    }

    const username = (
      newEmpForm.username.trim() ||
      newEmpForm.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")
    ).toLowerCase();

    // Check duplicate username against employees & admin accounts
    const isReserved = ["admin", "maabest", "root"].includes(username);
    const usernameTaken = employees.some(em => em.username?.toLowerCase() === username);
    if (isReserved || usernameTaken) {
      alert(`Username "@${username}" is already taken or reserved by administrator. Please choose a unique username.`);
      return;
    }

    const pass = newEmpForm.password.trim() || generateSecurePassword();

    const created = createEmployee({
      name: newEmpForm.name.trim(),
      username,
      email,
      phone: newEmpForm.phone.trim(),
      role: newEmpForm.role,
      zone: newEmpForm.zone,
      status: newEmpForm.status,
      salary: Number(newEmpForm.salary) || 20000,
      designation: newEmpForm.designation.trim() || newEmpForm.role,
      password: pass,
      sectionPerms: newEmpForm.sectionPerms,
    });

    setShowAddEmployee(false);
    setCreatedCredential({ emp: created, copied: false });
    setNewEmpForm({
      name: "",
      username: "",
      email: "",
      phone: "",
      password: generateSecurePassword(),
      role: "Billing Officer",
      zone: "Madaripur Sadar",
      salary: 20000,
      designation: "Staff Member",
      status: "active",
      sectionPerms: getDefaultRoleSectionPerms("Billing Officer"),
    });
    showToast(`Staff profile created! Credentials & permissions ready for ${created.name}`);
  };

  // Handle Save Edit Employee
  const handleSaveEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying employee profiles is restricted.");
      return;
    }
    if (!editEmployee) return;

    const username = editEmployee.username?.trim().toLowerCase();
    if (username) {
      const isReserved = ["admin", "maabest", "root"].includes(username);
      const usernameTaken = employees.some(em => em.id !== editEmployee.id && em.username?.toLowerCase() === username);
      if (isReserved || usernameTaken) {
        alert(`Username "@${username}" is already taken by another account. Please choose a different username.`);
        return;
      }
    }

    updateEmployee(editEmployee.id, {
      name: editEmployee.name,
      username: username || undefined,
      email: editEmployee.email,
      phone: editEmployee.phone,
      role: editEmployee.role,
      zone: editEmployee.zone,
      status: editEmployee.status,
      salary: Number(editEmployee.salary) || 0,
      designation: editEmployee.designation,
      sectionPerms: showEditEmpPerms ? editEmpPermsMatrix : editEmployee.sectionPerms,
    });

    if (editNewPassword.trim()) {
      updateEmployeePassword(editEmployee.id, editNewPassword.trim());
    }

    showToast(`Updated profile and permissions for ${editEmployee.name} (${editEmployee.id})!`);
    setEditEmployee(null);
    setEditNewPassword("");
    setShowEditEmpPerms(false);
  };

  // Save New Password from Credentials Modal
  const handleSaveCredentialPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying employee credentials is restricted.");
      return;
    }
    if (!credentialEmp || !newPasswordInput.trim()) return;

    updateEmployeePassword(credentialEmp.id, newPasswordInput.trim());
    // Update local modal state
    setCredentialEmp(prev => (prev ? { ...prev, password: newPasswordInput.trim() } : null));
    setNewPasswordInput("");
    showToast(`Password successfully updated for ${credentialEmp.name}!`);
  };

  // Toggle Employee Status
  const handleToggleStatus = (emp: Employee) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying employee status is restricted.");
      return;
    }
    toggleEmployeeStatus(emp.id);
    const next = emp.status === "active" ? "SUSPENDED" : "ACTIVE";
    showToast(`Account for ${emp.name} is now ${next}!`);
  };

  // Handle Delete Employee
  const handleDeleteEmployee = () => {
    if (!canDelete) {
      showToast("Access Restricted: Full delete permission is required to delete employees.");
      return;
    }
    if (!deleteConfirmEmp) return;
    deleteEmployee(deleteConfirmEmp.id);
    showToast(`Deleted employee ${deleteConfirmEmp.name} (${deleteConfirmEmp.id})!`);
    setDeleteConfirmEmp(null);
  };

  // Open Edit Permissions
  const openEditPermissions = (role: RoleDefinition) => {
    setEditingRole(role);
    setEditPermsList([...role.perms]);
  };

  // Toggle permission checkbox
  const togglePermission = (perm: string) => {
    setEditPermsList(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // Save Role Permissions
  const handleSaveRolePermissions = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying roles & permissions is restricted.");
      return;
    }
    if (!editingRole) return;
    setRoles(prev =>
      prev.map(r => (r.name === editingRole.name ? { ...r, perms: editPermsList } : r))
    );
    showToast(`Permissions updated for role [${editingRole.name}]!`);
    setEditingRole(null);
  };

  // Handle Create Role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Creating roles is restricted.");
      return;
    }
    if (!newRoleForm.name.trim()) return;

    const createdRole: RoleDefinition = {
      name: newRoleForm.name.trim(),
      description: newRoleForm.description.trim() || "Custom defined staff role",
      color: newRoleForm.color,
      bg: `${newRoleForm.color}15`,
      perms: newRoleForm.perms.length > 0 ? newRoleForm.perms : ["Dashboard & Financial KPIs"],
    };

    setRoles(prev => [...prev, createdRole]);
    setShowAddRole(false);
    setNewRoleForm({
      name: "",
      description: "",
      color: "#2563EB",
      bg: "#DBEAFE",
      perms: [],
    });
    showToast(`Created new access role [${createdRole.name}]!`);
  };

  const getRoleStyle = (roleName: string) => {
    const r = roles.find(ro => ro.name === roleName);
    return r ? { color: r.color, bg: r.bg } : { color: "#6B7280", bg: "#F3F4F6" };
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-medium border border-primary/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <UserCog size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Employee Management & Staff Access
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Credentials Active
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage ISP team members, login emails & passwords, role permissions, and zone access
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tab === "roles" ? (
            <button
              disabled={isReadOnly}
              onClick={() => {
                if (isReadOnly) return;
                setShowAddRole(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                isReadOnly ? "opacity-50 cursor-not-allowed bg-muted-foreground" : "bg-primary hover:opacity-95 cursor-pointer"
              }`}
              title={isReadOnly ? "View Only: Administrator rights required" : "Create New Role"}
            >
              <Shield size={14} />
              <span>Create New Role</span>
            </button>
          ) : (
            <button
              disabled={isReadOnly}
              onClick={() => {
                if (isReadOnly) return;
                setNewEmpForm(p => ({ ...p, password: generateSecurePassword() }));
                setShowAddEmployee(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                isReadOnly ? "opacity-50 cursor-not-allowed bg-muted-foreground" : "bg-primary hover:opacity-95 cursor-pointer"
              }`}
              title={isReadOnly ? "View Only: Administrator rights required to add staff" : "Add New Employee"}
            >
              <UserPlus size={14} />
              <span>Add New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Team Staff", value: `${employees.length}`, sub: "Registered employees", color: "#8B2020", bg: "rgba(139,32,32,0.1)" },
          { label: "Active On Duty", value: `${employees.filter(e => e.status === "active").length}`, sub: "Login access enabled", color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
          { label: "Suspended Staff", value: `${employees.filter(e => e.status === "suspended").length}`, sub: "Login access blocked", color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
          { label: "Total Payroll (৳)", value: `৳${employees.reduce((acc, e) => acc + (e.salary || 0), 0).toLocaleString()}`, sub: "Monthly staff budget", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">{k.label}</span>
              <div className="flex items-center justify-center rounded-xl w-8 h-8 font-bold" style={{ background: k.bg, color: k.color }}>
                <UserCog size={16} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight font-mono">{k.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-muted border border-border w-fit">
        <button
          onClick={() => setTab("list")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCog size={15} />
          <span>Employees & Login Credentials ({employees.length})</span>
        </button>
        <button
          onClick={() => setTab("roles")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === "roles" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield size={15} />
          <span>Roles & Permissions ({roles.length})</span>
        </button>
      </div>

      {/* ── TAB 1: EMPLOYEES ROSTER ── */}
      {tab === "list" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-xs">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, or ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                {roles.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>

              <select
                value={zoneFilter}
                onChange={e => setZoneFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Zones</option>
                <option value="All Zones">All Zones (HQ)</option>
                <option value="Madaripur Sadar">Madaripur Sadar</option>
                <option value="Somitir Hat">Somitir Hat</option>
                <option value="Kalkini">Kalkini</option>
                <option value="Shibchar">Shibchar</option>
                <option value="Rajoir">Rajoir</option>
                <option value="Dashar">Dashar</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (Access Allowed)</option>
                <option value="suspended">Suspended (Access Denied)</option>
                <option value="on-leave">On Leave</option>
              </select>

              {(search || roleFilter !== "all" || zoneFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setRoleFilter("all"); setZoneFilter("all"); setStatusFilter("all"); }}
                  className="px-3 py-2 rounded-xl bg-muted text-xs font-bold text-muted-foreground hover:text-foreground border border-border cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Employees Table */}
          <div className="rounded-2xl overflow-hidden shadow-xs bg-card border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3.5">Employee & Login Account</th>
                    <th className="px-4 py-3.5">Designation & Role</th>
                    <th className="px-4 py-3.5">Contact Phone</th>
                    <th className="px-4 py-3.5">Assigned Zone</th>
                    <th className="px-4 py-3.5">Salary (৳)</th>
                    <th className="px-4 py-3.5">Login Access</th>
                    <th className="px-4 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-center">Manage & Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                        No employees found matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(e => {
                      const rc = getRoleStyle(e.role);
                      return (
                        <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center rounded-2xl flex-shrink-0 font-bold text-xs shadow-xs"
                                style={{ width: 38, height: 38, background: rc.bg, color: rc.color }}
                              >
                                {e.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-foreground text-xs">{e.name}</p>
                                  {e.username && (
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground font-bold border border-border">
                                      @{e.username}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[11px] text-muted-foreground">{e.id}</span>
                                  <span className="text-muted-foreground">·</span>
                                  <span className="font-mono text-[11px] text-primary font-medium">{e.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-semibold text-foreground text-xs">{e.designation}</p>
                            <div className="flex items-center gap-1 flex-wrap mt-0.5">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                style={{ background: rc.bg, color: rc.color, borderColor: `${rc.color}30` }}
                              >
                                {e.role}
                              </span>
                              {(() => {
                                const perms = e.sectionPerms || getDefaultRoleSectionPerms(e.role);
                                let fullCount = 0, editCount = 0, viewCount = 0;
                                SYSTEM_SECTIONS.forEach(s => {
                                  const v = perms[s.id] || "read";
                                  if (v === "all") fullCount++;
                                  else if (v === "read_write") editCount++;
                                  else if (v === "read") viewCount++;
                                });
                                if (fullCount === SYSTEM_SECTIONS.length) {
                                  return (
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                                      <Zap size={10} className="fill-current text-emerald-500" />
                                      <span>All Access</span>
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full border border-border inline-flex items-center gap-1.5" title={`${fullCount} Full Access, ${editCount} View & Edit, ${viewCount} View Only`}>
                                    <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                      <Zap size={10} className="fill-current" />{fullCount}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                                      <Edit3 size={10} />{editCount}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                                      <Eye size={10} />{viewCount}
                                    </span>
                                  </span>
                                );
                              })()}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-foreground font-semibold">
                            {e.phone}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium text-[11px] border border-border">
                              {e.zone}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-foreground">
                            ৳{e.salary.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-full w-2 h-2 ${
                                  e.status === "active"
                                    ? "bg-emerald-500"
                                    : e.status === "suspended"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              <span
                                className={`font-bold capitalize text-[11px] ${
                                  e.status === "active"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : e.status === "suspended"
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {e.status === "active" ? "Allowed" : e.status === "suspended" ? "Blocked" : e.status}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-muted-foreground font-mono">
                            {e.lastLogin}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Customize Permissions Button */}
                              <button
                                onClick={() => openUserPermissionsModal(e)}
                                title={isReadOnly ? "View Permissions Matrix" : "Customize Section & Page Permissions"}
                                className="px-2 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer border border-indigo-500/30 flex items-center gap-1 font-bold text-[11px]"
                              >
                                <Sliders size={13} />
                                <span>Perms</span>
                              </button>

                              {/* Manage Credentials Key Button */}
                              <button
                                disabled={!canEdit}
                                onClick={() => {
                                  if (!canEdit) return;
                                  setCredentialEmp(e);
                                  setShowCredPass(false);
                                  setNewPasswordInput("");
                                }}
                                title={!canEdit ? "View Only: Modifying credentials restricted" : "Manage Login Credentials & Password"}
                                className={`px-2 py-1.5 rounded-lg border flex items-center gap-1 font-bold text-[11px] transition-all ${
                                  !canEdit
                                    ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-border"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30 cursor-pointer"
                                }`}
                              >
                                <KeyRound size={13} />
                                <span>Credentials</span>
                              </button>

                              {/* Edit Button */}
                              <button
                                disabled={!canEdit}
                                onClick={() => {
                                  if (!canEdit) return;
                                  setEditEmployee({ ...e });
                                  setEditNewPassword("");
                                  setEditEmpPermsMatrix(e.sectionPerms ? { ...e.sectionPerms } : getDefaultRoleSectionPerms(e.role));
                                  setShowEditEmpPerms(false);
                                }}
                                title={canEdit ? "Edit Employee Profile" : "View Only: Edit not permitted"}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  canEdit
                                    ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer border-primary/20"
                                    : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-border"
                                }`}
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Toggle Status */}
                              <button
                                disabled={!canEdit}
                                onClick={() => {
                                  if (!canEdit) return;
                                  handleToggleStatus(e);
                                }}
                                title={
                                  !canEdit
                                    ? "View Only: Modifying status not permitted"
                                    : e.status === "active"
                                    ? "Suspend Login Access"
                                    : "Grant Login Access"
                                }
                                className={`p-1.5 rounded-lg transition-all border ${
                                  !canEdit
                                    ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-border"
                                    : e.status === "active"
                                    ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20 cursor-pointer"
                                    : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 cursor-pointer"
                                }`}
                              >
                                <Power size={13} />
                              </button>

                              {/* Delete Button */}
                              {canDelete && (
                                <button
                                  onClick={() => setDeleteConfirmEmp(e)}
                                  title="Delete Employee"
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all cursor-pointer border border-rose-500/20"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ROLES & PERMISSIONS MATRIX ── */}
      {tab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(r => {
              const assignedCount = employees.filter(e => e.role === r.name).length;
              return (
                <div
                  key={r.name}
                  className="rounded-2xl p-5 bg-card border border-border shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-xl w-9 h-9 font-bold shadow-xs"
                          style={{ background: r.bg, color: r.color }}
                        >
                          <Shield size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{r.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{assignedCount} assigned staff</p>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ background: r.bg, color: r.color, borderColor: `${r.color}30` }}
                      >
                        {r.perms.length} Modules
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Allowed Permissions ({r.perms.length}/{ALL_SYSTEM_PERMISSIONS.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.perms.map(p => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-muted border border-border text-foreground"
                          >
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditPermissions(r)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Sliders size={13} />
                    <span>Edit Role Permissions</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW EMPLOYEE WITH CREDENTIALS & PERMISSIONS ── */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Add Employee & Configure Custom Access</h3>
                  <p className="text-[11px] text-muted-foreground">Admin sets username, password, and granular section permissions</p>
                </div>
              </div>
              <button onClick={() => setShowAddEmployee(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.name}
                    onChange={e => {
                      const val = e.target.value;
                      const rawUser = val.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
                      const suggestedEmail = val.trim() ? `${val.trim().toLowerCase().replace(/[^a-z0-9]/g, ".")}@maabestnetwork.com` : "";
                      setNewEmpForm(p => ({
                        ...p,
                        name: val,
                        username: p.username === "" ? rawUser : p.username,
                        email: p.email === "" || p.email.endsWith("@maabestnetwork.com") ? suggestedEmail : p.email,
                      }));
                    }}
                    placeholder="e.g. Md. Kabir Hossain"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                    Username / Login Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={newEmpForm.username}
                      onChange={e => setNewEmpForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                      placeholder="e.g. kabir_hossain"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.phone}
                    onChange={e => setNewEmpForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 01712-345678"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={newEmpForm.designation}
                    onChange={e => setNewEmpForm(p => ({ ...p, designation: e.target.value }))}
                    placeholder="e.g. Area Collector & Tech"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Preset Role Template *</label>
                  <select
                    value={newEmpForm.role}
                    onChange={e => {
                      const nextRole = e.target.value;
                      setNewEmpForm(p => ({
                        ...p,
                        role: nextRole,
                        sectionPerms: getDefaultRoleSectionPerms(nextRole),
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-bold outline-none cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Assigned Zone *</label>
                  <select
                    value={newEmpForm.zone}
                    onChange={e => setNewEmpForm(p => ({ ...p, zone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium outline-none cursor-pointer"
                  >
                    <option value="All Zones">All Zones (HQ)</option>
                    <option value="Madaripur Sadar">Madaripur Sadar</option>
                    <option value="Somitir Hat">Somitir Hat</option>
                    <option value="Kalkini">Kalkini</option>
                    <option value="Shibchar">Shibchar</option>
                    <option value="Rajoir">Rajoir</option>
                    <option value="Dashar">Dashar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Monthly Salary (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEmpForm.salary}
                    onChange={e => setNewEmpForm(p => ({ ...p, salary: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Account Login Status</label>
                  <select
                    value={newEmpForm.status}
                    onChange={e => setNewEmpForm(p => ({ ...p, status: e.target.value as Employee["status"] }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Active (Can Log In Immediately)</option>
                    <option value="suspended">Suspended (Login Blocked)</option>
                  </select>
                </div>
              </div>

              {/* ── Credentials Box ── */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <KeyRound size={14} />
                    <span>Staff Login Credentials</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold">
                    For /admin Gateway
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                      Login Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmpForm.email}
                      onChange={e => setNewEmpForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. staff@maabestnetwork.com"
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground font-mono outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-foreground uppercase">
                        Login Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewEmpForm(p => ({ ...p, password: generateSecurePassword() }))}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={10} />
                        <span>Random</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showAddPass ? "text" : "password"}
                        required
                        value={newEmpForm.password}
                        onChange={e => setNewEmpForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="e.g. pass123"
                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-card border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showAddPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Granular Permissions Section ── */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Custom Section & Page Permissions</h4>
                      <p className="text-[11px] text-muted-foreground">Choose View Only, View & Edit, or Full Access for any section</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomPerms(s => !s)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{showAddCustomPerms ? "Collapse Permissions Matrix" : "Expand & Customize Matrix (52 Sections)"}</span>
                    {showAddCustomPerms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {showAddCustomPerms && (
                  <div className="pt-2 border-t border-border">
                    <PermissionsMatrixEditor
                      matrix={newEmpForm.sectionPerms}
                      onChange={(secId, lvl) => setNewEmpForm(p => ({
                        ...p,
                        sectionPerms: { ...p.sectionPerms, [secId]: lvl }
                      }))}
                      onBatchSet={(lvl) => setNewEmpForm(p => ({
                        ...p,
                        sectionPerms: SYSTEM_SECTIONS.reduce((acc, s) => { acc[s.id] = lvl; return acc; }, {} as Record<string, PermissionLevel>)
                      }))}
                      onApplyTemplate={(tmpl) => setNewEmpForm(p => ({
                        ...p,
                        role: tmpl,
                        sectionPerms: getDefaultRoleSectionPerms(tmpl)
                      }))}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Create Employee Profile & Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATED CREDENTIAL CARD (READY TO COPY/SHARE) ── */}
      {createdCredential && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Login Credentials Created</h3>
                <p className="text-xs text-muted-foreground">Share these credentials with the employee to let them sign in</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Staff Member</span>
                <span className="font-bold text-foreground text-sm font-sans">{createdCredential.emp.name} ({createdCredential.emp.id})</span>
              </div>
              <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Username</span>
                  <span className="font-bold text-primary font-mono select-all">@{createdCredential.emp.username || createdCredential.emp.id.toLowerCase()}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredential.emp.username || createdCredential.emp.id.toLowerCase(), "Username")}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy Username"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Login Email</span>
                  <span className="font-bold text-foreground select-all">{createdCredential.emp.email}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredential.emp.email, "Login Email")}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy Email"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Password</span>
                  <span className="font-bold text-foreground select-all">{createdCredential.emp.password}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCredential.emp.password || "", "Password")}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy Password"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Role & Access</span>
                <span className="font-semibold text-foreground font-sans">{createdCredential.emp.role} · {createdCredential.emp.zone}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-sans font-bold">Login Portal</span>
                <span className="text-primary font-sans">MAA BEST NETWORK Admin Portal (/admin)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const fullText = `MAA BEST NETWORK - Staff Login Credentials\nPortal: ${window.location.origin}/admin\nEmployee: ${createdCredential.emp.name} (${createdCredential.emp.id})\nUsername: @${createdCredential.emp.username || createdCredential.emp.id.toLowerCase()}\nEmail: ${createdCredential.emp.email}\nPassword: ${createdCredential.emp.password}\nRole: ${createdCredential.emp.role}`;
                  copyToClipboard(fullText, "Full Credentials");
                  setCreatedCredential(p => (p ? { ...p, copied: true } : null));
                }}
                className="w-full py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Copy size={14} />
                <span>{createdCredential.copied ? "Credentials Copied to Clipboard!" : "Copy Full Credentials to Clipboard"}</span>
              </button>
              <button
                onClick={() => setCreatedCredential(null)}
                className="w-full py-2 rounded-xl border border-border text-foreground hover:bg-muted font-bold text-xs cursor-pointer"
              >
                Close & Return to Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANAGE CREDENTIALS & ACCESS ── */}
      {credentialEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Manage Staff Credentials</h3>
                  <p className="text-[11px] text-muted-foreground">{credentialEmp.id} · {credentialEmp.name}</p>
                </div>
              </div>
              <button onClick={() => setCredentialEmp(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Profile summary banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs"
                    style={getRoleStyle(credentialEmp.role)}
                  >
                    {credentialEmp.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-foreground text-xs">{credentialEmp.name}</h4>
                      {credentialEmp.username && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-foreground font-bold border border-border">
                          @{credentialEmp.username}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{credentialEmp.designation} · {credentialEmp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    credentialEmp.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {credentialEmp.status.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Last login: {credentialEmp.lastLogin}</p>
                </div>
              </div>

              {/* Current Active Credentials */}
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Current Active Login Credentials</span>
                </h4>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-bold">Username</span>
                    <span className="font-mono font-bold text-primary select-all">@{credentialEmp.username || credentialEmp.id.toLowerCase()}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentialEmp.username || credentialEmp.id.toLowerCase(), "Username")}
                    className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy Username"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-bold">Login Email</span>
                    <span className="font-mono font-bold text-foreground select-all">{credentialEmp.email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentialEmp.email, "Email")}
                    className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy Email"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border">
                  <div className="flex-1 mr-2">
                    <span className="text-[10px] text-muted-foreground uppercase block font-bold">Password</span>
                    <span className="font-mono font-bold text-foreground select-all">
                      {showCredPass ? credentialEmp.password || "mbn@123" : "••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCredPass(s => !s)}
                      className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showCredPass ? "Hide Password" : "Show Password"}
                    >
                      {showCredPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(credentialEmp.password || "mbn@123", "Password")}
                      className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy Password"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const full = `MAA BEST NETWORK - Login Credentials\nPortal: ${window.location.origin}/admin\nName: ${credentialEmp.name}\nUsername: @${credentialEmp.username || credentialEmp.id.toLowerCase()}\nEmail: ${credentialEmp.email}\nPassword: ${credentialEmp.password || "mbn@123"}\nRole: ${credentialEmp.role}`;
                      copyToClipboard(full, "Full Credentials");
                    }}
                    className="py-2 px-3 rounded-lg border border-border bg-card hover:bg-muted font-bold text-[11px] text-foreground flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = credentialEmp;
                      setCredentialEmp(null);
                      openUserPermissionsModal(target);
                    }}
                    className="py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sliders size={12} />
                    <span>Permissions Matrix</span>
                  </button>
                </div>
              </div>

              {/* Reset Password Form */}
              <form onSubmit={handleSaveCredentialPassword} className="p-3.5 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <RefreshCw size={13} className="text-primary" />
                    <span>Reset / Change Password</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(generateSecurePassword())}
                    className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={11} />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassInput ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new login password for employee..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-muted border border-border text-foreground font-mono font-bold outline-none focus:border-primary text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassInput(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassInput ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newPasswordInput.trim()}
                  className="w-full py-2 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save New Password</span>
                </button>
              </form>

              {/* Login Access Toggle (Active / Suspended) */}
              <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-xs">Login Access Permission</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {credentialEmp.status === "active"
                      ? "Employee can sign in using their credentials."
                      : "Login is currently blocked by the admin."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleStatus(credentialEmp);
                    setCredentialEmp(p => (p ? { ...p, status: p.status === "active" ? "suspended" : "active" } : null));
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all border ${
                    credentialEmp.status === "active"
                      ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/30"
                      : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30"
                  }`}
                >
                  {credentialEmp.status === "active" ? "Suspend Account" : "Activate Account"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setCredentialEmp(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs cursor-pointer border border-border"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT EMPLOYEE PROFILE ── */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Edit Employee Profile</h3>
                  <p className="text-[11px] text-muted-foreground">{editEmployee.id} · {editEmployee.name}</p>
                </div>
              </div>
              <button onClick={() => setEditEmployee(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editEmployee.name}
                    onChange={e => setEditEmployee(p => (p ? { ...p, name: e.target.value } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={editEmployee.phone}
                    onChange={e => setEditEmployee(p => (p ? { ...p, phone: e.target.value } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Login Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmployee.email}
                    onChange={e => setEditEmployee(p => (p ? { ...p, email: e.target.value } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Username (System Handle)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">@</span>
                    <input
                      type="text"
                      value={editEmployee.username || ""}
                      onChange={e => setEditEmployee(p => (p ? { ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "") } : null))}
                      placeholder="e.g. staff.username"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Role / Access Level</label>
                  <select
                    value={editEmployee.role}
                    onChange={e => {
                      const newRole = e.target.value;
                      setEditEmployee(p => (p ? { ...p, role: newRole } : null));
                      if (showEditEmpPerms) {
                        setEditEmpPermsMatrix(getDefaultRoleSectionPerms(newRole));
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-bold outline-none cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Assigned Zone</label>
                  <select
                    value={editEmployee.zone}
                    onChange={e => setEditEmployee(p => (p ? { ...p, zone: e.target.value } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium outline-none cursor-pointer"
                  >
                    <option value="All Zones">All Zones (HQ)</option>
                    <option value="Madaripur Sadar">Madaripur Sadar</option>
                    <option value="Somitir Hat">Somitir Hat</option>
                    <option value="Kalkini">Kalkini</option>
                    <option value="Shibchar">Shibchar</option>
                    <option value="Rajoir">Rajoir</option>
                    <option value="Dashar">Dashar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Account Login Status</label>
                  <select
                    value={editEmployee.status}
                    onChange={e => setEditEmployee(p => (p ? { ...p, status: e.target.value as Employee["status"] } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Active (Full Access Allowed)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Monthly Salary (৳)</label>
                  <input
                    type="number"
                    value={editEmployee.salary}
                    onChange={e => setEditEmployee(p => (p ? { ...p, salary: Number(e.target.value) } : null))}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Optional Reset Password Field */}
              <div className="p-3 rounded-xl bg-muted/60 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-foreground uppercase">
                    Change Password (Leave blank to keep existing)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditNewPassword(generateSecurePassword())}
                    className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPass ? "text" : "password"}
                    value={editNewPassword}
                    onChange={e => setEditNewPassword(e.target.value)}
                    placeholder="New password (optional)..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-card border border-border text-foreground font-mono font-bold outline-none focus:border-primary text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showEditPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* ── Granular Permissions Accordion ── */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Custom Section & Page Permissions</h4>
                      <p className="text-[11px] text-muted-foreground">Customize granular access (None, View Only, View & Edit, Full Access) for this staff</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showEditEmpPerms) {
                        setEditEmpPermsMatrix(editEmployee.sectionPerms ? { ...editEmployee.sectionPerms } : getDefaultRoleSectionPerms(editEmployee.role));
                      }
                      setShowEditEmpPerms(s => !s);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{showEditEmpPerms ? "Collapse Permissions Matrix" : "Expand & Customize Matrix (52 Sections)"}</span>
                    {showEditEmpPerms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {showEditEmpPerms && (
                  <div className="pt-2 border-t border-border">
                    <PermissionsMatrixEditor
                      matrix={editEmpPermsMatrix}
                      onChange={(secId, lvl) => setEditEmpPermsMatrix(p => ({
                        ...p,
                        [secId]: lvl
                      }))}
                      onBatchSet={(lvl) => setEditEmpPermsMatrix(
                        SYSTEM_SECTIONS.reduce((acc, s) => { acc[s.id] = lvl; return acc; }, {} as Record<string, PermissionLevel>)
                      )}
                      onApplyTemplate={(tmpl) => setEditEmpPermsMatrix(getDefaultRoleSectionPerms(tmpl))}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditEmployee(null);
                    setShowEditEmpPerms(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DEDICATED USER PERMISSIONS MATRIX ── */}
      {userPermsModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">Custom Permissions Matrix</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      @{userPermsModalEmp.username || userPermsModalEmp.id.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {userPermsModalEmp.name} · {userPermsModalEmp.role} · {userPermsModalEmp.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUserPermsModalEmp(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 shrink-0 flex items-start gap-2.5">
              <Zap size={16} className="text-amber-600 dark:text-amber-400 fill-amber-500/20 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                <strong>Live Real-Time Sync:</strong> Changes saved here apply instantly across the entire platform.
                Choose <span className="inline-flex items-center gap-1 font-bold"><Ban size={11} className="text-rose-500" /> None</span>,{" "}
                <span className="inline-flex items-center gap-1 font-bold"><Eye size={11} className="text-blue-500" /> View Only</span>,{" "}
                <span className="inline-flex items-center gap-1 font-bold"><Edit3 size={11} className="text-amber-500" /> View & Edit</span>, or{" "}
                <span className="inline-flex items-center gap-1 font-bold"><Zap size={11} className="text-emerald-500 fill-current" /> Full Access</span> for any of the {SYSTEM_SECTIONS.length} system sections.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <PermissionsMatrixEditor
                matrix={userPermsMatrix}
                onChange={(secId, lvl) => setUserPermsMatrix(p => ({
                  ...p,
                  [secId]: lvl
                }))}
                onBatchSet={(lvl) => setUserPermsMatrix(
                  SYSTEM_SECTIONS.reduce((acc, s) => { acc[s.id] = lvl; return acc; }, {} as Record<string, PermissionLevel>)
                )}
                onApplyTemplate={(tmpl) => setUserPermsMatrix(getDefaultRoleSectionPerms(tmpl))}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border shrink-0">
              <span className="text-[11px] text-muted-foreground">
                Auto-saves to persistent database & syncs across staff sessions.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserPermsModalEmp(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={handleSaveUserPermissionsModal}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
                    canEdit ? "bg-primary hover:opacity-95 cursor-pointer" : "bg-muted-foreground opacity-50 cursor-not-allowed"
                  }`}
                  title={canEdit ? "Save Permissions" : "View Only: Administrator permissions required to edit"}
                >
                  <Check size={14} />
                  <span>{canEdit ? "Save & Auto-Update Permissions" : "View Only (Edit Disabled)"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT ROLE PERMISSIONS ── */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-xs"
                  style={{ background: editingRole.bg, color: editingRole.color }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Edit Role Permissions</h3>
                  <p className="text-[11px] text-muted-foreground">{editingRole.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingRole(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                Select which system modules staff members with the <strong className="text-foreground">{editingRole.name}</strong> role can view and manage:
              </p>

              <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/30 max-h-64 overflow-y-auto">
                {ALL_SYSTEM_PERMISSIONS.map(perm => {
                  const isChecked = editPermsList.includes(perm);
                  return (
                    <label
                      key={perm}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm)}
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${isChecked ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                        {perm}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                <span>{editPermsList.length} of {ALL_SYSTEM_PERMISSIONS.length} modules granted</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPermsList([...ALL_SYSTEM_PERMISSIONS])}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setEditPermsList([])}
                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRolePermissions}
                className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Save Role Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE ROLE ── */}
      {showAddRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Create New Role</h3>
              </div>
              <button onClick={() => setShowAddRole(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleForm.name}
                  onChange={e => setNewRoleForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. NOC Supervisor"
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Role Description</label>
                <input
                  type="text"
                  value={newRoleForm.description}
                  onChange={e => setNewRoleForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Oversees network operations & fiber teams"
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Theme Color</label>
                <div className="flex gap-2">
                  {["#8B2020", "#7C3AED", "#2563EB", "#0891B2", "#16A34A", "#D97706", "#EC4899"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewRoleForm(p => ({ ...p, color: c, bg: `${c}15` }))}
                      className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                        newRoleForm.color === c ? "border-foreground scale-110 shadow-sm" : "border-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddRole(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE EMPLOYEE CONFIRMATION ── */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Remove Employee</h3>
                <p className="text-xs text-muted-foreground">{deleteConfirmEmp.id}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently remove employee <strong className="text-foreground">{deleteConfirmEmp.name}</strong> ({deleteConfirmEmp.role}) from the staff directory and revoke their login access?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setDeleteConfirmEmp(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
