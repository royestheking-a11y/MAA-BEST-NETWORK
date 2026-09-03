import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "bn";

// ─── Comprehensive English-to-Bangla ISP Dictionary ───────────────────────────
const DICTIONARY: Record<string, string> = {
  // Brand & Shell
  "MAA BEST NETWORK": "মা বেস্ট নেটওয়ার্ক",
  "FIBER OPERATING SYSTEM": "ফাইবার অপারেটিং সিস্টেম",
  "Operating Console": "অপারেটিং কনসোল",
  "All Systems Active": "সকল সিস্টেম সক্রিয়",
  "NOC Live Operations Center": "এনওসি লাইভ অপারেশন সেন্টার",

  // Navigation & Menus
  "Dashboard": "ড্যাশবোর্ড",
  "Customers": "গ্রাহকবৃন্দ",
  "All Customers": "সকল গ্রাহক",
  "Customer Profile": "গ্রাহক প্রোফাইল",
  "Customer Map": "গ্রাহক ম্যাপ",
  "Live Status": "লাইভ স্ট্যাটাস",
  "Due Customers": "বকেয়া গ্রাহক",
  "Disconnected Customers": "সংযোগ বিচ্ছিন্ন গ্রাহক",
  "Import": "ইম্পোর্ট",
  "Import Customers": "গ্রাহক ইম্পোর্ট",
  "Billing": "বিলিং ও পেমেন্ট",
  "Invoices": "ইনভয়েস",
  "Payments": "পেমেন্টসমূহ",
  "Cash Desk POS": "ক্যাশ কাউন্টার পিওএস",
  "Walk-In Cash Desk POS": "ওয়াক-ইন ক্যাশ কাউন্টার ও পিওএস বিলিং",
  "Packages": "প্যাকেজসমূহ",
  "Discounts": "ডিসকাউন্ট ও জরিমানা",
  "Discounts & Penalties": "ডিসকাউন্ট ও পেনাল্টি",
  "Billing Settings": "বিলিং সেটিংস",
  "Network": "নেটওয়ার্ক কোর",
  "Network Map": "নেটওয়ার্ক ম্যাপ",
  "NOC Wall Screen": "এনওসি লাইভ ওয়াল",
  "MikroTik": "মাইক্রোটিক",
  "MikroTik Management": "মাইক্রোটিক ব্যবস্থাপনা",
  "OLT": "ওএলটি",
  "OLT / ONT": "ওএলটি / ওএনটি",
  "OLT / ONT Management": "ওএলটি ও ওএনটি ব্যবস্থাপনা",
  "ONU Event History": "ওএনইউ ইভেন্ট হিস্ট্রি",
  "IP Pools & VLANs": "আইপি পুল ও ভি-ল্যান",
  "IPAM & Subnet Pools": "আইপ্যাম ও সাবনেট পুল",
  "TR-069 ACS Wi-Fi": "টিআর-০৬৯ এসিএস ওয়াইফাই",
  "TR-069 ACS Wi-Fi Management": "টিআর-০৬৯ এসিএস ওয়াইফাই নিয়ন্ত্রণ",
  "Zones": "জোন ও এলাকা",
  "Zones & Sub-Zones": "জোন ও সাব-জোন",
  "Incidents": "নেটওয়ার্ক ইনসিডেন্ট",
  "Network Incidents": "নেটওয়ার্ক সমস্যাসমূহ",
  "Monitoring": "মনিটরিং",
  "Network Monitoring": "নেটওয়ার্ক পর্যবেক্ষণ",
  "Resellers": "রিসেলার হাব",
  "MAC Resellers": "ম্যাক রিসেলার",
  "Bandwidth": "ব্যান্ডউইথ",
  "Bandwidth Resellers": "ব্যান্ডউইথ রিসেলার",
  "Wallets": "ওয়ালেট",
  "Reseller Wallets": "রিসেলার ওয়ালেট",
  "CRM": "সিআরএম ও টিকিট",
  "WhatsApp CRM": "হোয়াটসঅ্যাপ সিআরএম",
  "WhatsApp Business CRM": "হোয়াটসঅ্যাপ বিজনেস সিআরএম",
  "Tickets": "সাপোর্ট টিকিট",
  "Support Tickets": "সাপোর্ট টিকিট",
  "Customer Timeline": "গ্রাহক টাইমলাইন",
  "Messages": "মেসেজ ও বার্তা",
  "Technicians": "টেকনিশিয়ান",
  "Customer Support": "গ্রাহক সহায়তা",
  "Finance": "ফাইন্যান্স ও হিসাব",
  "Accounts": "হিসাবসমূহ",
  "Transactions": "লেনদেন",
  "Expenses": "খরচ ও ব্যয়",
  "Finance Reports": "ফাইন্যান্স রিপোর্ট",
  "Automation": "অটোমেশন",
  "SMS": "এসএমএস",
  "SMS Automation": "এসএমএস অটোমেশন",
  "Workflows": "ওয়ার্কফ্লো",
  "Automation Workflows": "অটোমেশন ওয়ার্কফ্লো",
  "Notifications": "নোটিফিকেশন",
  "AI Intelligence": "এআই ইন্টেলিজেন্স",
  "Revenue Analysis": "আয় বিশ্লেষণ",
  "Leakage Detector": "রেভিনিউ লিকেজ ডিটেক্টর",
  "Revenue Leakage Detector": "রাজস্ব লিকেজ সনাক্তকরণ",
  "Customer Risk": "গ্রাহক ঝুঁকি সূচক",
  "Customer Risk Scores": "গ্রাহক চর্ন ঝুঁকি",
  "Forecast": "আয়ের পূর্বাভাস",
  "Revenue Forecast": "রাজস্ব পূর্বাভাস",
  "AI Assistant": "এআই অ্যাসিস্ট্যান্ট",
  "AI Business Assistant": "এআই সহকারী",
  "Reports": "রিপোর্টসমূহ",
  "Revenue": "রাজস্ব",
  "Revenue Reports": "রাজস্ব রিপোর্ট",
  "Customer": "গ্রাহক",
  "Customer Reports": "গ্রাহক রিপোর্ট",
  "Network Reports": "নেটওয়ার্ক রিপোর্ট",
  "BTRC": "বিটিআরসি",
  "BTRC Regulatory": "বিটিআরসি রেগুলেটরি",
  "BTRC Regulatory Reports": "বিটিআরসি রিপোর্ট",
  "Custom Reports": "কাস্টম রিপোর্ট",
  "System": "সিস্টেম সেটিংস",
  "Subscriber Portal": "গ্রাহক সেলফ-সার্ভিস পোর্টাল",
  "Employees": "কর্মচারীবৃন্দ",
  "Inventory": "যন্ত্রপাতি ইনভেন্টরি",
  "Equipment Inventory": "যন্ত্রপাতি ইনভেন্টরি",
  "Activity Logs": "অ্যাক্টিভিটি লগ",
  "Backups": "সিস্টেম ব্যাকআপ",
  "Integrations": "ইন্টিগ্রেশন",
  "Settings": "সিস্টেম সেটিংস",

  // Dashboard Metrics & Headers
  "Good Morning": "শুভ সকাল",
  "Good Afternoon": "শুভ অপরাহ্ন",
  "Good Evening": "শুভ সন্ধ্যা",
  "Total Customers": "মোট গ্রাহক",
  "Monthly Revenue": "মাসিক রাজস্ব",
  "Today's Collection": "আজকের কালেকশন",
  "Online Now": "বর্তমানে অনলাইন",
  "Total Due": "মোট বকেয়া",
  "Net Profit": "নিট লাভ",
  "Recent Payments": "সাম্প্রতিক পেমেন্টসমূহ",
  "View all": "সবগুলো দেখুন",
  "Live Issues & 1-Click Instant Solutions": "লাইভ সমস্যা ও ১-ক্লিক তাৎক্ষণিক সমাধান",
  "Fix & Notify Tech": "সমাধান ও টেকনিশিয়ান পাঠান",
  "Dispatch bKash Links": "বিকাশ লিংক পাঠান",
  "Grant Grace Period": "গ্রেস পিরিয়ড দিন",
  "Optical Rx Degradation": "অপটিক্যাল সিগন্যাল সমস্যা",
  "Overdue Invoices Pending": "বকেয়া ইনভয়েস অপেক্ষমাণ",
  "Isolated Customer": "সংযোগ বিচ্ছিন্ন গ্রাহক",
  "ONU Spatial Map": "ওএনইউ স্পেশাল ম্যাপ",
  "MikroTik Provisioning": "মাইক্রোটিক প্রভিশনিং",

  // Customer Management & Provisioning
  "Add New Subscriber": "নতুন গ্রাহক যুক্ত করুন",
  "Provision New Subscriber": "নতুন গ্রাহক প্রভিশন করুন",
  "Add Customer": "নতুন গ্রাহক যুক্ত করুন",
  "FULL NAME": "পূর্ণ নাম",
  "MOBILE NUMBER": "মোবাইল নম্বর",
  "EMAIL ADDRESS": "ইমেইল ঠিকানা",
  "INSTALLATION ADDRESS": "সংযোগের ঠিকানা",
  "ZONE": "জোন / এলাকা",
  "SUB-ZONE": "সাব-জোন",
  "PORTAL PASSCODE (DEFAULT)": "পোর্টাল পাসকোড",
  "PPPOE USERNAME": "পিপিপিওই ইউজারনেম",
  "PPPOE PASSWORD": "পিপিপিওই পাসওয়ার্ড",
  "MAC ADDRESS": "ম্যাক অ্যাড্রেস",
  "PACKAGE": "প্যাকেজ",
  "BILLING DATE (DAY)": "বিলিং তারিখ (দিন)",
  "Bandwidth Speed Division (Bits / Rate)": "ব্যান্ডউইথ স্পিড বিভাজন (বিট ও গতি)",
  "IP Subnet Pool & Auto-Sequential Allocation": "আইপি সাবনেট পুল ও অটো-সিরিয়াল বরাদ্দ",
  "PPPoE Credentials & MikroTik Sync": "পিপিপিওই তথ্য ও মাইক্রোটিক সিঙ্ক",
  "Auto-Allocate Next IP": "পরবর্তী খালি আইপি বরাদ্দ দিন",
  "Auto-Generate PPPoE": "অটো-পিপিপিওই তৈরি করুন",
  "Create & Provision Subscriber": "গ্রাহক তৈরি ও কনফিগার করুন",
  "SELECT SUBNET POOL": "সাবনেট পুল নির্বাচন করুন",
  "FRAMED / STATIC IP": "স্ট্যাটিক / ফ্রেমড আইপি",
  "CORE MIKROTIK ROUTER": "কোর মাইক্রোটিক রাউটার",
  "OPTICAL OLT CHASSIS": "অপটিক্যাল ওএলটি চ্যাসিস",

  // Statuses & Actions
  "Search": "অনুসন্ধান",
  "Search customers, invoices, IPs, tickets…": "গ্রাহক, ইনভয়েস, আইপি বা টিকিট খুঁজুন…",
  "Active": "সক্রিয়",
  "Online": "অনলাইন",
  "Offline": "অফলাইন",
  "Due": "বকেয়া",
  "Overdue": "মেয়াদোত্তীর্ণ বকেয়া",
  "Suspended": "স্থগিত",
  "Disconnected": "বিচ্ছিন্ন",
  "Paid": "পরিশোধিত",
  "Unpaid": "অপরিশোধিত",
  "Pending": "অপেক্ষমাণ",
  "Verified": "যাচাইকৃত",
  "Resolved": "সমাধান হয়েছে",
  "Save": "সংরক্ষণ করুন",
  "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
  "Cancel": "বাতিল",
  "Delete": "মুছুন",
  "Edit": "সম্পাদনা",
  "Export": "এক্সপোর্ট",
  "Download": "ডাউনলোড",
  "Send SMS": "এসএমএস পাঠান",
  "Pay Now": "এখনই পরিশোধ করুন",
  "Pay Bill": "বিল পরিশোধ করুন",
  "Reconnect": "পুনরায় সংযোগ দিন",
  "Disconnect": "সংযোগ বিচ্ছিন্ন করুন",
  "View Profile": "প্রোফাইল দেখুন",
  "Change Package": "প্যাকেজ পরিবর্তন করুন",
  "Details": "বিস্তারিত",
  "Status": "স্ট্যাটাস",
  "Action": "অ্যাকশন",
  "Actions": "কার্যক্রম",
  "Name": "নাম",
  "Phone": "ফোন নম্বর",
  "Email": "ইমেইল",
  "Address": "ঠিকানা",
  "Package": "প্যাকেজ",
  "Amount": "পরিমাণ",
  "Total": "মোট",
  "Date": "তারিখ",
  "Time": "সময়",
  "Speed": "গতি",
  "Uptime": "আপটাইম",
  "Signal": "সিগন্যাল",
  "Login": "লগইন",
  "Logout": "লগআউট",
  "Sign In": "সাইন ইন করুন",
  "English": "English",
  "Bangla": "বাংলা",

  // Subscriber Portal
  "My Account": "আমার অ্যাকাউন্ট",
  "Current Balance": "বর্তমান ব্যালেন্স",
  "Account Status": "সংযোগ স্ট্যাটাস",
  "Active Plan": "বর্তমান প্যাকেজ",
  "Days Remaining": "বাকি দিন",
  "Download Invoice": "ইনভয়েস ডাউনলোড",
  "Wi-Fi Settings": "ওয়াইফাই সেটিংস",
  "Change Wi-Fi Password": "ওয়াইফাই পাসওয়ার্ড পরিবর্তন",
  "Speed Test": "স্পিড টেস্ট",
  "Support Ticket": "সাপোর্ট টিকিট",
  "Payment History": "পেমেন্ট হিস্ট্রি",
  "Pay with bKash": "বিকাশ দিয়ে পরিশোধ করুন",
  "Pay with Nagad": "নগদ দিয়ে পরিশোধ করুন",

  // Units & Time
  "Mbps": "এমবিপিএস",
  "Gbps": "জিবিপিএস",
  "GB": "জিবি",
  "dBm": "ডিবিএম",
  "mins ago": "মিনিট আগে",
  "hours ago": "ঘণ্টা আগে",
  "days ago": "দিন আগে",
  "just now": "এইমাত্র",
};

