# Profile Page Design

## Overview

Add a profile management page accessible to all authenticated users (personnel, divisionAdmin, superAdmin). The page displays personal information and service details with sensitive fields (NIN, BVN, Salary Account Number) masked at rest. Users can decrypt individual fields by entering a 4-digit verification code via a modal dialog.

## Data Model Changes

### New fields on `User` type

Add the following fields to the `User` interface in `src/types/user.ts`:

```typescript
nin: string           // National Identification Number (11 digits)
bvn: string           // Bank Verification Number (11 digits)
dateOfBirth: string   // ISO date string (e.g. "1995-11-10")
stateOfOrigin: string // e.g. "Kano State"
phone: string         // e.g. "+234 803 000 0002"
unit: string          // e.g. "1 Infantry Division Transport Company"
```

### Sensitive fields

These fields display masked at rest: `nin`, `bvn`, `salaryAccountNo`.

### Masking utility

A `maskSensitive(value: string): string` function that returns `"****"` + last 3 characters of the value. Example: `"23456789012"` becomes `"****012"`, `"SAL-002-2024"` becomes `"****024"`.

Location: `src/lib/utils.ts` (extend existing utils).

### Demo user data

All 5 users in `DEMO_USERS` (`src/data/users.ts`) get populated with the new fields. Private Ibrahim Musa (user #2) uses the exact data from the spec:

| Field          | Value                                    |
|----------------|------------------------------------------|
| nin            | 23456789012                              |
| bvn            | 12345678901                              |
| dateOfBirth    | 1995-11-10                               |
| stateOfOrigin  | Kano State                               |
| phone          | +234 803 000 0002                        |
| unit           | 1 Infantry Division Transport Company    |

Other demo users get similarly realistic dummy data for all new fields.

## Navigation

Add a "Profile" link to the sidebar in `src/components/app-sidebar.tsx`:
- Appears for **all roles** (personnel and admin nav lists)
- Icon: `UserRound` from lucide-react
- Route: `/profile`

## Routing

New route file: `src/routes/_authenticated/profile.tsx`
- Under `_authenticated/` (not nested under `_personnel/` or `admin/`) so all authenticated roles can access it
- Uses the authenticated layout with sidebar

## Profile Page Layout

### Personal Information Card

A card with labeled rows displaying:

1. National Identification Number (NIN) — masked, clickable to decrypt
2. BVN — masked, clickable to decrypt
3. Full Name — plain text (rank + name)
4. Army Number — plain text
5. Salary Account Number — masked, clickable to decrypt
6. Date of Birth — plain text, formatted
7. Date of Enlistment — plain text, formatted
8. State of Origin — plain text
9. Phone — plain text
10. Unit — plain text
11. Division — plain text
12. Corps — plain text

Footer note: "To correct any personal information, please raise a complaint ticket."

### Service Details Card

A card with labeled rows displaying:

1. Rank — plain text
2. Grade Level — plain text (e.g. "GL 04")
3. Step — plain text (e.g. "A1")
4. Trade — plain text (e.g. "Driver")
5. Status — displayed with the existing `StatusBadge` component

## Decrypt Modal

A `DecryptModal` component using the existing shadcn `Dialog`:

- **Trigger:** Clicking any masked sensitive field
- **Content:** "Enter verification code to view [field label]"
- **Input:** 4-digit code input field
- **Actions:** Submit button
- **On correct code (`0000`):** Modal closes, the clicked field is revealed (unmasked)
- **On wrong code:** Inline error message "Invalid verification code"
- **State:** Revealed fields tracked in local component state (`Set<string>` of field names). Each field decrypts independently. State resets on navigation away (component unmount).

## Styling

Follows existing military theme:
- Cards use existing shadcn `Card` component
- Army green / gold color scheme consistent with rest of app
- Masked fields show a lock/eye icon to indicate they're clickable
- Consistent spacing and typography with dashboard and pay pages

## Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `src/types/user.ts` — add new fields to User interface |
| Modify | `src/data/users.ts` — add dummy data for all 5 users |
| Modify | `src/lib/utils.ts` — add `maskSensitive()` utility |
| Modify | `src/components/app-sidebar.tsx` — add Profile nav link for all roles |
| Create | `src/routes/_authenticated/profile.tsx` — profile page |

The DecryptModal is defined inline within the profile page component (no separate file needed for a single-use dialog).
