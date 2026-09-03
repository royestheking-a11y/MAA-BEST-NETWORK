 **IPS BD** should be positioned as a **hybrid ISP Operations + Billing + CRM + Network Monitoring + Automation + Finance + AI platform**, with multi-tenant white-label capability.

The most important design decision is this:

> **ISP BD = one core platform, but every ISP gets its own branded private-looking system.**

Each ISP owner can use their own logo, name, domain, colors, website URL, login page, and company identity without seeing another ISP's data.

---

# ISP BD — Complete A–Z Product Blueprint

## 1. Product Identity

### Product Name

**IPS BD**

### Positioning

**Hybrid ISP Billing, Network Management, CRM & Automation Platform**

### Suggested tagline

**Run Your ISP. Automate Everything.**

Alternative:

**Billing • Network • Customers • Finance • AI — One Platform**

### Primary visual identity

Use a premium **White + Deep Maroon** system.

| Element    | Direction                     |
| ---------- | ----------------------------- |
| Primary    | Deep Maroon                   |
| Background | White / Off-white             |
| Secondary  | Light Maroon                  |
| Dark mode  | Near-black + Maroon           |
| Cards      | White with subtle borders     |
| Typography | Inter / Manrope               |
| UI         | Clean SaaS dashboard          |
| Corners    | 10–14px                       |
| Icons      | Lucide / modern outline icons |
| Charts     | Minimal, professional         |
| Buttons    | Maroon primary                |
| Status     | Green / Amber / Red           |

Do **not** make every element maroon. Maroon should be the brand accent, while white/neutral space creates the premium feel.

---

# 2. The Core Architecture

IPS BD should be built as a **multi-tenant SaaS platform**.

```text
                    IPS BD PLATFORM
                           │
          ┌────────────────┴────────────────┐
          │                                 │
      PLATFORM CORE                    WHITE LABEL
          │                                 │
    ┌─────┼─────┐                    ┌──────┼──────┐
    │     │     │                    │      │      │
 Billing CRM Network              Logo   Domain  Branding
    │     │     │
 Finance AI Automation
          │
     ISP Tenant
          │
 ┌────────┼──────────────┐
 │        │              │
MikroTik  OLT        Customers
 │        │              │
PPPoE   ONU/ONT       Billing
Hotspot                Payments
Static IP              SMS
```

### Multi-tenancy

Every ISP gets a separate tenant:

```text
ISP A
 ├── Customers
 ├── MikroTik
 ├── OLT
 ├── Employees
 ├── Payments
 └── Reports

ISP B
 ├── Customers
 ├── MikroTik
 ├── OLT
 ├── Employees
 ├── Payments
 └── Reports
```

**No tenant should ever be able to access another tenant's data.**

---

# 3. White-Label System

This should be one of IPS BD's strongest selling points.

When an ISP subscribes:

### Owner provides

* Company name
* Company logo
* Favicon
* Company website
* Custom domain
* Support phone
* Support email
* Address
* Brand colors
* Login background
* Company description

The system automatically generates their branded environment.

For example:

```text
billing.abcisp.com
```

Login page:

```text
[ ABC ISP LOGO ]

ABC Internet Service

Username
Password

[ Sign In ]

Forgot Password?

© ABC Internet Service
```

Instead of:

> IPS BD Billing System

the customer sees:

> **ABC Internet Service**

### White-label requirements

* Custom logo
* Custom app name
* Custom favicon
* Custom domain
* Custom login page
* Custom email sender
* Custom SMS identity where gateway permits
* Company website
* Company contact information
* No IPS BD watermark
* Custom dashboard branding
* Custom invoice branding
* Custom receipt branding
* Custom customer portal branding

---

# 4. Premium Login Experience

The login should feel like a **premium enterprise SaaS product**, not a traditional ISP software.

### Desktop

Left:

```text
Your Internet.
Your Business.
Fully Automated.

Manage customers,
billing, network & revenue
from one intelligent platform.
```

Right:

```text
       [ ISP LOGO ]

       Welcome Back

   Username / Email
   ─────────────────

   Password
   ─────────────────

   □ Remember me

       [ LOGIN ]

   Forgot Password?
```

Background can have a subtle network topology:

```text
Internet
   │
MikroTik
   │
OLT
 ┌─┼─┐
ONU ONU ONU
 │   │   │
Users
```

Very subtle. No clutter.

### Mobile

Mobile login should be completely optimized.

---

# 5. Authentication

Support:

* Username/password
* Email/password
* OTP login
* Password reset
* Email verification
* 2FA
* Google Authenticator/TOTP
* Login session management
* Device management
* Force logout
* Suspicious login detection
* Login activity
* IP tracking
* Failed-login protection

For ISP Admin:

**2FA should be strongly recommended.**

---

# 6. Main Dashboard

After login:

```text
IPS BD
────────────────────────────────

Good evening, Admin

[ Customers ] [ Online ] [ Due ]
[ Revenue ]   [ Collection ]

────────────────────────────────

Revenue Overview
[ Graph ]

Network Health
MikroTik   ● Online
OLT-01     ● Online
OLT-02     🔴 Down

────────────────────────────────

Payment Collection
Due Customers
Disconnections
New Customers

────────────────────────────────

AI Business Insights
```

---

# 7. Dashboard KPIs

The owner should immediately see:

### Customer

* Total customers
* Active customers
* Online customers
* Offline customers
* Suspended
* Disconnected
* New customers
* Expiring customers

