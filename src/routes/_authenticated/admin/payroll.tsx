import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { Search, Upload, Plus, Minus, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import type { Payslip, PayComponent, PayslipStatus } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/admin/payroll')({
  component: AdminPayroll,
})

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getLast6Months(): { month: number; year: number; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    })
  }
  return result
}

function AdminPayroll() {
  const { user } = useAuth()
  const { payslips, users, addPayslip } = useData()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [shortPaidOnly, setShortPaidOnly] = useState(false)
  const [search, setSearch] = useState('')

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false)
  const [uploadUserId, setUploadUserId] = useState('')
  const [uploadMonth, setUploadMonth] = useState(now.getMonth() + 1)
  const [uploadYear, setUploadYear] = useState(now.getFullYear())
  const [earnings, setEarnings] = useState<PayComponent[]>([{ label: 'Basic Salary', amount: 0, type: 'earning' }])
  const [deductions, setDeductions] = useState<PayComponent[]>([{ label: 'Tax (PAYE)', amount: 0, type: 'deduction' }])
  const [uploadStatus, setUploadStatus] = useState<PayslipStatus>('paid')
  const [discrepancyNote, setDiscrepancyNote] = useState('')

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'
  const months = getLast6Months()

  // Scope users by division for divisionAdmin
  const scopedUsers = useMemo(
    () =>
      isSuperAdmin
        ? users.filter((u) => u.role === 'personnel')
        : users.filter((u) => u.role === 'personnel' && u.division === user.division),
    [users, isSuperAdmin, user.division],
  )

  const scopedUserIds = useMemo(() => new Set(scopedUsers.map((u) => u.id)), [scopedUsers])

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  // Filter payslips to scope, month, short-paid toggle, and search
  const filteredPayslips = useMemo(() => {
    return payslips.filter((slip) => {
      if (!scopedUserIds.has(slip.userId)) return false
      if (slip.month !== selectedMonth || slip.year !== selectedYear) return false
      if (shortPaidOnly && slip.status !== 'short-paid') return false
      if (search.trim()) {
        const u = userMap.get(slip.userId)
        if (!u) return false
        const q = search.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.armyNumber.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [payslips, scopedUserIds, selectedMonth, selectedYear, shortPaidOnly, search, userMap])

  // Stats
  const payslipsThisMonth = useMemo(
    () => payslips.filter((s) => scopedUserIds.has(s.userId) && s.month === selectedMonth && s.year === selectedYear),
    [payslips, scopedUserIds, selectedMonth, selectedYear],
  )
  const shortPaidCount = payslipsThisMonth.filter((s) => s.status === 'short-paid').length
  const totalDisbursed = payslipsThisMonth.reduce((sum, s) => sum + s.netPay, 0)

  // Upload modal helpers
  const gross = earnings.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalDed = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0)
  const net = gross - totalDed

  function handleSavePayslip() {
    if (!uploadUserId) return
    const payslip: Payslip = {
      id: `PAY-${uploadUserId}-${uploadYear}-${String(uploadMonth).padStart(2, '0')}`,
      userId: uploadUserId,
      month: uploadMonth,
      year: uploadYear,
      components: [...earnings, ...deductions],
      grossPay: gross,
      totalDeductions: totalDed,
      netPay: net,
      status: uploadStatus,
      paidDate:
        uploadStatus === 'pending'
          ? null
          : `${uploadYear}-${String(uploadMonth).padStart(2, '0')}-25`,
      discrepancyNote: uploadStatus === 'short-paid' ? discrepancyNote : null,
    }
    addPayslip(payslip)
    setShowUpload(false)
    setUploadUserId('')
    setUploadMonth(now.getMonth() + 1)
    setUploadYear(now.getFullYear())
    setEarnings([{ label: 'Basic Salary', amount: 0, type: 'earning' }])
    setDeductions([{ label: 'Tax (PAYE)', amount: 0, type: 'deduction' }])
    setUploadStatus('paid')
    setDiscrepancyNote('')
  }

  const statusConfig: Record<PayslipStatus, { label: string; classes: string }> = {
    paid: { label: 'Paid', classes: 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700' },
    'short-paid': { label: 'Short-paid', classes: 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700' },
    pending: { label: 'Pending', classes: 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600' },
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-army-dark">Payroll Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {filteredPayslips.length} payslip{filteredPayslips.length !== 1 ? 's' : ''} · {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload Payslip
        </button>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Total Personnel</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">{scopedUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Payslips This Month</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">{payslipsThisMonth.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Short-Paid</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">{shortPaidCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Total Disbursed</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">₦{totalDisbursed.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {months.map(({ month, year, label }) => {
          const active = month === selectedMonth && year === selectedYear
          return (
            <button
              key={label}
              onClick={() => { setSelectedMonth(month); setSelectedYear(year) }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active ? 'bg-army-dark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-army-gold/40'
              }`}
            >
              {label}
            </button>
          )
        })}
        <button
          onClick={() => setShortPaidOnly(!shortPaidOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            shortPaidOnly ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'
          }`}
        >
          Short-paid only
        </button>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search personnel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-army-gold/40 w-48"
          />
        </div>
      </div>

      {/* Payslip Cards */}
      {filteredPayslips.length > 0 ? (
        <div className="space-y-2">
          {filteredPayslips.map((slip) => {
            const u = userMap.get(slip.userId)
            const userName = u?.name ?? 'Unknown'
            const armyNumber = u?.armyNumber ?? '—'
            const rank = u?.rank ?? '—'
            const { label: statusLabel, classes: statusClasses } = statusConfig[slip.status]
            return (
              <Link
                key={slip.id}
                to="/admin/users"
                className="block bg-white rounded-xl border border-gray-100 px-5 py-3.5 hover:border-army-gold/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-army-dark">{userName}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{armyNumber}</span> · {rank}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-semibold font-mono text-army-dark tabular-nums">
                      ₦{slip.netPay.toLocaleString()}
                    </span>
                    <span className={statusClasses}>{statusLabel}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No payslips match the current filters</p>
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Payslip</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Personnel selector */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Personnel</label>
              <select
                value={uploadUserId}
                onChange={(e) => setUploadUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
              >
                <option value="">Select personnel…</option>
                {scopedUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.armyNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Month + Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Month</label>
                <select
                  value={uploadMonth}
                  onChange={(e) => setUploadMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Year</label>
                <select
                  value={uploadYear}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                >
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Earnings</p>
              {earnings.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...earnings]
                      updated[idx] = { ...updated[idx], label: e.target.value }
                      setEarnings(updated)
                    }}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                  />
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => {
                      const updated = [...earnings]
                      updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                      setEarnings(updated)
                    }}
                    placeholder="0"
                    className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-right focus:outline-none focus:border-army-gold/40"
                  />
                  {earnings.length > 1 && (
                    <button
                      onClick={() => setEarnings(earnings.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setEarnings([...earnings, { label: '', amount: 0, type: 'earning' }])}
                className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold mt-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add earning
              </button>
            </div>

            {/* Deductions */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deductions</p>
              {deductions.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...deductions]
                      updated[idx] = { ...updated[idx], label: e.target.value }
                      setDeductions(updated)
                    }}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40"
                  />
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => {
                      const updated = [...deductions]
                      updated[idx] = { ...updated[idx], amount: Number(e.target.value) }
                      setDeductions(updated)
                    }}
                    placeholder="0"
                    className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono text-right focus:outline-none focus:border-army-gold/40"
                  />
                  {deductions.length > 1 && (
                    <button
                      onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setDeductions([...deductions, { label: '', amount: 0, type: 'deduction' }])}
                className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-gold mt-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add deduction
              </button>
            </div>

            {/* Auto-calculated summary */}
            <div className="bg-army-dark/5 rounded-xl px-4 py-3 mt-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gross Pay</span>
                <span className="font-mono font-semibold">₦{gross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Total Deductions</span>
                <span className="font-mono font-semibold text-red-500">-₦{totalDed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-army-dark mt-2 pt-2 border-t border-gray-200">
                <span>Net Pay</span>
                <span className="font-mono">₦{net.toLocaleString()}</span>
              </div>
            </div>

            {/* Status pills */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2">
                {(['paid', 'short-paid', 'pending'] as PayslipStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setUploadStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
                      uploadStatus === s
                        ? s === 'paid'
                          ? 'bg-green-600 text-white'
                          : s === 'short-paid'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s === 'short-paid' ? 'Short-paid' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Discrepancy note */}
            {uploadStatus === 'short-paid' && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Discrepancy Note</label>
                <textarea
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  placeholder="Describe the discrepancy…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-army-gold/40 resize-none"
                />
              </div>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePayslip}
              disabled={!uploadUserId}
              className="bg-army-gold text-army-dark font-bold hover:bg-army-gold-light"
            >
              Save Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
