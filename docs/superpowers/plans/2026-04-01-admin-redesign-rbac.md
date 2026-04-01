# Admin Redesign + Role-Based CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all admin pages to match personnel UI patterns, add payroll management and user detail routes, and enable role-based CRUD for complaint responses, payslip uploads, and user status management.

**Architecture:** Rebuild each admin page in-place using raw Tailwind cards (`bg-white rounded-xl border border-gray-100`) replacing ShadCN Card wrappers. All pages use `max-w-3xl mx-auto space-y-3`. New routes for `/admin/payroll` and `/admin/users/$userId`. DataContext extended with `addPayslip`, `updatePayslip`, `updateUserStatus` methods.

**Tech Stack:** React, TanStack Router, Tailwind CSS, Recharts, date-fns, Lucide icons, localStorage persistence

---

## File Structure

### Modified Files
- `src/contexts/DataContext.tsx` — add `addPayslip`, `updatePayslip`, `updateUserStatus` methods
- `src/components/app-sidebar.tsx` — add Payroll nav item for admin roles
- `src/components/timeline-view.tsx` — add admin response styling
- `src/routes/_authenticated/admin/dashboard.tsx` — full rebuild
- `src/routes/_authenticated/admin/tickets/index.tsx` — full rebuild (table → cards)
- `src/routes/_authenticated/admin/tickets/$ticketId.tsx` — rebuild with attachment support
- `src/routes/_authenticated/admin/analytics.tsx` — restyle
- `src/routes/_authenticated/admin/users.tsx` — rebuild (table → cards)
- `src/routes/_authenticated/admin/rbac.tsx` — restyle
- `src/routes/_authenticated/_personnel/complaints/$complaintId.tsx` — add admin response visibility

### New Files
- `src/routes/_authenticated/admin/payroll.tsx` — payroll management page
- `src/routes/_authenticated/admin/users/$userId.tsx` — user detail page

---

### Task 1: Extend DataContext with Payslip and User Status Methods

**Files:**
- Modify: `src/contexts/DataContext.tsx`

- [ ] **Step 1: Add `addPayslip` method to DataContext**

In `src/contexts/DataContext.tsx`, add to the `DataContextValue` interface:

```typescript
addPayslip: (payslip: Payslip) => void
updatePayslip: (payslipId: string, updates: Partial<Payslip>) => void
updateUserStatus: (userId: string, newStatus: ServiceStatus) => void
```

Import `ServiceStatus` from `#/types/user`.

Change `payslips` from `useState` with no setter to include a setter:

```typescript
const [payslips, setPayslips] = useState<Payslip[]>(() => loadFromStorage('payslips', PAYSLIPS))
```

Add the three new methods after `updateUserRole`:

```typescript
const addPayslip = useCallback(
  (payslip: Payslip) => {
    const updated = [payslip, ...payslips]
    setPayslips(updated)
    saveToStorage('payslips', updated)
  },
  [payslips],
)

const updatePayslip = useCallback(
  (payslipId: string, updates: Partial<Payslip>) => {
    const updated = payslips.map((p) => (p.id === payslipId ? { ...p, ...updates } : p))
    setPayslips(updated)
    saveToStorage('payslips', updated)
  },
  [payslips],
)

const updateUserStatus = useCallback(
  (userId: string, newStatus: ServiceStatus) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    setUsers(updated)
    saveToStorage('users', updated)
  },
  [users],
)
```

- [ ] **Step 2: Expose new methods in the provider value**

Add `addPayslip`, `updatePayslip`, `updateUserStatus` to the `DataContext.Provider value` object alongside the existing methods.

- [ ] **Step 3: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/contexts/DataContext.tsx
git commit -m "feat: add addPayslip, updatePayslip, updateUserStatus to DataContext"
```

---

### Task 2: Add Payroll Nav Item to Sidebar

**Files:**
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Add Payroll to admin nav items**

Import `Banknote` from `lucide-react` (add to existing import).

In the `adminItems` array, insert after the `Ticket Management` entry and before `Analytics`:

```typescript
{ label: 'Payroll', to: '/admin/payroll', icon: Banknote },
```

The full `adminItems` array becomes:

```typescript
const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'E-Learning', to: '/e-learning', icon: GraduationCap },
  { label: 'Ticket Management', to: '/admin/tickets', icon: Ticket },
  { label: 'Payroll', to: '/admin/payroll', icon: Banknote },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'RBAC Matrix', to: '/admin/rbac', icon: Shield },
  { label: 'Profile', to: '/profile', icon: UserRound },
]
```

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "feat: add Payroll nav item to admin sidebar"
```

---

### Task 3: Rebuild Admin Dashboard

**Files:**
- Modify: `src/routes/_authenticated/admin/dashboard.tsx`

- [ ] **Step 1: Rewrite the admin dashboard**