### Financial

* Today's collection
* This month's collection
* Monthly recurring revenue
* Total due
* Overdue amount
* Outstanding invoices
* Expenses
* Net revenue
* Estimated profit

### Network

* MikroTik online/offline
* OLT online/offline
* Active PPP sessions
* Active Hotspot users
* Bandwidth usage
* CPU
* RAM
* Uptime
* Network incidents

### AI

* Collection prediction
* Revenue forecast
* Revenue leakage
* High-risk customers
* High-risk zones
* Recommended actions

---

# 8. Notification Center

Real-time notification engine.

### Examples

🔴 MikroTik offline

🔴 OLT offline

🔴 ONU offline

🟡 High CPU

🟡 High bandwidth

🔴 Customer overdue

🟢 Payment received

🟢 Customer automatically reconnected

⚠️ Payment gateway failed

⚠️ SMS gateway failed

⚠️ Backup failed

⚠️ Revenue leakage detected

Every notification should have:

* Timestamp
* Severity
* Source
* Description
* Action
* Read/unread
* Related customer/device

---

# 9. Customer Management

This is the heart of IPS BD.

## Customer creation

Fields:

### Basic

* Customer ID
* Name
* Phone
* Email
* NID
* Address
* Zone
* Sub-zone
* Area
* Location
* Latitude
* Longitude
* Notes
* Status

### Network

* PPPoE username
* PPPoE password
* Static IP
* Elastic IP
* MAC address
* Connection type
* MikroTik server
* OLT
* ONU
* ONU MAC
* PON port
* VLAN
* Service profile

### Billing

* Package
* Billing cycle
* Billing date
* Due date
* Discount
* VAT
* Late fee
* Current balance
* Previous due

---

# 10. Customer Location Map

Use map integration.

Customer location:

```text
Customer
     ↓
Latitude
Longitude
     ↓
Map
```

Features:

* Customer pins
* Zone-based view
* Sub-zone
* OLT coverage
* Splitter mapping
* Offline customers
* Due customers
* Active customers

Clicking a customer pin opens their profile.

---

# 11. Customer Profile

A customer should have a complete 360° profile.

### Overview

* Customer information
* Current status
* Current package
* IP
* MAC
* Connection
* OLT
* ONU
* Payment status

### Tabs

```text
Overview
Network
Billing
Payments
Invoices
Messages
Usage
Activity
Tickets
Documents
```

---

# 12. Customer Actions

From customer profile:

* Enable internet
* Disable internet
* Suspend
* Unsuspend
* Delete
* Change package
* Schedule package
* Change IP
* Assign static IP
* Assign elastic IP
* MAC bind
* Remove MAC bind
* Change MikroTik
* Send SMS
* Send invoice
* Add payment
* Add discount
* Add penalty
* Add note
* Create ticket
* Give grace period

---

# 13. Scheduled Package

Very important.

Example:

Customer says:

> "Next month I want 20 Mbps."

Admin selects:

```text
Package:
20 Mbps

Effective date:
01/09/2026
```

IPS BD automatically changes the package on that date.

No manual work.

---

# 14. Automatic Billing Engine

The billing engine should work independently.

Example:

```text
Billing Date
     ↓
Generate Invoice
     ↓
Send Notification
     ↓
Payment Received?
   ↙       ↘
 YES        NO
 ↓           ↓
Continue    Reminder
             ↓
          Due Date
             ↓
        Disconnect
```

---

# 15. Auto Disconnect

Owner defines:

```text
Due Date: 10th
Grace Period: 2 days
```

If unpaid:

```text
10th → Due
11th → Reminder
12th → Grace period
13th → Auto disconnect
```

When payment arrives:

```text
Payment
   ↓
Verify
   ↓
Update invoice
   ↓
Reconnect
   ↓
Send confirmation
```

---

# 16. Payment Gateway

Bangladesh-focused.

### Must support

* bKash
* Nagad
* SSLCommerz
* Cash
* Manual payment
* Bank transfer

Potential future:

* Rocket
* Upay
* Cards
* International payments

Payment record:

* Amount
* Transaction ID
* Gateway
* Sender
* Receiver
* Date
* Time
* Invoice
* Customer
* Status
* Verified by
* Gateway response

---

# 17. Customer Payment Portal

Give customers their own portal.

```text
ABC ISP

Hello, Rahim

Current Package
20 Mbps

Current Bill
৳1,000

Due Date
10 September

[ Pay Now ]

Payment History
Internet Status
Support
```

Customer can:

* View invoice
* Pay bill
* Download receipt
* See payment history
* View package
* Open ticket
* Contact ISP
* See connection status

---

# 18. Grace Period

Admin can give:

```text
Customer:
Rahim

Grace period:
3 Days

Reason:
Payment commitment

Start:
12 Aug

End:
15 Aug
```

System automatically manages it.

---

# 19. Live Status

Real-time customer monitoring.

Columns:

* Customer
* User ID
* PPP username
* Status
* Uptime
* IP
* MAC
* Upload
* Download
* MikroTik
* Package
* Last seen

Filters:

* Online
* Offline
* Due
* Suspended
* Zone
* MikroTik
* Package

---

# 20. Package Management

Create:

```text
Package Name
Download
Upload
Price
Validity
Connection Type
MikroTik
Profile
Burst
FUP
```

Connection types:

* PPPoE
* Hotspot
* Static IP

Advanced:

* Burst limit
* Burst threshold
* Burst time
* Priority
* FUP
* Data limit
* Speed schedule

