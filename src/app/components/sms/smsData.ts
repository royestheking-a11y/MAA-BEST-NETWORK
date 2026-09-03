export interface SmsTemplate {
  id: string;
  sr: number;
  name: string;
  type: "Default" | "Custom";
  template: string;
  category: "Billing" | "Client" | "Auth" | "Support" | "Staff" | "Marketing";
  variables: string[];
}

export const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: "tpl-1",
    sr: 1,
    name: "Sales and Service Money Receipt Template",
    type: "Default",
    category: "Billing",
    variables: ["CustomerName", "CustomerId", "TotalAmount", "Discount", "PaidAmount", "RecieptNo", "InvoiceNo", "VAT", "TotalPaidBill", "Username"],
    template: "প্রিয় গ্রাহক, আপনার অ্যাকাউন্ট সম্পর্কিত তথ্য নিচে দেওয়া হলো:নাম: {CustomerName} ক্লায়েন্ট/কাস্টমার আইডি: {CustomerId} মোট বিল: {TotalAmount} ছাড়/ডিসকাউন্ট: {Discount}পরিশোধিত অর্থ: {PaidAmount} রসিদ নং: {RecieptNo} ইনভয়েস নং: {InvoiceNo} ভ্যাট: {VAT} মোট পরিশোধিত বিল: {TotalPaidBill} ধন্যবাদ ও শুভেচ্ছা, {Username}"
  },
  {
    id: "tpl-2",
    sr: 2,
    name: "Greetings To Client Template",
    type: "Default",
    category: "Client",
    variables: ["CustomerName", "ClientCode", "UserName", "Password", "CompanyName"],
    template: "প্রিয় {CustomerName}, আপনার ইউনিক আইডি হচ্ছেঃ {ClientCode}, সার্ভার আইডি/আইপি হচ্ছেঃ {UserName}, সার্ভার পাসওয়ার্ড হচ্ছেঃ {Password}। ধন্যবাদ ও শুভেচ্ছা, {CompanyName}"
  },
  {
    id: "tpl-3",
    sr: 3,
    name: "Employee Salary Payment Template",
    type: "Default",
    category: "Staff",
    variables: ["EmployeeName", "PaidAmount", "MonthName", "TotalSalary", "DueAmount", "CompanyName"],
    template: "প্রিয় {EmployeeName}, আপনি পেয়েছেন {PaidAmount} টাকা। আপনার বেতন মাস হচ্ছে {MonthName}, মোট বেতন: {TotalSalary} টাকা এবং বর্তমান বকেয়া: {DueAmount} টাকা। ধন্যবাদ ও শুভেচ্ছা, {CompanyName}"
  },
  {
    id: "tpl-4",
    sr: 4,
    name: "Verification Code Template",
    type: "Default",
    category: "Auth",
    variables: ["CompanyName", "VerificationCode", "CompanyMobile"],
    template: "{CompanyName}-তে আপনার পরিচয় যাচাই করার একক নম্বর (ওটিপি) হল: {VerificationCode}, এটি 10 মিনিটের মধ্যে কার্যকারিতা হারাবে। অননুমোদিত হলে, অনুগ্রহ করে কল করুন {CompanyMobile}"
  },
  {
    id: "tpl-5",
    sr: 5,
    name: "ClientCode Update Notification Template",
    type: "Default",
    category: "Client",
    variables: ["CustomerName", "LoginUserName", "LoginPassword", "BaseSiteURL", "CompanyName"],
    template: "প্রিয় {CustomerName}, আপনার ক্লায়েন্টকোড পরিবর্তন করা হয়েছে! আপনার নতুন লগইন তথ্য হল: ব্যবহারকারীর নাম: {LoginUserName} পাসওয়ার্ড: {LoginPassword} সাইট URL: {BaseSiteURL} ধন্যবাদ ও শুভেচ্ছা, {CompanyName}"
  },
  {
    id: "tpl-6",
    sr: 6,
    name: "Client Registration Template",
    type: "Default",
    category: "Client",
    variables: ["LoginUserName", "LoginPassword", "BaseSiteURL", "CompanyName"],
    template: "নিবন্ধনের জন্য ধন্যবাদ! আপনার লগইন তথ্য হল: ব্যবহারকারীর নাম: {LoginUserName} পাসওয়ার্ড: {LoginPassword} সাইট URL: {BaseSiteURL} ধন্যবাদ ও শুভেচ্ছা, {CompanyName}"
  },
  {
    id: "tpl-7",
    sr: 7,
    name: "Password Regenerator",
    type: "Default",
    category: "Auth",
    variables: ["CustomerName", "LoginUserName", "LoginPassword"],
    template: "প্রিয় {CustomerName}, আপনার পাসওয়ার্ডটি পুনরায় তৈরি করা হয়েছে আপনার লগইন তথ্য হল ব্যবহারকারীর নাম: {LoginUserName} পাসওয়ার্ড: {LoginPassword} ধন্যবাদ ও শুভেচ্ছা"
  },
  {
    id: "tpl-8",
    sr: 8,
    name: "Client Created",
    type: "Default",
    category: "Client",
    variables: ["ClientID", "UserName", "Password", "Package", "MonthlyBillAmount", "CompanyName", "CompanyMobile"],
    template: "প্রিয় গ্রাহক, আপনার অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে. আপনার ক্লায়েন্ট কোড: {ClientID} সার্ভার ID/IP: {UserName} পাসওয়ার্ড: {Password} প্যাকেজ: {Package} মাসিক বিল: {MonthlyBillAmount} ধন্যবাদ ও শুভেচ্ছা {CompanyName} বিস্তারিত জানতে আমাদেরকে কল করুন: {CompanyMobile}"
  },
  {
    id: "tpl-9",
    sr: 9,
    name: "Todo Assigned",
    type: "Default",
    category: "Staff",
    variables: ["EmpName", "CompanyName"],
    template: "প্রিয় {EmpName}, আমরা আপনার জন্য একটি টাস্ক সংযুক্ত করেছি, অনুগ্রহ করে এটি সেই টাস্কটি চেক করে দেখুন, ধন্যবাদ ও শুভেচ্ছা {CompanyName}"
  },
  {
    id: "tpl-10",
    sr: 10,
    name: "Client Disable",
    type: "Default",
    category: "Client",
    variables: ["ClientID", "UserName", "Password", "CustomerName", "Package", "MonthlyBillAmount", "BillingLastDate", "CompanyName"],
    template: "প্রিয় ক্লায়েন্ট, আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে. ক্লায়েন্ট কোড: {ClientID} ব্যবহারকারীর নাম: {UserName} পাসওয়ার্ড: {Password} গ্রাহকের নাম: {CustomerName} প্যাকেজ: {Package} মাসিক বিল: {MonthlyBillAmount} বিলিংয়ের শেষ তারিখ: {BillingLastDate} ধন্যবাদ ও শুভেচ্ছা {CompanyName}"
  },
  {
    id: "tpl-11",
    sr: 11,
    name: "Client Enable",
    type: "Default",
    category: "Client",
    variables: ["ClientID", "UserName", "Password", "CustomerName", "Package", "MonthlyBillAmount", "BillingLastDate", "CompanyName"],
    template: "প্রিয় ক্লায়েন্ট, আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে। ক্লায়েন্ট কোড: {ClientID} ব্যবহারকারীর নাম: {UserName} পাসওয়ার্ড: {Password} গ্রাহকের নাম: {CustomerName} প্যাকেজ: {Package} MonthlyBill: {MonthlyBillAmount} বিলিংয়ের শেষ তারিখ: {BillingLastDate} ধন্যবাদ ও শুভেচ্ছা {CompanyName}"
  },
  {
    id: "tpl-12",
    sr: 12,
    name: "Money Receipt Template",
    type: "Default",
    category: "Billing",
    variables: ["ClientID", "UserName", "MonthlyBillAmount", "PaidAmount", "PaymentDate", "CompanyName"],
    template: "প্রিয় গ্রাহক, আমরা আপনার ইন্টারনেট বিল পেয়েছি। User ID/IP: {ClientID} ব্যবহারকারীর নাম: {UserName} মাসিক বিল: {MonthlyBillAmount} বিল গ্রহণ করুন: {PaidAmount} পেমেন্টের তারিখ: {PaymentDate} ধন্যবাদ ও শুভেচ্ছা {CompanyName}"
  },
  {
    id: "tpl-13",
    sr: 13,
    name: "Due Template",
    type: "Default",
    category: "Billing",
    variables: ["ClientID", "UserName", "MonthlyBillAmount", "Due", "BillingLastDate", "CompanyName", "CompanyMobile"],
    template: "প্রিয় গ্রাহক, অনুগ্রহ করে আপনার ইন্টারনেট বিল পরিশোধ করুন। ক্লায়েন্ট কোড: {ClientID} ব্যবহারকারীর নাম: {UserName} মাসিক বিল: {MonthlyBillAmount} বকেয়া: {Due} বিলিংয়ের শেষ তারিখ: {BillingLastDate} ধন্যবাদ ও শুভেচ্ছা {CompanyName} {CompanyMobile}"
  },
  {
    id: "tpl-14",
    sr: 14,
    name: "Line Man Support Notification",
    type: "Default",
    category: "Support",
    variables: ["UserName", "CustomerNumber", "Problem"],
    template: "হ্যালো সাপোর্ট এক্সিকিউটিভ, খুব দ্রুত সমাধান এর প্রয়োজনীয় ব্যবস্থা নেওয়া হোক। আইডি: {UserName} মোবাইল নম্বর: {CustomerNumber} সমস্যা: {Problem}"
  },
  {
    id: "tpl-15",
    sr: 15,
    name: "Support Solved",
    type: "Default",
    category: "Support",
    variables: ["ClientID", "TicketNo", "Problem", "CompanyName"],
    template: "প্রিয় গ্রাহক, আপনার ক্লায়েন্ট কোড: {ClientID} টোকেন নম্বর: {TicketNo} সমস্যা হচ্ছে: {Problem} এই টোকেনটি এখন সম্পূর্ণ হয়েছে। আপনার ধৈর্য্যের জন্য ধন্যবাদ. {CompanyName}"
  },
  {
    id: "tpl-16",
    sr: 16,
    name: "Support Token Created",
    type: "Default",
    category: "Support",
    variables: ["TicketNo", "Problem", "ClientID", "UserName", "CompanyMobile", "CompanyName"],
    template: "প্রিয় গ্রাহক, আমরা এই সমস্যাটি তালিকাভুক্ত করেছি। আপনার টোকেন নং: {TicketNo} সমস্যা হচ্ছে: {Problem} আপনার ক্লায়েন্ট আইডি: {ClientID} সার্ভার ID/IP: {UserName} আপনার সমস্যাটি জানানোর জন্য ধন্যবাদ। শিগগিরই এর সমাধান হবে। জরুরী সাহায্যের জন্য আমাদের কল করুন: {CompanyMobile}। ধন্যবাদ ও শুভেচ্ছা {CompanyName}"
  }
];