Replace the entire content of `src/routes/_authenticated/admin/dashboard.tsx` with a new implementation that follows the personnel dashboard patterns. Key structural elements:

**Imports needed:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import {
  KPI_DATA, DIVISION_1_KPI, CATEGORY_CHART_DATA, MONTHLY_TREND_DATA,
} from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import { differenceInDays } from 'date-fns'
import {
  ChevronRight, ArrowUpRight, Ticket, Banknote, Users, BarChart3,
} from 'lucide-react'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Hero card** — `bg-army-dark rounded-2xl relative overflow-hidden` with:
   - Gradient overlay: `absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5`
   - Decorative blur: `absolute -top-20 -right-20 w-56 h-56 bg-army-gold/6 rounded-full blur-[80px]`
   - `relative z-10 px-6 pt-6 pb-5` content area with:
     - `getGreeting()` helper (same as personnel dashboard)
     - `text-xl sm:text-2xl font-bold text-white` greeting with rank + last name
     - `text-xs text-white/30` subtitle showing role + division scope
   - Service chips in `border-t border-white/8 px-6 py-3.5` with `grid grid-cols-2 sm:grid-cols-4`:
     - Role (Division Admin / Super Admin)
     - Division (or "All Divisions")
     - Rank
     - Corps

2. **Stat grid** — `grid grid-cols-2 sm:grid-cols-4 gap-3` with each card:
   ```html
   <div class="bg-white rounded-xl border border-gray-100 px-4 py-3">
     <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
     <p class="text-lg font-extrabold text-army-dark font-mono">{value}{unit}</p>
     <p class="text-xs {isPositive ? 'text-green-600' : 'text-red-500'} font-medium">{trend}% vs last month</p>
   </div>
   ```
   Use `isSuperAdmin ? KPI_DATA : DIVISION_1_KPI` for data.

3. **Charts** — `grid grid-cols-2 gap-3`, each in `bg-white rounded-xl border border-gray-100`:
   - Category bar chart:
     - Header: `px-5 pt-4 pb-2` with `text-xs font-bold text-gray-400 uppercase tracking-wider`
     - `ResponsiveContainer width="100%" height={180}` with horizontal `BarChart layout="vertical"`
     - No `CartesianGrid`, minimal axes: `XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}`, `YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false}`
     - `Bar dataKey="count" fill="#1B5E35" radius={[0, 4, 4, 0]}`
   - Monthly trend line chart:
     - Same header pattern
     - `ResponsiveContainer width="100%" height={180}` with `LineChart`
     - No `CartesianGrid`, minimal axes
     - Two lines: `stroke="#C8A84B" strokeWidth={2}` (Filed) and `stroke="#1B5E35" strokeWidth={2}` (Resolved)
     - No `Legend` — instead, colored inline labels in the header: `<span class="text-xs text-army-gold">Filed</span> <span class="text-xs text-army">Resolved</span>`

4. **Quick actions** — `grid grid-cols-2 gap-3`, same pattern as personnel profile quick links:
   ```html
   <Link to="/admin/tickets" class="group bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-army-gold/20 hover:shadow-sm transition-all">
     <div class="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center shrink-0">
       <Ticket class="w-4 h-4 text-army-gold" />
     </div>
     <div class="flex-1 min-w-0">
       <p class="text-sm font-semibold text-army-dark">Tickets</p>
       <p class="text-[11px] text-gray-400">Manage & respond</p>
     </div>
     <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
   </Link>
   ```
   Four links: Tickets, Payroll, Users (conditionally label "User Management" for superAdmin, "Division Users" for divisionAdmin), Analytics.

5. **Recent tickets** — `bg-white rounded-xl border border-gray-100` with:
   - Header: title + open count + "View all" link to `/admin/tickets`
   - 3 most recent tickets (use `isSuperAdmin ? complaints : getComplaintsForDivision(user.division)`)
   - Each row: `StatusBadge + subcategory text + SLA label + ChevronRight` — same pattern as personnel dashboard complaints