---

# 21. MikroTik Management

MikroTik should be a first-class module.

### Add server

```text
Server Name
IP Address
API Port
Username
Password
Connection Type
```

After connection:

```text
● Connected

CPU 23%
RAM 41%
Uptime 27 days

Customers 1,284
Active Sessions 972
```

---

# 22. MikroTik Features

Support:

### Monitoring

* CPU
* RAM
* Uptime
* Temperature where available
* Interfaces
* Traffic
* Active sessions

### Customer

* PPP secrets
* Active PPP sessions
* Profiles
* Hotspot users
* IP bindings
* DHCP leases where applicable
* MAC binding

### Operations

* Sync profiles
* Sync customers
* Push customers
* Reconnect
* Disconnect
* Backup
* Restore
* Server migration

---

# 23. MikroTik Crash Recovery

This can become a major USP.

If MikroTik crashes:

```text
MikroTik DOWN
      ↓
Detect failure
      ↓
Alert Admin
      ↓
Server restored
      ↓
IPS BD detects recovery
      ↓
Synchronize customers
      ↓
Restore required configuration
      ↓
Verify
```

Important: don't market this as magically restoring every MikroTik configuration. It should be implemented as a controlled backup/configuration synchronization system.

---

# 24. MikroTik Migration

Example:

```text
Old MikroTik
      ↓
Select customers
      ↓
Choose New MikroTik
      ↓
Validate
      ↓
Migrate
      ↓
Sync
      ↓
Verify
```

Deletion protection:

> A MikroTik containing assigned customers cannot be deleted.

---

# 25. Backup System

### Manual

* Create backup
* Download backup
* Backup history
* Restore backup

### Automatic

Default:

**Every day at 3:00 AM**

Keep:

**Latest 7 backups**

Advanced option:

* 14 days
* 30 days
* Custom retention

Backup status:

🟢 Successful
🔴 Failed

Send notification if backup fails.

---

# 26. OLT Management

Add:

* OLT name
* IP
* Vendor
* Model
* SNMP/API credentials
* Username/password
* Community
* Port
* Location

Then:

**Discover**

System retrieves available resources.

---

# 27. OLT Monitoring

Monitor:

* OLT online/offline
* PON ports
* ONU/ONT
* ONU status
* RX power
* TX power
* Temperature
* Distance
* Serial
* MAC
* PON
* VLAN
* Events

---

# 28. ONU/ONT Event History

Example:

```text
ONU #103

08:41 — Offline
08:47 — Online
08:48 — Signal changed
09:02 — Online
```

Show:

* Signal
* MAC
* Serial
* PON
* OLT
* IP
* Event time

---

# 29. OLT Action Log

Track exactly who did what.

Example:

```text
Admin
Changed ONU profile
19:42
IP: xxx.xxx.xxx.xxx
```

Employee:

```text
Employee-07
Disabled ONU
20:11
```

This is essential for accountability.

---

# 30. Network Diagram

This should be one of the **signature IPS BD features**.

Example:

```text
             INTERNET
                 │
             MIKROTIK
                 │
       ┌─────────┼─────────┐
       │         │         │
     ZONE A    ZONE B    ZONE C
       │         │         │
    Splitter   Splitter   Splitter
     / | \      / | \      / | \
    ONU ONU     ONU ONU    ONU ONU
```

Each node should have status.

### Green

Online

### Red

Down

### Yellow

Payment issue / due customer

### Gray

Unknown / disconnected

---

# 31. Intelligent Network Map

Click:

```text
Zone A
```

Show:

* Total customers
* Online
* Offline
* Due
* OLT
* Splitters
* Traffic
* Incidents

Click:

```text
Splitter A-12
```

Show connected customers.

This creates a genuine **network operations map**, not just a decorative diagram.

---

# 32. Zone & Sub-Zone

Hierarchy:

```text
Zone
 └── Sub-zone
      └── OLT
           └── PON
                └── Splitter
                     └── Customer
```

Example:

```text
Dhaka
 └── Mirpur
      └── OLT-01
           └── PON-08
                └── SPL-08-A
```

---

# 33. Due Customers

Dedicated page.

Columns:

* Customer
* Package
* Amount
* Due date
* Days overdue
* Zone
* Phone
* Status

Actions:

* Collect payment
* Send SMS
* Give grace
* Suspend
* Disconnect
* Call
* Open profile

---

# 34. Invoice System

Automatic invoice generation.

Invoice contains:

```text
ISP LOGO

Invoice #INV-000123

Customer
Package
Billing period
Previous due
Current bill
Discount
Late fee
VAT
Total

Payment Status
```

Actions:

* PDF
* Print
* Send SMS
* Send email
* Share
* WhatsApp integration later

---

# 35. Discounts & Penalties

Admin can add:

### Discount

```text
Bill = ৳1,000
Discount = ৳100

Total = ৳900
```

### Late fee

```text
Bill = ৳800
Penalty = ৳100

Total = ৳900
```

Every adjustment needs:

* Reason
* User
* Date
* Time
* Previous value
* New value

---

# 36. Payment History

Customer lifetime payment ledger.

Example:

| Date   | Amount | Method | Transaction | Added By |
| ------ | -----: | ------ | ----------- | -------- |
| 01 Aug | ৳1,000 | bKash  | TX123       | Gateway  |
| 01 Jul | ৳1,000 | Cash   | —           | Admin    |

---

