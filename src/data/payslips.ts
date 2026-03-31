import type { Payslip, PayComponent } from '#/types/payslip'

function makePayslip(
  userId: string,
  month: number,
  year: number,
  earnings: PayComponent[],
  deductions: PayComponent[],
  status: 'paid' | 'short-paid' | 'pending' = 'paid',
  discrepancyNote: string | null = null,
): Payslip {
  const grossPay = earnings.reduce((sum, c) => sum + c.amount, 0)
  const totalDeductions = deductions.reduce((sum, c) => sum + c.amount, 0)
  return {
    id: `PAY-${userId}-${year}-${String(month).padStart(2, '0')}`,
    userId,
    month,
    year,
    components: [...earnings, ...deductions],
    grossPay,
    totalDeductions,
    netPay: grossPay - totalDeductions,
    status,
    paidDate: status === 'pending' ? null : `${year}-${String(month).padStart(2, '0')}-25`,
    discrepancyNote,
  }
}

const officerEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 280000, type: 'earning' },
  { label: 'Housing Allowance', amount: 56000, type: 'earning' },
  { label: 'Transport Allowance', amount: 28000, type: 'earning' },
  { label: 'SF Allowance', amount: 42000, type: 'earning' },
]

const officerDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 32600, type: 'deduction' },
  { label: 'Pension Contribution', amount: 28000, type: 'deduction' },
]

const officerFebShortEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 280000, type: 'earning' },
  { label: 'Housing Allowance', amount: 56000, type: 'earning' },
  { label: 'Transport Allowance', amount: 28000, type: 'earning' },
]

const soldierEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 120000, type: 'earning' },
  { label: 'Housing Allowance', amount: 24000, type: 'earning' },
  { label: 'Transport Allowance', amount: 12000, type: 'earning' },
]

const soldierDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 15625, type: 'deduction' },
  { label: 'Pension Contribution', amount: 12000, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3400, type: 'deduction' },
]

const belloEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 135000, type: 'earning' },
  { label: 'Housing Allowance', amount: 27000, type: 'earning' },
  { label: 'Transport Allowance', amount: 13500, type: 'earning' },
]

const belloDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 17550, type: 'deduction' },
  { label: 'Pension Contribution', amount: 13500, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3800, type: 'deduction' },
]

function generateMonths(
  userId: string,
  earnings: PayComponent[],
  deductions: PayComponent[],
  overrides?: { month: number; year: number; earnings: PayComponent[]; status: 'paid' | 'short-paid'; note: string }[],
): Payslip[] {
  const months: Payslip[] = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(2026, 2 - i, 1)
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    const override = overrides?.find((o) => o.month === m && o.year === y)
    if (override) {
      months.push(makePayslip(userId, m, y, override.earnings, deductions, override.status, override.note))
    } else {
      months.push(makePayslip(userId, m, y, earnings, deductions))
    }
  }
  return months
}

export const PAYSLIPS: Payslip[] = [
  ...generateMonths('user-001', officerEarnings, officerDeductions, [
    {
      month: 2,
      year: 2026,
      earnings: officerFebShortEarnings,
      status: 'short-paid',
      note: 'SF Allowance (₦42,000) not included. Discrepancy under review.',
    },
  ]),
  ...generateMonths('user-002', soldierEarnings, soldierDeductions),
  ...generateMonths('user-003', belloEarnings, belloDeductions),
]
