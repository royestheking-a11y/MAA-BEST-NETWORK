import React, { useState } from "react";
import {
  MessageSquare, Send, ArrowRightLeft, Users, CheckCircle2,
  Search, X, Sparkles, Filter, CheckSquare, Square, Layers
} from "lucide-react";
import { INITIAL_SMS_TEMPLATES, INITIAL_SMS_GROUPS, COMPANY_SMS_METADATA } from "./smsData";
import { useCustomerContext } from "../../context/CustomerContext";

interface GroupSmsPageProps {
  onNavigate?: (page: string) => void;
}

export const GroupSmsPage: React.FC<GroupSmsPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // Groups Selection
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(["grp-1"]);

  // Transferred Users
  const [recipientUsers, setRecipientUsers] = useState<any[]>(() => {
    return customers.map(c => ({
      id: c.id,
      name: c.name,
      mobile: c.phone,
      selected: true
    }));
  });

  const [selectAllUsers, setSelectAllUsers] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setMessageContent("");
      return;
    }
    const tpl = INITIAL_SMS_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setMessageContent(tpl.template);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  // Transfer action: Transfer matching users from selected groups into the USERS table
  const handleTransfer = () => {
    if (selectedGroupIds.length === 0) {
      alert("Please select at least one group from the list.");
      return;
    }

    let matched: any[] = [];
    selectedGroupIds.forEach(grpId => {
      const grp = INITIAL_SMS_GROUPS.find(g => g.id === grpId);
      if (!grp) return;

      if (grp.criteria === "all") {
        matched = [...matched, ...customers];
      } else if (grp.criteria === "due") {
        matched = [...matched, ...customers.filter(c => (c.dueAmount || c.due || 0) > 0)];
      } else if (grp.criteria === "paid") {
        matched = [...matched, ...customers.filter(c => (c.dueAmount || c.due || 0) === 0)];
      } else if (grp.criteria === "active") {
        matched = [...matched, ...customers.filter(c => c.status === "active")];
      } else if (grp.criteria === "inactive") {
        matched = [...matched, ...customers.filter(c => c.status !== "active")];
      } else {
        matched = [...matched, ...customers.slice(0, 10)];
      }
    });

    // Deduplicate by ID
    const uniqueMap = new Map();
    matched.forEach(c => uniqueMap.set(c.id, c));
    const uniqueUsers = Array.from(uniqueMap.values()).map(c => ({
      id: c.id,
      name: c.name,
      mobile: c.phone,
      selected: true
    }));

    setRecipientUsers(uniqueUsers);
    setSelectAllUsers(true);
    showToast(`Transferred ${uniqueUsers.length} client(s) into recipient queue!`);
  };

  const toggleUserSelection = (userId: string) => {
    setRecipientUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, selected: !u.selected } : u))
    );
  };

  const handleToggleSelectAllUsers = () => {
    const nextVal = !selectAllUsers;
    setSelectAllUsers(nextVal);
    setRecipientUsers(prev => prev.map(u => ({ ...u, selected: nextVal })));
  };

  const selectedCount = recipientUsers.filter(u => u.selected).length;
  const totalCount = recipientUsers.length;

  const handleSendMessage = () => {
    if (selectedCount === 0) {
      alert("Please select at least one recipient user.");
      return;
    }
    if (!messageContent.trim()) {
      alert("Please provide SMS message content.");
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    const interval = setInterval(() => {
      setSendProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsSending(false);
          showToast(`Broadcast completed! Dispatched ${selectedCount} messages successfully.`);
          return 100;
        }
        return p + 25;
      });
    }, 300);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-primary/20 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb (Screenshot 4 Exact Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Send SMS</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">SMS Sending</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>SMS Service</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Send SMS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs flex items-center gap-2 shadow-xs">
            <span className="text-muted-foreground">Available SMS:</span>
            <span className="font-bold text-primary">2,450</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Send SMS Workspace (Screenshot 4 Exact Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Template, Message, Groups, Transfer Button (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Form Controls Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            {/* TEMPLATE */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase mb-1.5">TEMPLATE:</label>
              <select
                value={selectedTemplateId}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
              >
                <option value="">Select</option>
                {INITIAL_SMS_TEMPLATES.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.sr}. {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MESSAGE */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-foreground uppercase">
                  MESSAGE ({messageContent.length})
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {Math.ceil(messageContent.length / 70) || 1} Unicode Part(s)
                </span>
              </div>
              <textarea
                rows={5}
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                placeholder="Type your broadcast message or pick a pre-set template above..."
                className="w-full p-3.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary resize-none font-sans leading-relaxed shadow-inner"
              />
            </div>
          </div>

          {/* GROUPS Selection Table Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">GROUPS</h3>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                    <th className="py-2.5 px-3 w-16 text-center">Select</th>
                    <th className="py-2.5 px-4">Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {INITIAL_SMS_GROUPS.map(grp => {
                    const isChecked = selectedGroupIds.includes(grp.id);
                    return (
                      <tr
                        key={grp.id}
                        onClick={() => toggleGroupSelection(grp.id)}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                          isChecked ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by tr onClick
                            className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-medium text-foreground">
                          {grp.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Transfer Button (Screenshot 4 Center Action) */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleTransfer}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowRightLeft size={14} />
                <span>Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: USERS Table, Counters, Send Message Button (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">USERS</h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                {recipientUsers.length} Loaded Recipients
              </span>
            </div>

            {/* Users Table (Screenshot 4 Layout) */}
            <div className="border border-border rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs z-10">
                  <tr className="text-foreground border-b border-border font-bold">
                    <th className="py-3 px-3 w-16 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectAllUsers}
                          onChange={handleToggleSelectAllUsers}
                          className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                        />
                        <span className="text-[11px]">Select</span>
                      </div>
                    </th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recipientUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16 text-center text-muted-foreground">
                        No clients loaded. Select groups from the left and click "Transfer".
                      </td>
                    </tr>
                  ) : (
                    recipientUsers.map(user => (
                      <tr
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                          user.selected ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={user.selected}
                            onChange={() => {}} // Handled by tr onClick
                            className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-foreground">
                          {user.name}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-muted-foreground">
                          {user.mobile}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Counters & Send Button (Screenshot 4 Layout) */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* TOTAL CLIENT */}
                <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-muted border border-border text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">TOTAL CLIENT</p>
                  <p className="text-base font-bold font-mono text-foreground mt-0.5">{totalCount}</p>
                </div>

                {/* SELECTED CLIENT */}
                <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">SELECTED CLIENT</p>
                  <p className="text-base font-bold font-mono text-primary mt-0.5">{selectedCount}</p>
                </div>
              </div>

              {/* Send Message Button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isSending || selectedCount === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={14} className={isSending ? "animate-pulse" : ""} />
                <span>{isSending ? `Sending (${sendProgress}%)...` : "Send Message"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