# 37. SMS Automation

SMS template engine.

Templates:

* Welcome
* Invoice generated
* Bill reminder
* Due today
* Overdue
* Disconnection warning
* Disconnected
* Payment received
* Reconnected
* Package changed
* Password reset
* Support ticket
* Promotional

Variables:

```text
{{customer_name}}
{{invoice_amount}}
{{due_date}}
{{package}}
{{payment_link}}
{{isp_name}}
```

---

# 38. SMS Automation Rules

Example:

```text
7 days before due
     ↓
Reminder SMS

2 days before
     ↓
Reminder

Due date
     ↓
Final reminder

After grace period
     ↓
Disconnect

Payment received
     ↓
Reconnect + confirmation
```

---

# 39. SMS Gateway

Admin can configure:

* Gateway name
* API URL
* API key
* Sender ID
* Username
* Password

Also:

* Delivery reports
* Failed messages
* SMS balance
* Logs
* Retry

---

# 40. Reseller Management

Two reseller types.

## MAC Reseller

Fields:

* Username
* Password
* Zone
* MikroTik
* Commission
* Credit
* Status
* SMS permission

Capabilities:

* Add customer
* Manage customers
* See credit
* View commission
* View payments

---

# 41. Reseller Wallet

Example:

```text
Opening Balance: ৳5,000
Added: ৳1,000
Used: ৳500

Current: ৳5,500
```

Wallet ledger must be immutable.

---

# 42. Bandwidth Reseller

Fields:

* Username
* Zone
* Bandwidth package
* Allocated bandwidth
* Soft limit
* Price per Mbps
* VAT
* IP Pool
* Subnet
* PPP profile

Example:

```text
Bandwidth: 200 Mbps
Soft Limit: 10%

Allowed:
220 Mbps
```

Monthly invoice generation.

---

# 43. Reseller Portal

Don't force resellers to use the main admin interface.

Create:

```text
reseller.yourisp.com
```

They see only their permitted data.

Dashboard:

* Customers
* Active
* Due
* Wallet
* Commission
* Revenue
* Payments
* Tickets

---

# 44. Employee Management

Create employee:

* Name
* Username
* Password
* Phone
* Email
* Role
* Zone
* Status

---

# 45. RBAC

Use proper granular permission management.

Roles:

### Super Admin

Everything.

### ISP Admin

Everything within ISP.

### Manager

Operations + reports.

### Billing Officer

Billing/payment only.

### Support Agent

Customers + tickets.

### Network Engineer

MikroTik + OLT + network.

### Collector

Payment collection.

### Reseller

Only reseller data.

### Employee

Zone-specific permissions.

---

# 46. Zone-Based Permissions

Employee assigned:

```text
Zone: Mirpur
```

They cannot access:

```text
Uttara
Dhanmondi
Gulshan
```

Unless permission allows it.

---

# 47. Activity Log

Every important operation is logged.

Example:

```text
Admin created customer
Customer: CUST-10293
IP: 192.xxx.xxx.xxx
Time: 19:42
```

Track:

* Login
* Logout
* Customer creation
* Customer deletion
* Payment
* Discount
* Package change
* Suspension
* Reconnection
* MikroTik change
* OLT action
* Employee creation
* Password change
* Settings change

---

# 48. Ticketing / CRM

Internal support ticket system.

Ticket:

```text
#TKT-1001

Customer:
Rahim

Subject:
Internet slow

Priority:
High

Assigned:
Network Team

Status:
Open
```

Statuses:

* Open
* Assigned
* In progress
* Waiting
* Resolved
* Closed

---

# 49. CRM Customer Timeline

This is where IPS BD becomes more than billing software.

Customer timeline:

```text
Customer Created
      ↓
Package Changed
      ↓
Invoice Generated
      ↓
SMS Sent
      ↓
Payment Received
      ↓
Internet Enabled
      ↓
Ticket Created
      ↓
Issue Resolved
```

One place to understand the customer.

---

# 50. BTRC / Regulatory Reporting

Create a reporting module for required ISP regulatory datasets.

Features:

* Monthly report generation
* Customer information export
* Subscriber statistics
* Connection statistics
* Bandwidth/service reports
* CSV/Excel/PDF
* Historical reports

Important: exact BTRC reporting fields should be implemented against the **current BTRC requirements**, rather than hard-coding assumptions from the reference software.

---

# 51. Finance

Create a real finance module.

### Money In

* Customer payment
* Reseller payment
* Other income

### Money Out

* Bandwidth
* Staff salary
* Electricity
* Office rent
* Equipment
* Maintenance
* Transport
* Other expense

---

# 52. Wallet / Account Management

Example:

```text
bKash Account
Cash Account
Bank Account
Nagad Account
```

Transfers:

```text
bKash → Bank
Cash → Bank
Nagad → bKash
```

Every transfer generates a ledger entry.

---

# 53. Financial Dashboard

Show:

* Total income
* Total expense
* Net profit
* Receivable
* Payable
* Cash balance
* Bank balance
* Gateway balance
* MRR
* ARPU
* Collection rate

---

# 54. Revenue Reports

Reports:

* Daily revenue
* Weekly
* Monthly
* Yearly
* Zone-wise
* Package-wise
* Reseller-wise
* Payment-method-wise
* Employee-wise
* Collection officer-wise

---

# 55. Bandwidth Calculator

Input:

```text
Purchased bandwidth:
500 Mbps

Monthly cost:
৳50,000
```

Calculate:

