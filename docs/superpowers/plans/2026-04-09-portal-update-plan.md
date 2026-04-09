# Nigeria Army Pay Self-Service Portal Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the NARMY prototype to reflect stakeholder feedback across branding, auth, navigation, inquiries, pay slips, profile, help center, and admin features.

**Architecture:** 9 phased updates to an existing React 19 + TanStack Router + Tailwind CSS client-side prototype. All state lives in localStorage via contexts. No backend — all flows simulated in-browser.

**Tech Stack:** React 19, TypeScript 5.7, TanStack Router (file-based), Tailwind CSS 4, @react-pdf/renderer, Recharts, date-fns, Vite 7

---

## Task 1: Branding & Naming Updates

**Files:**
- Modify: `index.html`
- Modify: `src/routes/login.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Update index.html title**

```html
<!-- Change line 6 from -->
<title>NARMY — Personnel Self-Service Portal</title>
<!-- to -->
<title>Nigeria Army Pay Self-Service Portal</title>
```

Also update the meta description:
```html
<meta name="description" content="Nigeria Army Pay Self-Service Portal" />
```

- [ ] **Step 2: Update sidebar header in app-sidebar.tsx**

Replace lines 44-48 (the header text inside the sidebar):
```tsx
<div>
  <div className="text-sm font-bold tracking-[0.2em] text-white">Nigeria Army</div>
  <div className="text-[10px] tracking-wider text-white/40 uppercase">
    {user.role === 'personnel' ? 'Pay Self-Service' : 'Admin Console'}
  </div>
</div>
```

- [ ] **Step 3: Update login page left panel branding**

In `src/routes/login.tsx`:

Replace lines 84-87 (logo text):
```tsx
<div className="flex flex-col">
  <span className="text-army-gold text-sm font-bold tracking-[0.35em] uppercase">Nigeria Army</span>
  <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase mt-0.5">Pay Self-Service Portal</span>
</div>
```

Replace lines 97-104 (hero heading and description):
```tsx
<h1 className="text-white text-[2.75rem] xl:text-[3.25rem] leading-[1.15] mb-3 tracking-tight">
  <span className="font-light">Pay</span><br />
  <span className="font-bold">Self-Service Portal</span>
</h1>
<div className="w-12 h-[2px] bg-army-gold/50 my-6" />
<p className="text-white/40 text-[15px] max-w-md leading-[1.75]">
  Access your pay records, download documents, and submit requests, complaints and inquiries.
