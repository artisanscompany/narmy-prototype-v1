# NASFA E-Learning Platform — Design Spec

**Date:** 2026-04-01
**Status:** Approved
**Goal:** Add a polished, demo-ready e-learning section to the NARMY Personnel Portal, branded for NASFA (Nigerian Army School of Finance & Administration). Available to all profiles, scoped by trade and rank hierarchy. Must wow the room at the think-tank presentation.

---

## 1. Data Model

### Types (`src/types/elearning.ts`)

```typescript
type ClearanceLevel = 'all_ranks' | 'nco_above' | 'officer_above' | 'senior_officer'
type ContentType = 'curriculum' | 'lecture_notes' | 'training_material'
type FileFormat = 'pdf' | 'doc' | 'ppt' | 'video'

interface Department {
  id: string                    // e.g., 'accounting'
  name: string                  // e.g., 'Accounting'
  category: 'core' | 'supporting'
  description: string
  icon: string                  // lucide icon name
  courseCount: number
  trades: string[]              // which trades this dept is relevant to
}

interface Course {
  id: string
  departmentId: string
  title: string                 // e.g., 'Military Accounting & Budgeting'
  code: string                  // e.g., 'ACC-101'
  description: string
  objectives: string[]
  assessmentCriteria: string
  clearanceLevel: ClearanceLevel
  contents: CourseContent[]
}

interface CourseContent {
  id: string
  courseId: string
  title: string
  type: ContentType
  format: FileFormat
  description: string
  clearanceLevel: ClearanceLevel
  fileSize: string              // e.g., '2.4 MB'
  uploadedBy: string            // e.g., 'HOD Accounting'
  uploadDate: string
  pageCount: number             // for viewer preview
  summary: string               // fake content summary for viewer
}

interface CourseProgress {
  userId: string
  courseId: string
  completedContentIds: string[]
  bookmarked: boolean
  lastAccessedDate: string
}
```

### Clearance Mapping

| ClearanceLevel | Minimum Rank |
|---|---|
| `all_ranks` | Private and above (everyone) |
| `nco_above` | Corporal and above |
| `officer_above` | 2nd Lieutenant and above |
| `senior_officer` | Major and above |

Rank hierarchy order: Private → Corporal → Sergeant → Staff Sergeant → Warrant Officer → 2nd Lieutenant → Lieutenant → Captain → Major → Lieutenant Colonel → Colonel → Brigadier General → Major General

### Demo User Access Matrix

| User | Rank | Max Clearance | Locked Content |
|---|---|---|---|
| Pvt. Musa | Private | all_ranks | NCO+, Officer, Senior Officer |
| Cpl. Bello | Corporal | nco_above | Officer, Senior Officer |
| Capt. Adeyemi | Captain | officer_above | Senior Officer only |
| Maj. Okonkwo | Major | senior_officer | Nothing locked |
| Col. Nwachukwu | Colonel | senior_officer | Nothing locked |

---

## 2. Seed Data

### 6 NASFA Departments

**Core Academic:**
1. **Accounting** — trades: `['Accounting', 'Administration']` — 4 courses
2. **Office Technology & Management (OTM)** — trades: `['Administration', 'Clerical']` — 3 courses
3. **Military Service/Training** — trades: `['Infantry', 'Signals', 'Vehicle Maintenance']` — 3 courses

**Supporting/Short Courses:**
4. **Clerical/General Duties** — trades: `['Clerical', 'Administration']` — 3 courses
5. **Records Management** — trades: `['Administration', 'Clerical']` — 3 courses
6. **Computer Studies** — trades: `['Signals', 'Administration']` — 3 courses

### Course Catalog

| Dept | Course | Code | Clearance |
|---|---|---|---|
| Accounting | Military Accounting & Budgeting | ACC-101 | all_ranks |
| Accounting | Defence Financial Regulations | ACC-201 | nco_above |
| Accounting | Strategic Resource Allocation | ACC-301 | officer_above |
| Accounting | Classified Budget Operations | ACC-401 | senior_officer |
| OTM | Office Administration & Procedures | OTM-101 | all_ranks |
| OTM | Digital Records & Correspondence | OTM-102 | all_ranks |
| OTM | Executive Office Management | OTM-201 | officer_above |
| Military Service | Basic Military Training Doctrine | MST-101 | all_ranks |
| Military Service | Tactical Operations Planning | MST-201 | officer_above |
| Military Service | Classified Operations Procedures | MST-301 | senior_officer |
| Clerical | Service Documentation & Filing | CLR-101 | all_ranks |
| Clerical | Military Correspondence Standards | CLR-102 | all_ranks |
| Clerical | Personnel Records Administration | CLR-201 | nco_above |
| Records | Defence Records Management | REC-101 | all_ranks |
| Records | Archive & Retrieval Systems | REC-102 | all_ranks |
| Records | Classified Document Handling | REC-201 | officer_above |
| Computer Studies | Basic Computer Operations | CMP-101 | all_ranks |
| Computer Studies | Military Information Systems | CMP-201 | nco_above |
| Computer Studies | Defence Cybersecurity Fundamentals | CMP-301 | officer_above |

