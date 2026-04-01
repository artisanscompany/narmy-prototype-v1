# NASFA E-Learning Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished, demo-ready e-learning section to the NARMY Personnel Portal for NASFA, with department-based navigation, rank-scoped access control (lock + blur), progress tracking, bookmarks, search, and a content viewer — all available to every role.

**Architecture:** 3 new route pages under `/_authenticated/e-learning/` (catalog, department listing, course detail). Seed data for 6 departments and 19 courses with ~70 content items. Access control via rank-to-clearance mapping. Progress/bookmarks persisted in localStorage via DataContext. Content viewer uses Sheet component. Admin ghost buttons show future capability.

**Tech Stack:** React 19, TypeScript, TanStack Router v7 (file-based), Tailwind CSS v4, Base UI (Sheet, Tabs), Lucide icons, Sonner toasts, localStorage persistence.

**Spec:** `docs/superpowers/specs/2026-04-01-nasfa-elearning-design.md`

---

### Task 1: Types and Clearance Logic

**Files:**
- Create: `src/types/elearning.ts`
- Create: `src/lib/clearance.ts`

- [ ] **Step 1: Create e-learning types**

Create `src/types/elearning.ts`:

```typescript
export type ClearanceLevel = 'all_ranks' | 'nco_above' | 'officer_above' | 'senior_officer'
export type ContentType = 'curriculum' | 'lecture_notes' | 'training_material'
export type FileFormat = 'pdf' | 'doc' | 'ppt' | 'video'

export interface Department {
  id: string
  name: string
  category: 'core' | 'supporting'
  description: string
  icon: string
  courseCount: number
  trades: string[]
}

export interface Course {
  id: string
  departmentId: string
  title: string
  code: string
  description: string
  objectives: string[]
  assessmentCriteria: string
  clearanceLevel: ClearanceLevel
  contents: CourseContent[]
}

export interface CourseContent {
  id: string
  courseId: string
  title: string
  type: ContentType
  format: FileFormat
  description: string
  clearanceLevel: ClearanceLevel
  fileSize: string
  uploadedBy: string
  uploadDate: string
  pageCount: number
  summary: string
}

export interface CourseProgress {
  userId: string
  courseId: string
  completedContentIds: string[]
  bookmarked: boolean
  lastAccessedDate: string
}
```

- [ ] **Step 2: Create clearance helper**

Create `src/lib/clearance.ts`:

```typescript
import type { ClearanceLevel } from '#/types/elearning'

const RANK_ORDER: string[] = [
  'Private',
  'Lance Corporal',
  'Corporal',
  'Sergeant',
  'Staff Sergeant',
  'Warrant Officer',
  '2nd Lieutenant',
  'Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
  'Brigadier General',
  'Major General',
]

const CLEARANCE_MIN_RANK: Record<ClearanceLevel, string> = {
  all_ranks: 'Private',
  nco_above: 'Corporal',
  officer_above: '2nd Lieutenant',
  senior_officer: 'Major',
}

function getRankIndex(rank: string): number {
  const idx = RANK_ORDER.indexOf(rank)
  return idx === -1 ? 0 : idx
}

export function getUserClearanceLevel(rank: string): ClearanceLevel {
  const idx = getRankIndex(rank)
  if (idx >= getRankIndex('Major')) return 'senior_officer'
  if (idx >= getRankIndex('2nd Lieutenant')) return 'officer_above'
  if (idx >= getRankIndex('Corporal')) return 'nco_above'
  return 'all_ranks'
}

export function canAccess(userRank: string, required: ClearanceLevel): boolean {
  const userIdx = getRankIndex(userRank)
  const requiredIdx = getRankIndex(CLEARANCE_MIN_RANK[required])
  return userIdx >= requiredIdx
}

export function getClearanceLabel(level: ClearanceLevel): string {
  switch (level) {
    case 'all_ranks': return 'All Ranks'
    case 'nco_above': return 'NCO & Above'
    case 'officer_above': return 'Officers Only'
    case 'senior_officer': return 'Senior Officers'
  }
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors from the new files.

- [ ] **Step 4: Commit**

```bash
git add src/types/elearning.ts src/lib/clearance.ts
git commit -m "feat(elearning): add types and clearance logic"
```

---

### Task 2: Seed Data

**Files:**
- Create: `src/data/elearning.ts`

- [ ] **Step 1: Create seed data file with departments**

Create `src/data/elearning.ts` with all 6 departments, 19 courses, content items, and seed progress. This is a large data file — the full content follows.

```typescript
import type { Department, Course, CourseProgress } from '#/types/elearning'

export const DEPARTMENTS: Department[] = [
  {
    id: 'accounting',
    name: 'Accounting',
    category: 'core',
    description: 'Military accounting principles, defence financial regulations, budgeting, and fiscal management for armed forces operations.',
    icon: 'Calculator',
    courseCount: 4,
    trades: ['Accounting', 'Administration'],
  },
  {
    id: 'otm',
    name: 'Office Technology & Management',
    category: 'core',
    description: 'Modern office administration, digital correspondence, records management, and executive office operations in military environments.',
    icon: 'Monitor',
    courseCount: 3,
    trades: ['Administration', 'Clerical'],
  },
  {
    id: 'military-service',
    name: 'Military Service & Training',
    category: 'core',
    description: 'Core military doctrine, tactical operations, and field training procedures for all service personnel.',
    icon: 'Shield',
    courseCount: 3,
    trades: ['Infantry', 'Signals', 'Vehicle Maintenance'],
  },
  {
    id: 'clerical',
    name: 'Clerical & General Duties',
    category: 'supporting',
    description: 'Service documentation, military correspondence standards, and personnel records administration.',
    icon: 'ClipboardList',
    courseCount: 3,
    trades: ['Clerical', 'Administration'],
  },
  {
    id: 'records',
    name: 'Records Management',
    category: 'supporting',
    description: 'Defence records management, archive systems, and classified document handling procedures.',
    icon: 'FolderArchive',
    courseCount: 3,
    trades: ['Administration', 'Clerical'],
  },
  {
    id: 'computer-studies',
    name: 'Computer Studies',
    category: 'supporting',
    description: 'Computer operations, military information systems, and defence cybersecurity fundamentals.',
    icon: 'Laptop',
    courseCount: 3,
    trades: ['Signals', 'Administration'],
  },
]