- [ ] **Step 2: Verify the app compiles and the page renders**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/dashboard.tsx
git commit -m "feat: rebuild admin dashboard with personnel design patterns"
```

---

### Task 4: Rebuild Ticket List (Table to Cards)

**Files:**
- Modify: `src/routes/_authenticated/admin/tickets/index.tsx`

- [ ] **Step 1: Rewrite ticket list with card-based layout**

Replace the full content of `src/routes/_authenticated/admin/tickets/index.tsx`.

**Imports:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { differenceInDays } from 'date-fns'
import { useState, useMemo } from 'react'
import { Search, AlertTriangle, ChevronRight, X } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Header** — `flex items-start justify-between gap-4`:
   - Left: `text-2xl font-bold text-army-dark` title + `text-sm text-gray-400 mt-0.5` showing "{openCount} open · {total} total"
   - No action button (admins don't file from here)

2. **Search** — `relative` wrapper:
   ```html
   <div class="relative">
     <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
     <input placeholder="Search by ID, name, army number, category..."
       class="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
     <!-- X clear button when search has value -->
   </div>
   ```

3. **Status filter pills** — `flex gap-1.5 flex-wrap mt-2`:
   - Compute counts for each status from the ticket list
   - "All" pill + one pill per status that has count > 0
   - Active: `bg-army-dark text-white`, inactive: `bg-gray-100 text-gray-500 hover:bg-gray-200`
   - Each: `px-3 py-1.5 rounded-full text-xs font-medium transition-colors`

4. **Ticket cards** — `space-y-2 mt-3`:
   Each ticket as a `Link` to `/admin/tickets/$ticketId`:
   ```html
   <Link to="/admin/tickets/$ticketId" params={{ ticketId: ticket.id }}
     class="block bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-army-gold/20 hover:shadow-sm transition-all group">
     <!-- Row 1: badges -->
     <div class="flex items-center gap-2 mb-1.5">
       <StatusBadge status={ticket.status} />
       <!-- SLA label -->
       <span class="{slaClasses} text-[11px] font-semibold">{slaLabel}</span>
       <!-- Priority badge -->
       <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full {priorityClasses}">{ticket.priority}</span>
       <!-- Spacer + Ticket ID right-aligned -->
       <span class="ml-auto text-xs text-gray-400 font-mono">{ticket.id}</span>
     </div>
     <!-- Row 2: Filer info -->
     <p class="text-sm font-semibold text-army-dark">{ticket.userName}</p>
     <p class="text-xs text-gray-400">{ticket.userArmyNumber} · {ticket.category} · {formatDate}</p>
     <!-- Row 3: Description preview -->
     <p class="text-xs text-gray-400 mt-1.5 line-clamp-1">{ticket.description}</p>
     <!-- Super Admin: division badge -->
     {isSuperAdmin && <span class="mt-2 inline-flex text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{ticket.userDivision}</span>}
   </Link>
   ```

   Closed tickets get `opacity-60 hover:opacity-80`.

   SLA computation:
   ```typescript
   const daysLeft = differenceInDays(new Date(ticket.slaDeadline), new Date())
   const slaBreach = daysLeft < 0
   const slaWarning = daysLeft >= 0 && daysLeft <= 2
   ```

5. **Empty state** — `bg-white rounded-xl border border-gray-100 px-6 py-12 text-center` with message.

**Sorting:** Keep default sort by filed date descending. Remove the sort column UI (it was table-specific). The pills + search provide enough filtering for the card layout.

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/tickets/index.tsx
git commit -m "feat: rebuild ticket list with card layout matching personnel design"
```

---

### Task 5: Rebuild Ticket Detail with Attachment Support

**Files:**
- Modify: `src/routes/_authenticated/admin/tickets/$ticketId.tsx`

- [ ] **Step 1: Rewrite the admin ticket detail page**

Replace the full content of `src/routes/_authenticated/admin/tickets/$ticketId.tsx`.

**Imports:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { TimelineView } from '#/components/timeline-view'
import { differenceInDays, format } from 'date-fns'
import { useState, useRef } from 'react'
import {
  ArrowLeft, AlertTriangle, Send, Paperclip, X,
  Calendar, Shield, Clock, Target, User as UserIcon, Building2,
} from 'lucide-react'
import type { ComplaintStatus, Attachment } from '#/types/complaint'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Back link** — `inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors mb-1`

2. **Header** — same row:
   - `text-xs text-gray-400 font-mono` ticket ID
   - `StatusBadge`
   - Priority badge (same style as ticket list)
   - Title: `text-xl font-bold text-army-dark mb-1`
   - Category: `text-sm text-gray-400`

3. **Meta grid** — `grid grid-cols-2 sm:grid-cols-4 gap-3`:
   Each card: `bg-white rounded-xl border border-gray-100 px-4 py-3`
   - Filed: `text-[10px] uppercase` label + `text-sm font-semibold` formatted date
   - Priority: color-coded value
   - Days Open: computed `differenceInDays(new Date(), new Date(ticket.filedDate))`
   - SLA: color-coded remaining days or "Overdue"

4. **SLA breach alert** (conditional) — `bg-red-50 border border-red-100 rounded-xl px-4 py-2.5` with `AlertTriangle` icon

5. **Filer info card** — `bg-white rounded-xl border border-gray-100`:
   - Header: `w-8 h-8 rounded-lg bg-army/8` icon + `text-sm font-bold text-army-dark` "Filer Details"
   - Content: name, army number, division, rank, corps in `dl` layout
   - Clickable link to `/admin/users/$userId` using the filer's `userId`:
     ```html
     <Link to="/admin/users/$userId" params={{ userId: ticket.userId }}
       class="inline-flex items-center gap-1.5 text-xs font-semibold text-army hover:text-army-gold transition-colors mt-2">
       View full profile <ChevronRight class="w-3 h-3" />
     </Link>
     ```
     Note: `ticket.userId` is available on the `Complaint` type.

6. **Description card** — `bg-white rounded-xl border border-gray-100 px-5 py-4`:
   - `text-xs font-bold text-gray-400 uppercase tracking-wider mb-2` header
   - `text-sm text-gray-600 leading-relaxed whitespace-pre-wrap` body

7. **Attachments card** — same pattern as personnel complaint detail (reuse the existing attachment display pattern with PIN-lock)

8. **Timeline** — `bg-white rounded-xl border border-gray-100 px-5 py-4`:
   - `text-xs font-bold text-gray-400 uppercase tracking-wider mb-4` header
   - `TimelineView events={sortedTimeline}` (reverse chronological)

9. **Admin response section** — `bg-white rounded-xl border border-gray-100 px-5 py-4`:
   Only show if ticket status is not `closed`.
   - Header: `text-sm font-bold text-army-dark mb-3` "Respond"
   - Textarea: `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:ring-2 focus:ring-army/15 focus:border-army/30` with 4 rows
   - Attachment preview: if files selected, show `flex flex-wrap gap-2 mb-3` with each file as `flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs` + X remove button
   - Action bar: `flex items-center justify-between mt-3`
     - Left side:
       - File input (hidden) + `Paperclip` button: `inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors cursor-pointer`
       - "Add Response" button: `inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-sm font-bold disabled:opacity-40`
     - Right side: `flex items-center gap-2`
       - "Request More Info" button (only when valid): `px-3 py-2 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors`
         - On click: sets status to `needs-more-info` with pre-fill text "Please provide additional information regarding: "
       - Status dropdown: `border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white`
         - Options from `STATUS_TRANSITIONS[ticket.status]`
       - "Update" button: `px-3 py-2 rounded-lg text-xs font-semibold bg-army-dark text-white disabled:opacity-40`
       - "Escalate" button (when valid): `px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100`

   **Handlers:**
   - `handleAddResponse`: calls `addNote(ticket.id, noteText, user.name, noteAttachments)` where `noteAttachments` are `Attachment[]` built from selected files with `source: 'response'`
   - `handleStatusChange`: calls `updateComplaintStatus(ticket.id, selectedStatus, user.name, noteText || statusChangeMessage)`
   - `handleRequestMoreInfo`: calls `updateComplaintStatus(ticket.id, 'needs-more-info', user.name, noteText || 'Please provide additional information regarding: ')`, then sets noteText to the pre-fill
   - `handleEscalate`: calls `updateComplaintStatus(ticket.id, 'escalated', user.name, noteText || 'Ticket escalated by admin')`

   **File handling:** Use a `useRef<HTMLInputElement>` for the hidden file input. On change, read files with `FileReader` as dataUrl, build `Attachment` objects with `source: 'response'` and `uploadedAt: new Date().toISOString()`. Max 5MB per file, accept `image/*,.pdf`.

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/tickets/\$ticketId.tsx
git commit -m "feat: rebuild ticket detail with personnel design and attachment support"
```

---

### Task 6: Create Payroll Management Page

**Files:**
- Create: `src/routes/_authenticated/admin/payroll.tsx`

- [ ] **Step 1: Create the payroll management route**

Create `src/routes/_authenticated/admin/payroll.tsx` with:

**Imports:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { Search, X, Upload, Plus, Minus, ChevronRight } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import type { Payslip, PayComponent } from '#/types/payslip'
```

**Route definition:**
```typescript
export const Route = createFileRoute('/_authenticated/admin/payroll')({
  component: AdminPayroll,
})
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Header** — `flex items-start justify-between gap-4`:
   - Left: title + payslip count subtitle
   - Right: "Upload Payslip" button: `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors`

2. **Stat grid** — `grid grid-cols-2 sm:grid-cols-4 gap-3`:
   - Total Personnel: count of `users.filter(u => u.role === 'personnel')` (scoped by division for divisionAdmin)
   - Payslips This Month: count matching current month/year
   - Short-Paid: count with `status === 'short-paid'` this month
   - Total Disbursed: sum of `netPay` for current month, formatted as `₦{amount.toLocaleString()}`

3. **Filters** — `flex flex-wrap items-center gap-2`:
   - Month pills: current month + previous 5 months as `rounded-full` pills
   - Year pills if data spans multiple years
   - "Short-paid only" toggle: `rounded-full` pill that toggles
   - Search input (same pattern, but smaller — inline)

4. **Payslip cards** — `space-y-2`:
   Each card: `bg-white rounded-xl border border-gray-100 px-5 py-3.5 flex items-center gap-4 hover:border-army-gold/20 hover:shadow-sm transition-all group`
   - Left: user name `text-sm font-semibold text-army-dark` + army number `text-xs text-gray-400 font-mono` + rank `text-xs text-gray-400`
   - Right: net pay `text-sm font-semibold font-mono text-army-dark tabular-nums` + status badge + `ChevronRight`
   - Link to `/admin/users/$userId` using the payslip's `userId`

   Data: filter payslips by selected month/year, join with users for name/rank info. Scope by division for divisionAdmin.

5. **Empty state** — if no payslips match filters

**Upload Payslip Modal** — using `Dialog` component:

State:
```typescript
const [showUpload, setShowUpload] = useState(false)
const [uploadUserId, setUploadUserId] = useState('')
const [uploadMonth, setUploadMonth] = useState(new Date().getMonth() + 1)
const [uploadYear, setUploadYear] = useState(new Date().getFullYear())
const [earnings, setEarnings] = useState<PayComponent[]>([{ label: 'Basic Salary', amount: 0, type: 'earning' }])
const [deductions, setDeductions] = useState<PayComponent[]>([{ label: 'Tax (PAYE)', amount: 0, type: 'deduction' }])
const [uploadStatus, setUploadStatus] = useState<'paid' | 'short-paid' | 'pending'>('paid')
const [discrepancyNote, setDiscrepancyNote] = useState('')
```

Modal content:
- Personnel selector: `<select>` with all personnel users (scoped by division for divisionAdmin), searchable via filtering the options
- Month + Year: two `<select>` elements
- Earnings section: `text-xs font-bold text-gray-400 uppercase tracking-wider` header, then dynamic rows:
  - Each row: `flex items-center gap-2` with label input + amount input + remove button
  - "Add earning" button: `inline-flex items-center gap-1 text-xs text-army font-semibold`
- Deductions section: same pattern
- Auto-calculated summary:
  ```html
  <div class="bg-army-dark/5 rounded-xl px-4 py-3 mt-3">
    <div class="flex justify-between text-xs text-gray-500"><span>Gross Pay</span><span class="font-mono font-semibold">₦{gross}</span></div>
    <div class="flex justify-between text-xs text-gray-500"><span>Total Deductions</span><span class="font-mono font-semibold text-red-500">-₦{totalDed}</span></div>
    <div class="flex justify-between text-sm font-bold text-army-dark mt-1 pt-1 border-t border-gray-200"><span>Net Pay</span><span class="font-mono">₦{net}</span></div>
  </div>
  ```
- Status: three `rounded-full` pill buttons (Paid/Short-paid/Pending)
- Discrepancy note: textarea (only visible if `short-paid` selected)
- Save button: calls `addPayslip()` with a new Payslip object:
  ```typescript
  const payslip: Payslip = {
    id: `PAY-${uploadUserId}-${uploadYear}-${String(uploadMonth).padStart(2, '0')}`,
    userId: uploadUserId,
    month: uploadMonth,
    year: uploadYear,
    components: [...earnings, ...deductions],
    grossPay: earnings.reduce((s, e) => s + e.amount, 0),
    totalDeductions: deductions.reduce((s, d) => s + d.amount, 0),
    netPay: earnings.reduce((s, e) => s + e.amount, 0) - deductions.reduce((s, d) => s + d.amount, 0),
    status: uploadStatus,
    paidDate: uploadStatus === 'pending' ? null : `${uploadYear}-${String(uploadMonth).padStart(2, '0')}-25`,
    discrepancyNote: uploadStatus === 'short-paid' ? discrepancyNote : null,
  }
  ```

- [ ] **Step 2: Run the TanStack Router code generator to update route tree**

Run: `npx tsr generate`
Expected: `routeTree.gen.ts` updated with new `/admin/payroll` route

- [ ] **Step 3: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/routes/_authenticated/admin/payroll.tsx src/routeTree.gen.ts
git commit -m "feat: add payroll management page with upload modal"
```

---

### Task 7: Rebuild User List (Table to Cards)

**Files:**
- Modify: `src/routes/_authenticated/admin/users.tsx`

- [ ] **Step 1: Rewrite user list with card-based layout**

Replace the full content of `src/routes/_authenticated/admin/users.tsx`.

**Imports:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { Search, ChevronRight, X } from 'lucide-react'
import type { UserRole } from '#/types/user'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Header** — title + `text-sm text-gray-400 mt-0.5` user count

2. **Search** — same rounded-xl pattern as ticket list

3. **Role filter pills** — `flex gap-1.5 flex-wrap mt-2`:
   - "All" + one per role with counts
   - Same active/inactive styling

4. **User cards** — `space-y-2`:
   Each card as a `Link` to `/admin/users/$userId`:
   ```html
   <Link to="/admin/users/$userId" params={{ userId: u.id }}
     class="block bg-white rounded-xl border border-gray-100 px-5 py-3.5 hover:border-army-gold/20 hover:shadow-sm transition-all group">
     <div class="flex items-center gap-4">
       <div class="flex-1 min-w-0">
         <p class="text-sm font-semibold text-army-dark">{u.name}</p>
         <p class="text-xs text-gray-400"><span class="font-mono">{u.armyNumber}</span> · {u.rank} · {u.corps}</p>
       </div>
       <div class="flex items-center gap-2 shrink-0">
         <!-- Status badge -->
         <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full {statusClasses}">{status}</span>
         <!-- Division badge (for superAdmin) -->
         {isSuperAdmin && <span class="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{u.division}</span>}
         <!-- Role badge (for superAdmin) -->
         {isSuperAdmin && <span class="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{roleLabel}</span>}
         <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
       </div>
     </div>
   </Link>
   ```

   Status badge colors:
   ```typescript
   const statusClasses = u.status === 'active' ? 'bg-green-50 text-green-700'
     : u.status === 'awol' ? 'bg-red-50 text-red-700'
     : u.status === 'retired' ? 'bg-gray-100 text-gray-600'
     : 'bg-orange-50 text-orange-700'
   ```

   Filtering: divisionAdmin sees only users in their division. SuperAdmin sees all.

5. **Empty state** — same pattern

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/users.tsx
git commit -m "feat: rebuild user list with card layout matching personnel design"
```

---

### Task 8: Create User Detail Page

**Files:**
- Create: `src/routes/_authenticated/admin/users/$userId.tsx`

- [ ] **Step 1: Create the user detail route**

Create directory if needed, then create `src/routes/_authenticated/admin/users/$userId.tsx`.

**Imports:**
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { maskSensitive } from '#/lib/utils'
import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import {
  ArrowLeft, Lock, Eye, Shield, Fingerprint, Building2, MapPin, Phone, Calendar,
  ChevronDown, Upload, Plus, Minus,
} from 'lucide-react'
import type { UserRole, ServiceStatus } from '#/types/user'
import type { Payslip, PayComponent } from '#/types/payslip'
```

**Route:**
```typescript
export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetail,
})
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Back link** — `inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors` → `/admin/users`

2. **Profile header** — exact same pattern as personnel `profile.tsx`:
   - `flex items-center gap-3`
   - Name `text-2xl font-bold text-army-dark truncate` + status badge
   - Army number + division subtitle

3. **Service summary strip** — exact same as personnel profile:
   - `bg-white rounded-xl border border-gray-100 overflow-hidden`
   - `w-1.5 bg-army-gold shrink-0` left accent
   - 5 columns: Rank, Grade/Step, Trade, Corps, Service tenure

4. **Sensitive identifiers** — exact same as personnel profile:
   - Fingerprint icon header
   - NIN, BVN, Salary Account with mask/reveal toggle
   - PIN verification modal (same `Dialog` with `DEMO_DECRYPT_PIN = '0000'`)

5. **Personal information** — exact same 2-col grid as personnel profile:
   - DoB, Enlistment date, State, Phone, Unit

6. **Admin actions card** — `bg-white rounded-xl border border-gray-100`:
   - Header: `w-8 h-8 rounded-lg bg-army-gold/8` icon + `text-sm font-bold text-army-dark` "Admin Actions"
   - Content `px-5 pb-5`:
     - **Change Status** row: `flex items-center justify-between py-3 border-b border-gray-50`
       - Label: `text-xs font-medium text-gray-400`
       - For superAdmin or divisionAdmin (own division): `<select>` with Active/AWOL/Suspended/Retired + "Update" button
       - On update: call `updateUserStatus(targetUser.id, newStatus)`
     - **Change Role** row: `flex items-center justify-between py-3`
       - For superAdmin only: `<select>` with Personnel/Division Admin/Super Admin + "Update" button
       - On update: call `updateUserRole(targetUser.id, newRole)`
       - For divisionAdmin: read-only display of current role

7. **Payslip section** — `bg-white rounded-xl border border-gray-100`:
   - Header: `flex items-center justify-between px-5 pt-4 pb-2.5`
     - "Payslips" title + count
     - "Upload Payslip" button (same style as payroll page)
   - Year filter pills (if multiple years)
   - Expandable payslip rows — same pattern as personnel `pay.tsx`:
     - Row: month/year + status dot + net pay + chevron
     - Expanded: earnings list, deductions list, gross/deductions/net summary in `bg-army-dark rounded-xl` footer
     - Discrepancy note if short-paid

   **Upload modal** — reuse the same modal pattern from Task 6, but pre-filled with this user's ID (don't show the user selector).

- [ ] **Step 2: Run the route generator**

Run: `npx tsr generate`
Expected: `routeTree.gen.ts` updated

- [ ] **Step 3: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/routes/_authenticated/admin/users/\$userId.tsx src/routeTree.gen.ts
git commit -m "feat: add user detail page with profile, admin actions, and payslips"
```

---

### Task 9: Restyle Analytics Page

**Files:**
- Modify: `src/routes/_authenticated/admin/analytics.tsx`

- [ ] **Step 1: Rewrite the analytics page**

Replace the full content of `src/routes/_authenticated/admin/analytics.tsx`.

**Imports:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import {
  KPI_DATA, DIVISION_1_KPI, CATEGORY_CHART_DATA, MONTHLY_TREND_DATA,
  STATUS_DISTRIBUTION_DATA, DIVISION_COMPARISON_DATA, SLA_COMPLIANCE_DATA,
} from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Header** — title + subtitle

2. **Stat grid** — `grid grid-cols-2 sm:grid-cols-4 gap-3`:
   Same inline stat card pattern as admin dashboard (no KPICard component):
   ```html
   <div class="bg-white rounded-xl border border-gray-100 px-4 py-3">
     <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
     <p class="text-lg font-extrabold text-army-dark font-mono">{value}{unit}</p>
     <p class="text-xs {trendColor} font-medium">{trend}% vs last month</p>
   </div>
   ```

3. **Charts** — `grid grid-cols-2 gap-3`:
   - Category bar chart: horizontal, `height={180}`, no CartesianGrid, minimal axes
   - Monthly trend area chart: `height={180}`, two areas with fill opacity 0.15, inline colored labels in header instead of Legend

4. **Status distribution** — replace pie chart with stat cards in a `bg-white rounded-xl border border-gray-100 px-5 py-4`:
   - Header: `text-xs font-bold text-gray-400 uppercase tracking-wider mb-3`
   - `grid grid-cols-2 sm:grid-cols-5 gap-3`:
     Each status: colored dot + count + label
     ```html
     <div class="text-center">
       <div class="flex items-center justify-center gap-1.5 mb-1">
         <span class="w-2 h-2 rounded-full" style={{ background: entry.color }} />
         <span class="text-lg font-extrabold font-mono text-army-dark">{entry.count}</span>
       </div>
       <p class="text-[10px] text-gray-400 uppercase tracking-wider">{entry.status}</p>
     </div>
     ```

5. **Super Admin only — Division comparison**: compact horizontal bar chart in `bg-white rounded-xl border`, `height={180}`

6. **SLA Compliance** — `bg-white rounded-xl border border-gray-100 px-5 py-4`:
   - Header: `text-xs font-bold text-gray-400 uppercase tracking-wider mb-3`
   - For divisionAdmin: single division progress bar
   - For superAdmin: all divisions, each with:
     ```html
     <div class="flex items-center gap-3 py-2 {border-b if not last}">
       <span class="text-xs text-gray-600 w-32 shrink-0 truncate">{division}</span>
       <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
         <div class="h-full rounded-full {colorClass}" style={{ width: `${rate}%` }} />
       </div>
       <span class="text-xs font-semibold font-mono text-army-dark w-12 text-right">{rate}%</span>
     </div>
     ```

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/analytics.tsx
git commit -m "feat: restyle analytics page with personnel design patterns"
```

---

### Task 10: Restyle RBAC Page

**Files:**
- Modify: `src/routes/_authenticated/admin/rbac.tsx`

- [ ] **Step 1: Rewrite the RBAC page**

Replace the full content of `src/routes/_authenticated/admin/rbac.tsx`.

**Imports:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import type { UserRole } from '#/types/user'
```

**Layout — `max-w-3xl mx-auto space-y-3`:**

1. **Header** — title + subtitle

2. **Role descriptions** — `grid grid-cols-1 sm:grid-cols-3 gap-3`:
   Each role card uses the accent bar pattern from the profile service strip:
   ```html
   <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
     <div class="flex">
       <div class="w-1.5 {accentColor} shrink-0" />
       <div class="flex-1 px-4 py-3.5">
         <p class="text-sm font-bold text-army-dark mb-0.5">{roleName}</p>
         <p class="text-xs text-gray-400">{description}</p>
       </div>
     </div>
   </div>
   ```
   Accent colors: `bg-gray-300` for Personnel, `bg-army-gold` for Division Admin, `bg-army` for Super Admin.

3. **Permission matrix** — `bg-white rounded-xl border border-gray-100 overflow-hidden`:
   - Table with same styling but no ShadCN wrapper:
   ```html
   <table class="w-full text-sm">
     <thead>
       <tr class="border-b bg-gray-50/50">
         <th class="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Permission</th>
         {roles.map(role => <th class="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</th>)}
       </tr>
     </thead>
     <tbody>
       {permissions.map(perm => (
         <tr class="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
           <td class="px-4 py-2.5">
             <p class="text-sm font-medium text-army-dark">{perm.action}</p>
             <p class="text-[11px] text-gray-400">{perm.description}</p>
           </td>
           {roles.map(role => (
             <td class="px-4 py-2.5 text-center">
               {hasPermission ? <Check class="w-4 h-4 text-green-600 mx-auto" /> : <X class="w-4 h-4 text-gray-200 mx-auto" />}
             </td>
           ))}
         </tr>
       ))}
     </tbody>
   </table>
   ```

   Keep the same `PERMISSIONS` array but add the new permissions from the spec:
   ```typescript
   { action: 'Upload Payslips', description: 'Upload payslip records for personnel', roles: ['divisionAdmin', 'superAdmin'] },
   { action: 'Change User Status', description: 'Update service status (Active/AWOL/Suspended/Retired)', roles: ['divisionAdmin', 'superAdmin'] },
   ```

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/admin/rbac.tsx
git commit -m "feat: restyle RBAC page with personnel design patterns and new permissions"
```

---

### Task 11: Add Admin Response Visibility to Personnel Complaint Detail

**Files:**
- Modify: `src/routes/_authenticated/_personnel/complaints/$complaintId.tsx`
- Modify: `src/components/timeline-view.tsx`

- [ ] **Step 1: Update TimelineView to style admin responses distinctly**

In `src/components/timeline-view.tsx`, update the event rendering to detect admin responses. An admin response is a `note` type event where the actor is NOT the complaint filer. Since we don't have the filer's name in the component, we can detect admin notes by checking if `event.actor` matches known admin users, or simpler: check if the event has a specific pattern. The simplest approach for the prototype: add an `isAdminResponse` prop option, or detect by checking if the actor name doesn't start with the common personnel ranks.

Better approach: add an optional `filerId` prop to `TimelineView` and compare `event.actor` against it. But actors are stored as names, not IDs. Simplest for prototype: wrap admin notes (type `note` where actor is not the original filer) in a distinct style.

Update the component to accept an optional `filerName` prop:

```typescript
export function TimelineView({ events, filerName }: { events: TimelineEvent[]; filerName?: string }) {
```

Then in the event rendering, add a wrapper for admin responses:

```typescript
const isAdminResponse = event.type === 'note' && filerName && event.actor !== filerName
```

When `isAdminResponse` is true, wrap the event content in:
```html
<div class="bg-army-dark/5 rounded-lg px-3 py-2 -mx-1">
  <span class="text-[10px] font-semibold text-army-gold uppercase tracking-wider mb-1 block">Admin Response</span>
  <!-- existing content -->
</div>
```

And change the dot color for admin notes from `bg-gray-300` to `bg-army-gold`:
```typescript
event.type === 'note'
  ? (isAdminResponse ? 'bg-army-gold' : 'bg-gray-300')
```

- [ ] **Step 2: Update personnel complaint detail to pass filerName and show "needs-more-info" prompt**

In `src/routes/_authenticated/_personnel/complaints/$complaintId.tsx`:

Pass `filerName` to `TimelineView`:
```typescript
<TimelineView events={sortedTimeline} filerName={ticket.userName} />
```

Add a prompt card above the reply textarea when status is `needs-more-info`:
```html
{ticket.status === 'needs-more-info' && (
  <div class="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
    <AlertTriangle class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
    <div>
      <p class="text-sm font-semibold text-orange-800">Action Required</p>
      <p class="text-xs text-orange-600 mt-0.5">Admin has requested more information. Please respond below.</p>
    </div>
  </div>
)}
```

Import `AlertTriangle` from lucide-react if not already imported.

- [ ] **Step 3: Update the admin ticket detail to pass filerName**

In `src/routes/_authenticated/admin/tickets/$ticketId.tsx`, pass `filerName` to `TimelineView`:
```typescript
<TimelineView events={sortedTimeline} filerName={ticket.userName} />
```

- [ ] **Step 4: Verify the app compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add src/components/timeline-view.tsx src/routes/_authenticated/_personnel/complaints/\$complaintId.tsx src/routes/_authenticated/admin/tickets/\$ticketId.tsx
git commit -m "feat: add admin response styling in timeline and needs-more-info prompt"
```

---

### Task 12: Final Integration Verification

- [ ] **Step 1: Run the route generator to ensure all routes are registered**

Run: `npx tsr generate`

- [ ] **Step 2: Run TypeScript compilation check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run the dev server and test each admin page**

Run: `npm run dev`

Test checklist:
1. Login as Division Admin (DA/10/00456 / SAL-101-2024) — verify dashboard shows division-scoped data
2. Login as Super Admin (SA/05/00123 / SAL-201-2024) — verify dashboard shows system-wide data
3. Navigate to Ticket Management — verify card layout, search, filters work
4. Click a ticket — verify detail page, add a note, change status, attach a file
5. Navigate to Payroll — verify payslip list, upload a new payslip
6. Navigate to User Management — verify card layout, click a user
7. Verify user detail page — profile info, admin actions (change status/role), payslip section
8. Navigate to Analytics — verify compact charts, stat cards
9. Navigate to RBAC — verify restyled matrix
10. Login as Personnel (NA/23/01234 / SAL-001-2024) — verify complaint detail shows admin responses with distinct styling
11. Verify `needs-more-info` prompt appears when status is set

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration fixes for admin redesign"
```