Each course has 3-5 content items across curriculum, lecture notes, and training materials. Individual content items may have a higher clearance than their parent course (e.g., a course at `all_ranks` may contain one lecture note at `nco_above`).

### Trade-to-Department Mapping (for "Your Courses")

- **Infantry** → Military Service/Training
- **Vehicle Maintenance** → Military Service/Training
- **Signals** → Military Service/Training, Computer Studies
- **Administration** → Accounting, OTM, Clerical, Records, Computer Studies
- **Clerical** → OTM, Clerical, Records
- **Accounting** → Accounting

### Seed Progress Data

Pre-populate progress for demo users to show the feature working:
- Capt. Adeyemi: 2 courses in progress (MST-101 at 3/5, ACC-101 at 1/4), 1 bookmarked (ACC-301)
- Pvt. Musa: 1 course in progress (MST-101 at 2/5)
- Maj. Okonkwo: 3 courses in progress (ACC-101 at 4/4 complete, OTM-101 at 2/3, REC-101 at 1/3), ACC-201 bookmarked

---

## 3. Route & Page Architecture

### Route Structure

```
src/routes/_authenticated/e-learning/
  index.tsx                           → /e-learning
  $departmentId/
    index.tsx                         → /e-learning/:departmentId
    $courseId.tsx                      → /e-learning/:departmentId/:courseId
```

Routes live under `_authenticated` (not `_personnel`) so all roles access them.

### Page 1: `/e-learning` — Department Catalog

**Sections top to bottom:**
1. **Admin banner** (divisionAdmin/superAdmin only) — muted gold bar: "Administrator View — You can manage content and restrictions" with ghost "Manage Content" button
2. **Hero** — "NASFA E-Learning Centre" heading, subtitle: "Nigerian Army School of Finance & Administration — Training & Development Platform"
3. **Search bar** — full-width input with search icon, filters across departments, courses, and content titles. Client-side, real-time filtering. Results replace the sections below with a grouped result list
4. **"Your Courses" section** — horizontal scrollable row of course cards matching user's trade. Each card shows: course code, title, department name, clearance badge, progress bar (if in progress), lock icon if restricted. Shows progress percentage if user has started the course
5. **"Bookmarked" section** (only if user has bookmarks) — same card format, showing bookmarked courses
6. **"All Departments" section** — 2x3 responsive grid of department cards. Each: icon, name, category badge (Core/Supporting), description snippet, course count. Click → `/e-learning/:departmentId`

### Page 2: `/e-learning/$departmentId` — Course Listing

**Layout:**
1. Breadcrumb: E-Learning → [Department Name]
2. Department header: icon, name, full description, category badge
3. Admin: "Add Course" ghost button next to header
4. Course cards — vertical list. Each card:
   - Course code + title
   - Description (2-3 lines truncated)
   - Clearance badge (colored by level)
   - Content count: "X materials available"
   - Progress bar if user has progress on this course
   - Bookmark star icon (toggle)
   - **If restricted:** lock overlay on the card body, title and clearance badge still visible. "Restricted — Requires [clearance level]" text centered over blurred area
   - **If accessible:** click → `/e-learning/:departmentId/:courseId`

### Page 3: `/e-learning/$departmentId/$courseId` — Course Detail

**Layout:**
1. Breadcrumb: E-Learning → [Dept] → [Course Title]
2. Course header: code, title, clearance badge, bookmark star, admin "Edit Course" ghost button
3. **If user lacks clearance for this course:**
   - Course overview is visible (title, description, objectives list, assessment criteria)
   - Below overview: full-width blur + lock overlay panel. Lock icon centered, text: "Restricted — Requires [Officer Rank and Above]", subtext: "Contact your HOD or Training Officer for access"
4. **If user has clearance:**
   - Course overview section (objectives, assessment criteria)
   - Progress bar: "X of Y materials completed"
   - Tabbed content sections: **Curriculum** | **Lecture Notes** | **Training Materials**
   - Each tab lists content items as rows:
     - File format icon (PDF/DOC/PPT/Video)
     - Title + description
     - Uploaded by, upload date, file size
     - Completion checkbox (toggle, persisted)
     - "View" button → opens ContentViewer
     - **If individual item is restricted:** row is blurred with small lock badge, "Requires [level]" text
   - Admin: "Upload Material" ghost button per tab section

---

## 4. Features

### Search

- Search input on `/e-learning` catalog page
- Client-side filtering across: department names, course titles, course codes, content item titles
- As user types, sections below are replaced with a flat grouped result list:
  - Results grouped by department
  - Each result shows: course code, title, matching field highlighted, clearance badge, lock status
  - Click result → navigates to course detail page
- Clear button resets to normal catalog view
- Empty state: "No results for '[query]'"

### Bookmarks

- Star/bookmark icon on course cards (catalog, department pages) and course detail header
- Toggle on click, persisted in localStorage via `CourseProgress.bookmarked`
- "Bookmarked" section on catalog page (only renders if user has bookmarks)
- Bookmarked courses from any department appear here for quick access