</p>
```

- [ ] **Step 4: Update login feature list**

Replace the feature list items (lines 109-114) with:
```tsx
{[
  { icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z', label: 'Access your pay records' },
  { icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3', label: 'Download documents' },
  { icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155', label: 'Submit requests, complaints and inquiries' },
  { icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', label: 'Profile & service information' },
  { icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z', label: 'Help centre & FAQs' },
].map((feature) => (
```

- [ ] **Step 5: Remove "Directorate" branding and update footer**

Replace lines 129-143 (bottom institutional branding) with:
```tsx
<div className="relative z-10 border-t border-white/[0.06] pt-6 flex items-end justify-between">
  <div>
    <div className="text-white/40 text-[11px] font-semibold uppercase tracking-[0.2em]">
      Federal Republic of Nigeria
    </div>
    <div className="text-white/20 text-[10px] uppercase tracking-[0.15em] mt-1.5">
      Nigeria Army
    </div>
  </div>
  <div className="border border-army-gold/15 rounded px-2.5 py-1">
    <span className="text-army-gold/50 text-[9px] font-bold uppercase tracking-[0.2em]">
      Official Use Only
    </span>
  </div>
</div>
```

- [ ] **Step 6: Update mobile header on login page**

Replace lines 159-162 (mobile header text):
```tsx
<div className="flex flex-col">
  <span className="text-army-dark font-bold text-sm tracking-[0.2em] uppercase">Nigeria Army</span>
  <span className="text-army-dark/30 text-[9px] tracking-[0.15em] uppercase">Pay Self-Service</span>
</div>
```

- [ ] **Step 7: Update login form heading**

Replace lines 167-172:
```tsx
<h2 className="text-army-dark text-[1.85rem] mb-2 font-bold tracking-tight">
  Secure Access
</h2>
<p className="text-army-dark/40 text-sm">
  Sign in with your Army Number and Password
</p>
```

- [ ] **Step 8: Update login page footer**

Replace lines 263-274 with footer including FAQ and contact:
```tsx
{/* Footer */}
<div className="mt-12 pt-6 border-t border-army-sand/50 space-y-4">
  <div className="flex items-center justify-between">
    <p className="text-army-dark/20 text-[10px] uppercase tracking-[0.15em] font-medium">
      Prototype v1.0
    </p>
    <div className="flex items-center gap-1.5 text-army-dark/15">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <span className="text-[10px] tracking-wider uppercase">Secured</span>
    </div>
  </div>
  <div className="flex items-center gap-4 text-[10px] text-army-dark/30">
    <span>Need help? Contact your base pay office</span>
    <span>·</span>
    <span>0800-ARMY-HELP</span>
  </div>
</div>
```

- [ ] **Step 9: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 10: Commit**

```bash
git add index.html src/routes/login.tsx src/components/app-sidebar.tsx
git commit -m "feat: update branding to Nigeria Army Pay Self-Service Portal"
```

---

## Task 2: E-Learning Removal

**Files:**
- Delete: `src/routes/_authenticated/e-learning/index.tsx`
- Delete: `src/routes/_authenticated/e-learning/$departmentId/index.tsx`
- Delete: `src/routes/_authenticated/e-learning/$departmentId/$courseId/index.tsx`
- Delete: `src/routes/_authenticated/e-learning/$departmentId/$courseId/$contentId.tsx`
- Delete: `src/data/elearning.ts`
- Delete: `src/types/elearning.ts`
- Modify: `src/contexts/DataContext.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/routes/_authenticated/_personnel/dashboard.tsx`

- [ ] **Step 1: Delete e-learning route files**

```bash
rm -rf src/routes/_authenticated/e-learning
```

- [ ] **Step 2: Delete e-learning data and types**

```bash
rm src/data/elearning.ts src/types/elearning.ts
```

- [ ] **Step 3: Remove e-learning from DataContext**

In `src/contexts/DataContext.tsx`:

Remove the import on line 3:
```tsx
import { SEED_PROGRESS } from '#/data/elearning'
```

Remove the type import on line 8:
```tsx
import type { CourseProgress } from '#/types/elearning'
```

Remove from the `DataContextValue` interface:
- `elearningProgress: CourseProgress[]`
- `toggleContentCompletion: (userId: string, courseId: string, contentId: string) => void`
- `toggleBookmark: (userId: string, courseId: string) => void`
- `getProgressForUser: (userId: string) => CourseProgress[]`

Remove state (line 40-42):
```tsx
const [elearningProgress, setElearningProgress] = useState<CourseProgress[]>(() =>
  loadFromStorage('elearning_progress', SEED_PROGRESS),
)
```

Remove `persistProgress` callback (lines 49-52).

Remove `toggleContentCompletion` callback (lines 163-188).

Remove `toggleBookmark` callback (lines 190-210).

Remove `getProgressForUser` callback (lines 212-215).

Remove from Provider value: `elearningProgress`, `toggleContentCompletion`, `toggleBookmark`, `getProgressForUser`.

- [ ] **Step 4: Remove Training from sidebar**

In `src/components/app-sidebar.tsx`:

Remove `GraduationCap` from lucide imports.

Remove from `personnelItems`:
```tsx
{ label: 'Training', to: '/e-learning', icon: GraduationCap },
```

Remove from `adminItems`:
```tsx
{ label: 'Training', to: '/e-learning', icon: GraduationCap },
```

- [ ] **Step 5: Remove e-learning from personnel dashboard**

In `src/routes/_authenticated/_personnel/dashboard.tsx`:

Remove `GraduationCap` from lucide imports.

Remove the elearning import (line 13):
```tsx
import { DEPARTMENTS, COURSES } from '#/data/elearning'
```

Remove `getProgressForUser` from the `useData()` destructure.

Remove all e-learning related code in the component body (lines 75-81 — relevantDepts, relevantCourses, elearningProgress, inProgressCourses).

Remove the entire E-Learning card section (lines 225-244).

- [ ] **Step 6: Regenerate route tree**

```bash
npx @tanstack/router-plugin generate
```

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no errors. No references to elearning remain.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: remove e-learning module completely"
```

---

## Task 3: Authentication Flow Overhaul

**Files:**
- Modify: `src/types/user.ts`
- Modify: `src/data/users.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Create: `src/routes/setup.tsx`
- Create: `src/routes/reset-password.tsx`
- Modify: `src/routes/login.tsx`
- Modify: `src/routes/_authenticated.tsx`
- Create: `src/components/session-timeout-modal.tsx`

- [ ] **Step 1: Update User type**

In `src/types/user.ts`, add new fields to the User interface:

```typescript
export interface User {
  id: string
  name: string
  armyNumber: string
  salaryAccountNo: string
  password: string
  pin: string | null
  isFirstLogin: boolean
  sessionToken: string | null
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

export interface PasswordResetRequest {
  id: string
  userId: string
  armyNumber: string
  userName: string
  requestedAt: string
  status: 'pending' | 'completed'
}
```

- [ ] **Step 2: Update demo users data**

In `src/data/users.ts`, add `password`, `pin`, `isFirstLogin`, `sessionToken` to every user. Most users get `isFirstLogin: false` and `pin: '0000'`. Set 2-3 users to `isFirstLogin: true` to demo the setup flow.

For each user, add:
```typescript
password: 'demo1234',
pin: '0000',
isFirstLogin: false,
sessionToken: null,
```

Set `user-002` (Private Musa) and `user-010` (Private Okoro) to `isFirstLogin: true` and `pin: null`.

- [ ] **Step 3: Update AuthContext for password-based login**

Rewrite `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { DEMO_USERS } from '#/data/users'
import { loadFromStorage, saveToStorage } from '#/lib/localStorage'
import type { User, UserRole, PasswordResetRequest } from '#/types/user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (armyNumber: string, password: string) => { user: User | null; error: string | null }
  logout: () => void
  hasRole: (...roles: UserRole[]) => boolean
  completeSetup: (newPassword: string, newPin: string) => void
  resetRequests: PasswordResetRequest[]
  requestPasswordReset: (armyNumber: string) => boolean
  adminResetPassword: (userId: string, newPassword: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = loadFromStorage<User | null>('auth_user', null)
    if (!stored) return null
    // Validate session token
    const users = loadFromStorage('users', DEMO_USERS)
    const current = users.find((u: User) => u.id === stored.id)
    if (!current || current.sessionToken !== stored.sessionToken) return null
    return stored
  })

  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(() =>
    loadFromStorage('password_reset_requests', []),
  )

  const login = useCallback((armyNumber: string, password: string): { user: User | null; error: string | null } => {
    const users = loadFromStorage('users', DEMO_USERS)
    const found = users.find((u: User) => u.armyNumber === armyNumber && u.password === password)
    if (!found) return { user: null, error: 'Invalid credentials. Please check your Army Number and Password.' }

    // Generate session token and save to user record
    const token = `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const updatedUser = { ...found, sessionToken: token }
    const updatedUsers = users.map((u: User) => u.id === found.id ? updatedUser : u)
    saveToStorage('users', updatedUsers)
    setUser(updatedUser)
    saveToStorage('auth_user', updatedUser)
    return { user: updatedUser, error: null }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem('narmy_auth_user') } catch { /* ignore */ }
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const completeSetup = useCallback((newPassword: string, newPin: string) => {
    if (!user) return
    const users = loadFromStorage('users', DEMO_USERS)
    const updated = { ...user, password: newPassword, pin: newPin, isFirstLogin: false }
    const updatedUsers = users.map((u: User) => u.id === user.id ? updated : u)
    saveToStorage('users', updatedUsers)
    setUser(updated)
    saveToStorage('auth_user', updated)
  }, [user])

  const requestPasswordReset = useCallback((armyNumber: string): boolean => {
    const users = loadFromStorage('users', DEMO_USERS)
    const found = users.find((u: User) => u.armyNumber === armyNumber)
    if (!found) return false
    const request: PasswordResetRequest = {
      id: `rst-${Date.now()}`,
      userId: found.id,
      armyNumber: found.armyNumber,
      userName: found.name,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    }
    const updated = [request, ...resetRequests]
    setResetRequests(updated)
    saveToStorage('password_reset_requests', updated)
    return true
  }, [resetRequests])

  const adminResetPassword = useCallback((userId: string, newPassword: string) => {
    const users = loadFromStorage('users', DEMO_USERS)
    const updatedUsers = users.map((u: User) =>
      u.id === userId ? { ...u, password: newPassword, pin: null, isFirstLogin: true, sessionToken: null } : u,
    )
    saveToStorage('users', updatedUsers)
    // Mark matching reset requests as completed
    const updatedRequests = resetRequests.map(r =>
      r.userId === userId && r.status === 'pending' ? { ...r, status: 'completed' as const } : r,
    )
    setResetRequests(updatedRequests)
    saveToStorage('password_reset_requests', updatedRequests)
  }, [resetRequests])

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: user !== null,
      login, logout, hasRole, completeSetup,
      resetRequests, requestPasswordReset, adminResetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 4: Update login page for password-based auth**

In `src/routes/login.tsx`:

Change state from `salaryAccount` to `password`:
```tsx
const [password, setPassword] = useState('')
```

Update `handleSubmit` to use new login signature:
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  const result = login(armyNumber, password)
  if (!result.user) {
    setError(result.error ?? 'Invalid credentials.')
    return
  }
  if (result.user.isFirstLogin) {
    navigate({ to: '/setup' })
  } else if (result.user.role === 'personnel') {
    navigate({ to: '/dashboard' })
  } else {
    navigate({ to: '/admin/dashboard' })
  }
}
```

Update `fillDemo` to fill password instead of salary account:
```tsx
const fillDemo = (armyNum: string, _salary: string) => {
  setArmyNumber(armyNum)
  setPassword('demo1234')
  setError('')
}
```

Change the "Salary Account Number" form field to "Password":
```tsx
<label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
  Password
</label>
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  autoComplete="current-password"
  className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 focus:bg-white transition-all"
/>
```

Add "Request New Password" link below the form, before the demo accounts divider:
```tsx
<div className="text-center mt-4">
  <Link to="/reset-password" className="text-xs text-army/60 hover:text-army transition-colors">
    Forgot password? Request a new one
  </Link>
</div>
```

Add the `Link` import from `@tanstack/react-router` (already imported).

- [ ] **Step 5: Create first-login setup page**

Create `src/routes/setup.tsx`:

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})

function SetupPage() {
  const { user, completeSetup } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'password' | 'pin'>('password')

  if (!user || !user.isFirstLogin) {
    navigate({ to: '/login' })
    return null
  }

  const passwordStrength = (() => {
    if (newPassword.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' }
    if (newPassword.length < 8) return { label: 'Weak', color: 'bg-amber-400', width: 'w-2/4' }
    if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
    return { label: 'Fair', color: 'bg-amber-400', width: 'w-3/4' }
  })()

  const handlePasswordNext = () => {
    setError('')
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setStep('pin')
  }

  const handleComplete = () => {
    setError('')
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits.'); return }
    if (pin !== confirmPin) { setError('PINs do not match.'); return }
    completeSetup(newPassword, pin)
    if (user.role === 'personnel') {
      navigate({ to: '/dashboard' })
    } else {
      navigate({ to: '/admin/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-army-cream/50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08] mx-auto mb-4">
            <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-army-dark">Account Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user.rank} {user.name.split(' ').pop()}. Set up your credentials.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1.5 rounded-full ${step === 'password' ? 'bg-army-gold' : 'bg-army'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step === 'pin' ? 'bg-army-gold' : 'bg-gray-200'}`} />
        </div>

        {step === 'password' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-army-dark mb-1">Create Password</h2>
              <p className="text-sm text-gray-500">Choose a strong password for your account.</p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                New Password
              </label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
              {newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                  </div>
                  <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Confirm Password
              </label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>}
            <button onClick={handlePasswordNext}
              className="w-full bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all">
              Continue to PIN Setup
            </button>
          </div>
        )}

        {step === 'pin' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-army-dark mb-1">Create PIN</h2>
              <p className="text-sm text-gray-500">Your 4-digit PIN is used to access sensitive data and download documents.</p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                4-Digit PIN
              </label>
              <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Confirm PIN
              </label>
              <input type="password" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-army-sand rounded-lg px-4 py-3 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setStep('password'); setError('') }}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={handleComplete}
                className="flex-1 bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all">
                Complete Setup
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">Demo password for all accounts: demo1234</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create password reset request page**

Create `src/routes/reset-password.tsx`:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [armyNumber, setArmyNumber] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!armyNumber.trim()) { setError('Please enter your Army Number.'); return }
    const success = requestPasswordReset(armyNumber)
    if (!success) { setError('Army Number not found. Please check and try again.'); return }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-army-cream/50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>

        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-army-dark mb-2">Request Submitted</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password reset request has been sent to an administrator. You will receive your new password through your base pay office.
            </p>
            <Link to="/login" className="text-sm font-semibold text-army hover:text-army-gold transition-colors">
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-army-dark mb-1">Request New Password</h2>
              <p className="text-sm text-gray-500">Enter your Army Number. An admin will generate a new password for you.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                  Army Number
                </label>
                <input type="text" value={armyNumber} onChange={(e) => setArmyNumber(e.target.value)}
                  placeholder="e.g. NA/23/01234" autoComplete="username"
                  className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>}
              <button type="submit"
                className="w-full bg-army-dark text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all">
                Submit Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create session timeout modal**

Create `src/components/session-timeout-modal.tsx`:

```tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '#/contexts/AuthContext'
import { useNavigate } from '@tanstack/react-router'

const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const WARNING_BEFORE = 60 * 1000 // warn at 4 minutes (60s before timeout)

export function SessionTimeoutManager() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)
  const lastActivity = useRef(Date.now())
  const warningTimer = useRef<ReturnType<typeof setTimeout>>()
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>()
  const countdownInterval = useRef<ReturnType<typeof setInterval>>()

  const resetTimers = useCallback(() => {
    lastActivity.current = Date.now()
    setShowWarning(false)

    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)

    warningTimer.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsLeft(60)
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, IDLE_TIMEOUT - WARNING_BEFORE)

    logoutTimer.current = setTimeout(() => {
      logout()
      navigate({ to: '/login' })
    }, IDLE_TIMEOUT)
  }, [logout, navigate])

  const stayLoggedIn = useCallback(() => {
    resetTimers()
  }, [resetTimers])

  useEffect(() => {
    if (!user) return

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    const handler = () => {
      if (!showWarning) resetTimers()
    }

    events.forEach((evt) => window.addEventListener(evt, handler, { passive: true }))
    resetTimers()

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handler))
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
    }
  }, [user, showWarning, resetTimers])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-army-dark mb-1">Session Expiring</h3>
        <p className="text-sm text-gray-500 mb-6">
          You'll be logged out in <span className="font-bold text-amber-600">{secondsLeft}</span> seconds due to inactivity.
        </p>
        <button onClick={stayLoggedIn}
          className="w-full bg-army-dark text-white py-3 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all">
          Stay Logged In
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Add session timeout to authenticated layout**

In `src/routes/_authenticated.tsx`, add:

```tsx
import { SessionTimeoutManager } from '#/components/session-timeout-modal'
```

Add `<SessionTimeoutManager />` inside the return, after `<SidebarProvider>`:
```tsx
return (
  <SidebarProvider>
    <SessionTimeoutManager />
    <div className="flex h-screen w-full overflow-hidden">
      ...
    </div>
  </SidebarProvider>
)
```

- [ ] **Step 9: Regenerate route tree and build**

```bash
npx @tanstack/router-plugin generate && npm run build
```

Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: implement password-based auth, first-login setup, session timeout"
```

---

## Task 4: Navigation & UI Cleanup

**Files:**
- Modify: `src/components/app-sidebar.tsx`
- Create: `src/components/breadcrumbs.tsx`
- Create: `src/components/notification-bell.tsx`
- Modify: `src/routes/_authenticated.tsx`
- Modify: `src/routes/_authenticated/_personnel/dashboard.tsx`

- [ ] **Step 1: Reorder sidebar menu items**

In `src/components/app-sidebar.tsx`, update the arrays:

```tsx
const personnelItems = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', to: '/profile', icon: UserRound },
  { label: 'Pay Slips', to: '/pay', icon: Wallet },
  { label: 'Inquiries', to: '/complaints', icon: MessageCircle },
  { label: 'Help Center', to: '/help', icon: HelpCircle },
]

const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', to: '/admin/tickets', icon: Ticket },
  { label: 'Payroll', to: '/admin/payroll', icon: Banknote },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'RBAC', to: '/admin/rbac', icon: Shield },
  { label: 'Profile', to: '/profile', icon: UserRound },
]
```

- [ ] **Step 2: Create breadcrumbs component**

Create `src/components/breadcrumbs.tsx`:

```tsx
import { Link, useMatches } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Home',
  '/profile': 'My Profile',
  '/pay': 'Pay Slips',
  '/complaints': 'Inquiries',
  '/complaints/new': 'New Inquiry',
  '/help': 'Help Center',
  '/admin/dashboard': 'Dashboard',
  '/admin/tickets': 'Tickets',
  '/admin/payroll': 'Payroll',
  '/admin/payroll/upload': 'Upload',
  '/admin/analytics': 'Analytics',
  '/admin/users': 'Users',
  '/admin/rbac': 'RBAC',
}

export function Breadcrumbs() {
  const matches = useMatches()
  const crumbs = matches
    .filter((m) => m.pathname !== '/' && m.pathname !== '/_authenticated' && m.pathname !== '/_authenticated/_personnel')
    .map((m) => ({
      path: m.pathname,
      label: routeLabels[m.pathname] ?? m.pathname.split('/').pop() ?? '',
    }))
    .filter((c) => c.label)

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 lg:hidden">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {i < crumbs.length - 1 ? (
            <Link to={crumb.path} className="hover:text-army transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-army-dark font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Create notification bell component**

Create `src/components/notification-bell.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'

export function NotificationBell() {
  const { user, resetRequests } = useAuth()
  const { complaints } = useData()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const isAdmin = user.role !== 'personnel'

  // Count notifications
  const items: { label: string; count: number }[] = []

  if (isAdmin) {
    const pendingResets = resetRequests.filter(r => r.status === 'pending').length
    if (pendingResets > 0) items.push({ label: 'Password reset requests', count: pendingResets })
    const openTickets = complaints.filter(c => !['resolved', 'closed'].includes(c.status)).length
    if (openTickets > 0) items.push({ label: 'Open tickets', count: openTickets })
  } else {
    const myComplaints = complaints.filter(c => c.userId === user.id)
    const needsFeedback = myComplaints.filter(c => c.status === 'resolved').length
    if (needsFeedback > 0) items.push({ label: 'Inquiries awaiting your feedback', count: needsFeedback })
    const hasUpdates = myComplaints.filter(c => c.status === 'needs-more-info' || c.status === 'action-required').length
    if (hasUpdates > 0) items.push({ label: 'Inquiries needing your response', count: hasUpdates })
  }

  const total = items.reduce((sum, i) => sum + i.count, 0)

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-black/5 transition-colors">
        <Bell className="w-5 h-5 text-gray-500" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-army-dark">Notifications</p>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">All caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.label} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Add breadcrumbs and notification bell to authenticated layout**

In `src/routes/_authenticated.tsx`:

```tsx
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset } from '#/components/ui/sidebar'
import { AppSidebar } from '#/components/app-sidebar'
import { SessionTimeoutManager } from '#/components/session-timeout-modal'
import { Breadcrumbs } from '#/components/breadcrumbs'
import { NotificationBell } from '#/components/notification-bell'
import { useAuth } from '#/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || !user) return null

  return (
    <SidebarProvider>
      <SessionTimeoutManager />
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
            <Breadcrumbs />
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-army-cream/50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
```

- [ ] **Step 5: Remove short pay indicators from dashboard**

In `src/routes/_authenticated/_personnel/dashboard.tsx`:

Remove `AlertTriangle` from lucide imports.

Remove `shortPaidSlip` variable (line 73):
```tsx
const shortPaidSlip = sortedPayslips.find(s => s.status === 'short-paid')
```

Remove the entire short-pay alert section (lines 152-168).

In the Net Pay section, remove the short-paid badge (lines 138-140):
```tsx
{latestPayslip?.status === 'short-paid' && (
  <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full">Short-paid</span>
)}
```

In the Pay History list, remove the short-paid badge (lines 271-273):
```tsx
{slip.status === 'short-paid' && (
  <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Short</span>
)}
```

Change the status dot color logic (lines 263-266) to just use green for paid:
```tsx
<div className="w-1.5 h-1.5 rounded-full bg-green-400" />
```

- [ ] **Step 6: Update dashboard greeting and rename complaints**

In `src/routes/_authenticated/_personnel/dashboard.tsx`:

The greeting on line 94 already uses `{getGreeting()}, {user.rank} {user.name.split(' ').pop()}` — this is correct.

Update "Complaints" text references:
- Line 175: `<h3 className="text-sm font-bold text-army-dark">Inquiries</h3>`
- Line 210-213: Change "Raise a complaint" to "Submit an inquiry":
```tsx
<PenLine className="w-3 h-3" />
Submit an inquiry
```
- Line 219: Change "Raise your first complaint" to "Submit your first inquiry"

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: update navigation order, add breadcrumbs, notification bell, remove short pay"
```

---

## Task 5: Complaints to Inquiries

**Files:**
- Modify: `src/types/complaint.ts`
- Modify: `src/data/categories.ts`
- Modify: `src/data/complaints.ts`
- Modify: `src/components/complaint-form.tsx`
- Modify: `src/routes/_authenticated/_personnel/complaints/new.tsx`
- Modify: `src/routes/_authenticated/_personnel/complaints/index.tsx` (if exists) or the complaints list route
- Modify: `src/components/status-badge.tsx`
- Modify: Any admin ticket views that reference old statuses

- [ ] **Step 1: Update complaint types**

In `src/types/complaint.ts`:

```typescript
export type ComplaintStatus = 'open' | 'review' | 'action-required' | 'resolved' | 'closed'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TimelineEvent {
  id: string
  timestamp: string
  type: 'status-change' | 'note' | 'escalation' | 'submission'
  description: string
  actor: string
  newStatus?: ComplaintStatus
}

export interface Category {
  id: string
  label: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  label: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  source?: 'submission' | 'response'
  uploadedAt?: string
}

export interface VoiceRecording {
  id: string
  dataUrl: string
  duration: number
  recordedAt: string
}

export interface Complaint {
  id: string
  userId: string
  userName: string
  userArmyNumber: string
  userDivision: string
  category: string
  subcategory: string
  description: string
  status: ComplaintStatus
  priority: ComplaintPriority
  filedDate: string
  lastUpdated: string
  timeline: TimelineEvent[]
  slaDeadline: string
  attachments?: Attachment[]
  voiceRecording?: VoiceRecording
}
```

- [ ] **Step 2: Update categories**

Replace `src/data/categories.ts`:

```typescript
import type { Category } from '#/types/complaint'

export const COMPLAINT_CATEGORIES: Category[] = [
  {
    id: 'pay',
    label: 'Pay',
    subcategories: [
      { id: 'overpayment-salary', label: 'Overpayment of Salary' },
      { id: 'underpayment-salary', label: 'Underpayment of Salary' },
      { id: 'non-payment-salary', label: 'Non-payment of Salary' },
      { id: 'overpayment-allowance', label: 'Overpayment of Allowance' },
      { id: 'underpayment-allowance', label: 'Underpayment of Allowance' },
      { id: 'non-payment-allowance', label: 'Non-payment of Allowance' },
    ],
  },
  {
    id: 'others',
    label: 'Others',
    subcategories: [],
  },
]
```

- [ ] **Step 3: Update seed complaints to use new statuses**

In `src/data/complaints.ts`, do a find-and-replace:
- `'submitted'` → `'open'`
- `'under-review'` → `'review'`
- `'needs-more-info'` → `'action-required'`
- `'escalated'` → `'review'` (merge escalated into review)
- Keep `'resolved'` and `'closed'` as-is

Also update categories in seed data to use new category IDs ('pay' or 'others').

- [ ] **Step 4: Update status badge component**

Find `src/components/status-badge.tsx` and update the status labels/colors:
- `open` → "Open" (blue)
- `review` → "In Review" (amber)
- `action-required` → "Action Required" (red)
- `resolved` → "Resolved" (green)
- `closed` → "Closed" (gray)

- [ ] **Step 5: Rewrite complaint form as single-page form with voice recording**

Replace `src/components/complaint-form.tsx` with a single-page form:

```tsx
import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { COMPLAINT_CATEGORIES } from '#/data/categories'
import { Textarea } from '#/components/ui/textarea'
import { Paperclip, X, File, FileImage, Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
import type { Complaint, Attachment, VoiceRecording } from '#/types/complaint'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ComplaintForm() {
  const { user } = useAuth()
  const { addComplaint } = useData()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!user) return null

  const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === categoryId)
  const showSubcategory = selectedCategory && selectedCategory.subcategories.length > 0

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) return // 20MB limit
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const removeAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id))

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          setVoiceRecording({
            id: `voice-${Date.now()}`,
            dataUrl: reader.result as string,
            duration: recordingTime,
            recordedAt: new Date().toISOString(),
          })
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch {
      // Microphone permission denied or unavailable
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const playRecording = () => {
    if (!voiceRecording) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); return }
    const audio = new Audio(voiceRecording.dataUrl)
    audioRef.current = audio
    setIsPlaying(true)
    audio.onended = () => { setIsPlaying(false); audioRef.current = null }
    audio.play()
  }

  const removeRecording = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setVoiceRecording(null)
    setIsPlaying(false)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const canSubmit = categoryId && (categoryId === 'others' || subcategoryId) && description.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    const year = new Date().getFullYear()
    const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()
    const priority: Complaint['priority'] = categoryId === 'pay' ? 'high' : 'medium'
    const complaint: Complaint = {
      id: `TKT-${year}-${uid}`,
      userId: user.id,
      userName: user.name,
      userArmyNumber: user.armyNumber,
      userDivision: user.division,
      category: selectedCategory?.label ?? 'Others',
      subcategory: selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.label ?? 'General Inquiry',
      description,
      status: 'open',
      priority,
      filedDate: now,
      lastUpdated: now,
      slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [{
        id: `evt-${Date.now()}`,
        timestamp: now,
        type: 'submission',
        description: `Inquiry submitted via Pay Self-Service Portal.${attachments.length > 0 ? ` ${attachments.length} file(s) attached.` : ''}${voiceRecording ? ' Voice recording attached.' : ''}`,
        actor: user.name,
      }],
      attachments: attachments.length > 0 ? attachments.map(a => ({ ...a, source: 'submission' as const, uploadedAt: now })) : undefined,
      voiceRecording: voiceRecording ?? undefined,
    }
    addComplaint(complaint)
    navigate({ to: '/complaints/$complaintId', params: { complaintId: complaint.id } })
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-army-dark mb-1">Submit an Inquiry</h2>
        <p className="text-sm text-gray-500">Describe your issue and we'll route it to the right team.</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">Category</label>
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId('') }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all">
          <option value="">Select a category</option>
          {COMPLAINT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {/* Subcategory */}
      {showSubcategory && (
        <div>
          <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">Subcategory</label>
          <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all">
            <option value="">Select a subcategory</option>
            {selectedCategory.subcategories.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">Description</label>
        <Textarea placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)}
          rows={5} className="resize-none rounded-xl border-gray-200 focus:ring-army/15 focus:border-army/30" />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">Attachments</label>
        {attachments.length > 0 && (
          <div className="space-y-2 mb-3">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5">
                {isImage(att.type) ? (
                  <img src={att.dataUrl} alt={att.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5 text-red-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-army-dark truncate">{att.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                </div>
                <button onClick={() => removeAttachment(att.id)} className="text-gray-500 hover:text-red-500 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple onChange={handleFileSelect} className="hidden" />
        <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center transition-all group cursor-pointer ${isDragging ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army/30 hover:bg-army/2'}`}>
          <Paperclip className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isDragging ? 'text-army' : 'text-gray-300 group-hover:text-army'}`} />
          <p className="text-sm text-gray-500">Click or drag files to upload</p>
          <p className="text-xs text-gray-400 mt-0.5">PDF or images, max 20MB each</p>
        </div>
      </div>

      {/* Voice Recording */}
      <div>
        <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">Voice Recording (optional)</label>
        {voiceRecording ? (
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
            <button onClick={playRecording} className="w-10 h-10 rounded-full bg-army/10 flex items-center justify-center hover:bg-army/20 transition-colors shrink-0">
              {isPlaying ? <Pause className="w-4 h-4 text-army" /> : <Play className="w-4 h-4 text-army ml-0.5" />}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-army-dark">Recording — {formatTime(voiceRecording.duration)}</p>
              <p className="text-xs text-gray-400">Recorded {new Date(voiceRecording.recordedAt).toLocaleTimeString()}</p>
            </div>
            <button onClick={removeRecording} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-sm font-medium text-red-700 flex-1">Recording... {formatTime(recordingTime)}</span>
            <button onClick={stopRecording} className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shrink-0">
              <Square className="w-3.5 h-3.5 text-white fill-white" />
            </button>
          </div>
        ) : (
          <button onClick={startRecording}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-army/30 hover:text-army transition-all w-full">
            <Mic className="w-4 h-4" />
            Record a voice message
          </button>
        )}
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!canSubmit}
        className="w-full px-5 py-3.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        Submit Inquiry
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Update new complaint route page text**

In `src/routes/_authenticated/_personnel/complaints/new.tsx`:

```tsx
<Link to="/complaints" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors mb-5">
  <ArrowLeft className="w-3.5 h-3.5" />
  All inquiries
</Link>
```

- [ ] **Step 7: Update complaint list route**

In `src/routes/_authenticated/_personnel/complaints/index.tsx`:
- Rename all user-facing "Complaint" text to "Inquiry"/"Inquiries"
- Change page title from "Complaints" to "Inquiries"
- Change "Raise a complaint" / "File a complaint" to "Submit an inquiry"
- Update status references: `submitted` → `open`, `under-review` → `review`, `needs-more-info` → `action-required`
- Remove any SLA display from user-facing views

In `src/routes/_authenticated/_personnel/complaints/$complaintId.tsx`:
- Rename "Complaint" to "Inquiry" in headings and labels
- Update status labels to match new values
- Add voice recording playback if complaint has `voiceRecording`
- Remove SLA countdown from user view

- [ ] **Step 8: Update admin ticket detail view**

In `src/routes/_authenticated/admin/tickets/$ticketId.tsx`, update status options to match new statuses: `open`, `review`, `action-required`, `resolved`, `closed`. Add voice recording playback if the complaint has one.

- [ ] **Step 9: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: rename complaints to inquiries, simplify form, add voice recording"
```

---

## Task 6: Pay Slips Updates

**Files:**
- Modify: `src/types/payslip.ts`
- Modify: `src/data/payslips.ts`
- Modify: `src/routes/_authenticated/_personnel/pay.tsx`
- Modify: `src/lib/pdf/payslip-template.tsx`

- [ ] **Step 1: Update payslip type — remove short-paid**

In `src/types/payslip.ts`:

```typescript
export type PayslipStatus = 'paid' | 'pending'

export interface PayComponent {
  label: string
  amount: number
  type: 'earning' | 'deduction'
}

export interface Payslip {
  id: string
  userId: string
  month: number
  year: number
  components: PayComponent[]
  grossPay: number
  totalDeductions: number
  netPay: number
  status: PayslipStatus
  paidDate: string | null
}
```

Remove `discrepancyNote` field entirely.

- [ ] **Step 2: Update payslip seed data**

In `src/data/payslips.ts`:

Remove `SF Allowance` from `officerEarnings`.
Remove `Pension Contribution` from all deductions arrays (`officerDeductions`, `soldierDeductions`, `belloDeductions`).
Remove `officerFebShortEarnings` entirely.
Remove any overrides with `status: 'short-paid'`.
Remove the `discrepancyNote` parameter from `makePayslip` and all calls.
Update `makePayslip` to not accept `discrepancyNote`.

Update `officerEarnings`:
```typescript
const officerEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 280000, type: 'earning' },
  { label: 'Housing Allowance', amount: 56000, type: 'earning' },
  { label: 'Transport Allowance', amount: 28000, type: 'earning' },
]
```

Update `officerDeductions`:
```typescript
const officerDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 32600, type: 'deduction' },
]
```

Similarly for soldier and bello deductions — remove Pension Contribution lines.

- [ ] **Step 3: Update pay page — remove YTD and short pay**

In `src/routes/_authenticated/_personnel/pay.tsx`:

Replace the summary strip (lines 104-125) with just Gross, Deductions, Net for latest month:
```tsx
<div className="grid grid-cols-3 gap-3">
  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Gross Pay</p>
    <p className="text-lg font-extrabold text-army-dark font-mono">₦{latestPayslip?.grossPay.toLocaleString() ?? '—'}</p>
    <p className="text-xs text-gray-500">{latestPayslip ? `${monthNamesShort[latestPayslip.month]} ${latestPayslip.year}` : ''}</p>
  </div>
  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Deductions</p>
    <p className="text-lg font-extrabold text-red-500 font-mono">₦{latestPayslip?.totalDeductions.toLocaleString() ?? '—'}</p>
    <p className="text-xs text-gray-500">Tax</p>
  </div>
  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Net Pay</p>
    <p className="text-lg font-extrabold text-army-dark font-mono">₦{latestPayslip?.netPay.toLocaleString() ?? '—'}</p>
    <p className="text-xs text-gray-500">{latestPayslip ? `${monthNamesShort[latestPayslip.month]} ${latestPayslip.year}` : ''}</p>
  </div>
</div>
```

Remove all YTD-related variables (`ytdPayslips`, `ytdEarnings`, `ytdDeductions`, `shortPaidCount`).

Remove the "Short-paid only" filter button.

Remove `statusFilter` state and all short-paid references in rendering.

Remove `discrepancyNote` rendering in expanded breakdown.

Remove "Report this discrepancy" links.

Remove `PenLine` and `AlertTriangle` imports if no longer used.

Add rolling 12-month filter to the payslips:
```tsx
const twelveMonthsAgo = new Date()
twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
const allPayslips = getPayslipsForUser(user.id)
  .filter(p => new Date(p.year, p.month - 1) >= twelveMonthsAgo)
  .sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))
```

- [ ] **Step 4: Update PDF template**

In `src/lib/pdf/payslip-template.tsx`, remove any rendering of `discrepancyNote` or short-paid status. The template should reflect the simplified components (no SF Allowance, no Pension).

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: simplify pay slips — remove YTD, short pay, pension, SF allowance"
```

---

## Task 7: Profile & Rank Display

**Files:**
- Modify: `src/routes/_authenticated/_personnel/dashboard.tsx`
- Modify: `src/routes/_authenticated/profile.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Update dashboard service detail chips**

In `src/routes/_authenticated/_personnel/dashboard.tsx`, update the service detail grid (lines 104-115):

```tsx
{[
  { label: 'Army No.', value: user.armyNumber },
  { label: 'Rank / Step', value: `${user.rank} — Step ${user.step}` },
  ...(user.personnelType === 'soldier' ? [{ label: 'Trade', value: user.trade }] : []),
  { label: 'Corps', value: user.corps },
].map(({ label, value }) => (
  <div key={label} className="min-w-0 pr-4">
    <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-0.5">{label}</p>
    <p className="text-[13px] text-white/80 font-semibold truncate">{value}</p>
  </div>
))}
```

- [ ] **Step 2: Update profile page rank display**

In `src/routes/_authenticated/profile.tsx`, ensure:
- Officers show rank + step, no trade
- Soldiers show rank + step + trade
- Both show corps

Find where trade is displayed and conditionally render based on `user.personnelType`.

- [ ] **Step 3: Update sidebar user card**

In `src/components/app-sidebar.tsx`, the footer user card (lines 76-83) currently shows name and army number. The greeting format (rank + surname) should be used in the dashboard, not the sidebar. The sidebar can keep showing full name — no change needed here unless the card shows rank redundantly.

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update rank display — officers no trade, soldiers show trade"
```

---

## Task 8: Help Center Update

**Files:**
- Modify: `src/routes/_authenticated/_personnel/help.tsx`

- [ ] **Step 1: Rewrite FAQ sections**

Replace the `faqSections` array in `src/routes/_authenticated/_personnel/help.tsx`:

```tsx
const faqSections: FAQSection[] = [
  {
    id: 'pay',
    title: 'Pay & Allowances',
    icon: Wallet,
    faqs: [
      { q: 'How do I download my payslip?', a: 'Navigate to Pay Slips from the sidebar. Each month shows your payslip with a download button to generate a PDF copy. You will need your verification PIN to download.', links: [{ label: 'Go to Pay Slips', to: '/pay' }] },
      { q: 'Why are my allowances different this month?', a: 'Allowances may change due to posting changes, rank promotions, or policy updates. Compare your current payslip components with previous months. If the change seems incorrect, submit an inquiry.' },
      { q: 'When is salary typically paid?', a: 'Salary payments are processed on the 25th of each month. If the 25th falls on a weekend or holiday, payment is processed on the preceding working day. Allow 1-2 business days for bank processing.' },
      { q: 'How do I report a pay discrepancy?', a: 'Submit an inquiry under the "Pay" category, selecting the appropriate subcategory (overpayment, underpayment, or non-payment of salary or allowance). Include the affected month and amounts.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'How far back can I view my pay history?', a: 'The portal shows your last 12 months of payslips. For older records, contact your base pay office.' },
    ],
  },
  {
    id: 'account',
    title: 'Account & Access',
    icon: UserCheck,
    faqs: [
      { q: 'How do I log in for the first time?', a: 'You will receive a pre-generated password from your base pay office. Log in with your Army Number and the issued password. On first login, you will be prompted to create a new password and a 4-digit PIN.' },
      { q: 'What is the PIN used for?', a: 'Your 4-digit PIN is used to download payslip PDFs and view sensitive personal data (NIN, BVN). Keep it confidential.' },
      { q: 'I forgot my password — what do I do?', a: 'Click "Forgot password? Request a new one" on the login page. This sends a request to an administrator. You will receive a new password through your base pay office, which will trigger a fresh password and PIN setup.' },
      { q: 'Why was I logged out?', a: 'For security, the portal automatically logs you out after 5 minutes of inactivity. You can only be logged in on one device at a time — logging in elsewhere will end your current session.' },
      { q: 'Who can access my information?', a: 'Only you can see your full pay and inquiry details. Sensitive data (NIN, BVN) is encrypted and requires PIN verification. Division Admins can view inquiries assigned to their division. All access is logged.', links: [{ label: 'View your profile', to: '/profile' }] },
      { q: 'How do I report a security concern?', a: 'If you suspect unauthorized access, contact the Help Desk immediately at 0800-ARMY-HELP. Do not share your login credentials with anyone.' },
    ],
  },
  {
    id: 'inquiries',
    title: 'Inquiries & Resolutions',
    icon: Clock,
    faqs: [
      { q: 'How do I submit an inquiry?', a: 'Go to Inquiries in the sidebar and click "New Inquiry". Select a category, describe your issue, attach documents or record a voice message, then submit.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'What do the inquiry statuses mean?', a: 'Open: received and queued. In Review: assigned to a handler. Action Required: the handler needs additional details from you. Resolved: issue addressed — you will be asked to confirm. Closed: case finalized.' },
      { q: 'What happens when my inquiry is marked Resolved?', a: 'You will be prompted to confirm the resolution or reopen the inquiry. If you do not respond within 7 days, the inquiry will be automatically closed.' },
      { q: 'Can I add more information to an existing inquiry?', a: 'Yes. Open your inquiry and use the response area to add a message or attach supporting documents. This is especially important if your inquiry shows "Action Required".', links: [{ label: 'View your inquiries', to: '/complaints' }] },
      { q: 'Can I record a voice message?', a: 'Yes. When submitting a new inquiry, you can record a voice message using the microphone button. This is helpful if typing is difficult. The recording will be heard by the administrator handling your case.' },
    ],
  },
  {
    id: 'status',
    title: 'Status & AWOL',
    icon: Shield,
    faqs: [
      { q: 'How do I dispute an incorrect AWOL status?', a: 'Submit an inquiry immediately with supporting documentation such as leave approval letters, medical certificates, or posting orders.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'What happens when I am marked AWOL?', a: 'AWOL status restricts portal access to inquiries only. Your pay may be withheld until the status is resolved. Submit a dispute immediately if this status is incorrect.' },
      { q: 'How long does a status dispute take to resolve?', a: 'Resolution depends on verification of your documentation. Ensure all supporting documents are attached when submitting to avoid delays.' },
    ],
  },
]
```

Remove unused icon imports (`FileText`, `MapPin`) if they are no longer referenced.

- [ ] **Step 2: Update help page CTA text**

Replace the bottom CTA section text:
- "Raise a complaint ticket" → "Submit an inquiry"
- "our team will respond within 14 days" → "our team will respond as soon as possible"
- Button text: "Raise a Ticket" → "Submit an Inquiry"

- [ ] **Step 3: Add contact information section**

After the FAQ sections and before the CTA, add a contact card:
```tsx
{/* Contact Information */}
<div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
  <div className="space-y-2 text-sm text-gray-600">
    <p>Help Desk: <span className="font-semibold text-army-dark">0800-ARMY-HELP</span></p>
    <p>Visit your base pay office for in-person assistance</p>
    <p>Operating hours: Monday–Friday, 08:00–16:00</p>
  </div>
</div>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update help center — new sections, remove outdated content"
```

---

## Task 9: Admin Updates

**Files:**
- Modify: `src/routes/_authenticated/admin/users/index.tsx`
- Modify: `src/contexts/DataContext.tsx` (if needed for user role updates)
- Modify: `src/data/users.ts`

- [ ] **Step 1: Add NCO admin to seed data**

In `src/data/users.ts`, change user-006 (Sergeant Yusuf) to `divisionAdmin`:

```typescript
{
  id: 'user-006',
  name: 'Sergeant Abubakar Yusuf',
  armyNumber: 'NA/18/03456',
  salaryAccountNo: 'SAL-004-2024',
  password: 'demo1234',
  pin: '0000',
  isFirstLogin: false,
  sessionToken: null,
  role: 'divisionAdmin',
  personnelType: 'soldier',
  // ... rest stays the same
}
```

- [ ] **Step 2: Enforce max 2 super admins**

In the admin users page (`src/routes/_authenticated/admin/users/index.tsx` or the user detail page), find where role promotion to superAdmin happens. Add a check:

```tsx
const superAdminCount = users.filter(u => u.role === 'superAdmin').length

// In the promote button/action:
{superAdminCount >= 2 && targetRole === 'superAdmin' && (
  <p className="text-xs text-amber-600">Maximum of 2 Super Admins allowed. Cannot promote.</p>
)}
```

Disable the superAdmin promotion option when count >= 2.

- [ ] **Step 3: Add password reset tab to admin users page**

In the admin users page, add a tab or section that shows pending password reset requests:

```tsx
// Tab: "Password Resets"
const { resetRequests, adminResetPassword } = useAuth()
const pendingResets = resetRequests.filter(r => r.status === 'pending')

// Render:
{pendingResets.map(r => (
  <div key={r.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3">
    <div>
      <p className="text-sm font-semibold text-army-dark">{r.userName}</p>
      <p className="text-xs text-gray-500 font-mono">{r.armyNumber} · Requested {new Date(r.requestedAt).toLocaleDateString()}</p>
    </div>
    <button onClick={() => adminResetPassword(r.userId, 'reset1234')}
      className="px-4 py-2 rounded-lg bg-army-gold text-army-dark text-xs font-bold hover:bg-army-gold-light transition-colors">
      Generate Password
    </button>
  </div>
))}
```

The generated password `reset1234` is shown to the admin for distribution. User gets `isFirstLogin: true`.

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: admin updates — NCO admin, max 2 super admins, password resets"
```

---

## Final Verification

- [ ] **Step 1: Full build check**

```bash
npm run build
```

- [ ] **Step 2: Run tests if any**

```bash
npm test
```

- [ ] **Step 3: Manual smoke test checklist**
- Login with password works
- First-login setup flow works
- Session timeout warning appears
- Sidebar shows correct menu order and "Inquiries" label
- E-learning completely gone
- Pay page shows Gross/Deductions/Net (no YTD, no short-paid)
- New inquiry form is single page with voice recording
- Help center has 4 sections, no posting/transfer/e-learning
- Admin can see password resets, max 2 super admin enforced
- Rank display: officers no trade, soldiers show trade
