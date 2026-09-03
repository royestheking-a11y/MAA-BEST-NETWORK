import React, { useState } from "react";
import {
  FileText, Plus, Search, Edit2, Trash2, Send, CheckCircle2,
  X, Copy, Sparkles, MessageSquare, AlertCircle, Eye, SlidersHorizontal
} from "lucide-react";
import { INITIAL_SMS_TEMPLATES, SmsTemplate, COMPANY_SMS_METADATA } from "./smsData";
import { useCustomerContext } from "../../context/CustomerContext";

interface SmsTemplatePageProps {
  onNavigate?: (page: string) => void;
}

export const SmsTemplatePage: React.FC<SmsTemplatePageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();
  const [templates, setTemplates] = useState<SmsTemplate[]>(() => {
    const saved = localStorage.getItem("mbn_sms_templates");
    return saved ? JSON.parse(saved) : INITIAL_SMS_TEMPLATES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<SmsTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<SmsTemplate["category"]>("Client");
  const [formContent, setFormContent] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormCategory("Client");
    setFormContent("");
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (tpl: SmsTemplate) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormCategory(tpl.category);
    setFormContent(tpl.template);
    setShowAddEditModal(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) {
      alert("Please fill in template name and content");
      return;
    }

    if (editingTemplate) {
      const updated = templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, name: formName, category: formCategory, template: formContent }
          : t
      );
      setTemplates(updated);
      localStorage.setItem("mbn_sms_templates", JSON.stringify(updated));
      showToast(`Template "${formName}" updated successfully`);
    } else {
      const newTpl: SmsTemplate = {
        id: `tpl-${Date.now()}`,
        sr: templates.length + 1,
        name: formName,
        type: "Custom",
        category: formCategory,
        variables: ["CustomerName", "ClientID", "UserName", "MonthlyBillAmount", "CompanyName"],
        template: formContent
      };
      const updated = [newTpl, ...templates];
      setTemplates(updated);
      localStorage.setItem("mbn_sms_templates", JSON.stringify(updated));
      showToast(`New template "${formName}" created`);
    }

    setShowAddEditModal(false);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem("mbn_sms_templates", JSON.stringify(updated));
      showToast(`Template "${name}" removed`);
    }
  };

  const insertVariable = (variable: string) => {
    setFormContent(prev => `${prev}{${variable}} `);
  };

  // Filtered Templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1;
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Render Sample variable replacement for preview
  const renderSamplePreview = (tplText: string) => {
    const sampleCust = customers[0] || {
      name: "Sumon Bepari",
      clientCode: "MBN0007",
      phone: "01784659223",
      monthlyBill: 500,
      due: 0,
      pppUser: "mbn@sumonbepari",
      package: "PIONEER_HOME_20Mbps"
    };

    const billAmt = sampleCust.monthlyBill || sampleCust.price || 500;
    return tplText
      .replace(/{CustomerName}/g, sampleCust.name)
      .replace(/{CustomerId}/g, sampleCust.clientCode || "MBN0007")
      .replace(/{ClientID}/g, sampleCust.clientCode || "MBN0007")
      .replace(/{ClientCode}/g, sampleCust.clientCode || "MBN0007")
      .replace(/{UserName}/g, sampleCust.pppUser || "mbn@sumonbepari")
      .replace(/{LoginUserName}/g, sampleCust.pppUser || "mbn@sumonbepari")
      .replace(/{Password}/g, "123456")
      .replace(/{LoginPassword}/g, "123456")
      .replace(/{Package}/g, sampleCust.package || "20Mbps Fiber")
      .replace(/{MonthlyBillAmount}/g, `৳ ${billAmt}`)
      .replace(/{TotalAmount}/g, `৳ ${billAmt}`)
      .replace(/{PaidAmount}/g, `৳ ${billAmt}`)
      .replace(/{TotalPaidBill}/g, `৳ ${billAmt}`)
      .replace(/{Due}/g, `৳ ${sampleCust.dueAmount || sampleCust.due || 0}`)
      .replace(/{DueAmount}/g, `৳ ${sampleCust.dueAmount || sampleCust.due || 0}`)
      .replace(/{Discount}/g, "৳ 0")
      .replace(/{VAT}/g, "৳ 0")
      .replace(/{RecieptNo}/g, "REC-82910")
      .replace(/{InvoiceNo}/g, "INV-2026-0801")
      .replace(/{BillingLastDate}/g, "05/09/2026")
      .replace(/{PaymentDate}/g, "28/08/2026")
      .replace(/{CompanyName}/g, COMPANY_SMS_METADATA.companyName)
      .replace(/{CompanyMobile}/g, COMPANY_SMS_METADATA.companyMobile)
      .replace(/{BaseSiteURL}/g, COMPANY_SMS_METADATA.baseSiteURL)
      .replace(/{VerificationCode}/g, "849201")
      .replace(/{TicketNo}/g, "TKT-4921")
      .replace(/{Problem}/g, "Optical fiber line down")
      .replace(/{CustomerNumber}/g, sampleCust.phone)
      .replace(/{EmpName}/g, "Nasir Uddin (Tech)")
      .replace(/{EmployeeName}/g, "Tareq Hossain")
      .replace(/{MonthName}/g, "August 2026")
      .replace(/{TotalSalary}/g, "৳ 22,000")
      .replace(/{Username}/g, "Maa Best Admin");
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

      {/* Header & Breadcrumb (Matching Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">SMS Template</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Add SMS Template</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>SMS Service</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">SMS Template</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>+ Add Template</span>
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "Billing", "Client", "Auth", "Support", "Staff"].map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All Templates (16)" : cat}
          </button>
        ))}
      </div>

      {/* Table Controls (SHOW ENTRIES & SEARCH) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>SHOW</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground outline-none text-xs"
          >
            <option value={10}>10</option>
            <option value={16}>16</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>ENTRIES</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">SEARCH:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search template name or content..."
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

      {/* SMS Template Data Table (Screenshot 1 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3.5 px-4 w-14 text-center">Sr.</th>
                <th className="py-3.5 px-4 w-60 whitespace-nowrap">Name</th>
                <th className="py-3.5 px-3 w-24 text-center">Type</th>
                <th className="py-3.5 px-4 min-w-[340px]">Template</th>
                <th className="py-3.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No SMS templates found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                paginatedTemplates.map((tpl, idx) => (
                  <tr
                    key={tpl.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    {/* Sr. */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-muted-foreground">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex flex-col">
                        <span>{tpl.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal mt-0.5">{tpl.category}</span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tpl.type === "Default"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {tpl.type}
                      </span>
                    </td>

                    {/* Template Content with Highlighted Tokens */}
                    <td className="py-3.5 px-4 text-foreground/90 leading-relaxed font-sans text-xs">
                      {tpl.template.split(/(\{[A-Za-z0-9_]+\})/).map((part, pIdx) => {
                        if (part.startsWith("{") && part.endsWith("}")) {
                          return (
                            <span
                              key={pIdx}
                              className="inline-block px-1 py-0.5 mx-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20"
                            >
                              {part}
                            </span>
                          );
                        }
                        return <span key={pIdx}>{part}</span>;
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(tpl)}
                          title="Edit Template"
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Preview / Sample Test */}
                        <button
                          onClick={() => setShowPreviewModal(tpl)}
                          title="Live Rendered Preview & Test SMS"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Copy Template */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tpl.template);
                            showToast("Template text copied to clipboard!");
                          }}
                          title="Copy Raw Template"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                        >
                          <Copy size={15} />
                        </button>

                        {/* Delete (Custom only) */}
                        {tpl.type === "Custom" && (
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                            title="Delete Custom Template"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredTemplates.length)} of {filteredTemplates.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT TEMPLATE MODAL ── */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {editingTemplate ? "Edit SMS Template" : "Add New SMS Template"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Configure template tokens and Bengali/English body</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Template Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Monthly Special Promo Offer"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Category *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
                  >
                    <option value="Billing">Billing & Receipts</option>
                    <option value="Client">Client Lifecycle</option>
                    <option value="Auth">OTP & Credentials</option>
                    <option value="Support">Support & Complaints</option>
                    <option value="Staff">Staff & Technicians</option>
                    <option value="Marketing">Marketing / Broadcast</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Token Inserters */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase">Click to Insert Dynamic Token:</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-muted/40 rounded-xl border border-border">
                  {[
                    "CustomerName", "ClientID", "ClientCode", "UserName", "Password",
                    "MonthlyBillAmount", "PaidAmount", "Due", "Package", "BillingLastDate",
                    "PaymentDate", "RecieptNo", "InvoiceNo", "TicketNo", "Problem",
                    "CompanyName", "CompanyMobile", "BaseSiteURL"
                  ].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold bg-card border border-border hover:border-primary hover:text-primary transition-all cursor-pointer"
                    >
                      +{`{${v}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground">Template Body (SMS Content) *</label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formContent.length} chars (approx {Math.ceil(formContent.length / 70) || 1} Unicode part)
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  required
                  placeholder="Type your message in Bengali or English. Use tokens like {CustomerName} for personalization..."
                  className="w-full p-3 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Real-time Rendered Live Preview */}
              {formContent && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles size={13} />
                    <span>Live Rendered Subscriber Preview:</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                    {renderSamplePreview(formContent)}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE TEST & PREVIEW MODAL ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Template Live Preview</h3>
                  <p className="text-xs text-muted-foreground">{showPreviewModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Raw Template Tokens:</span>
                <div className="p-3 rounded-xl bg-muted text-xs font-mono text-muted-foreground border border-border leading-relaxed">
                  {showPreviewModal.template}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                  <Sparkles size={12} /> Rendered Message (Actual SMS Delivered):
                </span>
                <div className="p-4 rounded-xl bg-card border border-emerald-500/30 text-xs text-foreground font-sans leading-relaxed shadow-xs">
                  {renderSamplePreview(showPreviewModal.template)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground">Character Count: </span>
                  <strong className="text-foreground">{renderSamplePreview(showPreviewModal.template).length}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Cost: </span>
                  <strong className="text-primary">৳ 0.35</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(renderSamplePreview(showPreviewModal.template));
                    showToast("Rendered SMS copied!");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} /> Copy Rendered Text
                </button>
                <button
                  onClick={() => {
                    showToast(`Simulated Test SMS delivered to 01784659223!`);
                    setShowPreviewModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Send size={13} /> Send Test SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
