# Admin Redesign + Role-Based CRUD — Design Spec

**Date:** 2026-04-01
**Status:** Approved

## Overview

Rebuild all admin pages (Division Admin + Super Admin) to match the personnel UI design language. Add role-based CRUD: payslip uploading, complaint response with attachments, user status management. New routes for payroll management and user detail.

## Design System Alignment

All admin pages adopt the personnel design vocabulary:

- **Container:** `max-w-3xl mx-auto space-y-3`
- **Cards:** raw `bg-white rounded-xl border border-gray-100` — no ShadCN Card/CardHeader/CardContent wrappers
- **Labels:** `text-[10px] text-gray-400 uppercase tracking-wider font-medium`
- **Section headers:** icon in `w-8 h-8 rounded-lg bg-army/8` + `text-sm font-bold text-army-dark`
- **Filter pills:** `rounded-full` with `bg-army-dark text-white` active state
- **Tables:** inline in white cards, `text-sm`, `hover:bg-gray-50/50`, no heavy card wrapper
- **Charts:** `height={180}` max, simplified (no legends where redundant, minimal grid lines)
- **Stat grids:** `grid grid-cols-2 sm:grid-cols-4 gap-3` with `text-[10px] uppercase` labels + `text-lg font-extrabold font-mono` values

---

## 1. Admin Dashboard (`/admin/dashboard`)

### Hero Card
- `bg-army-dark rounded-2xl` with gradient overlay (`bg-linear-to-br from-army/20 via-transparent to-army-gold/5`)
- Decorative blur element (same as personnel dashboard)
- Greeting + admin name/rank
- Role badge (Division Admin / Super Admin)
- Division scope or "All Divisions" indicator
- 4-column service detail chips: Role, Division, Rank, Corps

### Stat Grid
- 4 KPI cards: Total Tickets, Open, Escalated, Avg Resolution (days)
- Division-scoped for Division Admin, system-wide for Super Admin
- `font-mono text-lg font-extrabold` values with change indicators

### Charts Section
- `grid grid-cols-2 gap-3`
- Category bar chart (horizontal, `height={180}`, no cartesian grid, minimal axis)
- Monthly trend line chart (`height={180}`, two lines, no legend — colored labels inline)

### Quick Actions Row
- 2-column grid of link cards (same pattern as personnel profile quick links):
  - "Ticket Management" → `/admin/tickets`
  - "Payroll Management" → `/admin/payroll`
  - "User Management" → `/admin/users`
  - "Analytics" → `/admin/analytics`

### Recent Tickets
- 3 most recent tickets, card pattern matching personnel complaints on dashboard
- StatusBadge + SLA indicator + chevron link

---

## 2. Ticket Management

### Ticket List (`/admin/tickets`)

**Header:** title + open/total count, no action button

**Search:** `rounded-xl border` input with Search icon

**Filter pills:** status filters as `rounded-full` pills with counts

**Ticket cards** (replaces current table) — `space-y-2`:
- Top row: StatusBadge + SLA label + Priority badge + Ticket ID (right-aligned, `text-xs text-gray-400 font-mono`)
- Filer: name `text-sm font-semibold text-army-dark` + army number `text-xs text-gray-400`
- Category + subcategory + filed date
- Description preview: `line-clamp-1`
- Division badge (Super Admin only)

### Ticket Detail (`/admin/tickets/$ticketId`)

**Back link** — standard pattern

**Header:** Ticket ID + StatusBadge + Priority badge, category below

**Meta grid:** `grid grid-cols-2 sm:grid-cols-4 gap-3` — Filed date, Priority, Days open, SLA (color-coded)

**Filer info card:** white card with icon header — name, army number, division, rank, corps. Clickable link to `/admin/users/$userId`

**Description card:** same as personnel complaint detail

**Attachments card:** same pattern with PIN-lock

**Timeline:** `TimelineView` component. Admin responses get army-gold dot (distinct from gray for regular notes)

**Admin response section:**
- Textarea (same styling as personnel complaint reply)
- File attachment button (drag-drop, 5MB max, images + PDF)
- Action bar:
  - Left: "Add Response" button (sends note + attachments)
  - Right: Status dropdown (valid transitions only) + "Update" button
  - Right: "Escalate" button (red, when valid)
  - "Request More Info" shortcut — sets `needs-more-info` status, pre-fills textarea: "Please provide additional information regarding: "

---

## 3. Payroll Management (New)

### Payroll List (`/admin/payroll`) — new route

**Header:** "Payroll Management" + payslip count + "Upload Payslip" button (army-gold)

**Stat grid:** 4 cards — Total Personnel, Payslips This Month, Short-Paid Count, Total Disbursed (₦)

**Filters:** Month/Year pill selectors + "Show short-paid only" toggle + search input

**Payslip cards** — `space-y-2`:
- Personnel name + army number + rank (left)
- Net pay `font-mono font-semibold` + status badge (right)
- Chevron → `/admin/users/$userId`

### Upload Payslip Modal
- Select personnel (searchable dropdown)
- Month + Year selectors
- Dynamic pay component rows:
  - Earnings: label + amount (add/remove rows)
  - Deductions: label + amount (add/remove rows)
- Auto-calculated: Gross, Total Deductions, Net Pay
- Status: Paid / Short-paid / Pending
- Optional discrepancy note
- "Save Payslip" button

### DataContext Additions
- `addPayslip(payslip: Payslip): void`
- `updatePayslip(payslipId: string, updates: Partial<Payslip>): void`