* Cost per Mbps
* Cost per 10 Mbps
* Cost per customer
* Monthly bandwidth cost
* Estimated margin

---

# 56. Package Profitability

Example:

```text
Package:
10 Mbps

Selling:
৳1,000

Estimated network cost:
৳100

Gross contribution:
৳900

Margin:
90%
```

This should use configurable cost models rather than simplistic bandwidth cost alone.

---

# 57. AI Revenue Analysis

This should become one of IPS BD's flagship features.

AI analyzes:

* Payment behavior
* Customer churn
* Overdue behavior
* Package popularity
* Zone performance
* Revenue trends
* Disconnects
* Reconnects
* Discounts
* Collection rate

Then produces:

### Revenue forecast

```text
Expected next-month revenue
৳206,420
```

### Collection prediction

```text
Expected collection
68%
```

### Risk

```text
High cash-flow risk
```

---

# 58. AI Revenue Leakage Detector

This is particularly valuable.

Detect:

### Active customer not paying

Customer is online but has outstanding bill.

### Underpayment

Package:

```text
৳1,000
```

Customer consistently pays:

```text
৳800
```

### Long-term non-payer

Customer repeatedly uses service without payment.

### Disconnected revenue loss

Disconnected customers represent lost MRR.

---

# 59. AI Customer Risk Score

Each customer:

```text
Payment Risk
████████░░ 82%
```

Factors:

* Late payments
* Missed payments
* Partial payments
* Previous disconnects
* Payment frequency
* Usage behavior
* Package history

Categories:

🟢 Low risk
🟡 Medium
🔴 High

---

# 60. AI Zone Intelligence

Example:

```text
Highest Outstanding Zone

Mirpur
11 customers
Outstanding: ৳9,700

Recommendation:
Targeted collection visit
```

This gives management actionable intelligence rather than just charts.

---

# 61. AI Package Intelligence

Show:

```text
Most Popular
10 Mbps

Highest Revenue
20 Mbps

Highest Margin
15 Mbps

Lowest Performing
5 Mbps
```

---

# 62. AI Business Assistant

Add a conversational assistant:

> "How much did we collect this month?"

> "Which zone has the highest due?"

> "Show customers who haven't paid for 60 days."

> "Which package makes the highest margin?"

> "Why did revenue fall this month?"

> "Which MikroTik has the highest CPU?"

The assistant should query **only the current ISP tenant's authorized data**.

---

# 63. AI Recommendations

Instead of only saying:

> Revenue is falling.

IPS BD should say:

> Revenue decreased 7.2% compared with last month. 61% of the decline is associated with overdue accounts in Mirpur and Uttara. 14 high-risk customers account for ৳18,400 outstanding.

That's much more valuable.

---

# 64. Customer Import

For existing ISPs:

### Download template

CSV:

```text
Name
Customer ID
Phone
Address
Zone
Package
PPPoE Username
PPPoE Password
IP
MAC
MikroTik
OLT
ONU
Billing Date
```

Upload.

Then:

```text
Validate
   ↓
Preview
   ↓
Detect errors
   ↓
Confirm
   ↓
Import
   ↓
Sync Network
```

---

# 65. Import Validation

Before importing thousands of customers:

Detect:

* Duplicate customer ID
* Duplicate username
* Invalid phone
* Invalid IP
* Missing package
* Invalid MikroTik
* Invalid zone
* Duplicate MAC

Show:

```text
1,245 records

Valid: 1,218
Errors: 21
Duplicates: 6
```

User can download the error report.

---

# 66. Automation Engine

This should be a separate platform-level module.

Example:

```text
WHEN
Invoice becomes overdue

IF
Amount > ৳1,000

THEN
Send SMS
Wait 2 days
Disconnect
Create notification
```

Future:

Visual workflow builder.

```text
Trigger → Condition → Action
```

---

# 67. WhatsApp Integration

Future/high-value feature:

* Invoice
* Payment confirmation
* Due reminder
* Support
* Promotional campaigns
* Service notification

Using official WhatsApp Business APIs.

---

# 68. Email System

Automatic:

* Invoice
* Payment receipt
* Welcome
* Password reset
* Ticket update
* Network outage
* Admin alerts

---

# 69. Push Notifications

Web + mobile:

* Payment
* Network down
* OLT issue
* Backup failure
* High-risk customer
* New ticket

---

# 70. Network Alert Engine

Configurable thresholds.

Example:

```text
CPU > 80%
→ Warning

CPU > 95%
→ Critical
```

Likewise:

* RAM
* Interface traffic
* ONU signal
* Device uptime
* Connection failure

---

# 71. Incident Management

When network failure occurs:

```text
OLT-02 DOWN
      ↓
Incident created
      ↓
Affected zone identified
      ↓
Affected customers identified
      ↓
Admin notified
      ↓
Technician assigned
      ↓
Incident resolved
```

This is a major hybrid feature.

---

# 72. Customer Outage Notification

If a zone goes down:

IPS BD can automatically notify affected customers:

> "We are currently experiencing a network interruption in your area. Our technical team is working to restore service."

When restored:

> "Internet service has been restored."

---

# 73. Technician Management

Add:

* Technician
* Zone
* Phone
* Skills
* Assigned incidents
* Assigned tickets
* Job history

Field job:

```text
Ticket
 ↓
Technician
 ↓
Location
 ↓
Work
 ↓
Photo
 ↓
Note
 ↓
Resolved
```

---

