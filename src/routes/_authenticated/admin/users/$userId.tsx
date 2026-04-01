import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { maskSensitive } from '#/lib/utils'
import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import {
  ArrowLeft,
  Lock,
  Eye,
  Shield,
  Fingerprint,
  Building2,
  MapPin,
  Phone,
  Calendar,
  ChevronDown,
  Upload,
  Plus,
  Minus,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import type { UserRole, ServiceStatus } from '#/types/user'
import type { Payslip, PayComponent, PayslipStatus } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetail,
})

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const SENSITIVE_FIELDS = ['nin', 'bvn', 'salaryAccountNo'] as const
type SensitiveField = (typeof SENSITIVE_FIELDS)[number]

const FIELD_LABELS: Record<SensitiveField, string> = {
  nin: 'National Identification Number (NIN)',
  bvn: 'Bank Verification Number (BVN)',
  salaryAccountNo: 'Salary Account Number',
}

const DEMO_DECRYPT_PIN = '0000'

function AdminUserDetail() {
  const { userId } = Route.useParams()
  const { user: currentUser } = useAuth()
  const { users, getPayslipsForUser, updateUserStatus, updateUserRole, addPayslip } = useData()

  // Sensitive reveal state
  const [revealedFields, setRevealedFields] = useState<Set<SensitiveField>>(new Set())
  const [decryptField, setDecryptField] = useState<SensitiveField | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  // Admin actions state
  const [newStatus, setNewStatus] = useState<ServiceStatus | null>(null)
  const [newRole, setNewRole] = useState<UserRole | null>(null)

  // Payslips state
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMonth, setUploadMonth] = useState<number>(new Date().getMonth() + 1)
  const [uploadYear, setUploadYear] = useState<number>(new Date().getFullYear())
  const [uploadComponents, setUploadComponents] = useState<PayComponent[]>([
    { label: 'Basic Salary', amount: 0, type: 'earning' },
  ])
  const [uploadStatus, setUploadStatus] = useState<PayslipStatus>('paid')
  const [uploadDiscrepancy, setUploadDiscrepancy] = useState('')

  const targetUser = users.find((u) => u.id === userId)

  // Initialize action states when targetUser loads
  const resolvedStatus = newStatus ?? targetUser?.status ?? 'active'
  const resolvedRole = newRole ?? targetUser?.role ?? 'personnel'

  const allPayslips = useMemo(
    () => targetUser ? getPayslipsForUser(targetUser.id).sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month)) : [],
    [targetUser, getPayslipsForUser],
  )

  const years = useMemo(() => [...new Set(allPayslips.map((p) => p.year))].sort((a, b) => b - a), [allPayslips])

  const filteredPayslips = useMemo(
    () => yearFilter === 'all' ? allPayslips : allPayslips.filter((p) => p.year === yearFilter),
    [allPayslips, yearFilter],
  )

  if (!currentUser || !targetUser) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-sm text-gray-500 mb-4">User not found.</p>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-army font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to users
        </Link>
      </div>
    )
  }

  const enlistDate = new Date(targetUser.dateOfEnlistment)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - enlistDate.getFullYear()) * 12 + (now.getMonth() - enlistDate.getMonth())
  const serviceYears = Math.floor(totalMonths / 12)
  const serviceMonths = totalMonths % 12

  const statusBgClass =
    targetUser.status === 'active'
      ? 'bg-green-50 text-green-700'
      : targetUser.status === 'awol'
        ? 'bg-red-50 text-red-700'
        : targetUser.status === 'retired'
          ? 'bg-gray-100 text-gray-600'
          : 'bg-orange-50 text-orange-700'

  const statusDotClass =
    targetUser.status === 'active'
      ? 'bg-green-500'
      : targetUser.status === 'awol'
        ? 'bg-red-500'
        : targetUser.status === 'retired'
          ? 'bg-gray-400'
          : 'bg-orange-500'

  const statusLabel =
    targetUser.status === 'awol'
      ? 'AWOL'
      : targetUser.status.charAt(0).toUpperCase() + targetUser.status.slice(1)

  const serviceItems = [
    { label: 'Rank', value: targetUser.rank },
    { label: 'Grade / Step', value: `GL ${targetUser.gradeLevel} – A${targetUser.step}` },
    { label: 'Trade', value: targetUser.trade },
    { label: 'Corps', value: targetUser.corps },
    { label: 'Service', value: `${serviceYears}y ${serviceMonths}m` },
  ]

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function handleDecryptSubmit() {
    if (code === DEMO_DECRYPT_PIN) {
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

  function renderSensitiveValue(field: SensitiveField, value: string) {
    const isRevealed = revealedFields.has(field)
    return (
      <button
        type="button"
        onClick={() => {
          if (isRevealed) {
            setRevealedFields((prev) => {
              const next = new Set(prev)
              next.delete(field)
              return next
            })
          } else {
            setDecryptField(field)
            setCode('')
            setCodeError(false)
          }
        }}
        className="inline-flex items-center gap-2 group/field rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-army-gold/5 transition-colors"
      >
        <span className={`font-mono text-sm transition-colors ${isRevealed ? 'text-army-dark' : 'text-gray-400'}`}>
          {isRevealed ? value : maskSensitive(value)}
        </span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid opacity-50 group-hover/field:opacity-100 transition-opacity" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-army-gold group-hover/field:text-army-gold transition-colors" />
        )}
      </button>
    )
  }

  // Admin action permissions
  const isSuperAdmin = currentUser.role === 'superAdmin'
  const isDivisionAdmin = currentUser.role === 'divisionAdmin'
  const canChangeStatus =
    isSuperAdmin || (isDivisionAdmin && targetUser.division === currentUser.division)
  const canChangeRole = isSuperAdmin && targetUser.id !== currentUser.id

  function handleStatusUpdate() {
    if (!targetUser) return
    updateUserStatus(targetUser.id, resolvedStatus)
  }

  function handleRoleUpdate() {
    if (!targetUser) return
    updateUserRole(targetUser.id, resolvedRole)
  }

  const roleLabel = (role: UserRole) =>
    role === 'personnel' ? 'Personnel' : role === 'divisionAdmin' ? 'Division Admin' : 'Super Admin'

  // Payslip expand toggle
  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Upload modal helpers
  const uploadEarnings = uploadComponents.filter((c) => c.type === 'earning')
  const uploadDeductions = uploadComponents.filter((c) => c.type === 'deduction')
  const uploadGross = uploadEarnings.reduce((s, c) => s + (c.amount || 0), 0)
  const uploadTotalDeductions = uploadDeductions.reduce((s, c) => s + (c.amount || 0), 0)
  const uploadNet = uploadGross - uploadTotalDeductions

  function addComponent(type: 'earning' | 'deduction') {
    setUploadComponents((prev) => [...prev, { label: '', amount: 0, type }])
  }

  function removeComponent(index: number) {
    setUploadComponents((prev) => prev.filter((_, i) => i !== index))
  }

  function updateComponent(index: number, field: keyof PayComponent, value: string | number) {
    setUploadComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  function handleUploadSave() {
    if (!targetUser) return
    const payslip: Payslip = {
      id: `ps-${Date.now()}`,
      userId: targetUser.id,
      month: uploadMonth,
      year: uploadYear,
      components: uploadComponents,
      grossPay: uploadGross,
      totalDeductions: uploadTotalDeductions,
      netPay: uploadNet,
      status: uploadStatus,
      paidDate: uploadStatus !== 'pending' ? new Date().toISOString().split('T')[0] : null,
      discrepancyNote: uploadStatus === 'short-paid' && uploadDiscrepancy ? uploadDiscrepancy : null,
    }
    addPayslip(payslip)
    setShowUpload(false)
    setUploadComponents([{ label: 'Basic Salary', amount: 0, type: 'earning' }])
    setUploadStatus('paid')
    setUploadDiscrepancy('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Back link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Users
      </Link>

      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-army-dark truncate">{targetUser.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusBgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="font-mono">{targetUser.armyNumber}</span>
            <span className="text-gray-300 mx-1.5">·</span>
            {targetUser.division}
          </p>
        </div>
      </div>

      {/* Service Summary Strip */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex">
          <div className="w-1.5 bg-army-gold shrink-0" />
          <div className="flex-1 px-5 py-3.5">
            <div className="flex items-center">
              {serviceItems.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex-1 min-w-0 ${i < serviceItems.length - 1 ? 'border-r border-gray-100 pr-4 mr-4' : ''}`}
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                  <p className="text-sm text-army-dark font-semibold truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sensitive Identifiers */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-army-gold" />
            </div>
            <h3 className="text-sm font-bold text-army-dark">Sensitive Identifiers</h3>
          </div>
          {revealedFields.size === 0 && (
            <span className="text-[11px] text-gray-300 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Click to reveal
            </span>
          )}
        </div>
        <div className="px-3 pb-3">
          {([
            { label: 'National Identification Number (NIN)', field: 'nin' as SensitiveField, value: targetUser.nin },
            { label: 'Bank Verification Number (BVN)', field: 'bvn' as SensitiveField, value: targetUser.bvn },
            { label: 'Salary Account Number', field: 'salaryAccountNo' as SensitiveField, value: targetUser.salaryAccountNo },
          ]).map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
              onClick={() => {
                if (!revealedFields.has(row.field)) {
                  setDecryptField(row.field)
                  setCode('')
                  setCodeError(false)
                }
              }}
            >
              <span className="text-xs font-medium text-gray-400">{row.label}</span>
              {renderSensitiveValue(row.field, row.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center">
            <Shield className="w-4 h-4 text-army" />
          </div>
          <h3 className="text-sm font-bold text-army-dark">Personal Information</h3>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {([
              { icon: Calendar, label: 'Date of Birth', value: formatDate(targetUser.dateOfBirth) },
              { icon: Calendar, label: 'Date of Enlistment', value: formatDate(targetUser.dateOfEnlistment) },
              { icon: MapPin, label: 'State of Origin', value: targetUser.stateOfOrigin },
              { icon: Phone, label: 'Phone', value: targetUser.phone },
            ]).map((row) => (
              <div key={row.label} className="flex items-start gap-3 py-2">
                <row.icon className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{row.label}</p>
                  <p className="text-sm text-army-dark font-semibold truncate">{row.value}</p>
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 flex items-start gap-3 py-2 border-t border-gray-50 mt-1 pt-3">
              <Building2 className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Unit</p>
                <p className="text-sm text-army-dark font-semibold truncate">{targetUser.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions Card */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
          <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center">
            <Settings className="w-4 h-4 text-army-gold" />
          </div>
          <h3 className="text-sm font-bold text-army-dark">Admin Actions</h3>
        </div>
        <div className="px-5 pb-5">
          {/* Change Status */}
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-xs font-medium text-gray-400">Service Status</span>
            {canChangeStatus ? (
              <div className="flex items-center gap-0">
                <select
                  value={resolvedStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceStatus)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-army-dark focus:outline-none focus:ring-1 focus:ring-army/20"
                >
                  <option value="active">Active</option>
                  <option value="awol">AWOL</option>
                  <option value="suspended">Suspended</option>
                  <option value="retired">Retired</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-army-dark text-white hover:bg-army-dark/90 transition-colors ml-2"
                >
                  Update
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-army-dark">{statusLabel}</span>
            )}
          </div>

          {/* Change Role */}
          <div className="flex items-center justify-between py-3">
            <span className="text-xs font-medium text-gray-400">System Role</span>
            {canChangeRole ? (
              <div className="flex items-center gap-0">
                <select
                  value={resolvedRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-army-dark focus:outline-none focus:ring-1 focus:ring-army/20"
                >
                  <option value="personnel">Personnel</option>
                  <option value="divisionAdmin">Division Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
                <button
                  onClick={handleRoleUpdate}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-army-dark text-white hover:bg-army-dark/90 transition-colors ml-2"
                >
                  Update
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-army-dark">{roleLabel(targetUser.role)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Payslips Section */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-army-dark">Payslips</h3>
            <span className="text-xs text-gray-400 font-medium">{allPayslips.length}</span>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-army-gold text-army-dark hover:bg-army-gold-light transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Payslip
          </button>
        </div>

        {/* Year filter pills */}
        {years.length > 1 && (
          <div className="flex gap-1.5 px-5 pb-2.5 flex-wrap">
            <button
              onClick={() => setYearFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${yearFilter === 'all' ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              All
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${yearFilter === y ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Payslip rows */}
        {filteredPayslips.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">No payslips yet.</p>
          </div>
        ) : (
          <div className="border-t border-gray-50">
            {filteredPayslips.map((p) => {
              const isExpanded = expanded.has(p.id)
              const earnings = p.components.filter((c) => c.type === 'earning')
              const deductions = p.components.filter((c) => c.type === 'deduction')
              const statusDot =
                p.status === 'paid'
                  ? 'bg-green-500'
                  : p.status === 'short-paid'
                    ? 'bg-amber-400'
                    : 'bg-gray-300'

              return (
                <div key={p.id} className="border-b border-gray-50 last:border-b-0">
                  {/* Row header */}
                  <div
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleExpand(p.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                      <span className="text-sm font-semibold text-army-dark">
                        {MONTH_NAMES[p.month]} {p.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-sm text-army-dark">
                        ₦{p.netPay.toLocaleString()}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {p.discrepancyNote && (
                        <div className="flex items-center gap-2.5 bg-amber-50 px-5 py-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <p className="text-xs text-amber-700">{p.discrepancyNote}</p>
                        </div>
                      )}
                      <div className="px-5 py-3">
                        {/* Earnings */}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Earnings</p>
                        <div className="space-y-1.5 mb-3">
                          {earnings.map((c) => (
                            <div key={c.label} className="flex justify-between py-1.5 text-sm">
                              <span className="text-gray-600">{c.label}</span>
                              <span className="font-mono text-army-dark">₦{c.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between py-1.5 border-t border-gray-100 text-sm">
                            <span className="font-semibold text-army-dark">Gross Pay</span>
                            <span className="font-bold font-mono text-army-dark">₦{p.grossPay.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Deductions */}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Deductions</p>
                        <div className="space-y-1.5 mb-3">
                          {deductions.map((c) => (
                            <div key={c.label} className="flex justify-between py-1.5 text-sm">
                              <span className="text-red-500">{c.label}</span>
                              <span className="font-mono text-red-500">-₦{c.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between py-1.5 border-t border-gray-100 text-sm">
                            <span className="font-semibold text-gray-700">Total Deductions</span>
                            <span className="font-bold font-mono text-red-500">-₦{p.totalDeductions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net pay summary */}
                      <div className="bg-army-dark rounded-xl mx-5 mb-4 px-5 py-3.5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white/70">Net Pay</span>
                        <span className="text-xl font-extrabold text-army-gold font-mono">₦{p.netPay.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
              placeholder="0000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-lg text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army transition-all"
              autoFocus
            />
            {codeError && (
              <p className="text-xs text-red-600 mt-2 text-center font-medium">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDecryptSubmit} className="bg-army-dark text-white hover:bg-army transition-colors">
              Verify & Reveal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Payslip Modal */}
      <Dialog open={showUpload} onOpenChange={(open) => { if (!open) setShowUpload(false) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Payslip</DialogTitle>
            <DialogDescription>
              Adding payslip for {targetUser.name} ({targetUser.armyNumber})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Month + Year */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Month</label>
                <select
                  value={uploadMonth}
                  onChange={(e) => setUploadMonth(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-army/20"
                >
                  {MONTH_NAMES_FULL.slice(1).map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Year</label>
                <select
                  value={uploadYear}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-army/20"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Earnings</p>
                <button
                  onClick={() => addComponent('earning')}
                  className="inline-flex items-center gap-1 text-xs text-army font-semibold hover:text-army-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {uploadComponents.map((c, i) =>
                  c.type === 'earning' ? (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={c.label}
                        onChange={(e) => updateComponent(i, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-army/20"
                      />
                      <input
                        type="number"
                        value={c.amount || ''}
                        onChange={(e) => updateComponent(i, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-army/20"
                      />
                      <button
                        onClick={() => removeComponent(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null,
                )}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deductions</p>
                <button
                  onClick={() => addComponent('deduction')}
                  className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {uploadComponents.map((c, i) =>
                  c.type === 'deduction' ? (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={c.label}
                        onChange={(e) => updateComponent(i, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-army/20"
                      />
                      <input
                        type="number"
                        value={c.amount || ''}
                        onChange={(e) => updateComponent(i, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-army/20"
                      />
                      <button
                        onClick={() => removeComponent(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null,
                )}
              </div>
            </div>

            {/* Auto-calculated summary */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gross Pay</span>
                <span className="font-mono">₦{uploadGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-red-500">
                <span>Total Deductions</span>
                <span className="font-mono">-₦{uploadTotalDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-army-dark border-t border-gray-200 pt-1.5 mt-1.5">
                <span>Net Pay</span>
                <span className="font-mono text-army-gold">₦{uploadNet.toLocaleString()}</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
              <div className="flex gap-2">
                {(['paid', 'short-paid', 'pending'] as PayslipStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setUploadStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      uploadStatus === s
                        ? s === 'paid'
                          ? 'bg-green-500 text-white'
                          : s === 'short-paid'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-400 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'paid' ? 'Paid' : s === 'short-paid' ? 'Short-paid' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>

            {/* Discrepancy note */}
            {uploadStatus === 'short-paid' && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Discrepancy Note</label>
                <textarea
                  value={uploadDiscrepancy}
                  onChange={(e) => setUploadDiscrepancy(e.target.value)}
                  placeholder="Describe the short-payment reason..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-army/20 resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpload(false)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button onClick={handleUploadSave} className="bg-army-dark text-white hover:bg-army transition-colors">
              Save Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