export const COURSES: Course[] = [
  // ── Accounting ──
  {
    id: 'ACC-101',
    departmentId: 'accounting',
    title: 'Military Accounting & Budgeting',
    code: 'ACC-101',
    description: 'Foundational course covering military accounting principles, budget preparation, and financial reporting within the Nigerian Army structure.',
    objectives: [
      'Understand the structure of military financial management',
      'Prepare unit-level budgets using approved templates',
      'Interpret financial reports and variance analysis',
      'Apply Nigerian Army financial regulations to daily operations',
    ],
    assessmentCriteria: 'Written examination (60%), practical budget exercise (25%), continuous assessment (15%)',
    clearanceLevel: 'all_ranks',
    contents: [
      {
        id: 'acc101-c1', courseId: 'ACC-101', title: 'Scheme of Work — Military Accounting & Budgeting', type: 'curriculum', format: 'pdf',
        description: 'Complete course outline with weekly breakdown, topics, and assessment schedule.',
        clearanceLevel: 'all_ranks', fileSize: '1.2 MB', uploadedBy: 'HOD Accounting', uploadDate: '2026-01-15',
        pageCount: 12, summary: 'Week 1-2: Introduction to Military Financial Management\nWeek 3-4: Budget Classification and Structure\nWeek 5-6: Unit Budget Preparation\nWeek 7-8: Financial Reporting Standards\nWeek 9-10: Variance Analysis and Reconciliation\nWeek 11-12: Practical Exercises and Assessment\n\nCourse Objectives:\nThis course introduces personnel to the fundamental principles of military accounting as practised within the Nigerian Army. Students will learn to prepare, interpret, and manage unit-level budgets in accordance with extant financial regulations.',
      },
      {
        id: 'acc101-c2', courseId: 'ACC-101', title: 'Lecture Notes — Introduction to Military Finance', type: 'lecture_notes', format: 'pdf',
        description: 'Week 1-2 lecture notes covering the military financial management framework.',
        clearanceLevel: 'all_ranks', fileSize: '2.8 MB', uploadedBy: 'Lt. Col. Abubakar (HOD)', uploadDate: '2026-02-03',
        pageCount: 24, summary: '1. INTRODUCTION TO MILITARY FINANCIAL MANAGEMENT\n\n1.1 Overview\nThe Nigerian Army financial management system operates within the framework established by the Financial Regulations (FR) and extant Defence Headquarters directives. All financial transactions must comply with the provisions of the Fiscal Responsibility Act 2007.\n\n1.2 Structure of Military Finance\nThe military financial hierarchy flows from the Ministry of Defence through the Defence Headquarters to individual service arms. Each formation maintains a finance branch responsible for:\n- Budget preparation and execution\n- Payment processing and disbursement\n- Financial reporting and accountability\n- Audit compliance and documentation\n\n1.3 Key Principles\n- Accountability: Every kobo must be accounted for\n- Transparency: Financial records must be open to authorised audit\n- Regularity: All expenditure must conform to approved estimates',
      },
      {
        id: 'acc101-c3', courseId: 'ACC-101', title: 'Lecture Notes — Budget Preparation', type: 'lecture_notes', format: 'pdf',
        description: 'Week 3-4 lecture notes on budget classification and unit budget preparation.',
        clearanceLevel: 'all_ranks', fileSize: '3.1 MB', uploadedBy: 'Lt. Col. Abubakar (HOD)', uploadDate: '2026-02-17',
        pageCount: 28, summary: '2. BUDGET CLASSIFICATION AND STRUCTURE\n\n2.1 Budget Heads\nMilitary budgets are classified under the following heads:\n- Personnel Costs (Head 01): Salaries, allowances, pensions\n- Overhead Costs (Head 02): Utilities, maintenance, consumables\n- Capital Expenditure (Head 03): Equipment, infrastructure, vehicles\n\n2.2 Unit Budget Preparation\nEach unit prepares an annual budget estimate following the prescribed format:\nStep 1: Review previous year expenditure\nStep 2: Identify requirements for the coming year\nStep 3: Classify requirements under appropriate budget heads\nStep 4: Apply current rates and cost estimates\nStep 5: Submit through the chain of command for consolidation',
      },
      {
        id: 'acc101-c4', courseId: 'ACC-101', title: 'Budget Template — Unit Annual Estimate', type: 'training_material', format: 'doc',
        description: 'Editable template for preparing unit annual budget estimates.',
        clearanceLevel: 'nco_above', fileSize: '0.8 MB', uploadedBy: 'Finance Branch', uploadDate: '2026-01-20',
        pageCount: 6, summary: 'UNIT ANNUAL BUDGET ESTIMATE TEMPLATE\n\nFormation: _______________\nUnit: _______________\nFinancial Year: _______________\n\nSECTION A: PERSONNEL COSTS\n1.1 Salaries and Wages\n1.2 Allowances\n1.3 Social Contributions\n\nSECTION B: OVERHEAD COSTS\n2.1 Utilities\n2.2 Materials and Supplies\n2.3 Maintenance Services\n\nSECTION C: CAPITAL EXPENDITURE\n3.1 Equipment Procurement\n3.2 Infrastructure Development\n\nApproved by: _______________\nDate: _______________',
      },
    ],
  },
  {
    id: 'ACC-201',
    departmentId: 'accounting',
    title: 'Defence Financial Regulations',
    code: 'ACC-201',
    description: 'In-depth study of Nigerian Defence financial regulations, procurement procedures, and audit compliance requirements.',
    objectives: [
      'Interpret Defence Financial Regulations in full',
      'Apply procurement procedures in accordance with regulations',
      'Conduct internal financial audits at unit level',
      'Identify and report financial irregularities',
    ],
    assessmentCriteria: 'Written examination (50%), case study analysis (30%), continuous assessment (20%)',
    clearanceLevel: 'nco_above',
    contents: [
      {
        id: 'acc201-c1', courseId: 'ACC-201', title: 'Scheme of Work — Defence Financial Regulations', type: 'curriculum', format: 'pdf',
        description: 'Complete course outline for the defence financial regulations programme.',
        clearanceLevel: 'nco_above', fileSize: '1.0 MB', uploadedBy: 'HOD Accounting', uploadDate: '2026-01-15',
        pageCount: 10, summary: 'Week 1-3: Overview of Defence Financial Regulations\nWeek 4-6: Procurement Procedures and Guidelines\nWeek 7-9: Audit Compliance and Internal Controls\nWeek 10-12: Case Studies and Practical Assessment\n\nThis advanced course provides NCOs and above with comprehensive knowledge of the financial regulatory framework governing defence expenditure.',
      },
      {
        id: 'acc201-c2', courseId: 'ACC-201', title: 'Lecture Notes — Procurement Procedures', type: 'lecture_notes', format: 'pdf',
        description: 'Detailed notes on military procurement procedures and approval thresholds.',
        clearanceLevel: 'nco_above', fileSize: '3.5 MB', uploadedBy: 'Maj. Okonkwo', uploadDate: '2026-02-10',
        pageCount: 32, summary: '3. PROCUREMENT PROCEDURES\n\n3.1 Procurement Thresholds\nAll procurement within the Nigerian Army is governed by the Public Procurement Act 2007 and extant Defence HQ guidelines.\n\nApproval Thresholds:\n- Up to ₦500,000: Unit Commanding Officer\n- ₦500,001 - ₦2,500,000: Formation Commander\n- ₦2,500,001 - ₦50,000,000: Service Ministerial Tenders Board\n- Above ₦50,000,000: Federal Executive Council\n\n3.2 Procurement Methods\n- Open Competitive Bidding\n- Restricted Tendering\n- Direct Procurement (emergency only, with justification)',
      },
      {
        id: 'acc201-c3', courseId: 'ACC-201', title: 'Reference — Financial Regulations Handbook', type: 'training_material', format: 'pdf',
        description: 'Compiled reference handbook of key defence financial regulations.',
        clearanceLevel: 'nco_above', fileSize: '5.2 MB', uploadedBy: 'Finance Branch', uploadDate: '2026-01-08',
        pageCount: 48, summary: 'DEFENCE FINANCIAL REGULATIONS — QUICK REFERENCE\n\nChapter 1: General Provisions\nChapter 2: Revenue and Appropriation\nChapter 3: Expenditure Control\nChapter 4: Accounting and Reporting\nChapter 5: Audit and Inspection\nChapter 6: Stores and Procurement\nChapter 7: Special Provisions for Operational Expenditure',
      },
    ],
  },
  {
    id: 'ACC-301',
    departmentId: 'accounting',
    title: 'Strategic Resource Allocation',
    code: 'ACC-301',
    description: 'Advanced course on strategic-level resource allocation, defence budget analysis, and long-term financial planning for military operations.',
    objectives: [
      'Analyse defence budget allocation at strategic level',
      'Develop long-term financial plans for formations',
      'Evaluate resource allocation efficiency across units',
      'Present financial recommendations to senior leadership',
    ],
    assessmentCriteria: 'Research paper (40%), strategic planning exercise (35%), oral presentation (25%)',
    clearanceLevel: 'officer_above',
    contents: [
      {
        id: 'acc301-c1', courseId: 'ACC-301', title: 'Scheme of Work — Strategic Resource Allocation', type: 'curriculum', format: 'pdf',
        description: 'Course outline for strategic-level resource allocation and defence planning.',
        clearanceLevel: 'officer_above', fileSize: '0.9 MB', uploadedBy: 'HOD Accounting', uploadDate: '2026-01-15',
        pageCount: 8, summary: 'Week 1-2: Defence Budget Structure at National Level\nWeek 3-4: Strategic Planning Frameworks\nWeek 5-6: Resource Optimisation Models\nWeek 7-8: Long-Term Financial Planning\nWeek 9-10: Research Paper Development\nWeek 11-12: Presentations and Assessment',
      },
      {
        id: 'acc301-c2', courseId: 'ACC-301', title: 'Lecture Notes — Defence Budget Analysis', type: 'lecture_notes', format: 'pdf',
        description: 'Strategic-level analysis of Nigerian defence budget allocation patterns.',
        clearanceLevel: 'officer_above', fileSize: '4.1 MB', uploadedBy: 'Col. Nwachukwu', uploadDate: '2026-02-20',
        pageCount: 36, summary: 'STRATEGIC DEFENCE BUDGET ANALYSIS\n\n1. National Defence Expenditure Overview\nNigeria allocates approximately 0.6% of GDP to defence, significantly below the 2% NATO benchmark. The defence budget is distributed across four service arms with the Army receiving the largest share.\n\n2. Budget Allocation Patterns\n- Personnel: ~65% of total defence budget\n- Capital: ~20% of total defence budget\n- Overhead: ~15% of total defence budget\n\n3. Strategic Implications\nThe high personnel-to-capital ratio limits modernisation capacity and operational readiness.',
      },
      {
        id: 'acc301-c3', courseId: 'ACC-301', title: 'Case Study — Formation Budget Optimisation', type: 'training_material', format: 'pdf',
        description: 'Real-world case study on optimising resource allocation across a division.',
        clearanceLevel: 'officer_above', fileSize: '2.3 MB', uploadedBy: 'HOD Accounting', uploadDate: '2026-03-01',
        pageCount: 18, summary: 'CASE STUDY: 1 INFANTRY DIVISION BUDGET OPTIMISATION\n\nBackground:\nThe 1 Infantry Division faced a 15% budget reduction for FY2025 while maintaining operational tempo. This case study examines how the formation restructured its budget to maintain combat readiness.\n\nKey Decisions:\n1. Consolidated logistics across brigades (saved 8%)\n2. Shifted to preventive maintenance programme (saved 12% on vehicle costs)\n3. Centralised procurement for common items (saved 6%)',
      },
    ],
  },
  {
    id: 'ACC-401',
    departmentId: 'accounting',
    title: 'Classified Budget Operations',
    code: 'ACC-401',
    description: 'Highly restricted course on classified military budget operations, special accounts, and operational funding mechanisms.',
    objectives: [
      'Manage classified financial operations',
      'Administer special purpose accounts',
      'Comply with oversight requirements for classified expenditure',
    ],
    assessmentCriteria: 'Classified assessment — details provided upon enrolment',
    clearanceLevel: 'senior_officer',
    contents: [
      {
        id: 'acc401-c1', courseId: 'ACC-401', title: 'Course Overview — Classified Budget Operations', type: 'curriculum', format: 'pdf',
        description: 'Restricted course overview for classified budget operations programme.',
        clearanceLevel: 'senior_officer', fileSize: '0.6 MB', uploadedBy: 'Commandant NASFA', uploadDate: '2026-01-10',
        pageCount: 4, summary: 'CLASSIFIED BUDGET OPERATIONS — COURSE OVERVIEW\n\nThis course is restricted to officers of the rank of Major and above. Content covers the administration of special purpose accounts, classified operational funding, and oversight compliance.\n\nSecurity Classification: RESTRICTED\nDuration: 6 weeks\nPrerequisites: ACC-301, Security Clearance Level 3',
      },
      {
        id: 'acc401-c2', courseId: 'ACC-401', title: 'Lecture Notes — Special Accounts Administration', type: 'lecture_notes', format: 'pdf',
        description: 'Administration procedures for special purpose military accounts.',
        clearanceLevel: 'senior_officer', fileSize: '2.9 MB', uploadedBy: 'Col. Nwachukwu', uploadDate: '2026-02-28',
        pageCount: 22, summary: 'SPECIAL ACCOUNTS ADMINISTRATION\n\n[RESTRICTED CONTENT]\n\nThis material covers the procedures for managing special purpose accounts used in operational contexts. All personnel accessing this material must have appropriate security clearance and are bound by the Official Secrets Act.\n\n1. Types of Special Accounts\n2. Authorisation Procedures\n3. Disbursement Protocols\n4. Audit and Oversight Requirements\n5. Reporting Obligations',
      },
      {
        id: 'acc401-c3', courseId: 'ACC-401', title: 'Reference — Oversight Compliance Framework', type: 'training_material', format: 'pdf',
        description: 'Compliance framework for classified financial operations oversight.',
        clearanceLevel: 'senior_officer', fileSize: '1.8 MB', uploadedBy: 'Finance Branch', uploadDate: '2026-01-25',
        pageCount: 16, summary: 'OVERSIGHT COMPLIANCE FRAMEWORK FOR CLASSIFIED EXPENDITURE\n\n[RESTRICTED CONTENT]\n\nThis framework establishes the oversight and compliance requirements for all classified financial operations within the Nigerian Army.',
      },
    ],
  },

  // ── OTM ──
  {
    id: 'OTM-101',
    departmentId: 'otm',
    title: 'Office Administration & Procedures',
    code: 'OTM-101',
    description: 'Comprehensive introduction to military office administration, document handling, filing systems, and standard operating procedures.',
    objectives: [
      'Organise and manage a military office environment',
      'Apply standard filing and document management procedures',
      'Draft military correspondence in approved formats',
      'Manage office schedules and appointment systems',
    ],
    assessmentCriteria: 'Practical examination (50%), written test (30%), continuous assessment (20%)',
    clearanceLevel: 'all_ranks',
    contents: [
      {
        id: 'otm101-c1', courseId: 'OTM-101', title: 'Scheme of Work — Office Administration', type: 'curriculum', format: 'pdf',
        description: 'Complete course outline for office administration and procedures.', clearanceLevel: 'all_ranks',
        fileSize: '1.1 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-01-15', pageCount: 10,
        summary: 'Week 1-2: Introduction to Military Office Environment\nWeek 3-4: Filing Systems and Document Classification\nWeek 5-6: Military Correspondence Formats\nWeek 7-8: Office Equipment and Technology\nWeek 9-10: Schedule Management and Protocol\nWeek 11-12: Practical Assessment',
      },
      {
        id: 'otm101-c2', courseId: 'OTM-101', title: 'Lecture Notes — Military Filing Systems', type: 'lecture_notes', format: 'pdf',
        description: 'Detailed notes on military filing classification and document management.', clearanceLevel: 'all_ranks',
        fileSize: '2.4 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-02-05', pageCount: 20,
        summary: 'MILITARY FILING SYSTEMS\n\n1. Classification Scheme\nMilitary documents are filed using the Army Filing System (AFS) which classifies all correspondence under subject headings:\n- A Series: Administration\n- G Series: Operations\n- Q Series: Logistics\n- T Series: Training\n\n2. Security Classification\nAll documents must bear one of the following markings:\n- UNCLASSIFIED\n- RESTRICTED\n- CONFIDENTIAL\n- SECRET\n- TOP SECRET',
      },
      {
        id: 'otm101-c3', courseId: 'OTM-101', title: 'Template — Standard Military Letter Format', type: 'training_material', format: 'doc',
        description: 'Approved template for official military correspondence.', clearanceLevel: 'all_ranks',
        fileSize: '0.5 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-01-20', pageCount: 4,
        summary: 'STANDARD MILITARY LETTER FORMAT\n\nReference Number: ___/___/___\nDate: _______________\n\nFrom: [Rank, Name, Appointment]\nTo: [Rank, Name, Appointment]\n\nSubject: _______________\n\nReferences:\na. [Previous correspondence]\nb. [Relevant regulations]\n\n1. [Opening paragraph — state purpose]\n2. [Body — details and justification]\n3. [Closing — recommended action]\n\n[Signature Block]\n[Distribution List]',
      },
    ],
  },
  {
    id: 'OTM-102',
    departmentId: 'otm',
    title: 'Digital Records & Correspondence',
    code: 'OTM-102',
    description: 'Digital transformation of military records management — electronic filing, digital signatures, and correspondence tracking systems.',
    objectives: [
      'Operate electronic document management systems',
      'Apply digital signature procedures',
      'Track correspondence using digital systems',
    ],
    assessmentCriteria: 'Practical exam (60%), written test (25%), continuous assessment (15%)',
    clearanceLevel: 'all_ranks',
    contents: [
      {
        id: 'otm102-c1', courseId: 'OTM-102', title: 'Scheme of Work — Digital Records', type: 'curriculum', format: 'pdf',
        description: 'Course outline for digital records and correspondence management.', clearanceLevel: 'all_ranks',
        fileSize: '0.9 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-01-15', pageCount: 8,
        summary: 'Week 1-3: Introduction to Digital Records Management\nWeek 4-6: Electronic Filing and Classification\nWeek 7-9: Digital Signatures and Authentication\nWeek 10-12: Correspondence Tracking Systems',
      },
      {
        id: 'otm102-c2', courseId: 'OTM-102', title: 'Lecture Notes — Electronic Document Management', type: 'lecture_notes', format: 'pdf',
        description: 'Introduction to EDMS in military environments.', clearanceLevel: 'all_ranks',
        fileSize: '2.6 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-02-12', pageCount: 22,
        summary: 'ELECTRONIC DOCUMENT MANAGEMENT SYSTEMS (EDMS)\n\n1. Overview\nModern military organisations are transitioning from paper-based to electronic document management. EDMS provides:\n- Centralised document storage\n- Version control and audit trails\n- Access control based on security classification\n- Rapid search and retrieval capabilities\n\n2. Implementation Considerations\n- Security requirements for classified material\n- Integration with existing filing systems\n- Training requirements for personnel\n- Backup and disaster recovery',
      },
      {
        id: 'otm102-c3', courseId: 'OTM-102', title: 'Guide — Digital Signature Procedures', type: 'training_material', format: 'pdf',
        description: 'Step-by-step guide for using digital signatures in military correspondence.', clearanceLevel: 'all_ranks',
        fileSize: '1.4 MB', uploadedBy: 'IT Branch', uploadDate: '2026-02-01', pageCount: 12,
        summary: 'DIGITAL SIGNATURE PROCEDURES\n\n1. Overview of Digital Signatures\nDigital signatures provide authentication, integrity, and non-repudiation for electronic military correspondence.\n\n2. Procedure\nStep 1: Obtain your digital certificate from the IT Branch\nStep 2: Install the certificate on your workstation\nStep 3: Open the document to be signed\nStep 4: Select "Add Digital Signature" from the menu\nStep 5: Enter your PIN when prompted\nStep 6: Verify the signature appears correctly',
      },
    ],
  },
  {
    id: 'OTM-201',
    departmentId: 'otm',
    title: 'Executive Office Management',
    code: 'OTM-201',
    description: 'Advanced office management for senior staff — managing general officer schedules, briefing preparation, and high-level correspondence.',
    objectives: [
      'Manage executive-level military offices',
      'Prepare briefing materials for senior officers',
      'Coordinate high-level meetings and conferences',
    ],
    assessmentCriteria: 'Practical demonstration (50%), written exam (30%), portfolio (20%)',
    clearanceLevel: 'officer_above',
    contents: [
      {
        id: 'otm201-c1', courseId: 'OTM-201', title: 'Scheme of Work — Executive Office Management', type: 'curriculum', format: 'pdf',
        description: 'Course outline for executive office management programme.', clearanceLevel: 'officer_above',
        fileSize: '0.8 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-01-15', pageCount: 8,
        summary: 'Week 1-2: The Executive Military Office\nWeek 3-4: Briefing Preparation and Presentation\nWeek 5-6: Conference and Meeting Management\nWeek 7-8: Protocol and Diplomatic Correspondence\nWeek 9-10: Portfolio Development\nWeek 11-12: Practical Assessment',
      },
      {
        id: 'otm201-c2', courseId: 'OTM-201', title: 'Lecture Notes — Briefing Preparation', type: 'lecture_notes', format: 'ppt',
        description: 'Comprehensive guide on preparing military briefings for senior leadership.', clearanceLevel: 'officer_above',
        fileSize: '4.8 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-02-18', pageCount: 30,
        summary: 'MILITARY BRIEFING PREPARATION\n\n1. Types of Briefings\n- Information Briefing: Presents facts without recommendation\n- Decision Briefing: Presents options with recommended course of action\n- Staff Briefing: Coordinates among staff elements\n- Mission Briefing: Conveys specific operational instructions\n\n2. Briefing Format (Standard)\n- Situation\n- Mission\n- Execution\n- Service Support\n- Command and Signal\n\n3. Presentation Standards\n- Maximum 15 minutes unless directed otherwise\n- Use of visual aids mandatory for decision briefings\n- Rehearsal required before presentation to General Officers',
      },
      {
        id: 'otm201-c3', courseId: 'OTM-201', title: 'Template — Briefing Slides Format', type: 'training_material', format: 'ppt',
        description: 'Approved briefing slide templates for senior officer presentations.', clearanceLevel: 'officer_above',
        fileSize: '3.2 MB', uploadedBy: 'HOD OTM', uploadDate: '2026-01-25', pageCount: 15,
        summary: 'APPROVED BRIEFING SLIDE TEMPLATES\n\nTemplate 1: Information Briefing\n- Title slide with formation crest\n- Situation overview\n- Key facts and figures\n- Summary and way forward\n\nTemplate 2: Decision Briefing\n- Background and problem statement\n- Options analysis (pros/cons matrix)\n- Recommended course of action\n- Resource implications\n- Decision required',
      },
    ],
  },

  // ── Military Service ──
  {
    id: 'MST-101',
    departmentId: 'military-service',
    title: 'Basic Military Training Doctrine',
    code: 'MST-101',
    description: 'Foundational military doctrine covering chain of command, military law, drill procedures, and basic field craft.',
    objectives: [
      'Explain the Nigerian Army command structure',
      'Apply basic military law and regulations',
      'Demonstrate standard drill movements',
      'Perform basic field craft and navigation',
      'Understand the Armed Forces Act',
    ],
    assessmentCriteria: 'Practical drill assessment (40%), written exam (35%), field exercise (25%)',
    clearanceLevel: 'all_ranks',
    contents: [
      {
        id: 'mst101-c1', courseId: 'MST-101', title: 'Scheme of Work — Basic Military Doctrine', type: 'curriculum', format: 'pdf',
        description: 'Complete course outline for basic military training doctrine.', clearanceLevel: 'all_ranks',
        fileSize: '1.3 MB', uploadedBy: 'HOD Military Service', uploadDate: '2026-01-15', pageCount: 14,
        summary: 'Week 1-2: Nigerian Army Organisation and Command Structure\nWeek 3-4: Military Law and the Armed Forces Act\nWeek 5-6: Drill Procedures and Ceremonial\nWeek 7-8: Basic Field Craft\nWeek 9-10: Map Reading and Navigation\nWeek 11-12: Field Exercise and Assessment',
      },
      {
        id: 'mst101-c2', courseId: 'MST-101', title: 'Lecture Notes — Command Structure', type: 'lecture_notes', format: 'pdf',
        description: 'Detailed overview of Nigerian Army organisational structure and chain of command.', clearanceLevel: 'all_ranks',
        fileSize: '3.2 MB', uploadedBy: 'HOD Military Service', uploadDate: '2026-02-03', pageCount: 26,
        summary: 'NIGERIAN ARMY COMMAND STRUCTURE\n\n1. National Command Authority\n- Commander-in-Chief (President)\n- Minister of Defence\n- Chief of Defence Staff\n- Chief of Army Staff\n\n2. Army Structure\n- Army Headquarters\n- Divisions (1 Div, 2 Div, 3 Div, etc.)\n- Brigades\n- Battalions\n- Companies\n- Platoons\n- Sections\n\n3. Rank Structure\nOfficers: 2nd Lieutenant → Lieutenant → Captain → Major → Lt Colonel → Colonel → Brigadier General → Major General → Lieutenant General → General\nSoldiers: Private → Lance Corporal → Corporal → Sergeant → Staff Sergeant → Warrant Officer',
      },
      {
        id: 'mst101-c3', courseId: 'MST-101', title: 'Lecture Notes — Military Law Basics', type: 'lecture_notes', format: 'pdf',
        description: 'Introduction to military law, the Armed Forces Act, and disciplinary procedures.', clearanceLevel: 'all_ranks',
        fileSize: '2.8 MB', uploadedBy: 'Legal Branch', uploadDate: '2026-02-10', pageCount: 22,
        summary: 'MILITARY LAW — INTRODUCTION\n\n1. The Armed Forces Act\nThe Armed Forces Act CAP A20 Laws of the Federation of Nigeria 2004 governs the discipline and administration of the Nigerian Armed Forces.\n\n2. Key Provisions\n- Enlistment and Terms of Service\n- Offences and Punishments\n- Courts Martial Procedures\n- Appeals and Review Process\n\n3. Disciplinary Offences\n- Absence Without Leave (AWOL)\n- Insubordination\n- Conduct Prejudicial to Good Order\n- Disobedience of Lawful Command',
      },
      {
        id: 'mst101-c4', courseId: 'MST-101', title: 'Field Manual — Basic Map Reading', type: 'training_material', format: 'pdf',
        description: 'Practical guide to military map reading, grid references, and compass navigation.', clearanceLevel: 'all_ranks',
        fileSize: '4.5 MB', uploadedBy: 'Training Wing', uploadDate: '2026-01-20', pageCount: 34,
        summary: 'BASIC MAP READING AND NAVIGATION\n\n1. Map Fundamentals\n- Scale and distance measurement\n- Contour lines and elevation\n- Grid reference system (4-figure and 6-figure)\n- Conventional signs and symbols\n\n2. Compass Navigation\n- Parts of the compass\n- Taking a bearing\n- Converting grid to magnetic bearing\n- Following a bearing in the field\n\n3. Practical Exercises\n- Route planning on 1:50,000 maps\n- Night navigation procedures\n- GPS backup procedures',
      },
      {
        id: 'mst101-c5', courseId: 'MST-101', title: 'Drill Manual — Standard Movements', type: 'training_material', format: 'pdf',
        description: 'Complete drill manual covering all standard movements and ceremonial procedures.', clearanceLevel: 'all_ranks',
        fileSize: '2.1 MB', uploadedBy: 'RSM Training Wing', uploadDate: '2026-01-18', pageCount: 28,
        summary: 'STANDARD DRILL MOVEMENTS\n\n1. Individual Drill\n- Attention\n- Stand at Ease / Stand Easy\n- Saluting (to the front, to the right/left)\n- Turning movements (right turn, left turn, about turn)\n- Marching (quick march, slow march, halt)\n\n2. Squad Drill\n- Forming up\n- Dressing\n- Open/Close order\n- Marching in formation\n\n3. Ceremonial\n- Guard mounting\n- Colour party drill\n- General salute',
      },
    ],
  },
  {
    id: 'MST-201',
    departmentId: 'military-service',
    title: 'Tactical Operations Planning',
    code: 'MST-201',
    description: 'Officer-level course on tactical planning, operations orders, and field command procedures.',
    objectives: [
      'Develop tactical operations plans',
      'Write and deliver operations orders',
      'Conduct tactical appreciations',
      'Command small unit operations',
    ],
    assessmentCriteria: 'Operations order exercise (40%), tactical exercise without troops (35%), oral assessment (25%)',
    clearanceLevel: 'officer_above',
    contents: [
      {
        id: 'mst201-c1', courseId: 'MST-201', title: 'Scheme of Work — Tactical Operations', type: 'curriculum', format: 'pdf',
        description: 'Course outline for tactical operations planning.', clearanceLevel: 'officer_above',
        fileSize: '1.0 MB', uploadedBy: 'HOD Military Service', uploadDate: '2026-01-15', pageCount: 10,
        summary: 'Week 1-2: The Tactical Planning Process\nWeek 3-4: Intelligence Preparation of the Battlefield\nWeek 5-6: Operations Order Format and Writing\nWeek 7-8: Tactical Appreciation\nWeek 9-10: TEWT (Tactical Exercise Without Troops)\nWeek 11-12: Command Post Exercise',
      },
      {
        id: 'mst201-c2', courseId: 'MST-201', title: 'Lecture Notes — Operations Order Format', type: 'lecture_notes', format: 'pdf',
        description: 'Detailed guide on writing military operations orders.', clearanceLevel: 'officer_above',
        fileSize: '3.8 MB', uploadedBy: 'HOD Military Service', uploadDate: '2026-02-15', pageCount: 30,
        summary: 'OPERATIONS ORDER FORMAT\n\n1. SITUATION\n  a. Enemy Forces\n  b. Friendly Forces\n  c. Attachments and Detachments\n\n2. MISSION\n  [Who, What, When, Where, Why]\n\n3. EXECUTION\n  a. Concept of Operations\n  b. Scheme of Manoeuvre\n  c. Tasks to Subordinate Units\n  d. Coordinating Instructions\n\n4. SERVICE SUPPORT\n  a. Logistics\n  b. Medical\n  c. Personnel\n\n5. COMMAND AND SIGNAL\n  a. Command\n  b. Signal',
      },
      {
        id: 'mst201-c3', courseId: 'MST-201', title: 'Reference — Tactical Symbols Guide', type: 'training_material', format: 'pdf',
        description: 'Military map symbols and tactical graphics reference.', clearanceLevel: 'officer_above',
        fileSize: '2.7 MB', uploadedBy: 'Training Wing', uploadDate: '2026-01-22', pageCount: 24,
        summary: 'TACTICAL SYMBOLS AND GRAPHICS\n\nThis guide covers standard NATO/AU tactical symbols used in military operations:\n\n1. Unit Symbols\n- Infantry, Armour, Artillery, Engineers, Signals\n- Size indicators (team through corps)\n\n2. Tactical Graphics\n- Boundaries and phase lines\n- Objectives and checkpoints\n- Routes and axes of advance\n- Fire support coordination measures',
      },
    ],
  },
  {
    id: 'MST-301',
    departmentId: 'military-service',
    title: 'Classified Operations Procedures',
    code: 'MST-301',
    description: 'Restricted course covering classified operational procedures, intelligence handling, and special operations coordination.',
    objectives: [
      'Handle classified operational information',
      'Coordinate with intelligence agencies',
      'Plan and execute special operations',
    ],
    assessmentCriteria: 'Classified assessment — details provided upon enrolment',
    clearanceLevel: 'senior_officer',
    contents: [
      {
        id: 'mst301-c1', courseId: 'MST-301', title: 'Course Overview — Classified Operations', type: 'curriculum', format: 'pdf',
        description: 'Restricted course overview for classified operations procedures.', clearanceLevel: 'senior_officer',
        fileSize: '0.5 MB', uploadedBy: 'Commandant NASFA', uploadDate: '2026-01-10', pageCount: 4,
        summary: 'CLASSIFIED OPERATIONS PROCEDURES — COURSE OVERVIEW\n\n[RESTRICTED CONTENT]\n\nThis course is restricted to officers of the rank of Major and above with appropriate security clearance.\n\nSecurity Classification: SECRET\nDuration: 4 weeks\nPrerequisites: MST-201, Security Clearance Level 4',
      },
      {
        id: 'mst301-c2', courseId: 'MST-301', title: 'Lecture Notes — Intelligence Coordination', type: 'lecture_notes', format: 'pdf',
        description: 'Procedures for coordinating with military intelligence agencies.', clearanceLevel: 'senior_officer',
        fileSize: '3.4 MB', uploadedBy: 'Col. Nwachukwu', uploadDate: '2026-03-05', pageCount: 28,
        summary: 'INTELLIGENCE COORDINATION PROCEDURES\n\n[RESTRICTED CONTENT]\n\nThis material covers coordination procedures between operational units and intelligence agencies. Access is strictly limited to authorised personnel.',
      },
      {
        id: 'mst301-c3', courseId: 'MST-301', title: 'Reference — Special Operations Handbook', type: 'training_material', format: 'pdf',
        description: 'Handbook for special operations planning and execution.', clearanceLevel: 'senior_officer',
        fileSize: '4.2 MB', uploadedBy: 'Special Operations Branch', uploadDate: '2026-02-15', pageCount: 40,
        summary: 'SPECIAL OPERATIONS HANDBOOK\n\n[RESTRICTED CONTENT]\n\nThis handbook is classified SECRET and is only available to authorised personnel involved in special operations planning.',
      },
    ],
  },

  // ── Clerical ──
  {
    id: 'CLR-101',
    departmentId: 'clerical',
    title: 'Service Documentation & Filing',
    code: 'CLR-101',
    description: 'Fundamentals of military service documentation, personnel file management, and filing procedures.',
    objectives: ['Manage military personnel files', 'Apply correct filing procedures', 'Maintain service documentation records'],
    assessmentCriteria: 'Practical exam (50%), written test (30%), continuous assessment (20%)',
    clearanceLevel: 'all_ranks',
    contents: [
      { id: 'clr101-c1', courseId: 'CLR-101', title: 'Scheme of Work — Service Documentation', type: 'curriculum', format: 'pdf', description: 'Course outline for service documentation programme.', clearanceLevel: 'all_ranks', fileSize: '0.9 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-15', pageCount: 8, summary: 'Week 1-3: Personnel File Structure and Management\nWeek 4-6: Service Documentation Types\nWeek 7-9: Filing Procedures and Classification\nWeek 10-12: Practical Filing Exercises' },
      { id: 'clr101-c2', courseId: 'CLR-101', title: 'Lecture Notes — Personnel File Management', type: 'lecture_notes', format: 'pdf', description: 'How to create and maintain military personnel files.', clearanceLevel: 'all_ranks', fileSize: '2.2 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-02-05', pageCount: 18, summary: 'PERSONNEL FILE MANAGEMENT\n\n1. File Structure\nEvery military personnel file contains:\n- Part 1: Personal particulars and next of kin\n- Part 2: Service history and postings\n- Part 3: Qualifications and courses\n- Part 4: Medical records\n- Part 5: Disciplinary record\n- Part 6: Correspondence\n\n2. File Maintenance\n- Regular updates required upon posting, promotion, or course completion\n- Annual review by unit HR office\n- Secure storage in locked filing cabinets' },
      { id: 'clr101-c3', courseId: 'CLR-101', title: 'Template — Personnel File Checklist', type: 'training_material', format: 'doc', description: 'Checklist template for personnel file completeness audit.', clearanceLevel: 'all_ranks', fileSize: '0.4 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-20', pageCount: 3, summary: 'PERSONNEL FILE COMPLETENESS CHECKLIST\n\n[ ] Passport photographs (4 copies)\n[ ] Birth certificate or declaration of age\n[ ] Educational certificates\n[ ] Enlistment/commission certificate\n[ ] Next of kin form\n[ ] Medical examination report\n[ ] Security clearance certificate\n[ ] All posting orders\n[ ] Promotion letters\n[ ] Course completion certificates' },
    ],
  },
  {
    id: 'CLR-102',
    departmentId: 'clerical',
    title: 'Military Correspondence Standards',
    code: 'CLR-102',
    description: 'Standards and formats for all types of military correspondence — signals, memos, letters, and returns.',
    objectives: ['Draft military correspondence in approved formats', 'Process incoming and outgoing signals', 'Prepare routine returns and reports'],
    assessmentCriteria: 'Written exam (40%), practical correspondence exercise (40%), continuous assessment (20%)',
    clearanceLevel: 'all_ranks',
    contents: [
      { id: 'clr102-c1', courseId: 'CLR-102', title: 'Scheme of Work — Correspondence Standards', type: 'curriculum', format: 'pdf', description: 'Course outline for military correspondence standards.', clearanceLevel: 'all_ranks', fileSize: '0.8 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-15', pageCount: 8, summary: 'Week 1-3: Types of Military Correspondence\nWeek 4-6: Signal Drafting and Processing\nWeek 7-9: Memoranda and Routine Orders\nWeek 10-12: Returns and Reports' },
      { id: 'clr102-c2', courseId: 'CLR-102', title: 'Lecture Notes — Signal Drafting', type: 'lecture_notes', format: 'pdf', description: 'How to draft, classify, and process military signals.', clearanceLevel: 'all_ranks', fileSize: '2.0 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-02-08', pageCount: 16, summary: 'MILITARY SIGNAL DRAFTING\n\n1. Signal Format\n- Priority: FLASH / IMMEDIATE / PRIORITY / ROUTINE\n- Classification: UNCLASSIFIED / RESTRICTED / CONFIDENTIAL / SECRET\n- From/To/Info addresses\n- Date-Time Group (DTG)\n- Subject line\n- Text (numbered paragraphs)\n\n2. Processing Procedures\n- Drafting by originator\n- Approval by authorising officer\n- Transmission by Signal Centre\n- Receipt and distribution' },
      { id: 'clr102-c3', courseId: 'CLR-102', title: 'Reference — Correspondence Formats Handbook', type: 'training_material', format: 'pdf', description: 'Complete reference of approved military correspondence formats.', clearanceLevel: 'all_ranks', fileSize: '3.1 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-22', pageCount: 36, summary: 'MILITARY CORRESPONDENCE FORMATS — COMPLETE REFERENCE\n\n1. Official Letter\n2. Demi-Official Letter\n3. Personal Letter\n4. Signal Message\n5. Memorandum\n6. Routine Order\n7. Part I/Part II Order\n8. Situation Report (SITREP)\n9. Intelligence Summary (INTSUM)\n10. Logistics Report' },
    ],
  },
  {
    id: 'CLR-201',
    departmentId: 'clerical',
    title: 'Personnel Records Administration',
    code: 'CLR-201',
    description: 'Advanced course on administering personnel records — promotions, postings, discipline records, and service record maintenance.',
    objectives: ['Administer personnel records systems', 'Process promotion and posting documentation', 'Maintain discipline records'],
    assessmentCriteria: 'Case study (40%), practical exam (35%), written test (25%)',
    clearanceLevel: 'nco_above',
    contents: [
      { id: 'clr201-c1', courseId: 'CLR-201', title: 'Scheme of Work — Personnel Records Admin', type: 'curriculum', format: 'pdf', description: 'Course outline for personnel records administration.', clearanceLevel: 'nco_above', fileSize: '0.9 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-15', pageCount: 10, summary: 'Week 1-3: Personnel Records Systems Overview\nWeek 4-6: Promotion and Posting Documentation\nWeek 7-9: Discipline Records Management\nWeek 10-12: Case Studies and Assessment' },
      { id: 'clr201-c2', courseId: 'CLR-201', title: 'Lecture Notes — Promotion Documentation', type: 'lecture_notes', format: 'pdf', description: 'Processing promotion documentation and gazetting procedures.', clearanceLevel: 'nco_above', fileSize: '2.5 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-02-12', pageCount: 20, summary: 'PROMOTION DOCUMENTATION\n\n1. Promotion Process\n- Recommendation by Commanding Officer\n- Review by Promotion Board\n- Approval by appropriate authority\n- Gazetting and notification\n- Update of service records\n\n2. Required Documents\n- Recommendation letter\n- Confidential report (last 3 years)\n- Medical fitness certificate\n- Security clearance (for officers)\n- Course completion records' },
      { id: 'clr201-c3', courseId: 'CLR-201', title: 'Template — Promotion Board Summary Sheet', type: 'training_material', format: 'doc', description: 'Template for preparing promotion board summary sheets.', clearanceLevel: 'nco_above', fileSize: '0.6 MB', uploadedBy: 'HOD Clerical', uploadDate: '2026-01-25', pageCount: 4, summary: 'PROMOTION BOARD SUMMARY SHEET\n\nName: _______________\nArmy Number: _______________\nCurrent Rank: _______________\nDate of Current Rank: _______________\nQualifications: _______________\nCourses Attended: _______________\nConfidential Report Rating: _______________\nRecommendation: [ ] Promote  [ ] Defer  [ ] Not Ready' },
    ],
  },

  // ── Records ──
  {
    id: 'REC-101',
    departmentId: 'records',
    title: 'Defence Records Management',
    code: 'REC-101',
    description: 'Fundamentals of defence records management — creation, classification, storage, retrieval, and disposal of military records.',
    objectives: ['Apply defence records management principles', 'Classify and store records correctly', 'Retrieve records efficiently'],
    assessmentCriteria: 'Practical exam (50%), written test (30%), continuous assessment (20%)',
    clearanceLevel: 'all_ranks',
    contents: [
      { id: 'rec101-c1', courseId: 'REC-101', title: 'Scheme of Work — Records Management', type: 'curriculum', format: 'pdf', description: 'Course outline for defence records management.', clearanceLevel: 'all_ranks', fileSize: '1.0 MB', uploadedBy: 'HOD Records', uploadDate: '2026-01-15', pageCount: 10, summary: 'Week 1-3: Records Lifecycle Management\nWeek 4-6: Classification and Storage\nWeek 7-9: Retrieval and Reference Systems\nWeek 10-12: Disposal and Archiving' },
      { id: 'rec101-c2', courseId: 'REC-101', title: 'Lecture Notes — Records Lifecycle', type: 'lecture_notes', format: 'pdf', description: 'The complete lifecycle of military records.', clearanceLevel: 'all_ranks', fileSize: '2.3 MB', uploadedBy: 'HOD Records', uploadDate: '2026-02-05', pageCount: 20, summary: 'RECORDS LIFECYCLE\n\n1. Creation\n- Records are created when a document is generated or received\n- Each record must be classified upon creation\n\n2. Active Use\n- Records in current use are stored in active filing systems\n- Access controlled by classification level\n\n3. Semi-Active\n- Records no longer in daily use moved to secondary storage\n- Retention periods determined by records schedule\n\n4. Disposal\n- Destruction (classified material requires witnessed destruction)\n- Transfer to National Archives (historical records)\n- Permanent retention (certain personnel and operational records)' },
      { id: 'rec101-c3', courseId: 'REC-101', title: 'Guide — Records Classification Handbook', type: 'training_material', format: 'pdf', description: 'Handbook for classifying and handling military records.', clearanceLevel: 'all_ranks', fileSize: '1.8 MB', uploadedBy: 'HOD Records', uploadDate: '2026-01-20', pageCount: 14, summary: 'RECORDS CLASSIFICATION HANDBOOK\n\nClassification Categories:\n1. Administrative Records (A)\n2. Operations Records (G)\n3. Intelligence Records (I)\n4. Logistics Records (Q)\n5. Training Records (T)\n6. Personnel Records (P)\n\nRetention Periods:\n- Administrative: 5 years\n- Operations: 25 years\n- Intelligence: 30 years\n- Personnel: Duration of service + 25 years' },
    ],
  },
  {
    id: 'REC-102',
    departmentId: 'records',
    title: 'Archive & Retrieval Systems',
    code: 'REC-102',
    description: 'Design and operation of military archive systems — physical and digital storage, retrieval procedures, and preservation.',
    objectives: ['Operate archive storage systems', 'Design retrieval procedures', 'Implement preservation measures'],
    assessmentCriteria: 'Practical exam (50%), project work (30%), written test (20%)',
    clearanceLevel: 'all_ranks',
    contents: [
      { id: 'rec102-c1', courseId: 'REC-102', title: 'Scheme of Work — Archive Systems', type: 'curriculum', format: 'pdf', description: 'Course outline for archive and retrieval systems.', clearanceLevel: 'all_ranks', fileSize: '0.8 MB', uploadedBy: 'HOD Records', uploadDate: '2026-01-15', pageCount: 8, summary: 'Week 1-3: Archive Design Principles\nWeek 4-6: Physical Storage Systems\nWeek 7-9: Digital Archive Systems\nWeek 10-12: Retrieval Procedures and Project Work' },
      { id: 'rec102-c2', courseId: 'REC-102', title: 'Lecture Notes — Digital Archive Systems', type: 'lecture_notes', format: 'pdf', description: 'Implementation of digital archive systems in military context.', clearanceLevel: 'all_ranks', fileSize: '2.6 MB', uploadedBy: 'HOD Records', uploadDate: '2026-02-10', pageCount: 22, summary: 'DIGITAL ARCHIVE SYSTEMS\n\n1. System Requirements\n- Secure storage with encryption\n- Redundant backup (minimum 3 copies)\n- Access control and audit logging\n- Full-text search capability\n- Metadata tagging and classification\n\n2. Implementation Steps\n- Needs assessment\n- System selection and procurement\n- Data migration plan\n- Staff training\n- Phased rollout\n- Monitoring and evaluation' },
      { id: 'rec102-c3', courseId: 'REC-102', title: 'Case Study — Army Records Centre Migration', type: 'training_material', format: 'pdf', description: 'Case study on the Army Records Centre digitisation project.', clearanceLevel: 'all_ranks', fileSize: '1.5 MB', uploadedBy: 'HOD Records', uploadDate: '2026-02-15', pageCount: 10, summary: 'CASE STUDY: ARMY RECORDS CENTRE DIGITISATION\n\nThe Army Records Centre undertook a major digitisation project to convert 2.3 million personnel records from paper to digital format.\n\nScope: All active and archived personnel files from 1970 to present\nTimeline: 3 years (Phase 1: Active files, Phase 2: Archives)\nCost: ₦1.2 billion\nResult: 85% of records successfully digitised in Phase 1' },
    ],
  },
  {
    id: 'REC-201',
    departmentId: 'records',
    title: 'Classified Document Handling',
    code: 'REC-201',
    description: 'Procedures for handling, storing, transmitting, and destroying classified military documents.',
    objectives: ['Apply classified document handling procedures', 'Manage secure storage facilities', 'Execute document destruction procedures'],
    assessmentCriteria: 'Practical assessment (60%), written exam (25%), security procedures test (15%)',
    clearanceLevel: 'officer_above',
    contents: [
      { id: 'rec201-c1', courseId: 'REC-201', title: 'Scheme of Work — Classified Document Handling', type: 'curriculum', format: 'pdf', description: 'Course outline for classified document handling.', clearanceLevel: 'officer_above', fileSize: '0.7 MB', uploadedBy: 'HOD Records', uploadDate: '2026-01-15', pageCount: 8, summary: 'Week 1-3: Security Classifications and Markings\nWeek 4-6: Secure Storage and Access Control\nWeek 7-9: Transmission and Transport Procedures\nWeek 10-12: Destruction Procedures and Assessment' },
      { id: 'rec201-c2', courseId: 'REC-201', title: 'Lecture Notes — Security Classifications', type: 'lecture_notes', format: 'pdf', description: 'Detailed guide on security classification markings and handling requirements.', clearanceLevel: 'officer_above', fileSize: '3.0 MB', uploadedBy: 'Security Branch', uploadDate: '2026-02-08', pageCount: 24, summary: 'SECURITY CLASSIFICATIONS\n\n1. Classification Levels\n- UNCLASSIFIED: No restriction\n- RESTRICTED: Limited distribution\n- CONFIDENTIAL: Could cause damage to national security\n- SECRET: Could cause serious damage to national security\n- TOP SECRET: Could cause exceptionally grave damage\n\n2. Handling Requirements by Level\nEach classification level has specific requirements for:\n- Storage (safe type and combination procedures)\n- Transmission (approved channels only)\n- Distribution (need-to-know basis)\n- Destruction (witnessed, documented)' },
      { id: 'rec201-c3', courseId: 'REC-201', title: 'Checklist — Document Destruction Procedures', type: 'training_material', format: 'pdf', description: 'Step-by-step checklist for classified document destruction.', clearanceLevel: 'officer_above', fileSize: '0.5 MB', uploadedBy: 'Security Branch', uploadDate: '2026-01-25', pageCount: 4, summary: 'CLASSIFIED DOCUMENT DESTRUCTION CHECKLIST\n\n1. [ ] Verify destruction authorisation\n2. [ ] Identify all copies of the document\n3. [ ] Record document details in destruction register\n4. [ ] Select appropriate destruction method:\n   - Burning (preferred for SECRET and above)\n   - Shredding (RESTRICTED and CONFIDENTIAL)\n5. [ ] Destruction witnessed by two authorised personnel\n6. [ ] Both witnesses sign destruction certificate\n7. [ ] File destruction certificate\n8. [ ] Notify originator of destruction' },
    ],
  },

  // ── Computer Studies ──
  {
    id: 'CMP-101',
    departmentId: 'computer-studies',
    title: 'Basic Computer Operations',
    code: 'CMP-101',
    description: 'Foundational computer literacy — operating systems, office applications, email, and basic network usage in military environments.',
    objectives: ['Operate military computer systems', 'Use office productivity applications', 'Apply basic cybersecurity hygiene'],
    assessmentCriteria: 'Practical exam (60%), written test (25%), continuous assessment (15%)',
    clearanceLevel: 'all_ranks',
    contents: [
      { id: 'cmp101-c1', courseId: 'CMP-101', title: 'Scheme of Work — Basic Computer Operations', type: 'curriculum', format: 'pdf', description: 'Course outline for basic computer operations.', clearanceLevel: 'all_ranks', fileSize: '0.8 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-01-15', pageCount: 8, summary: 'Week 1-2: Computer Hardware and Operating Systems\nWeek 3-4: Office Productivity Suite\nWeek 5-6: Email and Communication Tools\nWeek 7-8: Basic Networking Concepts\nWeek 9-10: Cybersecurity Hygiene\nWeek 11-12: Practical Assessment' },
      { id: 'cmp101-c2', courseId: 'CMP-101', title: 'Lecture Notes — Cybersecurity Hygiene', type: 'lecture_notes', format: 'pdf', description: 'Basic cybersecurity practices for military personnel.', clearanceLevel: 'all_ranks', fileSize: '2.0 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-02-15', pageCount: 16, summary: 'CYBERSECURITY HYGIENE FOR MILITARY PERSONNEL\n\n1. Password Security\n- Minimum 12 characters\n- Mix of uppercase, lowercase, numbers, symbols\n- Change every 90 days\n- Never share or write down passwords\n\n2. Email Security\n- Verify sender before opening attachments\n- Report suspicious emails to IT Branch\n- Never use personal email for official business\n\n3. Physical Security\n- Lock workstation when leaving desk\n- No unauthorised USB devices\n- Report lost or stolen devices immediately' },
      { id: 'cmp101-c3', courseId: 'CMP-101', title: 'Quick Reference — Keyboard Shortcuts', type: 'training_material', format: 'pdf', description: 'Essential keyboard shortcuts for office productivity.', clearanceLevel: 'all_ranks', fileSize: '0.3 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-01-20', pageCount: 4, summary: 'ESSENTIAL KEYBOARD SHORTCUTS\n\nGeneral:\nCtrl+C: Copy | Ctrl+V: Paste | Ctrl+Z: Undo | Ctrl+S: Save\n\nWord Processing:\nCtrl+B: Bold | Ctrl+I: Italic | Ctrl+U: Underline\n\nSpreadsheet:\nCtrl+Home: Go to cell A1 | F2: Edit cell | Ctrl+Shift+L: Toggle filters\n\nSecurity:\nWin+L: Lock workstation (USE THIS ALWAYS WHEN LEAVING DESK)' },
    ],
  },
  {
    id: 'CMP-201',
    departmentId: 'computer-studies',
    title: 'Military Information Systems',
    code: 'CMP-201',
    description: 'Introduction to military information systems — command and control systems, logistics databases, and personnel management systems.',
    objectives: ['Operate military command and control systems', 'Use logistics and personnel databases', 'Understand military network architecture'],
    assessmentCriteria: 'Practical exam (50%), project work (30%), written test (20%)',
    clearanceLevel: 'nco_above',
    contents: [
      { id: 'cmp201-c1', courseId: 'CMP-201', title: 'Scheme of Work — Military Information Systems', type: 'curriculum', format: 'pdf', description: 'Course outline for military information systems.', clearanceLevel: 'nco_above', fileSize: '0.9 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-01-15', pageCount: 10, summary: 'Week 1-3: Introduction to Military C4I Systems\nWeek 4-6: Logistics Information Systems\nWeek 7-9: Personnel Management Systems\nWeek 10-12: Project Work and Assessment' },
      { id: 'cmp201-c2', courseId: 'CMP-201', title: 'Lecture Notes — C4I Systems Overview', type: 'lecture_notes', format: 'pdf', description: 'Overview of Command, Control, Communications, Computers, and Intelligence systems.', clearanceLevel: 'nco_above', fileSize: '3.3 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-02-10', pageCount: 26, summary: 'C4I SYSTEMS OVERVIEW\n\nC4I: Command, Control, Communications, Computers, and Intelligence\n\n1. Components\n- Command: Decision-making authority and process\n- Control: Execution monitoring and adjustment\n- Communications: Information transmission systems\n- Computers: Data processing and storage\n- Intelligence: Information gathering and analysis\n\n2. Nigerian Army C4I Infrastructure\n- Army Command and Control Centre (ACCC)\n- Formation-level communication nodes\n- Tactical radio networks\n- Data link systems' },
      { id: 'cmp201-c3', courseId: 'CMP-201', title: 'Guide — Personnel Management System User Manual', type: 'training_material', format: 'pdf', description: 'User manual for the Army Personnel Management Information System.', clearanceLevel: 'nco_above', fileSize: '2.8 MB', uploadedBy: 'IT Branch', uploadDate: '2026-02-01', pageCount: 30, summary: 'ARMY PERSONNEL MANAGEMENT INFORMATION SYSTEM (APMIS)\nUSER MANUAL\n\n1. System Login and Navigation\n2. Personnel Record Lookup\n3. Posting Order Generation\n4. Leave Management Module\n5. Promotion Board Module\n6. Reports and Returns\n7. Data Export Functions\n\nNote: Access levels are role-based. Contact your system administrator for access requests.' },
    ],
  },
  {
    id: 'CMP-301',
    departmentId: 'computer-studies',
    title: 'Defence Cybersecurity Fundamentals',
    code: 'CMP-301',
    description: 'Cybersecurity for military officers — threat landscape, incident response, security architecture, and policy development.',
    objectives: ['Assess cybersecurity threats to military systems', 'Develop security policies', 'Coordinate incident response'],
    assessmentCriteria: 'Written exam (35%), incident response exercise (40%), policy paper (25%)',
    clearanceLevel: 'officer_above',
    contents: [
      { id: 'cmp301-c1', courseId: 'CMP-301', title: 'Scheme of Work — Cybersecurity Fundamentals', type: 'curriculum', format: 'pdf', description: 'Course outline for defence cybersecurity fundamentals.', clearanceLevel: 'officer_above', fileSize: '1.0 MB', uploadedBy: 'HOD Computer Studies', uploadDate: '2026-01-15', pageCount: 10, summary: 'Week 1-2: Military Cyber Threat Landscape\nWeek 3-4: Security Architecture and Defence in Depth\nWeek 5-6: Incident Response Procedures\nWeek 7-8: Security Policy Development\nWeek 9-10: Incident Response Exercise\nWeek 11-12: Policy Paper and Assessment' },
      { id: 'cmp301-c2', courseId: 'CMP-301', title: 'Lecture Notes — Cyber Threat Landscape', type: 'lecture_notes', format: 'pdf', description: 'Analysis of current cyber threats targeting military organisations.', clearanceLevel: 'officer_above', fileSize: '3.6 MB', uploadedBy: 'Cybersecurity Branch', uploadDate: '2026-02-20', pageCount: 28, summary: 'MILITARY CYBER THREAT LANDSCAPE\n\n1. Threat Actors\n- Nation-state actors (state-sponsored cyber operations)\n- Advanced Persistent Threats (APTs)\n- Insider threats\n- Hacktivists and cybercriminals\n\n2. Common Attack Vectors\n- Spear phishing (most common initial access)\n- Supply chain compromise\n- Removable media (USB-based attacks)\n- Social engineering\n\n3. Military-Specific Threats\n- Electronic warfare integration with cyber\n- Attacks on C4I systems\n- GPS spoofing and jamming\n- Communication interception' },
      { id: 'cmp301-c3', courseId: 'CMP-301', title: 'Template — Incident Response Plan', type: 'training_material', format: 'doc', description: 'Template for developing unit-level cyber incident response plans.', clearanceLevel: 'officer_above', fileSize: '1.2 MB', uploadedBy: 'Cybersecurity Branch', uploadDate: '2026-01-28', pageCount: 12, summary: 'CYBER INCIDENT RESPONSE PLAN — TEMPLATE\n\n1. PURPOSE AND SCOPE\n2. INCIDENT CLASSIFICATION\n   - Category 1: Routine (malware detection)\n   - Category 2: Significant (data breach attempt)\n   - Category 3: Critical (successful compromise of classified system)\n3. RESPONSE PROCEDURES BY CATEGORY\n4. ESCALATION MATRIX\n5. COMMUNICATION PLAN\n6. EVIDENCE PRESERVATION\n7. RECOVERY PROCEDURES\n8. POST-INCIDENT REVIEW' },
    ],
  },
]

