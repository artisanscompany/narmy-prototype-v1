# NARMY Personnel Self-Service Portal — Prototype Design Spec

## Overview

A bid prototype for the Nigerian Army Personnel Self-Service Portal. Demonstrates a modern, fully responsive web application where personnel can view pay, raise complaints, and download documents — and where admins can manage tickets, view analytics, and administer users.

**Stack:** TanStack Router + React 19 + Tailwind CSS v4 + shadcn/ui + Recharts
**Deployment:** Cloudflare Workers (static assets)
**Data:** Fully mocked client-side with localStorage persistence
**Target:** Bid demo — 5 hardcoded user accounts, no real backend

---

## 1. Authentication

### Login Screen
- Split-screen cinematic layout: brand panel (left) + login form (right)
- Left panel: Nigerian Army branding, tagline, trust indicators (personnel count, divisions, uptime SLA)
- Right panel: two-field form — Army Number (text, monospace) + Salary Account Number (password with show/hide toggle)
- Validation against hardcoded user fixtures (5 demo accounts)
- On success: store user in AuthContext + localStorage, redirect based on role
- On failure: inline error message with subtle card shake animation
- Responsive: stacks vertically on mobile (brand panel collapses to compact header)

### Demo Users

| # | Name | Army Number | Salary Account | Role | Special |
|---|------|-------------|----------------|------|---------|
| 1 | Captain James Adeyemi | NA/23/01234 | SAL-001-2024 | Personnel (Officer) | Short-paid month for discrepancy demo |
| 2 | Private Ibrahim Musa | NA/15/05678 | SAL-002-2024 | Personnel (Soldier) | "Needs More Info" ticket |
| 3 | Corporal Fatima Bello | NA/20/09012 | SAL-003-2024 | Personnel (Soldier) | AWOL status + active complaint about incorrect marking |
| 4 | Major Sarah Okonkwo | DA/10/00456 | SAL-101-2024 | Division Admin | Scoped to 1 Infantry Division |
| 5 | Colonel David Nwachukwu | SA/05/00123 | SAL-201-2024 | Super Admin | Full system access |

### Session Management
- AuthContext wraps the entire app
- On refresh, hydrate from localStorage
- Logout clears context + localStorage, redirects to /login
- Route guards redirect unauthenticated users to /login
- Role-based route guards prevent personnel from accessing admin routes (redirect to their dashboard)

---

## 2. Layout & Navigation