export interface SmsGroup {
  id: string;
  sr: number;
  name: string;
  status: "Active" | "Inactive";
  memberTypes: string;
  memberCount: number;
  description: string;
  criteria?: "all" | "paid" | "due" | "collected" | "unpaid" | "active" | "inactive" | "employee" | "left";
}

export const INITIAL_SMS_GROUPS: SmsGroup[] = [
  { id: "grp-1", sr: 1, name: "All Client", status: "Active", memberTypes: "All Registered Subscribers", memberCount: 150, criteria: "all", description: "All active & inactive subscribers" },
  { id: "grp-2", sr: 2, name: "Paid Client", status: "Active", memberTypes: "Cleared Monthly Accounts", memberCount: 114, criteria: "paid", description: "Subscribers with zero due for current month" },
  { id: "grp-3", sr: 3, name: "Due Client", status: "Active", memberTypes: "Overdue Subscribers", memberCount: 36, criteria: "due", description: "Subscribers with pending billing balances" },
  { id: "grp-4", sr: 4, name: "Collected Client", status: "Active", memberTypes: "Recent Biller Payers", memberCount: 92, criteria: "collected", description: "Subscribers with payment recorded in last 30 days" },
  { id: "grp-5", sr: 5, name: "Unpaid Client", status: "Active", memberTypes: "Uninvoiced / Unpaid Lines", memberCount: 22, criteria: "unpaid", description: "Subscribers who haven't made any payment this cycle" },
  { id: "grp-6", sr: 6, name: "Active Client", status: "Active", memberTypes: "Connected Live PPPoE", memberCount: 125, criteria: "active", description: "Subscribers with active connection status" },
  { id: "grp-7", sr: 7, name: "Inactive Client", status: "Active", memberTypes: "Suspended / Offline", memberCount: 25, criteria: "inactive", description: "Suspended or temporarily offline subscribers" },
  { id: "grp-8", sr: 8, name: "Employee", status: "Active", memberTypes: "Staff, Techs & Line Men", memberCount: 18, criteria: "employee", description: "NOC staff, field technicians, and line managers" },
  { id: "grp-9", sr: 9, name: "Left Client", status: "Active", memberTypes: "Permanently Disconnected", memberCount: 8, criteria: "left", description: "Cancelled lines or former subscribers" },
];

export const COMPANY_SMS_METADATA = {
  companyName: "MAA BEST NETWORK",
  companyMobile: "01700-000000",
  baseSiteURL: "https://maabestnetwork.com/portal",
  smsRatePerPart: 0.35,
  smsBalance: 2450
};