// ── Seed Progress Data ──
export const SEED_PROGRESS: CourseProgress[] = [
  // Capt. Adeyemi — 2 courses in progress, 1 bookmarked
  { userId: 'user-001', courseId: 'MST-101', completedContentIds: ['mst101-c1', 'mst101-c2', 'mst101-c3'], bookmarked: false, lastAccessedDate: '2026-03-30' },
  { userId: 'user-001', courseId: 'ACC-101', completedContentIds: ['acc101-c1'], bookmarked: false, lastAccessedDate: '2026-03-28' },
  { userId: 'user-001', courseId: 'ACC-301', completedContentIds: [], bookmarked: true, lastAccessedDate: '2026-03-25' },

  // Pvt. Musa — 1 course in progress
  { userId: 'user-002', courseId: 'MST-101', completedContentIds: ['mst101-c1', 'mst101-c2'], bookmarked: false, lastAccessedDate: '2026-03-29' },

  // Maj. Okonkwo — 3 courses in progress, 1 completed, 1 bookmarked
  { userId: 'user-004', courseId: 'ACC-101', completedContentIds: ['acc101-c1', 'acc101-c2', 'acc101-c3', 'acc101-c4'], bookmarked: false, lastAccessedDate: '2026-03-27' },
  { userId: 'user-004', courseId: 'OTM-101', completedContentIds: ['otm101-c1', 'otm101-c2'], bookmarked: false, lastAccessedDate: '2026-03-30' },
  { userId: 'user-004', courseId: 'REC-101', completedContentIds: ['rec101-c1'], bookmarked: false, lastAccessedDate: '2026-03-26' },
  { userId: 'user-004', courseId: 'ACC-201', completedContentIds: [], bookmarked: true, lastAccessedDate: '2026-03-24' },
]
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/elearning.ts
git commit -m "feat(elearning): add NASFA seed data — 6 departments, 19 courses, 70+ content items"
```

---

### Task 3: DataContext — E-Learning Progress Methods

**Files:**
- Modify: `src/contexts/DataContext.tsx`

- [ ] **Step 1: Add e-learning imports and state**

Add to imports at top of `src/contexts/DataContext.tsx`:

```typescript
import { SEED_PROGRESS } from '#/data/elearning'
import type { CourseProgress } from '#/types/elearning'
```

Add to `DataContextValue` interface:

```typescript
elearningProgress: CourseProgress[]
toggleContentCompletion: (userId: string, courseId: string, contentId: string) => void
toggleBookmark: (userId: string, courseId: string) => void
getProgressForUser: (userId: string) => CourseProgress[]
```

- [ ] **Step 2: Add state and methods inside DataProvider**

Add state:

```typescript
const [elearningProgress, setElearningProgress] = useState<CourseProgress[]>(() =>
  loadFromStorage('elearning_progress', SEED_PROGRESS),
)
```

Add persist helper:

```typescript
const persistProgress = (updated: CourseProgress[]) => {
  setElearningProgress(updated)
  saveToStorage('elearning_progress', updated)
}
```

Add methods:

```typescript
const toggleContentCompletion = useCallback(
  (userId: string, courseId: string, contentId: string) => {
    const existing = elearningProgress.find((p) => p.userId === userId && p.courseId === courseId)
    if (existing) {
      const completed = existing.completedContentIds.includes(contentId)
        ? existing.completedContentIds.filter((id) => id !== contentId)
        : [...existing.completedContentIds, contentId]
      const updated = elearningProgress.map((p) =>
        p.userId === userId && p.courseId === courseId
          ? { ...p, completedContentIds: completed, lastAccessedDate: new Date().toISOString().split('T')[0] }
          : p,
      )
      persistProgress(updated)
    } else {
      const newProgress: CourseProgress = {
        userId,
        courseId,
        completedContentIds: [contentId],
        bookmarked: false,
        lastAccessedDate: new Date().toISOString().split('T')[0],
      }
      persistProgress([...elearningProgress, newProgress])
    }
  },
  [elearningProgress],
)