### Progress Tracking

- Checkbox on each content item in course detail
- Clicking toggles `completedContentIds` in `CourseProgress`, persisted to localStorage
- Progress bar on course cards: "X of Y completed" with green fill
- Dashboard quick card: "X courses in progress" with link to `/e-learning`
- Progress is per-user (keyed by userId + courseId)

### Content Viewer

- Clicking "View" on a content item opens a Sheet (slide-over panel from right, matching existing app pattern)
- Viewer shows:
  - Header: content title, format badge, file size, page count
  - Body: styled summary text (faked content — lorem-style but military-themed paragraphs)
  - For curriculum type: structured outline with numbered sections
  - For lecture notes: paragraph text with section headings
  - For training materials: bullet-point format
  - Footer: "Download" button, completion checkbox, close button
- **If item is restricted:** viewer shows lock overlay instead of content body
- No actual PDF rendering — the viewer simulates a document preview with styled text

### Admin Role-Aware UI

All roles access `/e-learning`. Additional elements by role:

**divisionAdmin / superAdmin:**
- Gold admin banner at top of catalog page
- "Add Course" ghost button on department page
- "Edit Course" ghost button on course detail header
- "Upload Material" ghost button per content tab
- "Manage Restrictions" ghost button on course detail (superAdmin only)
- All ghost buttons: styled as outline buttons, on click show toast: "Upload functionality coming in Phase 2" (or similar)

---

## 5. Components

### New Components

| Component | File | Purpose |
|---|---|---|
| `ClearanceBadge` | `src/components/clearance-badge.tsx` | Colored badge showing clearance level. Colors: green (all_ranks), yellow (nco_above), amber (officer_above), red (senior_officer) |
| `ContentLock` | `src/components/content-lock.tsx` | Blur + lock overlay. Props: `clearanceLevel`, `requiredLabel`. Used at card level and content-item level. Renders children blurred with centered lock icon + text |
| `CourseCard` | `src/components/course-card.tsx` | Reusable course card. Props: course data, user clearance, progress, bookmark state, onClick. Used on catalog and department pages |
| `ContentViewer` | `src/components/content-viewer.tsx` | Sheet-based document viewer. Props: content item, isOpen, onClose, onToggleComplete, canAccess |

### Existing Components Reused

- `Sheet` (from ui/) for ContentViewer
- `Badge` for clearance and category badges
- `Tabs` for course detail content sections
- `Card` for department and course cards
- `Input` for search
- Toast (Sonner) for admin ghost button feedback

---

## 6. Integration Points

### Files to Modify

1. **`src/components/app-sidebar.tsx`**
   - Add `GraduationCap` import from lucide-react
   - Add `{ label: 'E-Learning', to: '/e-learning', icon: GraduationCap }` to both `personnelItems` (position 2, after Dashboard) and `adminItems` (position 2, after Dashboard)

2. **`src/routes/_authenticated/_personnel/dashboard.tsx`**
   - Add an "E-Learning" quick access card in the bottom grid row
   - Shows: "X courses available for your trade", progress summary if any, link to `/e-learning`
   - Uses existing card styling pattern

3. **`src/contexts/DataContext.tsx`**
   - Add e-learning progress state: `elearningProgress: CourseProgress[]`
   - Add methods: `toggleContentCompletion(userId, courseId, contentId)`, `toggleBookmark(userId, courseId)`, `getProgressForUser(userId)`
   - Persist to localStorage with key `narmy_elearning_progress`

### New Files

```
src/types/elearning.ts
src/data/elearning.ts
src/lib/clearance.ts
src/components/clearance-badge.tsx
src/components/content-lock.tsx
src/components/course-card.tsx
src/components/content-viewer.tsx
src/routes/_authenticated/e-learning/index.tsx
src/routes/_authenticated/e-learning/$departmentId/index.tsx
src/routes/_authenticated/e-learning/$departmentId/$courseId.tsx
```

**Total: 10 new files, 3 modified files.**

---

## 7. Design Language

Follows existing NARMY design system exactly:
- Army dark/green/gold color palette
- White cards with `border-gray-100`, `rounded-xl`
- Army-dark headers and gold accents
- `text-sm`/`text-xs` typography scale
- Lucide icons throughout
- Hover transitions matching existing cards
- Toast notifications via Sonner

Clearance badge colors extend the palette:
- `all_ranks`: green (bg-green-50, text-green-700)
- `nco_above`: yellow (bg-yellow-50, text-yellow-700)
- `officer_above`: amber (bg-amber-50, text-amber-700)
- `senior_officer`: red (bg-red-50, text-red-700)

Lock overlay: `backdrop-blur-sm` with centered lock icon in army-dark, semi-transparent background.

---

## 8. Out of Scope

- Real file uploads or storage
- Actual PDF rendering (viewer uses styled fake content)
- Backend/API integration
- On-premise deployment considerations
- Live/online teaching features (Phase 2)
- User enrollment workflows
- Notifications for new content
- Course completion certificates