# 74. Inventory

Add equipment management.

Track:

* ONU
* OLT
* MikroTik
* Router
* Switch
* SFP
* Fiber
* Adapter
* UPS
* Tools

Inventory status:

* Available
* Assigned
* Damaged
* Maintenance
* Lost
* Retired

---

# 75. Customer Equipment

Customer profile can show:

```text
ONU
Serial:
ABC123

Assigned:
12 Aug 2026

Technician:
Rahim
```

---

# 76. Complaint History

Customer:

```text
Total Tickets: 8
Resolved: 7
Open: 1

Average Resolution:
2h 17m
```

This creates useful CRM intelligence.

---

# 77. SLA

For business customers:

```text
Priority:
Critical

SLA:
2 Hours

Response:
15 minutes
```

Track SLA breaches.

---

# 78. Reports Center

Central reporting module.

Categories:

### Customers

### Billing

### Payments

### Network

### OLT

### MikroTik

### Resellers

### Employees

### Finance

### AI

### Regulatory

### Tickets

Export:

* PDF
* Excel
* CSV

---

# 79. Search

Global search should be extremely powerful.

Search:

```text
Rahim
017xxxxxxxx
PPPoE123
192.168.1.10
ONU123
INV-10291
```

Return:

```text
Customer
Invoice
Payment
Ticket
Network device
Activity
```

---

# 80. Advanced Filters

Every major table should support:

* Search
* Date range
* Zone
* Status
* Package
* Device
* Payment method
* Employee
* Reseller
* Amount range

And:

**Save Filter**

Example:

> High Risk Customers — Mirpur

---

# 81. Dark Mode

Full application dark mode.

Not just dashboard.

Everything:

* Login
* Sidebar
* Tables
* Forms
* Charts
* Network diagram
* Maps
* Modals
* Invoice preview

User preference saved per account.

---

# 82. Responsive Design

Must support:

### Desktop

Full dashboard.

### Laptop

Optimized layout.

### Tablet

Collapsible navigation.

### Mobile

Dedicated mobile UX.

Do not simply shrink desktop UI onto mobile.

---

# 83. Mobile App

For Phase 2:

### ISP Owner App

* Revenue
* Due
* Customers
* Network
* Alerts
* Payments
* Tickets
* AI insights

### Employee App

* Assigned tickets
* Customer search
* Collection
* Technician jobs
* Location
* Customer details

### Customer App

* Bill
* Payment
* Internet status
* Ticket
* Notifications

---

# 84. Security Architecture

This must be treated as an enterprise system.

### Required

* HTTPS
* Encryption at rest where appropriate
* Password hashing
* RBAC
* Tenant isolation
* API authentication
* Rate limiting
* CSRF protection
* XSS protection
* SQL injection protection
* Audit logs
* 2FA
* Session control
* IP/device logging
* Backup encryption
* Secrets management

Never store MikroTik passwords in plain text.

---

# 85. MikroTik / OLT Credentials

Use encrypted credential storage.

Ideally:

```text
Application
     ↓
Credential Vault
     ↓
Encrypted Secret
     ↓
Network Connector
```

The frontend should never receive raw credentials unnecessarily.

---

# 86. API Architecture

Recommended:

```text
Frontend
   ↓
API Gateway
   ↓
Authentication
   ↓
Application Services
   ↓
Database
```

Separate services:

```text
Billing Service
Customer Service
Network Service
Payment Service
Notification Service
AI Service
Reporting Service
Backup Service
```

For an MVP, these can initially live in a modular monolith and later be extracted into services.

---

# 87. Recommended Tech Stack

For IPS BD, I would recommend:

### Frontend

**Next.js + React + TypeScript**

UI:

* Tailwind CSS
* shadcn/ui
* Recharts
* TanStack Table
* React Query
* React Hook Form

### Backend

**NestJS + TypeScript**

or a structured Node.js backend.

### Database

**PostgreSQL**

### Cache

**Redis**

### Queue

**BullMQ / Redis**

Useful for:

* SMS
* invoice generation
* payments
* backups
* network polling
* notifications
* scheduled jobs

### Realtime

WebSocket / Socket.IO

For:

* Live sessions
* Network status
* Notifications
* Dashboard

---

# 88. Network Integration Layer

Create a dedicated abstraction:

```text
Network Integration Layer
       │
 ┌─────┼─────────┐
 │     │         │
MikroTik OLT   SNMP
```

This is important because you may eventually support:

* MikroTik
* Huawei OLT
* ZTE OLT
* FiberHome
* VSOL
* EPON/GPON devices
* Other vendors

Do not hard-code the whole application around one OLT vendor.

---

# 89. Background Workers

IPS BD will have thousands of scheduled operations.

Workers handle:

```text
Invoice generation
Payment verification
Auto disconnect
Auto reconnect
SMS
Email
OLT polling
MikroTik polling
Backup
AI analysis
Reports
```

This prevents the main application from becoming slow.

---

# 90. Subscription System for IPS BD

Since IPS BD itself is a SaaS, create:

### Plans

Example:

**Starter**

* 500 customers

**Growth**

* 2,000 customers

**Business**

* 10,000 customers

**Enterprise**

* Unlimited/custom

Possible billing:

* Monthly
* Yearly

Add-ons:

* Extra SMS
* Extra storage
* AI credits
* WhatsApp
* Advanced monitoring
* Additional technicians
* White-label
* Custom domain

---

# 91. IPS BD Super Admin Panel