const toggleBookmark = useCallback(
  (userId: string, courseId: string) => {
    const existing = elearningProgress.find((p) => p.userId === userId && p.courseId === courseId)
    if (existing) {
      const updated = elearningProgress.map((p) =>
        p.userId === userId && p.courseId === courseId ? { ...p, bookmarked: !p.bookmarked } : p,
      )
      persistProgress(updated)
    } else {
      const newProgress: CourseProgress = {
        userId,
        courseId,
        completedContentIds: [],
        bookmarked: true,
        lastAccessedDate: new Date().toISOString().split('T')[0],
      }
      persistProgress([...elearningProgress, newProgress])
    }
  },
  [elearningProgress],
)

const getProgressForUser = useCallback(
  (userId: string) => elearningProgress.filter((p) => p.userId === userId),
  [elearningProgress],
)
```

- [ ] **Step 3: Add to Provider value**

Add `elearningProgress`, `toggleContentCompletion`, `toggleBookmark`, `getProgressForUser` to the `DataContext.Provider` value object.

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/DataContext.tsx
git commit -m "feat(elearning): add progress tracking and bookmarks to DataContext"
```

---

### Task 4: Shared Components — ClearanceBadge, ContentLock, CourseCard

**Files:**
- Create: `src/components/clearance-badge.tsx`
- Create: `src/components/content-lock.tsx`
- Create: `src/components/course-card.tsx`