### Scope
- Division Admin: personnel in their division only
- Super Admin: all personnel

---

## 4. User Management

### User List (`/admin/users`) — restyle

**Header:** "User Management" + user count

**Search:** rounded-xl input

**Filter pills:** role filters as `rounded-full` pills with counts

**User cards** (replaces table) — `space-y-2`, clickable → `/admin/users/$userId`:
- Left: Name + Army number `font-mono`
- Middle: Rank + Corps
- Right: Status badge + Division badge + ChevronRight
- Super Admin sees role badge

### User Detail (`/admin/users/$userId`) — new route

**Back link** → user list

**Profile section** — reuses personnel profile.tsx layout:
- Name + status badge header
- Service summary strip (gold accent bar)
- Sensitive identifiers (NIN, BVN, Salary Account — PIN to reveal)
- Personal information grid

**Admin actions card:**
- Change Status dropdown (Active, AWOL, Suspended, Retired) + "Update" — Super Admin + Division Admin (own division only)
- Change Role dropdown (Personnel, Division Admin, Super Admin) + "Update" — Super Admin only
- Division Admin sees read-only for role

**Payslip section:**
- Expandable payslip list (same as personnel pay.tsx)
- "Upload Payslip" button (opens modal, pre-filled with this user)

### DataContext Additions
- `updateUserStatus(userId: string, newStatus: ServiceStatus): void`

### Scope
- Division Admin: users in their division, can change status, cannot change roles
- Super Admin: all users, can change roles and status

---

## 5. Analytics (`/admin/analytics`) — restyle

**Header:** title + subtitle

**Stat summary:** 4-card grid (same `text-[10px] uppercase` + `font-mono font-extrabold` pattern)

**Charts:** `grid grid-cols-2 gap-3`, all `height={180}`:
- Category bar chart (horizontal, minimal)
- Monthly trend area chart (inline colored labels, no separate legend)
- Status distribution — horizontal stacked bar or stat cards with colored dots (replaces pie chart)
- Super Admin only: Division comparison as compact grouped bars

**SLA Compliance:** progress bars in white card, restyled to match

**Removed:** duplicate "Monthly Trend (Line)" chart

---

## 6. RBAC (`/admin/rbac`) — restyle

**Header:** title + subtitle

**Role descriptions:** `grid grid-cols-1 sm:grid-cols-3 gap-3`, white rounded-xl cards with colored left accent bar:
- Green → Super Admin
- Gold → Division Admin
- Gray → Personnel

**Permission matrix:** same table in white rounded-xl card, compact rows, smaller text, no ShadCN wrapper

---

## 7. Personnel Complaint Detail — Admin Response Visibility

Updates to personnel-side complaint detail page:

- Admin responses in timeline: `bg-army-dark/5 rounded-lg px-3 py-2` wrapper with "Admin Response" label, army-gold dot
- Admin-attached files show "Response" source badge
- If status is `needs-more-info`: prompt card above reply textarea — "Action Required — Admin has requested more information"

---

## Role-Based Access Summary

| Capability | Personnel | Division Admin | Super Admin |
|---|---|---|---|
| View own profile | ✓ | ✓ | ✓ |
| View own payslips | ✓ | ✓ | ✓ |
| File complaints | ✓ | ✓ | ✓ |
| View division tickets | — | ✓ (own div) | ✓ (all) |
| Respond to tickets | — | ✓ (own div) | ✓ (all) |
| Change ticket status | — | ✓ (own div) | ✓ (all) |
| Escalate tickets | — | ✓ (own div) | ✓ (all) |
| View division analytics | — | ✓ (own div) | ✓ (all) |
| View users | — | ✓ (own div) | ✓ (all) |
| Change user status | — | ✓ (own div) | ✓ |
| Change user roles | — | — | ✓ |
| View/upload payslips (others) | — | ✓ (own div) | ✓ (all) |
| View RBAC matrix | — | ✓ | ✓ |

---

## New Routes

| Route | Description |
|---|---|
| `/admin/payroll` | Payroll management list + upload |
| `/admin/users/$userId` | User detail with profile, admin actions, payslips |

## DataContext New Methods

| Method | Signature |
|---|---|
| `addPayslip` | `(payslip: Payslip) => void` |
| `updatePayslip` | `(payslipId: string, updates: Partial<Payslip>) => void` |
| `updateUserStatus` | `(userId: string, newStatus: ServiceStatus) => void` |

## Files Modified

- `src/routes/_authenticated/admin/dashboard.tsx` — rebuild
- `src/routes/_authenticated/admin/tickets/index.tsx` — rebuild
- `src/routes/_authenticated/admin/tickets/$ticketId.tsx` — rebuild
- `src/routes/_authenticated/admin/analytics.tsx` — rebuild
- `src/routes/_authenticated/admin/users.tsx` — rebuild
- `src/routes/_authenticated/admin/rbac.tsx` — rebuild
- `src/routes/_authenticated/_personnel/complaints/$complaintId.tsx` — add admin response visibility

## Files Created

- `src/routes/_authenticated/admin/payroll.tsx` — new
- `src/routes/_authenticated/admin/users/$userId.tsx` — new

## Files Extended

- `src/contexts/DataContext.tsx` — addPayslip, updatePayslip, updateUserStatus
- `src/components/app-sidebar.tsx` — add Payroll nav item for admin roles (between Ticket Management and Analytics)
