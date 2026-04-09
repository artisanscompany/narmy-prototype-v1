# Nigeria Army Pay Self-Service Portal — Update Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Approach:** Phased by domain (9 phases, each leaves app in working state)

---

## Phase 1: Branding & Naming

### App Identity
- Rename from "NARMY" / "Personnel Self-Service Portal" to **"Nigeria Army Pay Self-Service Portal"** everywhere:
  - Manifest: `short_name: "NA Pay Portal"`, `name: "Nigeria Army Pay Self-Service Portal"`
  - Page titles, sidebar header, login page
- Sidebar header: "Nigeria Army" (remove "Personnel Service")
- Logo: Keep existing Nigerian Army SVG, remove any "Personnel Service" text rendered alongside it

### Login Page
- Title: "Nigeria Army Pay Self-Service Portal"
- Tagline bullets:
  - "Access your pay records"
  - "Download documents"
  - "Submit requests, complaints and inquiries"
- Remove "for the Nigeria Army" (redundant)
- Remove "Directorate of Army Personnel Services" branding

### Login Footer
- Add FAQ link (links to in-app help center)
- Add contact details for office access
- Remove "Director" reference

### Files Affected
- `src/routes/login.tsx`
- `src/components/app-sidebar.tsx`
- `index.html` (title, manifest)
- Any component rendering the app title

---

## Phase 2: E-Learning Removal

### Complete Removal
- Delete `src/routes/_authenticated/e-learning/` (entire directory)
- Delete `src/data/elearning.ts`
- Delete `src/types/elearning.ts`
- Remove all e-learning state, actions, and types from `src/contexts/DataContext.tsx`
- Remove "Training" menu item from both personnel and admin sidebars in `src/components/app-sidebar.tsx`
- Remove e-learning/training references from help center FAQ
- Regenerate TanStack route tree

No placeholder or link to future e-learning portal.

---

## Phase 3: Authentication Flow Overhaul

### Login Mechanism
- Replace army number + salary account number with **army number + password**
- Demo users get pre-generated passwords stored in user data
- Login validates army number + password

### First-Login Setup
- New user flag: `isFirstLogin: boolean`
- On first login, redirect to setup screen requiring:
  1. New password creation (with confirmation, strength indicator)
  2. 4-digit PIN creation (with confirmation)
- On completion: `isFirstLogin = false`, proceed to dashboard

### PIN Usage
- Required for payslip PDF downloads (existing behavior)
- Required for viewing sensitive profile data — NIN, BVN (existing behavior)

### Session Management
- **Single session:** Generate session token on login, stored in localStorage. New login with same user invalidates previous session.
- **5-minute inactivity timeout:**
  - Track mouse, keyboard, touch events
  - At 4 minutes: show warning modal ("You'll be logged out in 60 seconds" + "Stay Logged In" button)
  - At 5 minutes: force logout, redirect to login
  - Activity listeners at `_authenticated` layout level

### Password Reset
- Login page: "Request New Password" link
- Form: enter army number → creates pending reset request in localStorage
- Admin sees pending requests, generates new password
- New password sets `isFirstLogin = true` (forces full setup again)
- All existing credentials invalidated

### Demo Data
- Seed some users with `isFirstLogin: true` (to demonstrate setup flow)
- Seed some with `isFirstLogin: false` (for direct login)
- Default demo password shown on login page for convenience

---

## Phase 4: Navigation & UI Cleanup

### Personnel Menu Order
1. Home (`/dashboard`)
2. My Profile (`/profile`)
3. Pay Slips (`/pay`)
4. Inquiries (`/complaints`)
5. Help Center (`/help`)

### Admin Menu Order
1. Dashboard (`/admin/dashboard`)
2. Tickets (`/admin/tickets`)
3. Payroll (`/admin/payroll`)
4. Analytics (`/admin/analytics`)
5. Users (`/admin/users`)
6. RBAC (`/admin/rbac`)
7. Profile (`/profile`)

### Breadcrumbs
- New breadcrumb component for mobile (sidebar hidden on mobile)
- Shows navigation path, e.g. "Home > Pay Slips > January 2026"
- Placed below top bar on all authenticated pages

### Notification System
- Bell icon in top bar with badge count
- Badge count: unresolved inquiries, admin responses needing feedback, pending password resets (admin)
- Dropdown with recent notifications on click
- Notifications stored in localStorage per user

### Remove Short Pay Indicators
- Remove all short pay badges, icons, indicators throughout app

### Greeting Format
- Dashboard: "Good [morning/afternoon/evening], Captain Adeyemi"
- Time-of-day: morning (5-12), afternoon (12-17), evening (17-5)
- Rank + surname only
- Remove duplicate rank from nearby profile sections

---

## Phase 5: Complaints to Inquiries

### Rename
- "Complaints" → "Inquiries" in all user-facing UI text, sidebar, help center
- Route paths stay as `/complaints` for URL stability
- Internal component/variable names remain as-is to minimize churn

### Simplified Categories
1. **Pay** — 6 subcategories:
   - Overpayment of Salary
   - Underpayment of Salary
   - Non-payment of Salary
   - Overpayment of Allowance
   - Underpayment of Allowance
   - Non-payment of Allowance