- [ ] **Step 1: Create ClearanceBadge**

Create `src/components/clearance-badge.tsx`:

```typescript
import type { ClearanceLevel } from '#/types/elearning'
import { getClearanceLabel } from '#/lib/clearance'

const config: Record<ClearanceLevel, { bg: string; text: string; dot: string }> = {
  all_ranks: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  nco_above: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  officer_above: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  senior_officer: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

export function ClearanceBadge({ level }: { level: ClearanceLevel }) {
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {getClearanceLabel(level)}
    </span>
  )
}
```

- [ ] **Step 2: Create ContentLock**

Create `src/components/content-lock.tsx`:

```typescript
import { Lock } from 'lucide-react'
import type { ClearanceLevel } from '#/types/elearning'
import { getClearanceLabel } from '#/lib/clearance'

interface ContentLockProps {
  requiredLevel: ClearanceLevel
  children: React.ReactNode
  className?: string
  compact?: boolean
}

export function ContentLock({ requiredLevel, children, className = '', compact = false }: ContentLockProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="select-none pointer-events-none blur-[6px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
        <div className={`flex flex-col items-center gap-2 ${compact ? 'scale-90' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-army-dark">Restricted</p>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            Requires {getClearanceLabel(requiredLevel)}
          </p>
          {!compact && (
            <p className="text-[11px] text-gray-300 text-center mt-1">
              Contact your HOD or Training Officer for access
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create CourseCard**

Create `src/components/course-card.tsx`:

```typescript
import { Link } from '@tanstack/react-router'
import { Lock, Star, ChevronRight } from 'lucide-react'
import type { Course, CourseProgress } from '#/types/elearning'
import { ClearanceBadge } from '#/components/clearance-badge'

interface CourseCardProps {
  course: Course
  departmentName: string
  canAccess: boolean
  progress?: CourseProgress
  onToggleBookmark?: () => void
  showDepartment?: boolean
}

export function CourseCard({ course, departmentName, canAccess, progress, onToggleBookmark, showDepartment = false }: CourseCardProps) {
  const totalContent = course.contents.length
  const completedCount = progress?.completedContentIds.length ?? 0
  const progressPct = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0
  const isBookmarked = progress?.bookmarked ?? false

  const card = (
    <div className={`bg-white rounded-xl border border-gray-100 transition-all ${canAccess ? 'hover:border-army-gold/30 hover:shadow-sm group' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-300">{course.code}</span>
            <ClearanceBadge level={course.clearanceLevel} />
          </div>
          <div className="flex items-center gap-1.5">
            {!canAccess && <Lock className="w-3.5 h-3.5 text-gray-300" />}
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark() }}
                className="p-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300 hover:text-gray-400'}`} />
              </button>
            )}
          </div>
        </div>
        <h3 className={`text-sm font-bold mb-1 ${canAccess ? 'text-army-dark group-hover:text-army' : 'text-gray-400'} transition-colors`}>
          {course.title}
        </h3>
        {showDepartment && (
          <p className="text-[11px] text-gray-300 mb-1.5">{departmentName}</p>
        )}
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-300">{totalContent} materials</span>
          {canAccess && completedCount > 0 && (
            <span className="text-[11px] font-semibold text-army">{progressPct}% complete</span>
          )}
        </div>

        {canAccess && completedCount > 0 && (
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-army rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {canAccess && (
        <div className="border-t border-gray-50 px-5 py-2 flex items-center justify-end">
          <span className="flex items-center gap-1 text-army-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View course <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  )

  if (!canAccess) return card

  return (
    <Link to="/e-learning/$departmentId/$courseId" params={{ departmentId: course.departmentId, courseId: course.id }}>
      {card}
    </Link>
  )
}
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/clearance-badge.tsx src/components/content-lock.tsx src/components/course-card.tsx
git commit -m "feat(elearning): add ClearanceBadge, ContentLock, and CourseCard components"
```

---

### Task 5: Content Viewer Component

**Files:**
- Create: `src/components/content-viewer.tsx`

- [ ] **Step 1: Create ContentViewer**

Create `src/components/content-viewer.tsx`:

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '#/components/ui/sheet'
import { ContentLock } from '#/components/content-lock'
import { ClearanceBadge } from '#/components/clearance-badge'
import { FileText, FileSpreadsheet, Presentation, Video, Download, Check, Square } from 'lucide-react'
import type { CourseContent } from '#/types/elearning'

const formatIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileSpreadsheet,
  ppt: Presentation,
  video: Video,
}

const formatLabels: Record<string, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  ppt: 'Presentation',
  video: 'Video',
}

interface ContentViewerProps {
  content: CourseContent | null
  isOpen: boolean
  onClose: () => void
  canAccess: boolean
  isCompleted: boolean
  onToggleComplete: () => void
}

export function ContentViewer({ content, isOpen, onClose, canAccess, isCompleted, onToggleComplete }: ContentViewerProps) {
  if (!content) return null

  const Icon = formatIcons[content.format] ?? FileText

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center">
              <Icon className="w-4 h-4 text-army" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium">{formatLabels[content.format]}</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">{content.fileSize}</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">{content.pageCount} pages</span>
            </div>
          </div>
          <SheetTitle className="text-base font-bold text-army-dark">{content.title}</SheetTitle>
          <SheetDescription className="text-xs text-gray-400">
            {content.description}
          </SheetDescription>
          <div className="flex items-center gap-2 mt-2">
            <ClearanceBadge level={content.clearanceLevel} />
            <span className="text-[11px] text-gray-300">Uploaded by {content.uploadedBy} · {content.uploadDate}</span>
          </div>
        </SheetHeader>

        <div className="flex-1 p-4">
          {canAccess ? (
            <div className="bg-gray-50 rounded-lg p-5 min-h-[300px]">
              <div className="prose prose-sm max-w-none">
                {content.summary.split('\n').map((line, i) => {
                  if (line.trim() === '') return <div key={i} className="h-3" />
                  if (/^\d+\./.test(line.trim()) || /^[A-Z][A-Z\s&:—-]+$/.test(line.trim())) {
                    return <p key={i} className="text-sm font-bold text-army-dark mt-3 mb-1">{line}</p>
                  }
                  if (line.trim().startsWith('-') || line.trim().startsWith('[ ]') || line.trim().startsWith('[')) {
                    return <p key={i} className="text-xs text-gray-500 pl-4 py-0.5">{line}</p>
                  }
                  return <p key={i} className="text-xs text-gray-600 leading-relaxed">{line}</p>
                })}
              </div>
            </div>
          ) : (
            <ContentLock requiredLevel={content.clearanceLevel}>
              <div className="bg-gray-50 rounded-lg p-5 min-h-[300px]">
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
              </div>
            </ContentLock>
          )}
        </div>

        <SheetFooter className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between w-full">
            {canAccess && (
              <button
                onClick={onToggleComplete}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-army transition-colors"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-army" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {isCompleted ? 'Completed' : 'Mark as complete'}
              </button>
            )}
            <button
              onClick={() => {
                if (canAccess) {
                  const { toast } = require('sonner')
                  toast.success('Download started', { description: `${content.title} (${content.fileSize})` })
                }
              }}
              disabled={!canAccess}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                canAccess
                  ? 'bg-army-dark text-white hover:bg-army'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/content-viewer.tsx
git commit -m "feat(elearning): add ContentViewer sheet component"
```

---

### Task 6: Route Page — Department Catalog (`/e-learning`)

**Files:**
- Create: `src/routes/_authenticated/e-learning/index.tsx`

- [ ] **Step 1: Create the catalog page**

Create `src/routes/_authenticated/e-learning/index.tsx`:

```typescript
import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import { CourseCard } from '#/components/course-card'
import { ClearanceBadge } from '#/components/clearance-badge'
import {
  GraduationCap, Search, X, Calculator, Monitor, Shield, ClipboardList,
  FolderArchive, Laptop, ChevronRight, Settings,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/e-learning/')({
  component: ELearningCatalog,
})

const iconMap: Record<string, typeof Calculator> = {
  Calculator, Monitor, Shield, ClipboardList, FolderArchive, Laptop,
}

function ELearningCatalog() {
  const { user, hasRole } = useAuth()
  const { elearningProgress, toggleBookmark, getProgressForUser } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!user) return null

  const userProgress = getProgressForUser(user.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')

  // Trade-scoped departments
  const relevantDepts = DEPARTMENTS.filter((d) => d.trades.includes(user.trade))
  const relevantCourseIds = new Set(
    COURSES.filter((c) => relevantDepts.some((d) => d.id === c.departmentId)).map((c) => c.id),
  )
  const yourCourses = COURSES.filter((c) => relevantCourseIds.has(c.id))

  // Bookmarked courses
  const bookmarkedIds = new Set(userProgress.filter((p) => p.bookmarked).map((p) => p.courseId))
  const bookmarkedCourses = COURSES.filter((c) => bookmarkedIds.has(c.id))

  // Search
  const query = searchQuery.trim().toLowerCase()
  const isSearching = query.length > 0

  const searchResults = isSearching
    ? COURSES.filter((c) => {
        const dept = DEPARTMENTS.find((d) => d.id === c.departmentId)
        return (
          c.title.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          dept?.name.toLowerCase().includes(query) ||
          c.contents.some((ct) => ct.title.toLowerCase().includes(query))
        )
      })
    : []

  // Group search results by department
  const groupedResults = searchResults.reduce<Record<string, typeof searchResults>>((acc, course) => {
    const deptId = course.departmentId
    if (!acc[deptId]) acc[deptId] = []
    acc[deptId].push(course)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin banner */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-army-gold/10 border border-army-gold/20 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-xs text-army-dark font-medium">
            Administrator View — You can manage content and restrictions
          </p>
          <button
            onClick={() => toast('Content management coming in Phase 2')}
            className="text-xs font-semibold text-army-gold hover:text-army-dark transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" /> Manage Content
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-army-dark flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-army-gold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-army-dark">NASFA E-Learning Centre</h1>
            <p className="text-xs text-gray-400">Nigerian Army School of Finance & Administration — Training & Development Platform</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search departments, courses, or materials..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-army-gold/50 focus:ring-2 focus:ring-army-gold/10 transition-all"
        />
        {isSearching && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isSearching ? (
        /* Search Results */
        <div>
          <p className="text-xs text-gray-400 mb-4">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
              <p className="text-sm text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-xs text-gray-300 mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResults).map(([deptId, courses]) => {
                const dept = DEPARTMENTS.find((d) => d.id === deptId)
                if (!dept) return null
                return (
                  <div key={deptId}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{dept.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {courses.map((course) => {
                        const accessible = canAccess(user.rank, course.clearanceLevel)
                        const progress = userProgress.find((p) => p.courseId === course.id)
                        return (
                          <CourseCard
                            key={course.id}
                            course={course}
                            departmentName={dept.name}
                            canAccess={accessible}
                            progress={progress}
                            onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                            showDepartment
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Normal View */
        <>
          {/* Your Courses */}
          {yourCourses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-army-dark mb-3">Your Courses</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {yourCourses.map((course) => {
                  const accessible = canAccess(user.rank, course.clearanceLevel)
                  const progress = userProgress.find((p) => p.courseId === course.id)
                  const dept = DEPARTMENTS.find((d) => d.id === course.departmentId)
                  return (
                    <div key={course.id} className="min-w-[260px] max-w-[280px] shrink-0">
                      <CourseCard
                        course={course}
                        departmentName={dept?.name ?? ''}
                        canAccess={accessible}
                        progress={progress}
                        onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                        showDepartment
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bookmarked */}
          {bookmarkedCourses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-army-dark mb-3">Bookmarked</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkedCourses.map((course) => {
                  const accessible = canAccess(user.rank, course.clearanceLevel)
                  const progress = userProgress.find((p) => p.courseId === course.id)
                  const dept = DEPARTMENTS.find((d) => d.id === course.departmentId)
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      departmentName={dept?.name ?? ''}
                      canAccess={accessible}
                      progress={progress}
                      onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                      showDepartment
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* All Departments */}
          <div>
            <h2 className="text-sm font-bold text-army-dark mb-3">All Departments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEPARTMENTS.map((dept) => {
                const DeptIcon = iconMap[dept.icon] ?? GraduationCap
                const isRelevant = relevantDepts.some((d) => d.id === dept.id)
                return (
                  <Link
                    key={dept.id}
                    to="/e-learning/$departmentId"
                    params={{ departmentId: dept.id }}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:border-army-gold/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-army-dark/5 flex items-center justify-center">
                        <DeptIcon className="w-4.5 h-4.5 text-army" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isRelevant && (
                          <span className="text-[10px] font-semibold text-army bg-army/10 px-1.5 py-0.5 rounded-full">Your trade</span>
                        )}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          dept.category === 'core' ? 'text-army-dark bg-army-dark/5' : 'text-gray-500 bg-gray-50'
                        }`}>
                          {dept.category === 'core' ? 'Core' : 'Supporting'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-army-dark group-hover:text-army transition-colors mb-1">{dept.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{dept.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-300">{dept.courseCount} courses</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-army-gold transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify the page loads**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/e-learning/index.tsx
git commit -m "feat(elearning): add department catalog page with search, bookmarks, trade scoping"
```

---

### Task 7: Route Page — Department Course Listing (`/e-learning/$departmentId`)

**Files:**
- Create: `src/routes/_authenticated/e-learning/$departmentId/index.tsx`

- [ ] **Step 1: Create the department page**

Create `src/routes/_authenticated/e-learning/$departmentId/index.tsx`:

```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import { CourseCard } from '#/components/course-card'
import {
  GraduationCap, ChevronRight, Calculator, Monitor, Shield, ClipboardList,
  FolderArchive, Laptop, Plus,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/')({
  component: DepartmentCourses,
})

const iconMap: Record<string, typeof Calculator> = {
  Calculator, Monitor, Shield, ClipboardList, FolderArchive, Laptop,
}

function DepartmentCourses() {
  const { departmentId } = Route.useParams()
  const { user, hasRole } = useAuth()
  const { toggleBookmark, getProgressForUser } = useData()

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  if (!department) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-sm text-gray-400">Department not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold mt-2 inline-block">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const courses = COURSES.filter((c) => c.departmentId === departmentId)
  const userProgress = getProgressForUser(user.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')
  const DeptIcon = iconMap[department.icon] ?? GraduationCap

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link to="/e-learning" className="hover:text-army transition-colors">E-Learning</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-army-dark font-medium">{department.name}</span>
      </div>

      {/* Department Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-army-dark/5 flex items-center justify-center shrink-0">
            <DeptIcon className="w-5 h-5 text-army" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-army-dark">{department.name}</h1>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                department.category === 'core' ? 'text-army-dark bg-army-dark/5' : 'text-gray-500 bg-gray-50'
              }`}>
                {department.category === 'core' ? 'Core Academic' : 'Supporting'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{department.description}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => toast('Course creation coming in Phase 2')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-army/20 rounded-lg hover:bg-army/5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        )}
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {courses.map((course) => {
          const accessible = canAccess(user.rank, course.clearanceLevel)
          const progress = userProgress.find((p) => p.courseId === course.id)
          return (
            <CourseCard
              key={course.id}
              course={course}
              departmentName={department.name}
              canAccess={accessible}
              progress={progress}
              onToggleBookmark={() => toggleBookmark(user.id, course.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/e-learning/\$departmentId/index.tsx
git commit -m "feat(elearning): add department course listing page"
```

---

### Task 8: Route Page — Course Detail (`/e-learning/$departmentId/$courseId`)

**Files:**
- Create: `src/routes/_authenticated/e-learning/$departmentId/$courseId.tsx`

- [ ] **Step 1: Create the course detail page**

Create `src/routes/_authenticated/e-learning/$departmentId/$courseId.tsx`:

```typescript
import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess as checkAccess } from '#/lib/clearance'
import { ClearanceBadge } from '#/components/clearance-badge'
import { ContentLock } from '#/components/content-lock'
import { ContentViewer } from '#/components/content-viewer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import {
  ChevronRight, Star, FileText, FileSpreadsheet, Presentation, Video,
  Check, Square, Eye, Upload, Pencil, ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CourseContent, ContentType } from '#/types/elearning'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/$courseId')({
  component: CourseDetail,
})

const formatIcons: Record<string, typeof FileText> = {
  pdf: FileText, doc: FileSpreadsheet, ppt: Presentation, video: Video,
}

const tabLabels: Record<ContentType, string> = {
  curriculum: 'Curriculum',
  lecture_notes: 'Lecture Notes',
  training_material: 'Training Materials',
}

function CourseDetail() {
  const { departmentId, courseId } = Route.useParams()
  const { user, hasRole } = useAuth()
  const { toggleContentCompletion, toggleBookmark, getProgressForUser } = useData()
  const [viewerContent, setViewerContent] = useState<CourseContent | null>(null)

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  const course = COURSES.find((c) => c.id === courseId && c.departmentId === departmentId)

  if (!department || !course) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-sm text-gray-400">Course not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold mt-2 inline-block">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const userProgress = getProgressForUser(user.id)
  const courseProgress = userProgress.find((p) => p.courseId === course.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')
  const isSuperAdmin = hasRole('superAdmin')
  const courseAccessible = checkAccess(user.rank, course.clearanceLevel)
  const isBookmarked = courseProgress?.bookmarked ?? false
  const completedIds = new Set(courseProgress?.completedContentIds ?? [])
  const totalContent = course.contents.length
  const completedCount = course.contents.filter((c) => completedIds.has(c.id)).length

  // Group contents by type
  const contentByType = course.contents.reduce<Record<ContentType, CourseContent[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<ContentType, CourseContent[]>)

  const availableTabs = (['curriculum', 'lecture_notes', 'training_material'] as ContentType[]).filter(
    (type) => contentByType[type]?.length > 0,
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
        <Link to="/e-learning" className="hover:text-army transition-colors">E-Learning</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/e-learning/$departmentId" params={{ departmentId }} className="hover:text-army transition-colors">{department.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-army-dark font-medium">{course.code}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-gray-300">{course.code}</span>
              <ClearanceBadge level={course.clearanceLevel} />
            </div>
            <h1 className="text-xl font-bold text-army-dark">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleBookmark(user.id, course.id)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300'}`} />
            </button>
            {isAdmin && (
              <button
                onClick={() => toast('Course editing coming in Phase 2')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-army/20 rounded-lg hover:bg-army/5 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit Course
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => toast('Restriction management coming in Phase 2')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <ShieldAlert className="w-3 h-3" /> Manage Restrictions
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{course.description}</p>

        {/* Objectives */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-army-dark uppercase tracking-wider mb-2">Objectives</h3>
          <ul className="space-y-1">
            {course.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-army mt-0.5">-</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Assessment */}
        <div>
          <h3 className="text-xs font-semibold text-army-dark uppercase tracking-wider mb-1">Assessment</h3>
          <p className="text-xs text-gray-400">{course.assessmentCriteria}</p>
        </div>
      </div>

      {/* Content Section */}
      {courseAccessible ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-army-dark">{completedCount} of {totalContent} completed</span>
              {completedCount === totalContent && totalContent > 0 && (
                <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Complete</span>
              )}
            </div>
            <span className="text-xs text-gray-300">{Math.round((completedCount / Math.max(totalContent, 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-army rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / Math.max(totalContent, 1)) * 100}%` }}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue={availableTabs[0] ?? 'curriculum'}>
            <TabsList variant="line" className="mb-4">
              {availableTabs.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {tabLabels[type]} ({contentByType[type].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {availableTabs.map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-2">
                  {isAdmin && (
                    <button
                      onClick={() => toast('Upload functionality coming in Phase 2')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-dashed border-army/20 rounded-lg hover:bg-army/5 transition-colors w-full justify-center mb-2"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload {tabLabels[type]}
                    </button>
                  )}
                  {contentByType[type].map((item) => {
                    const itemAccessible = checkAccess(user.rank, item.clearanceLevel)
                    const isCompleted = completedIds.has(item.id)
                    const Icon = formatIcons[item.format] ?? FileText

                    if (!itemAccessible) {
                      return (
                        <ContentLock key={item.id} requiredLevel={item.clearanceLevel} compact>
                          <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-gray-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-400 truncate">{item.title}</p>
                                <p className="text-xs text-gray-300">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </ContentLock>
                      )
                    }

                    return (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-army" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-army-dark truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-300">{item.uploadedBy}</span>
                              <span className="text-[11px] text-gray-200">·</span>
                              <span className="text-[11px] text-gray-300">{item.uploadDate}</span>
                              <span className="text-[11px] text-gray-200">·</span>
                              <span className="text-[11px] text-gray-300">{item.fileSize}</span>
                              {item.clearanceLevel !== 'all_ranks' && (
                                <>
                                  <span className="text-[11px] text-gray-200">·</span>
                                  <ClearanceBadge level={item.clearanceLevel} />
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleContentCompletion(user.id, course.id, item.id)}
                              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 text-army" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => setViewerContent(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-army bg-army/5 rounded-lg hover:bg-army/10 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        /* Locked Course Content */
        <ContentLock requiredLevel={course.clearanceLevel}>
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                    <div className="h-2 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentLock>
      )}

      {/* Content Viewer */}
      <ContentViewer
        content={viewerContent}
        isOpen={viewerContent !== null}
        onClose={() => setViewerContent(null)}
        canAccess={viewerContent ? checkAccess(user.rank, viewerContent.clearanceLevel) : false}
        isCompleted={viewerContent ? completedIds.has(viewerContent.id) : false}
        onToggleComplete={() => {
          if (viewerContent) toggleContentCompletion(user.id, course.id, viewerContent.id)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/e-learning/\$departmentId/\$courseId.tsx
git commit -m "feat(elearning): add course detail page with tabs, content viewer, and lock overlay"
```

---

### Task 9: Sidebar Update + Dashboard Card

**Files:**
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/routes/_authenticated/_personnel/dashboard.tsx`

- [ ] **Step 1: Add E-Learning to sidebar**

In `src/components/app-sidebar.tsx`, add `GraduationCap` to the lucide import:

```typescript
import { LayoutDashboard, Wallet, MessageCircle, HelpCircle, Ticket, BarChart3, Users, Shield, LogOut, GraduationCap } from 'lucide-react'
```

Add the E-Learning item to `personnelItems` (after Dashboard, position index 1):

```typescript
const personnelItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'E-Learning', to: '/e-learning', icon: GraduationCap },
  { label: 'Pay & Documents', to: '/pay', icon: Wallet },
  { label: 'Complaints', to: '/complaints', icon: MessageCircle },
  { label: 'Help & Support', to: '/help', icon: HelpCircle },
]
```

Add it to `adminItems` too (after Dashboard):

```typescript
const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'E-Learning', to: '/e-learning', icon: GraduationCap },
  { label: 'Ticket Management', to: '/admin/tickets', icon: Ticket },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'RBAC Matrix', to: '/admin/rbac', icon: Shield },
]
```

- [ ] **Step 2: Add E-Learning card to personnel dashboard**

In `src/routes/_authenticated/_personnel/dashboard.tsx`, add imports:

```typescript
import { GraduationCap } from 'lucide-react'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
```

Add after the existing data gathering (after `const shortPaidSlip = ...`):

```typescript
const relevantDepts = DEPARTMENTS.filter((d) => d.trades.includes(user.trade))
const relevantCourses = COURSES.filter((c) => relevantDepts.some((d) => d.id === c.departmentId))
const { getProgressForUser } = useData()
const elearningProgress = getProgressForUser(user.id)
const inProgressCourses = elearningProgress.filter((p) => {
  const course = COURSES.find((c) => c.id === p.courseId)
  return course && p.completedContentIds.length > 0 && p.completedContentIds.length < course.contents.length
})
```

Note: `getProgressForUser` needs to be destructured from `useData()` — update the existing destructure line:

```typescript
const { getComplaintsForUser, getPayslipsForUser, getProgressForUser } = useData()
```

Add the E-Learning card just before the `{/* Pay History */}` section:

```tsx
{/* E-Learning */}
<Link to="/e-learning" className="group block">
  <div className="bg-white rounded-xl border border-gray-100 transition-all group-hover:border-army-gold/20 group-hover:shadow-sm">
    <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-army" />
        <h3 className="text-sm font-bold text-army-dark">E-Learning</h3>
      </div>
      <span className="flex items-center gap-1 text-xs text-army font-semibold group-hover:text-army-gold transition-colors">
        Browse <ArrowUpRight className="w-3 h-3" />
      </span>
    </div>
    <div className="px-5 pb-4">
      <p className="text-xs text-gray-400">
        {relevantCourses.length} courses available for your trade
        {inProgressCourses.length > 0 && ` · ${inProgressCourses.length} in progress`}
      </p>
    </div>
  </div>
</Link>
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/app-sidebar.tsx src/routes/_authenticated/_personnel/dashboard.tsx
git commit -m "feat(elearning): add sidebar nav item and dashboard card"
```

---

### Task 10: Fix ContentViewer Toast Import + Final Verification

**Files:**
- Modify: `src/components/content-viewer.tsx`

- [ ] **Step 1: Fix the toast import in ContentViewer**

The ContentViewer has an inline `require('sonner')` which won't work in ESM. Replace the Download button's onClick to use a proper import. At the top of `src/components/content-viewer.tsx`, add:

```typescript
import { toast } from 'sonner'
```

Replace the Download button onClick from:
```typescript
onClick={() => {
  if (canAccess) {
    const { toast } = require('sonner')
    toast.success('Download started', { description: `${content.title} (${content.fileSize})` })
  }
}}
```
To:
```typescript
onClick={() => {
  if (canAccess) {
    toast.success('Download started', { description: `${content.title} (${content.fileSize})` })
  }
}}
```

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Build completes successfully with no errors.

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`
Expected: App loads. Navigate to `/e-learning` — catalog page renders. Click a department — courses load. Click a course — detail page shows with tabs and content items.

- [ ] **Step 4: Commit**

```bash
git add src/components/content-viewer.tsx
git commit -m "fix(elearning): fix toast import in content viewer"
```

---

### Task 11: Manual Demo Verification

- [ ] **Step 1: Test as Private Musa (most restricted)**

Login with: `NA/15/05678` / `SAL-002-2024`
- Verify: Dashboard shows E-Learning card with "3 courses available"
- Verify: `/e-learning` shows "Your Courses" with Military Service courses
- Verify: MST-101 shows progress (2/5)
- Verify: ACC-201 (NCO+), ACC-301 (Officers), ACC-401 (Senior Officers) all show lock + blur
- Verify: ACC-101 is accessible, content items with `nco_above` clearance within it are individually locked

- [ ] **Step 2: Test as Captain Adeyemi (mid-level)**

Login with: `NA/23/01234` / `SAL-001-2024`
- Verify: Can access all `all_ranks` and `nco_above` and `officer_above` courses
- Verify: `senior_officer` courses (ACC-401, MST-301) are locked
- Verify: MST-101 shows 3/5 progress, ACC-101 shows 1/4 progress
- Verify: ACC-301 shows bookmarked (star filled)
- Verify: Content viewer opens when clicking "View" on a content item

- [ ] **Step 3: Test as Colonel Nwachukwu (full access)**

Login with: `SA/05/00123` / `SAL-201-2024`
- Verify: All courses accessible, no locks visible
- Verify: Admin banner shows on catalog page
- Verify: "Add Course", "Edit Course", "Upload Material", "Manage Restrictions" ghost buttons visible
- Verify: Ghost buttons show toast on click

- [ ] **Step 4: Test search**

From catalog page, search "cybersecurity"
- Verify: Shows CMP-301 Defence Cybersecurity Fundamentals in results
- Verify: Clear button resets to normal view

- [ ] **Step 5: Test bookmarks**

Click star on any course card
- Verify: Star fills with gold
- Verify: "Bookmarked" section appears on catalog page
- Verify: Click again to unbookmark — star unfills, section disappears if empty
