# Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a profile management page with masked sensitive fields and a decrypt-on-click modal for all authenticated users.

**Architecture:** Extend the existing `User` type with new fields (NIN, BVN, DOB, etc.), add dummy data to all demo users, add a masking utility, create a profile route accessible to all roles, and build a decrypt modal using the existing shadcn Dialog component.

**Tech Stack:** React 19, TanStack Router, Tailwind CSS v4, shadcn/ui (Base Nova), lucide-react

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/types/user.ts` | Add new fields to User interface |
| Modify | `src/data/users.ts` | Add dummy data for all 5 demo users |
| Modify | `src/lib/utils.ts` | Add `maskSensitive()` utility |
| Modify | `src/components/app-sidebar.tsx` | Add Profile nav link for all roles |
| Create | `src/routes/_authenticated/profile.tsx` | Profile page with decrypt modal |

---

### Task 1: Extend User type

**Files:**
- Modify: `src/types/user.ts`

- [ ] **Step 1: Add new fields to User interface**

Open `src/types/user.ts` and add the new fields after `trade`:

```typescript
export interface User {
  id: string
  name: string
  armyNumber: string
  salaryAccountNo: string
  role: UserRole
  personnelType: PersonnelType | null
  rank: string
  gradeLevel: string
  step: number
  corps: string
  division: string
  status: ServiceStatus
  dateOfEnlistment: string
  trade: string
  nin: string
  bvn: string
  dateOfBirth: string
  stateOfOrigin: string
  phone: string
  unit: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/user.ts
git commit -m "feat: add profile fields to User type (nin, bvn, dob, etc.)"
```

---

### Task 2: Add dummy data to all demo users

**Files:**
- Modify: `src/data/users.ts`

- [ ] **Step 1: Add new fields to all 5 demo users**

Update each user object in `DEMO_USERS` with the new fields. Here is the complete updated array:

```typescript
import type { User } from '#/types/user'

export const DEMO_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Captain James Adeyemi',
    armyNumber: 'NA/23/01234',
    salaryAccountNo: 'SAL-001-2024',
    role: 'personnel',
    personnelType: 'officer',
    rank: 'Captain',
    gradeLevel: 'GL 08',
    step: 3,
    corps: 'Infantry Corps',
    division: '1 Infantry Division',
    status: 'active',
    dateOfEnlistment: '2023-06-15',
    trade: 'Infantry',
    nin: '12345678901',
    bvn: '22100345678',
    dateOfBirth: '1990-03-22',
    stateOfOrigin: 'Lagos State',
    phone: '+234 803 000 0001',
    unit: '1 Infantry Division HQ Company',
  },
  {
    id: 'user-002',
    name: 'Private Ibrahim Musa',
    armyNumber: 'NA/15/05678',
    salaryAccountNo: 'SAL-002-2024',
    role: 'personnel',
    personnelType: 'soldier',
    rank: 'Private',
    gradeLevel: 'GL 04',
    step: 1,
    corps: 'Army Service Corps',
    division: '1 Infantry Division',
    status: 'active',
    dateOfEnlistment: '2018-06-01',
    trade: 'Driver',
    nin: '23456789012',
    bvn: '12345678901',
    dateOfBirth: '1995-11-10',
    stateOfOrigin: 'Kano State',
    phone: '+234 803 000 0002',
    unit: '1 Infantry Division Transport Company',
  },
  {
    id: 'user-003',
    name: 'Corporal Fatima Bello',
    armyNumber: 'NA/20/09012',
    salaryAccountNo: 'SAL-003-2024',
    role: 'personnel',
    personnelType: 'soldier',
    rank: 'Corporal',
    gradeLevel: 'GL 05',
    step: 1,
    corps: 'Signals Corps',
    division: '2 Mechanised Division',
    status: 'awol',
    dateOfEnlistment: '2020-01-22',
    trade: 'Signals',
    nin: '34567890123',
    bvn: '33200456789',
    dateOfBirth: '1997-07-15',
    stateOfOrigin: 'Kaduna State',
    phone: '+234 803 000 0003',
    unit: '2 Mechanised Division Signals Company',
  },
  {
    id: 'user-004',
    name: 'Major Sarah Okonkwo',
    armyNumber: 'DA/10/00456',
    salaryAccountNo: 'SAL-101-2024',
    role: 'divisionAdmin',
    personnelType: null,
    rank: 'Major',
    gradeLevel: 'GL 10',
    step: 4,
    corps: 'Administration',
    division: '1 Infantry Division',
    status: 'active',
    dateOfEnlistment: '2010-08-01',
    trade: 'Administration',
    nin: '45678901234',
    bvn: '44300567890',
    dateOfBirth: '1985-02-28',
    stateOfOrigin: 'Anambra State',
    phone: '+234 803 000 0004',
    unit: '1 Infantry Division Admin Company',
  },
  {
    id: 'user-005',
    name: 'Colonel David Nwachukwu',
    armyNumber: 'SA/05/00123',
    salaryAccountNo: 'SAL-201-2024',
    role: 'superAdmin',
    personnelType: null,
    rank: 'Colonel',
    gradeLevel: 'GL 14',
    step: 6,
    corps: 'Administration',
    division: 'Army Headquarters',
    status: 'active',
    dateOfEnlistment: '2005-04-15',
    trade: 'Administration',
    nin: '56789012345',
    bvn: '55400678901',
    dateOfBirth: '1978-09-05',
    stateOfOrigin: 'Imo State',
    phone: '+234 803 000 0005',
    unit: 'Army Headquarters Staff',
  },
]
```

Note: Private Ibrahim Musa's `step` is changed to `1` and `trade` to `'Driver'` and `dateOfEnlistment` to `'2018-06-01'` to match the user's spec.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (all users now satisfy the updated User interface).

- [ ] **Step 3: Commit**

```bash
git add src/data/users.ts
git commit -m "feat: add profile dummy data for all demo users"
```

---

### Task 3: Add masking utility

**Files:**
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Add maskSensitive function**

Append to `src/lib/utils.ts`:

```typescript
export function maskSensitive(value: string): string {
  if (value.length <= 3) return '****'
  return '****' + value.slice(-3)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add maskSensitive utility for profile field masking"
```

---

### Task 4: Add Profile link to sidebar

**Files:**
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Import UserRound icon**

In `src/components/app-sidebar.tsx`, update the lucide-react import to include `UserRound`:

```typescript
import { LayoutDashboard, Wallet, MessageCircle, HelpCircle, Ticket, BarChart3, Users, Shield, LogOut, UserRound } from 'lucide-react'
```

- [ ] **Step 2: Add Profile to personnelItems**

Add after the Help & Support entry:

```typescript
const personnelItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Pay & Documents', to: '/pay', icon: Wallet },
  { label: 'Complaints', to: '/complaints', icon: MessageCircle },
  { label: 'Help & Support', to: '/help', icon: HelpCircle },
  { label: 'Profile', to: '/profile', icon: UserRound },
]
```

- [ ] **Step 3: Add Profile to adminItems**

Add after the RBAC Matrix entry:

```typescript
const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Ticket Management', to: '/admin/tickets', icon: Ticket },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'RBAC Matrix', to: '/admin/rbac', icon: Shield },
  { label: 'Profile', to: '/profile', icon: UserRound },
]
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "feat: add Profile nav link to sidebar for all roles"
```

---

### Task 5: Create profile page with decrypt modal

**Files:**
- Create: `src/routes/_authenticated/profile.tsx`

- [ ] **Step 1: Create the profile route file**

Create `src/routes/_authenticated/profile.tsx` with the full profile page implementation:

```tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { maskSensitive } from '#/lib/utils'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Lock, Eye } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

