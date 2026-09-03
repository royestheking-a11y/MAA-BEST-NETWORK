import React, { useState } from "react";
import {
  MessageSquare, Send, Search, CheckCircle2, User, Phone,
  Sparkles, Layers, DollarSign, Clock, Users, X, Info
} from "lucide-react";
import { INITIAL_SMS_TEMPLATES, COMPANY_SMS_METADATA, SmsTemplate } from "./smsData";
import { useCustomerContext } from "../../context/CustomerContext";

interface IndividualSmsPageProps {
  onNavigate?: (page: string) => void;
}

export const IndividualSmsPage: React.FC<IndividualSmsPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [smsDescription, setSmsDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick client picker drawer state
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Unicode detection: Bengali characters require 70 chars/part, standard ASCII 160 chars/part
  const isUnicode = /[\u0980-\u09FF]/.test(smsDescription);
  const charLimitPerPart = isUnicode ? 70 : 160;
  const charLength = smsDescription.length;
  const partsCount = charLength > 0 ? Math.ceil(charLength / charLimitPerPart) : 0;
  const recipientCount = phoneNumbers
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length >= 8).length || (phoneNumbers.trim() ? 1 : 0);
  const totalCost = (partsCount * recipientCount * COMPANY_SMS_METADATA.smsRatePerPart).toFixed(2);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSmsDescription("");
      return;
    }
    const tpl = INITIAL_SMS_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setSmsDescription(tpl.template);
    }
  };

  const handleSelectCustomer = (c: any) => {
    const formattedPhone = c.phone.startsWith("88") ? c.phone : `88${c.phone.replace(/[^0-9]/g, "")}`;
    if (phoneNumbers.trim()) {
      setPhoneNumbers(prev => `${prev},${formattedPhone}`);
    } else {
      setPhoneNumbers(formattedPhone);
    }

    // Auto-render customer variables if a template is selected
    if (selectedTemplateId) {
      const tpl = INITIAL_SMS_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (tpl) {
        let text = tpl.template
          .replace(/{CustomerName}/g, c.name)
          .replace(/{CustomerId}/g, c.clientCode || c.id)
          .replace(/{ClientID}/g, c.clientCode || c.id)
          .replace(/{ClientCode}/g, c.clientCode || c.id)
          .replace(/{UserName}/g, c.pppUser || c.id)
          .replace(/{LoginUserName}/g, c.pppUser || c.id)
          .replace(/{Password}/g, "123456")
          .replace(/{LoginPassword}/g, "123456")
          .replace(/{Package}/g, c.package || "20Mbps")
          .replace(/{MonthlyBillAmount}/g, `৳ ${c.monthlyBill || 500}`)
          .replace(/{TotalAmount}/g, `৳ ${c.monthlyBill || 500}`)
          .replace(/{PaidAmount}/g, `৳ ${c.monthlyBill || 500}`)
          .replace(/{TotalPaidBill}/g, `৳ ${c.monthlyBill || 500}`)
          .replace(/{Due}/g, `৳ ${c.due || 0}`)
          .replace(/{DueAmount}/g, `৳ ${c.due || 0}`)
          .replace(/{Discount}/g, "৳ 0")
          .replace(/{VAT}/g, "৳ 0")
          .replace(/{RecieptNo}/g, `REC-${Math.floor(10000 + Math.random() * 90000)}`)
          .replace(/{InvoiceNo}/g, `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`)
          .replace(/{BillingLastDate}/g, "05/09/2026")
          .replace(/{PaymentDate}/g, "28/08/2026")
          .replace(/{CompanyName}/g, COMPANY_SMS_METADATA.companyName)
          .replace(/{CompanyMobile}/g, COMPANY_SMS_METADATA.companyMobile)
          .replace(/{BaseSiteURL}/g, COMPANY_SMS_METADATA.baseSiteURL)
          .replace(/{VerificationCode}/g, `${Math.floor(100000 + Math.random() * 900000)}`)
          .replace(/{TicketNo}/g, "TKT-4921")
          .replace(/{Problem}/g, "Internet speed query")
          .replace(/{CustomerNumber}/g, c.phone);
        setSmsDescription(text);
      }
    }
    showToast(`Added ${c.name} (${formattedPhone})`);
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumbers.trim()) {
      alert("Please provide at least one recipient mobile number.");
      return;
    }
    if (!smsDescription.trim()) {
      alert("Please enter SMS description or select a template.");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast(`SMS successfully dispatched to ${recipientCount} recipient(s)! Cost: ৳ ${totalCost}`);
      setPhoneNumbers("");
      setSmsDescription("");
      setSelectedTemplateId("");
    }, 1000);
  };

  const filteredSubscribers = customers.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch) ||
    (c.clientCode && c.clientCode.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-primary/20 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb (Screenshot 2 Exact Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Individual SMS</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">SMS Sending</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>SMS Service</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Individual SMS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs flex items-center gap-2 shadow-xs">
            <span className="text-muted-foreground">Gateway Balance:</span>
            <span className="font-bold text-primary">2,450 SMS</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Sending Form (Screenshot 2 Exact Layout) */}
      <form onSubmit={handleSendSms} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          {/* SEND TO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-foreground uppercase">SEND TO *</label>
              <button
                type="button"
                onClick={() => setShowClientPicker(!showClientPicker)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Users size={12} /> {showClientPicker ? "Hide Directory" : "+ Pick Subscribers"}
              </button>
            </div>
            <input
              type="text"
              value={phoneNumbers}
              onChange={e => setPhoneNumbers(e.target.value)}
              placeholder="ex:8801670000900,8801670000000"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
              required
            />
            <p className="text-[10px] text-muted-foreground mt-1">Separate multiple mobile numbers with comma (,)</p>
          </div>

          {/* Quick Client Picker Drawer */}
          {showClientPicker && (
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2 animate-in fade-in">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Search subscriber name or phone..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-border/50">
                {filteredSubscribers.slice(0, 10).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left py-1.5 px-2 hover:bg-card rounded flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{c.clientCode || c.id} · {c.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary">+ Insert</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SELECT TEMPLETE */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase mb-1.5">SELECT TEMPLETE</label>
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

          {/* LENGTH */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">LENGTH:</label>
            <div className="w-full px-3.5 py-2 text-xs font-mono font-semibold rounded-xl bg-muted border border-border text-foreground flex items-center justify-between">
              <span>{charLength} Characters ({partsCount} {isUnicode ? "Unicode SMS Part" : "GSM SMS Part"})</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {isUnicode ? "70 chars/part" : "160 chars/part"}
              </span>
            </div>
          </div>

          {/* COST */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">COST:</label>
            <div className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-muted border border-border text-primary flex items-center justify-between">
              <span>৳ {totalCost} BDT</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {recipientCount} recipient(s) × {partsCount} part(s) @ ৳0.35
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Card (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-foreground uppercase">SMS DESCRIPTION *</label>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Info size={12} />
                <span>Bengali Unicode supported</span>
              </div>
            </div>

            <textarea
              rows={11}
              value={smsDescription}
              onChange={e => setSmsDescription(e.target.value)}
              placeholder="Type message in Bengali/English or pick a pre-configured template from the left dropdown..."
              className="w-full p-4 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary resize-none font-sans leading-relaxed shadow-inner"
              required
            />
          </div>

          {/* Dynamic Token Inserters */}
          <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Quick Insert Dynamic Tokens:</span>
            <div className="flex flex-wrap gap-1">
              {["CustomerName", "ClientID", "MonthlyBillAmount", "Due", "BillingLastDate", "CompanyMobile"].map(tok => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => setSmsDescription(p => `${p}{${tok}} `)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-card border border-border hover:border-primary hover:text-primary transition-all cursor-pointer"
                >
                  +{`{${tok}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Send Button (Screenshot 2 Exact Placement) */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} className={isSending ? "animate-pulse" : ""} />
              <span>{isSending ? "Dispatching SMS..." : "Send"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
