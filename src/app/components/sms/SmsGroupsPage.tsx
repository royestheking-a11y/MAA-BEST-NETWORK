import React, { useState } from "react";
import {
  Users, Plus, Search, Edit2, Trash2, Send, CheckCircle2,
  X, Eye, Filter, UserCheck, Layers, ArrowUpDown
} from "lucide-react";
import { INITIAL_SMS_GROUPS, SmsGroup } from "./smsData";
import { useCustomerContext } from "../../context/CustomerContext";

interface SmsGroupsPageProps {
  onNavigate?: (page: string) => void;
}

export const SmsGroupsPage: React.FC<SmsGroupsPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();
  const [groups, setGroups] = useState<SmsGroup[]>(() => {
    const saved = localStorage.getItem("mbn_sms_groups");
    return saved ? JSON.parse(saved) : INITIAL_SMS_GROUPS;
  });

  const [memberStatusFilter, setMemberStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SmsGroup | null>(null);
  const [viewingMembersGroup, setViewingMembersGroup] = useState<SmsGroup | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formMemberTypes, setFormMemberTypes] = useState("Custom Filtered Subscribers");
  const [formDescription, setFormDescription] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormName("");
    setFormStatus("Active");
    setFormMemberTypes("Custom Targeted Subscribers");
    setFormDescription("");
    setShowNewGroupModal(true);
  };

  const handleOpenEdit = (grp: SmsGroup) => {
    setEditingGroup(grp);
    setFormName(grp.name);
    setFormStatus(grp.status);
    setFormMemberTypes(grp.memberTypes);
    setFormDescription(grp.description || "");
    setShowNewGroupModal(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please provide group name.");
      return;
    }

    if (editingGroup) {
      const updated = groups.map(g =>
        g.id === editingGroup.id
          ? { ...g, name: formName, status: formStatus, memberTypes: formMemberTypes, description: formDescription }
          : g
      );
      setGroups(updated);
      localStorage.setItem("mbn_sms_groups", JSON.stringify(updated));
      showToast(`Group "${formName}" updated`);
    } else {
      const newGrp: SmsGroup = {
        id: `grp-${Date.now()}`,
        sr: groups.length + 1,
        name: formName,
        status: formStatus,
        memberTypes: formMemberTypes,
        memberCount: Math.floor(10 + Math.random() * 80),
        description: formDescription
      };
      const updated = [...groups, newGrp];
      setGroups(updated);
      localStorage.setItem("mbn_sms_groups", JSON.stringify(updated));
      showToast(`New SMS Group "${formName}" created`);
    }

    setShowNewGroupModal(false);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete SMS group "${name}"?`)) {
      const updated = groups.filter(g => g.id !== id);
      setGroups(updated);
      localStorage.setItem("mbn_sms_groups", JSON.stringify(updated));
      showToast(`Group "${name}" deleted`);
    }
  };

  // Filtered Groups
  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.memberTypes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      memberStatusFilter === "all" ||
      (memberStatusFilter === "Active" && g.status === "Active") ||
      (memberStatusFilter === "Inactive" && g.status === "Inactive");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-primary/20 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb (Screenshot 3 Exact Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">SMS Groups</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">All SMS Groups</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>SMS Service</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">SMS Group</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>+ New Group</span>
          </button>
        </div>
      </div>

      {/* MEMBER STATUS Filter (Screenshot 3 Layout) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs max-w-sm">
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">MEMBER STATUS</label>
        <select
          value={memberStatusFilter}
          onChange={e => setMemberStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
        >
          <option value="all">Select / All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>SHOW</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground outline-none text-xs"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>ENTRIES</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">SEARCH:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search group name..."
              className="w-56 sm:w-72 px-3 py-1.5 text-xs rounded-md bg-card border border-border text-foreground outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SMS Groups Table (Screenshot 3 Exact Structure) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3.5 px-4 w-20 text-center">Sr. No.</th>
                <th className="py-3.5 px-4">Group Name</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Member Types</th>
                <th className="py-3.5 px-4 text-center">Member Count</th>
                <th className="py-3.5 px-4 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No SMS groups available in table.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((grp, idx) => (
                  <tr
                    key={grp.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    {/* Sr. No. */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-muted-foreground">
                      {idx + 1}
                    </td>

                    {/* Group Name */}
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{grp.name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          grp.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {grp.status}
                      </span>
                    </td>

                    {/* Member Types */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {grp.memberTypes}
                    </td>

                    {/* Member Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold font-mono bg-muted text-foreground border border-border">
                        {grp.memberCount} Clients
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Send SMS to group */}
                        <button
                          onClick={() => onNavigate?.("sms-send-group")}
                          title="Broadcast SMS to this Group"
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                        >
                          <Send size={15} />
                        </button>

                        {/* View Members */}
                        <button
                          onClick={() => setViewingMembersGroup(grp)}
                          title="View Group Members"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(grp)}
                          title="Edit Group"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteGroup(grp.id, grp.name)}
                          title="Delete Group"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Showing 1 to {filteredGroups.length} of {filteredGroups.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT GROUP MODAL ── */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {editingGroup ? "Edit SMS Group" : "Create New SMS Group"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Group subscribers for targeted promotional broadcasts</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Group Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  placeholder="e.g. VIP Corporate Clients"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Status *</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Member Types *</label>
                  <input
                    type="text"
                    value={formMemberTypes}
                    onChange={e => setFormMemberTypes(e.target.value)}
                    placeholder="e.g. Fiber Premium Users"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Notes about target audience for this SMS group..."
                  className="w-full p-3 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW GROUP MEMBERS MODAL ── */}
      {viewingMembersGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="font-bold text-foreground text-base">Members of {viewingMembersGroup.name}</h3>
                <p className="text-xs text-muted-foreground">{viewingMembersGroup.memberCount} Subscribers attached</p>
              </div>
              <button
                onClick={() => setViewingMembersGroup(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto divide-y divide-border">
              {customers.slice(0, 15).map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{c.clientCode || c.id} · {c.phone}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setViewingMembersGroup(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