### Global Layout (All Roles)
- **shadcn Sidebar** — collapsible sidebar on the left, consistent across all roles
- **Top header bar** — Nigerian Army branding (star icon + "NARMY"), current user info (name, rank, division), avatar initials, logout button
- **Main content area** — scrollable, max-width constrained, cream/sand background (#F5F0E8)
- Sidebar uses shadcn's `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenuItem` components
- Collapsible to icon-only mode on desktop; drawer overlay on mobile

### Personnel Sidebar Items
- Dashboard (home icon)
- Pay & Documents (wallet icon)
- Complaints (message-circle icon)
- Help & Support (help-circle icon)

### Division Admin Sidebar Items
- Dashboard (layout-dashboard icon)
- Ticket Management (ticket icon)
- Analytics (bar-chart icon)
- User Management (users icon) — view only, cannot change roles
- RBAC Matrix (shield icon)

### Super Admin Sidebar Items
- Dashboard (layout-dashboard icon)
- Ticket Management (ticket icon)
- Analytics (bar-chart icon)
- User Management (users icon) — full CRUD
- RBAC Matrix (shield icon)

### Color System
| Token | Value | Usage |
|-------|-------|-------|
| army-dark | #0B2E1A | Sidebar bg, dark UI elements |
| army | #1B5E35 | Primary buttons, active states |
| army-mid | #2E7D4F | Hover states, secondary accents |
| army-gold | #C8A84B | Accent highlights, badges, important numbers |
| army-cream | #F5F0E8 | Page background |
| army-sand | #E8E0D0 | Card borders, dividers |

---

## 3. Personnel Module

### 3.1 Personnel Dashboard
- Personalized greeting with time-of-day context ("Good morning, Captain Adeyemi")
- Current month context ("March 2026")
- Quick action buttons: "Download Payslip" + "Raise Complaint"
- 4 status cards (color-coded top borders):
  - Net Pay — current month, monospace, payment status
  - Service Status — Active Duty / AWOL / etc.
  - Rank & Grade — rank, grade level, step, corps
  - Open Complaints — count + latest status
- Pay breakdown card — line items for salary components, deductions, net total in gold on dark row
- Service details card — army number, division, trade, years of service
- Latest complaint card — status badge, ticket ID, description, filed date

### 3.2 AWOL Status Treatment (Corporal Fatima Bello)
- Non-dismissable full-width red/amber banner below the header: "Your status is currently marked as AWOL. Some services may be restricted. If this is incorrect, file a complaint."
- Service Status card turns red with "AWOL" label
- Restriction notices on certain actions (e.g., "Status under review" overlay on download payslip)
- Active complaint about AWOL marking is surfaced prominently on dashboard

### 3.3 Pay & Documents Page
- **Payslip History** — table/list of monthly payslips (last 12 months)
  - Each row: month, gross pay, deductions, net pay, status (paid/short-paid), download button
  - Short-paid month (February for Capt. Adeyemi) highlighted in amber with discrepancy badge
  - Click to expand detailed breakdown
- **Payslip PDF Download** — client-side PDF generation using `@react-pdf/renderer`
  - Formatted payslip with Nigerian Army header, user details, line-item breakdown, signatures section
  - Generated with real mock data for the logged-in user
- **Tax Exemption Certificate** — downloadable PDF
  - Generated with user data (name, army number, tax year, exemption details)
  - Styled with official-looking header and formatting

### 3.4 Complaints Module
- **Raise New Complaint**
  - Step 1: Select category (Pay & Allowances, Service Records, Postings & Transfers, Status Issues, Other)
  - Step 2: Select subcategory (context-dependent on category)
  - Step 3: Describe issue (textarea), optional file attachment placeholder
  - Step 4: Review and submit
  - On submit: generates ticket ID (TKT-YYYY-XXXX), adds to local state, redirects to complaint detail
- **Complaint History** — list of all complaints for the user
  - Each item: ticket ID, category, date filed, current status (badge), last update
  - Filter by status: All / Open / Under Review / Resolved / Escalated
  - Sort by date or status
- **Complaint Detail View** — timeline of events
  - Status progression: Submitted → Under Review → Needs More Info → Resolved (or Escalated)
  - Timeline entries with timestamps, status changes, admin notes (from mock data)
  - Current status prominently displayed
  - SLA indicator (days since filed, expected resolution time)

### 3.5 Help & Support Page
- FAQ accordion (shadcn Accordion) — common questions about pay, complaints, portal usage
- Contact channels: WhatsApp link, phone number, email address
- Each channel in a card with icon, description, and action button
- Division Admin contact info for the user's division

---

## 4. Admin Module

### 4.1 Admin Dashboard
- **Division Admin** sees stats scoped to their division only
- **Super Admin** sees stats across all divisions
- KPI cards: Total Open Tickets, Avg Resolution Time (days), SLA Breach Rate (%), Tickets Resolved This Month
- Charts (Recharts via shadcn charts):
  - Bar chart: tickets by category
  - Line chart: monthly ticket trend (6 months)
  - Donut/pie chart: ticket status distribution
  - Stacked bar: tickets by division (Super Admin only)
  - Table/heatmap: SLA compliance by division (Super Admin only)
- Filterable by date range (preset: 7d, 30d, 90d, All)

### 4.2 Ticket Management
- Table view of all tickets (scoped by role)
- Columns: Ticket ID, Personnel Name, Category, Status, Priority, Division, Filed Date, SLA Age
- Sortable by any column
- Filterable by: status, category, division (Super Admin), SLA status (within/breached)
- Search by ticket ID or personnel name
- Click row to open ticket detail:
  - Full complaint info, timeline, personnel details
  - **Actions:** Update status (dropdown), add internal note (textarea + submit), escalate to HQ (Division Admin), assign to division (Super Admin)
  - Status changes and notes persist to local state and appear in the timeline
  - Escalation creates a visual marker in the timeline

### 4.3 Analytics Page
- Expanded version of dashboard charts with more detail
- Division Admin: their division's data only
- Super Admin: cross-division comparison views
- Chart types: bar, line, donut, stacked bar
- All charts use the army color palette (green, gold, sand tones)
- Date range filter affects all charts simultaneously

### 4.4 User Management
- Table of all users (scoped by role)
- Columns: Name, Army Number, Rank, Division, Role, Status
- Division Admin: can view users in their division, cannot modify roles
- Super Admin: full access, can change user roles (dropdown in table row)
- Search and filter by division, rank, role, status

### 4.5 RBAC Matrix Page
- Visual matrix showing permissions by role
- Rows: actions (View Dashboard, View Pay, Download Payslip, Raise Complaint, Manage Tickets, View Analytics, Manage Users, etc.)
- Columns: Personnel, Division Admin, Super Admin
- Check/cross icons for each permission
- Read-only informational page — demonstrates the RBAC model to evaluators

---

## 5. Data Layer

### Mock Data Structure
All data lives in `src/data/` as TypeScript files exporting typed constants.

```
src/data/
  users.ts          — 5 demo user objects with full profile data
  payslips.ts       — 12 months of payslip data per personnel user (3 users × 12 months)
  complaints.ts     — pre-seeded complaints with timeline events
  categories.ts     — complaint category/subcategory tree
  analytics.ts      — pre-computed analytics data for charts
```

### State Management (React Context + localStorage)
```
src/contexts/
  AuthContext.tsx    — current user, login/logout, role checks
  DataContext.tsx    — complaints, payslips, user list; mutations update state + localStorage
```

- AuthContext: `{ user, login, logout, isAuthenticated, hasRole }`
- DataContext: `{ complaints, addComplaint, updateComplaintStatus, addNote, payslips, users, updateUserRole }`
- On app load: hydrate from localStorage, fall back to fixture data
- On mutation: update context state, persist to localStorage
- Each context is split to minimize re-renders (auth changes don't trigger data re-renders)

### Type Definitions
```
src/types/
  user.ts           — User, UserRole, PersonnelType, ServiceStatus
  payslip.ts        — Payslip, PayComponent, PayslipStatus
  complaint.ts      — Complaint, ComplaintStatus, TimelineEvent, Category, Subcategory
  analytics.ts      — ChartData, KPIData, DivisionStats
```

---

## 6. Routing

TanStack Router file-based routing:

```
src/routes/
  __root.tsx                    — root layout (AuthContext + DataContext providers)
  login.tsx                     — login page (no sidebar)
  _authenticated.tsx            — layout with sidebar + header (requires auth)
  _authenticated/
    _personnel.tsx              — personnel layout guard (role check)
    _personnel/
      dashboard.tsx             — personnel dashboard
      pay.tsx                   — pay & documents
      complaints/
        index.tsx               — complaint list
        new.tsx                 — raise new complaint (multi-step form)
        $complaintId.tsx        — complaint detail with timeline
      help.tsx                  — help & support
    _admin.tsx                  — admin layout guard (role check)
    _admin/
      dashboard.tsx             — admin dashboard with KPIs + charts
      tickets/
        index.tsx               — ticket management table
        $ticketId.tsx           — ticket detail + actions
      analytics.tsx             — full analytics page
      users.tsx                 — user management
      rbac.tsx                  — RBAC matrix
```

- `_authenticated.tsx` checks AuthContext, redirects to /login if not authenticated
- `_personnel.tsx` checks role is 'personnel', redirects to admin dashboard if admin
- `_admin.tsx` checks role is 'divisionAdmin' or 'superAdmin', redirects to personnel dashboard if personnel
- Default redirect after login: personnel → /dashboard, admin → /admin/dashboard
- Root path `/` redirects to `/login` if unauthenticated, or to the appropriate dashboard if authenticated

---

## 7. PDF Generation

Using `@react-pdf/renderer` for client-side PDF creation.

### Payslip PDF
- Nigerian Army header with star emblem (rendered in PDF, not an image)
- User details: name, army number, rank, division, month/year
- Table: pay component, amount (earnings vs deductions separated)
- Net pay total row
- Footer: "This is a computer-generated document"

### Tax Exemption Certificate
- Formal certificate layout
- User details, tax year, exemption basis
- "Authorized for official use" footer
- Certificate number (generated from user data + year)

---

## 8. Responsive Design

### Breakpoints
- Mobile: < 768px — sidebar becomes drawer overlay, cards stack vertically, tables become card lists
- Tablet: 768px–1024px — sidebar collapsible, 2-column grids
- Desktop: > 1024px — full sidebar, multi-column layouts, full tables

### Key Responsive Behaviors
- Login: split-screen → stacked (brand panel becomes compact header on mobile)
- Sidebar: persistent on desktop, drawer overlay on mobile with hamburger trigger
- Dashboard cards: 4-column → 2-column → 1-column
- Data tables: full table on desktop, card-based list on mobile
- Charts: full width on all breakpoints, responsive container

---

## 9. Component Library

All UI components from **shadcn/ui**:
- Sidebar, Button, Card, Input, Label, Badge, Table, Dialog, Accordion
- Select, Textarea, Tabs, Avatar, DropdownMenu, Sheet (mobile sidebar)
- Toast (for success/error notifications)
- Charts (Recharts wrapper from shadcn)

Custom components built with shadcn primitives:
- `StatusBadge` — colored badge for ticket/complaint statuses
- `KPICard` — metric card with icon, value, label, trend indicator
- `TimelineView` — vertical timeline for complaint/ticket events
- `PayslipPDF` / `TaxCertPDF` — react-pdf document components
- `ComplaintForm` — multi-step form wizard
- `AWOLBanner` — non-dismissable warning banner for AWOL users

---

## 10. Out of Scope

- E-Learning module (deferred)
- Real backend / database
- Real authentication / JWT
- Email or push notifications
- File upload (placeholder only in complaint form)
- Officer vs Soldier functional differences (data-only differences, no gated pages)
- Production security (CSRF, rate limiting, etc.)
