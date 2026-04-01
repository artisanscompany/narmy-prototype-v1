import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { pdf } from '@react-pdf/renderer'
import { PayslipPDF } from '#/lib/pdf/payslip-template'
import { TaxCertPDF } from '#/lib/pdf/tax-cert-template'
import { Download, FileText, AlertTriangle, ChevronDown, Lock, PenLine } from 'lucide-react'
import { useState } from 'react'
import type { Payslip } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/_personnel/pay')({
  component: PayDocumentsPage,
})

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEMO_PIN = '0000'

function PayDocumentsPage() {
  const { user } = useAuth()
  const { getPayslipsForUser } = useData()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'short-paid'>('all')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<(() => Promise<void>) | null>(null)

  if (!user) return null

  const allPayslips = getPayslipsForUser(user.id).sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))
  const years = [...new Set(allPayslips.map(p => p.year))].sort((a, b) => b - a)

  // Filters
  const filtered = allPayslips
    .filter(p => yearFilter === 'all' || p.year === yearFilter)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)

  // Summary stats
  const latestPayslip = allPayslips[0]
  const ytdPayslips = allPayslips.filter(p => p.year === new Date().getFullYear())
  const ytdEarnings = ytdPayslips.reduce((sum, p) => sum + p.grossPay, 0)
  const ytdDeductions = ytdPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)
  const shortPaidCount = allPayslips.filter(p => p.status === 'short-paid').length

  const requestDownload = (downloadFn: () => Promise<void>) => {
    setPendingDownload(() => downloadFn)
    setShowPinModal(true)
    setPinCode('')
    setPinError(false)
  }

  const handlePinSubmit = async () => {
    if (pinCode === DEMO_PIN) {
      setShowPinModal(false)
      setPinCode('')
      if (pendingDownload) await pendingDownload()
      setPendingDownload(null)
    } else {
      setPinError(true)
    }
  }

  const downloadPayslip = async (payslip: Payslip) => {
    const blob = await pdf(<PayslipPDF payslip={payslip} user={user} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Payslip-${payslip.year}-${String(payslip.month).padStart(2, '0')}-${user.armyNumber.replace(/\//g, '')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadTaxCert = async () => {
    const blob = await pdf(<TaxCertPDF user={user} taxYear={2025} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TaxCert-${user.armyNumber.replace(/\//g, '')}-2025.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-army-dark">Pay & Documents</h1>
        <p className="text-sm text-gray-500 mt-0.5">{allPayslips.length} payslips · {years[0]}–{years[years.length - 1]}</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Latest Net Pay</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">₦{latestPayslip?.netPay.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-gray-500">{latestPayslip ? `${monthNamesShort[latestPayslip.month]} ${latestPayslip.year}` : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">YTD Earnings</p>
          <p className="text-lg font-extrabold text-army-dark font-mono">₦{ytdEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{ytdPayslips.length} months in {new Date().getFullYear()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">YTD Deductions</p>
          <p className="text-lg font-extrabold text-red-500 font-mono">₦{ytdDeductions.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Tax + Pension</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Short-paid</p>
          <p className={`text-lg font-extrabold font-mono ${shortPaidCount > 0 ? 'text-amber-600' : 'text-army-dark'}`}>{shortPaidCount}</p>
          <p className="text-xs text-gray-500">{shortPaidCount === 0 ? 'All clear' : `${shortPaidCount} month${shortPaidCount > 1 ? 's' : ''} affected`}</p>
        </div>
      </div>

      {/* Tax Certificate */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-army/8 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-army" />
          </div>
          <div>
            <p className="text-sm font-semibold text-army-dark">Tax Exemption Certificate</p>
            <p className="text-xs text-gray-500">Financial Year 2025</p>
          </div>
        </div>
        <button
          onClick={() => requestDownload(downloadTaxCert)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-xs font-bold hover:bg-army-gold-light transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          Download PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setYearFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${yearFilter === 'all' ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          All years
        </button>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${yearFilter === y ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {y}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        <button
          onClick={() => setStatusFilter(statusFilter === 'short-paid' ? 'all' : 'short-paid')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === 'short-paid' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          Short-paid only
        </button>
      </div>

      {/* Payslip List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No payslips match this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id
            const isShortPaid = p.status === 'short-paid'
            return (
              <div key={p.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isShortPaid ? 'border-amber-200' : 'border-gray-100'}`}>
                {/* Row */}
                <div
                  className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${isShortPaid ? 'hover:bg-amber-50/50' : 'hover:bg-gray-50'}`}
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    <div>
                      <p className="text-sm font-semibold text-army-dark">{monthNames[p.month]} {p.year}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isShortPaid ? (
                          <span className="text-amber-600 font-medium">Short-paid</span>
                        ) : (
                          <span className="text-green-600 font-medium">Paid</span>
                        )}
                        {p.paidDate && ` · ${new Date(p.paidDate).getUTCDate()} ${monthNamesShort[p.month]}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-base font-bold font-mono text-army-dark tabular-nums">₦{p.netPay.toLocaleString()}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); requestDownload(() => downloadPayslip(p)) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-army-gold hover:bg-army-gold/8 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (() => {
                  const earnings = p.components.filter((c) => c.type !== 'deduction')
                  const deductions = p.components.filter((c) => c.type === 'deduction')
                  const totalEarnings = earnings.reduce((sum, c) => sum + c.amount, 0)
                  const totalDeductions = deductions.reduce((sum, c) => sum + c.amount, 0)
                  return (
                    <div className="border-t border-gray-100">
                      {/* Discrepancy warning at top */}
                      {p.discrepancyNote && (
                        <div className="flex items-center gap-2.5 bg-amber-50 px-5 py-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <p className="text-xs text-amber-700 flex-1">{p.discrepancyNote}</p>
                          <Link to="/complaints/new" className="text-xs font-semibold text-amber-900 underline decoration-amber-300 hover:no-underline shrink-0">
                            Report
                          </Link>
                        </div>
                      )}

                      <div className="px-5 py-4">
                        {/* Earnings */}
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Earnings</p>
                        <div className="space-y-1.5 mb-3">
                          {earnings.map((c) => (
                            <div key={c.label} className="flex justify-between">
                              <span className="text-sm text-gray-600">{c.label}</span>
                              <span className="text-sm font-semibold font-mono text-army-dark tabular-nums">₦{c.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1.5 border-t border-gray-100">
                            <span className="text-sm font-semibold text-army-dark">Gross Pay</span>
                            <span className="text-sm font-bold font-mono text-army-dark tabular-nums">₦{totalEarnings.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Deductions */}
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deductions</p>
                        <div className="space-y-1.5 mb-3">
                          {deductions.map((c) => (
                            <div key={c.label} className="flex justify-between">
                              <span className="text-sm text-red-600">{c.label}</span>
                              <span className="text-sm font-semibold font-mono text-red-500 tabular-nums">-₦{c.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1.5 border-t border-gray-100">
                            <span className="text-sm font-semibold text-gray-700">Total Deductions</span>
                            <span className="text-sm font-bold font-mono text-red-500 tabular-nums">-₦{totalDeductions.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Net Pay total */}
                        <div className="flex justify-between items-center bg-army-dark rounded-xl px-5 py-3.5">
                          <span className="text-sm font-semibold text-white/70">Net Pay</span>
                          <span className="text-xl font-extrabold text-army-gold font-mono">₦{p.netPay.toLocaleString()}</span>
                        </div>

                        {/* Report link for short-paid */}
                        {isShortPaid && !p.discrepancyNote && (
                          <div className="mt-3 flex items-center justify-end">
                            <Link
                              to="/complaints/new"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                            >
                              <PenLine className="w-3 h-3" />
                              Report this discrepancy
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}

      {/* PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={(open) => { if (!open) { setShowPinModal(false); setPinCode(''); setPinError(false); setPendingDownload(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
            <DialogDescription>
              Pay documents are encrypted. Enter your verification PIN to download.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              onChange={(e) => { setPinCode(e.target.value); setPinError(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit() }}
              placeholder="0000"
              aria-label="Verification PIN"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army transition-all"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-600 mt-2 text-center font-medium">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handlePinSubmit} className="bg-army-dark text-white hover:bg-army transition-colors">
              Verify & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