This is separate from the ISP dashboard.

You control:

```text
IPS BD Super Admin
```

See:

* Total ISPs
* Active subscriptions
* Revenue
* Customers across platform
* System health
* API usage
* Storage
* SMS usage
* Payment gateways
* Subscription status

But **you should never expose one ISP's business data to another ISP**.

---

# 92. Super Admin Tenant Management

```text
ISP
 ├── Company
 ├── Owner
 ├── Plan
 ├── Customers
 ├── Usage
 ├── Domain
 ├── Branding
 └── Subscription
```

Actions:

* Activate
* Suspend
* Upgrade
* Downgrade
* Reset
* Support access
* Domain verification
* Usage monitoring

---

# 93. Support Access

Very important for SaaS.

If IPS BD support needs access:

Use:

**Temporary Support Session**

Example:

```text
Support requested access
Duration: 30 minutes
Reason: OLT integration issue
```

Everything support does is logged.

This is much safer than permanent master access.

---

# 94. Custom Domain System

Flow:

```text
ISP enters:
billing.abcinternet.com

        ↓

IPS BD provides DNS instructions

        ↓

ISP adds DNS

        ↓

Verify

        ↓

SSL automatically issued

        ↓

Domain Active
```

---

# 95. Onboarding Wizard

When an ISP first joins:

### Step 1

Company

### Step 2

Branding

### Step 3

Domain

### Step 4

MikroTik

### Step 5

OLT

### Step 6

Packages

### Step 7

Payment gateways

### Step 8

SMS

### Step 9

Import customers

### Step 10

Go Live

Progress:

```text
████████████████░░ 85%
```

---

# 96. ISP Setup Checklist

System should tell the owner:

```text
✓ Company profile
✓ Logo
✓ Domain
✓ MikroTik
✓ OLT
✓ Package
✓ Payment gateway
✓ SMS gateway
✓ Billing date
✓ Invoice settings
✓ Customer import

Setup complete.
```

---

# 97. Data Model — Core Entities

At minimum:

```text
Tenant
User
Role
Permission
Employee
Customer
CustomerNetwork
Package
Zone
SubZone
MikroTik
OLT
ONU
PON
Splitter
Invoice
InvoiceItem
Payment
PaymentGateway
Wallet
Transaction
Expense
Reseller
ResellerWallet
BandwidthReseller
Ticket
Message
SMSTemplate
Notification
ActivityLog
Backup
NetworkIncident
AIInsight
AIAlert
Inventory
Equipment
Subscription
Domain
Branding
```

---

# 98. Billing State Machine

Don't implement billing as scattered if/else statements.

Use clear states:

```text
ACTIVE
 ↓
INVOICED
 ↓
DUE
 ↓
GRACE
 ↓
SUSPENDED
 ↓
DISCONNECTED
```

Payment:

```text
PAYMENT RECEIVED
       ↓
VERIFIED
       ↓
INVOICE PAID
       ↓
SERVICE ACTIVE
```

This will make the system much more reliable.

---

# 99. Customer Status Engine

Similarly:

```text
ACTIVE
ONLINE
OFFLINE
DUE
GRACE
SUSPENDED
DISCONNECTED
DELETED
```

Network status and billing status should be separate.

For example:

> Billing status = PAID
> Network status = OFFLINE

That distinction is extremely important.

---

# 100. Event-Driven Automation

Use events.

Example:

```text
PaymentReceived
      ↓
InvoicePaid
      ↓
ReconnectCustomer
      ↓
UpdateCustomer
      ↓
SendSMS
      ↓
CreateActivityLog
```

Another:

```text
OLTOffline
    ↓
CreateIncident
    ↓
NotifyAdmin
    ↓
IdentifyAffectedZone
    ↓
IdentifyAffectedCustomers
```

This will make IPS BD much more scalable.

---

# 101. What Makes IPS BD Different

Don't market it as:

> "ISP billing software."

Market it as:

> **An intelligent ISP operating system.**

Because IPS BD combines:

**Billing + CRM + Network + OLT + MikroTik + Finance + Reseller + Automation + AI + Customer Portal + Support**

in one system.

---

# 102. IPS BD Navigation Structure

I recommend this sidebar:

```text
IPS BD

▣ Dashboard

CUSTOMERS
  ├── Customers
  ├── Live Status
  ├── Due Customers
  ├── Disconnected
  └── Import

BILLING
  ├── Invoices
  ├── Payments
  ├── Packages
  ├── Discounts
  └── Billing Settings

NETWORK
  ├── Network Map
  ├── MikroTik
  ├── OLT
  ├── ONU/ONT
  ├── Zones
  ├── Incidents
  └── Monitoring

RESELLERS
  ├── MAC Reseller
  ├── Bandwidth Reseller
  └── Wallets

CRM
  ├── Tickets
  ├── Customer Timeline
  ├── Messages
  └── Support

FINANCE
  ├── Accounts
  ├── Transactions
  ├── Expenses
  └── Reports

AUTOMATION
  ├── SMS
  ├── Workflows
  └── Notifications

AI INTELLIGENCE
  ├── Revenue Analysis
  ├── Leakage Detector
  ├── Customer Risk
  ├── Forecast
  └── AI Assistant

REPORTS
  ├── Revenue
  ├── Customer
  ├── Network
  ├── BTRC
  └── Custom Reports

SYSTEM
  ├── Employees
  ├── Activity Logs
  ├── Backups
  ├── Integrations
  └── Settings
```