2. **Others** — no subcategories, general inquiry

### Single-Page Form (replaces 4-step wizard)
- Category dropdown (Pay / Others)
- Subcategory dropdown (visible only when "Pay" selected)
- Description textarea
- File attachments inline (PDF/images, up to 20MB)
- Voice recording button (record, playback preview, re-record, attach)
- Submit button

### Voice Recording
- MediaRecorder API for audio capture
- Record button with visual timer/waveform indicator
- Playback preview before attaching
- Stored as base64 in localStorage with the inquiry
- Admin can play recordings in ticket detail view
- Auto-delete recording data when case status becomes "Closed"

### Status Flow
- New: Open → Review → Action Required → Resolved → Closed
- Old statuses mapped to new in data layer

### Workflow
- Remove SLA tracking from user-facing views (admin-only)
- Activity log: submission, assignment to department, admin responses
- User feedback required when marked "Resolved" — prompt to confirm or reopen
- Auto-close after 7 days if no response to "Resolved"
- Attachments displayed inline with response area (not at bottom)

---

## Phase 6: Pay Slips Updates

### Top Bar Summary
- Most recent month only: Gross, Deductions, Net
- Remove "Year to date" calculations

### Deduction/Earning Updates
- Remove "Pension" from deductions
- Remove "SF Allowance" from earnings
- Update seed payslip data accordingly
- Keep PAYE Tax and other standard deductions

### Historical Data
- Rolling 12 months from current date
- Filter out payslips older than 12 months

### PDF
- Update PDF template to reflect removed items
- Keep PIN-protected download

### Short Pay Removal
- Remove `short-paid` status from payslip type
- Remove discrepancy notes
- Remove short pay filtering/badges
- Convert seed `short-paid` entries to `paid`

---

## Phase 7: Profile & Rank Display

### Rank Display Rules
- **Officers** (`personnelType: 'officer'`): rank + step. No trade anywhere.
- **Soldiers** (`personnelType: 'soldier'`): rank + step + trade.
- **Everyone:** Show corps.

### Profile Page
- Follow rank display rules consistently
- Remove duplicate rank when greeting already shows it
- Step in service details: "Captain — Step 3"

### Greeting
- "Good [morning/afternoon/evening], Captain Adeyemi" — rank + surname
- Applied on dashboard and sidebar user card
- Time-of-day: morning (5-12), afternoon (12-17), evening (17-5)

### Admin User Views
- Same rank display rules when viewing other users
- User list cards: rank + trade for soldiers, rank only for officers

---

## Phase 8: Help Center

### Restructured Sections
1. **Pay & Allowances** — update, remove short pay references
2. **Account & Access** — update with new auth flow (password setup, PIN, session timeout)
3. **Inquiries & Resolutions** — renamed from "Complaints & Resolution", new status names (Open → Review → Action Required → Resolved → Closed), remove SLA from user-facing FAQ
4. **Status & AWOL** — keep as-is

### Removed Sections
- "Service Records" — not in scope
- "Postings & Transfers" — not in scope

### New Content
- Contact information for office access (phone, physical address placeholder)
- System usage instructions (navigation, submit inquiry, download payslip)

### Remove References To
- E-learning/training
- Short pay
- Posting/transfer procedures
- SLA timelines in user-facing content

### Implementation
- In-app FAQ, searchable, with section navigation (keep current UX)

---

## Phase 9: Admin Updates

### Super Admin Limits
- Maximum 2 super admins at any time
- UI: disable "Promote to Super Admin" when 2 exist, show explanatory message
- Seed data: Colonel Nwachukwu as sole super admin (1 of 2 slots)

### Admin Role for NCOs
- Soldiers (e.g. Sergeants) can hold `divisionAdmin` role
- Seed data: add/modify one user as Sergeant with `divisionAdmin` to demonstrate

### Password Reset Management
- Admin view: pending password reset requests
- Shows army number, name, date requested
- Admin generates new password → stored on user, `isFirstLogin = true`
- Existing credentials invalidated
- Lives as "Password Resets" tab within the Users page (`/admin/users`)

### Super Admin Seeding
- First super admin seeded via command line (documented in help)
- Re-seeding supported if both super admins transfer

### Terminology
- Admin internally sees "Tickets"
- User-facing descriptions reference "Inquiries"

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| E-learning | Fully removed | Separate portal, separate auth |
| Auth simulation depth | Full simulation in localStorage | Prototype needs to demonstrate real flow |
| Visual companion | Declined | Updating existing UI, not designing new |
| Rank in greeting | Rank + surname only | Step shown in profile details |
| Voice recording | Include now | Accessibility need for personnel with literacy challenges |
| Landing page | Login footer only | Landing page is separate project |
| Complaint form | Single page | Only 2 categories, wizard is overkill |
| Historical payslips | Rolling 12 months | Simplest, most intuitive |
| Logout warning | Show 60-second warning | Better UX than silent logout |
| Implementation approach | Phased by domain | Each phase testable independently |