const SENSITIVE_FIELDS = ['nin', 'bvn', 'salaryAccountNo'] as const
type SensitiveField = (typeof SENSITIVE_FIELDS)[number]

const FIELD_LABELS: Record<SensitiveField, string> = {
  nin: 'National Identification Number (NIN)',
  bvn: 'BVN',
  salaryAccountNo: 'Salary Account Number',
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  awol: 'bg-red-50 text-red-700 border-red-200',
  retired: 'bg-gray-50 text-gray-500 border-gray-200',
  suspended: 'bg-orange-50 text-orange-700 border-orange-200',
}

function ProfilePage() {
  const { user } = useAuth()
  const [revealedFields, setRevealedFields] = useState<Set<SensitiveField>>(new Set())
  const [decryptField, setDecryptField] = useState<SensitiveField | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  if (!user) return null

  function handleDecryptSubmit() {
    if (code === '0000') {
      setRevealedFields((prev) => {
        const next = new Set(prev)
        next.add(decryptField!)
        return next
      })
      setDecryptField(null)
      setCode('')
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function renderSensitiveField(field: SensitiveField, value: string) {
    const isRevealed = revealedFields.has(field)
    return (
      <button
        type="button"
        onClick={() => {
          if (!isRevealed) {
            setDecryptField(field)
            setCode('')
            setCodeError(false)
          }
        }}
        className={`inline-flex items-center gap-2 font-mono text-sm ${isRevealed ? 'text-army-dark' : 'text-army-dark/60 hover:text-army-dark cursor-pointer'}`}
      >
        <span>{isRevealed ? value : maskSensitive(value)}</span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-army-gold" />
        )}
      </button>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const personalRows: { label: string; value: React.ReactNode }[] = [
    { label: 'National Identification Number (NIN)', value: renderSensitiveField('nin', user.nin) },
    { label: 'BVN', value: renderSensitiveField('bvn', user.bvn) },
    { label: 'Full Name', value: user.name },
    { label: 'Army Number', value: user.armyNumber },
    { label: 'Salary Account Number', value: renderSensitiveField('salaryAccountNo', user.salaryAccountNo) },
    { label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
    { label: 'Date of Enlistment', value: formatDate(user.dateOfEnlistment) },
    { label: 'State of Origin', value: user.stateOfOrigin },
    { label: 'Phone', value: user.phone },
    { label: 'Unit', value: user.unit },
    { label: 'Division', value: user.division },
    { label: 'Corps', value: user.corps },
  ]

  const serviceRows: { label: string; value: React.ReactNode }[] = [
    { label: 'Rank', value: user.rank },
    { label: 'Grade Level', value: user.gradeLevel },
    { label: 'Step', value: `A${user.step}` },
    { label: 'Trade', value: user.trade },
    {
      label: 'Status',
      value: (
        <Badge variant="outline" className={`text-[11px] font-semibold capitalize ${statusStyles[user.status] || ''}`}>
          {user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-army-dark">My Profile</h1>
        <p className="text-sm text-army-dark/50 mt-1">View your personal information and service details</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-army-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-army-sand bg-army-cream/50">
          <h2 className="text-sm font-bold text-army-dark uppercase tracking-wider">Personal Information</h2>
        </div>
        <div className="divide-y divide-army-sand/60">
          {personalRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-xs font-medium text-army-dark/50 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-army-dark font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3.5 border-t border-army-sand bg-army-cream/30">
          <p className="text-xs text-army-dark/40 italic">
            To correct any personal information, please raise a complaint ticket.
          </p>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-xl border border-army-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-army-sand bg-army-cream/50">
          <h2 className="text-sm font-bold text-army-dark uppercase tracking-wider">Service Details</h2>
        </div>
        <div className="divide-y divide-army-sand/60">
          {serviceRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-xs font-medium text-army-dark/50 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-army-dark font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decrypt Modal */}
      <Dialog
        open={decryptField !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDecryptField(null)
            setCode('')
            setCodeError(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
            <DialogDescription>
              Enter verification code to view{' '}
              {decryptField ? FIELD_LABELS[decryptField] : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="password"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDecryptSubmit()
              }}
              placeholder="Enter 4-digit code"
              className="w-full px-3 py-2 rounded-lg border border-army-sand bg-white text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army-gold/40 focus:border-army-gold"
              autoFocus
            />
            {codeError && (
              <p className="text-xs text-red-600 mt-2 text-center">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDecryptSubmit} className="bg-army text-white hover:bg-army-mid">
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Regenerate route tree**

Run: `npx vite --clearScreen false` (start dev server briefly to trigger TanStack Router code generation) or run the project's dev command.

Run: `npm run dev` and verify the route tree is regenerated at `src/routeTree.gen.ts` and includes the `/profile` route.

Stop the dev server after confirming.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`

Test the following:
1. Login as Private Ibrahim Musa (NA/15/05678 / SAL-002-2024)
2. Verify "Profile" appears in the sidebar
3. Click Profile — page shows Personal Information and Service Details
4. NIN shows as `****012`, BVN as `****901`, Salary Account Number as `****024`
5. Click any masked field — modal appears asking for verification code
6. Enter wrong code (e.g. `1234`) — shows "Invalid verification code"
7. Enter `0000` — modal closes, field is revealed with full value
8. Each field decrypts independently
9. Navigate away and back — fields are masked again
10. Login as admin (DA/10/00456 / SAL-101-2024) — Profile link also shows in admin sidebar

- [ ] **Step 5: Commit**

```bash
git add src/routes/_authenticated/profile.tsx src/routeTree.gen.ts
git commit -m "feat: add profile page with masked sensitive fields and decrypt modal"
```
