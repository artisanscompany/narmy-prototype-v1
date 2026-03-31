import type { Category } from '#/types/complaint'

export const COMPLAINT_CATEGORIES: Category[] = [
  {
    id: 'pay-allowances',
    label: 'Pay & Allowances',
    subcategories: [
      { id: 'short-payment', label: 'Short Payment / Missing Allowance' },
      { id: 'delayed-payment', label: 'Delayed Payment' },
      { id: 'wrong-deduction', label: 'Incorrect Deduction' },
      { id: 'promotion-pay', label: 'Promotion Pay Not Reflected' },
    ],
  },
  {
    id: 'service-records',
    label: 'Service Records',
    subcategories: [
      { id: 'wrong-rank', label: 'Incorrect Rank / Grade' },
      { id: 'missing-record', label: 'Missing Service Record' },
      { id: 'wrong-division', label: 'Wrong Division Assignment' },
      { id: 'date-correction', label: 'Date of Enlistment Correction' },
    ],
  },
  {
    id: 'postings-transfers',
    label: 'Postings & Transfers',
    subcategories: [
      { id: 'transfer-request', label: 'Transfer Request' },
      { id: 'posting-error', label: 'Posting Error' },
      { id: 'relocation-allowance', label: 'Relocation Allowance Not Paid' },
    ],
  },
  {
    id: 'status-issues',
    label: 'Status Issues',
    subcategories: [
      { id: 'wrong-status', label: 'Incorrect Status Marking' },
      { id: 'awol-dispute', label: 'AWOL Dispute' },
      { id: 'reinstatement', label: 'Reinstatement Request' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    subcategories: [
      { id: 'general-inquiry', label: 'General Inquiry' },
      { id: 'system-issue', label: 'Portal / System Issue' },
      { id: 'other', label: 'Other' },
    ],
  },
]