// Convert English numbers (e.g. 1234.50) to Bengali numerals (১২৩৪.৫০)
export function toBanglaNumber(num: string | number | undefined | null): string {
  if (num === undefined || num === null) return "";
  const str = String(num);
  const bnDigits: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return str.replace(/[0-9]/g, match => bnDigits[match] || match);
}

// Translate text intelligently with fallback dictionary lookups and number localization
export function translateText(text: string | undefined | null, lang: Language): string {
  if (!text) return "";
  if (lang === "en") return text;

  const trimmed = text.trim();
  if (DICTIONARY[trimmed]) {
    return DICTIONARY[trimmed];
  }

  // Exact lowercase fallback
  for (const [enKey, bnVal] of Object.entries(DICTIONARY)) {
    if (enKey.toLowerCase() === trimmed.toLowerCase()) {
      return bnVal;
    }
  }

  // If text contains a known word plus numbers, translate known parts and convert numbers
  let localized = text;
  for (const [enKey, bnVal] of Object.entries(DICTIONARY)) {
    if (enKey.length > 3 && localized.includes(enKey)) {
      localized = localized.split(enKey).join(bnVal);
    }
  }

  if (/\d/.test(localized)) {
    localized = toBanglaNumber(localized);
  }

  return localized;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
  bnNum: (num: string | number) => string;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (text: string) => text,
  bnNum: (num: string | number) => String(num),
  isBangla: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ips_bd_lang");
      if (saved === "bn" || saved === "en") return saved;
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ips_bd_lang", lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  const t = (text: string) => translateText(text, language);
  const bnNum = (num: string | number) => (language === "bn" ? toBanglaNumber(num) : String(num));

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        bnNum,
        isBangla: language === "bn",
      }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