---

# 103. Premium Dashboard Layout

I would make the main UI roughly:

```text
┌─────────────────────────────────────────────────────────┐
│ IPS BD       Search...       🔔     Admin ▾             │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│ Dashboard    │ Good evening, Admin                      │
│              │                                          │
│ Customers    │ ┌────────┐ ┌────────┐ ┌────────┐        │
│ Billing      │ │Customers│ │Revenue │ │ Due    │        │
│ Network      │ │ 12,840 │ │৳12.4M  │ │৳420K  │        │
│ Resellers    │ └────────┘ └────────┘ └────────┘        │
│ CRM          │                                          │
│ Finance      │ Revenue Analytics                        │
│ Automation   │ ┌────────────────────────────────────┐   │
│ AI           │ │                                    │   │
│ Reports      │ │          Revenue Graph             │   │
│              │ │                                    │   │
│ Settings     │ └────────────────────────────────────┘   │
│              │                                          │
│              │ Network Health     AI Insights           │
│              │ MikroTik ●         Revenue ↑             │
│              │ OLT-01   ●         Risk ⚠                │
│              │ OLT-02   🔴        Leakage ⚠             │
└──────────────┴──────────────────────────────────────────┘
```

---

# 104. Premium Design Language

Avoid:

❌ Too many gradients
❌ Excessive shadows
❌ Huge cards
❌ Too many colors
❌ Cluttered tables
❌ Old-fashioned Bootstrap look
❌ Too many icons
❌ Giant text

Use:

✅ Lots of white space
✅ Deep maroon accents
✅ Thin borders
✅ Elegant typography
✅ Compact professional tables
✅ Smart charts
✅ Smooth micro-interactions
✅ Consistent spacing
✅ Premium empty states
✅ Excellent mobile responsiveness

---

# 105. Recommended Development Phases

Don't attempt every feature simultaneously.

## Phase 1 — Core Foundation

* Multi-tenancy
* Authentication
* White label
* Branding
* Dashboard
* Customers
* Zones
* Packages
* Employees
* RBAC

## Phase 2 — Billing

* Invoices
* Payments
* bKash
* Nagad
* SSLCommerz
* Auto billing
* Auto disconnect
* Auto reconnect
* Grace period
* SMS

## Phase 3 — MikroTik

* Server management
* API
* PPPoE
* Hotspot
* Static IP
* Live sessions
* Sync
* Backup
* Migration

## Phase 4 — OLT

* OLT integration
* ONU
* PON
* Discovery
* Monitoring
* Events
* Logs

## Phase 5 — Network Intelligence

* Network map
* Zone map
* Sub-zone
* Splitter
* Incidents
* Outage detection

## Phase 6 — CRM

* Tickets
* Customer timeline
* Employee workflow
* Technician
* Support

## Phase 7 — Finance

* Wallets
* Expenses
* Accounts
* Profit
* Revenue reports

## Phase 8 — Resellers

* MAC reseller
* Bandwidth reseller
* Wallet
* Commission
* Reseller portal

## Phase 9 — AI

* Revenue forecast
* Leakage detection
* Customer risk
* Zone intelligence
* Package intelligence
* AI assistant

## Phase 10 — Enterprise

* Mobile apps
* WhatsApp
* Advanced analytics
* Workflow builder
* Advanced SLA
* Inventory
* Advanced reporting

---

# 106. The Most Important MVP

If you're actually starting development now, I would **not** start with the AI.

The first production-ready version should be:

```text
White Label
+
Customer Management
+
Packages
+
Billing
+
Payments
+
Auto Disconnect/Reconnect
+
MikroTik
+
OLT
+
SMS
+
Employee/RBAC
+
Dashboard
+
Reports
```

Once these are stable, AI can sit on top of real operational data.

---

# 107. IPS BD's Core USP

The homepage should communicate something like this conceptually:

### One ISP. One Platform.

```text
Customers
     +
Billing
     +
Payments
     +
MikroTik
     +
OLT
     +
CRM
     +
Finance
     +
Automation
     +
AI
```

**Everything connected.**

The strongest differentiation is not having the longest feature list. It is making all these modules **talk to each other automatically**.

For example:

> Customer pays through bKash → payment verified → invoice paid → MikroTik service re-enabled → customer status updated → SMS sent → ledger updated → activity logged → dashboard revenue updated.

That is the real **IPS BD hybrid architecture**.

---

# 108. Final Product Vision

The finished IPS BD ecosystem should look like:

```text
                         IPS BD
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     BUSINESS            NETWORK           CUSTOMER
        │                  │                  │
   Billing              MikroTik          Portal
   Finance              OLT               Payment
   Revenue              ONU               SMS
   Reseller             PON               Ticket
   Reports              Monitoring        CRM
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                      AUTOMATION
                           │
                    ┌──────┴──────┐
                    │             │
                   AI          WORKFLOW
                    │             │
             Forecasting      Auto Billing
             Risk Analysis    Auto SMS
             Leakage          Auto Disconnect
             Insights         Auto Reconnect
```

### The final positioning:

**IPS BD isn't just an ISP billing system.**

It becomes an **ISP Operating System** where the ISP owner can manage:

**Customers → Network → OLT → MikroTik → Billing → Payments → Employees → Resellers → Finance → Support → Automation → AI**

from one premium, white-label platform.



here is the all details and the architecture so you have to build this with proper detail use premium design don’t use local emoji use premium icons and make it higer level and premium quality 