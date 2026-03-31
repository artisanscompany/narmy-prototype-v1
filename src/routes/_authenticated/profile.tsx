import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { maskSensitive } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Lock, Eye, Shield, PenLine } from 'lucide-react'

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

// TODO: replace with real auth flow
const DEMO_DECRYPT_PIN = '0000'

function ProfilePage() {
  const { user } = useAuth()
  const [revealedFields, setRevealedFields] = useState<Set<SensitiveField>>(new Set())
  const [decryptField, setDecryptField] = useState<SensitiveField | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  if (!user) return null

  const enlistDate = new Date(user.dateOfEnlistment)
  const now = new Date()
  const totalMonths = (now.getFullYear() - enlistDate.getFullYear()) * 12 + (now.getMonth() - enlistDate.getMonth())
  const serviceYears = Math.floor(totalMonths / 12)
  const serviceMonths = totalMonths % 12

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

  function renderSensitiveField(field: SensitiveField, value: string) {
    const isRevealed = revealedFields.has(field)
    return (
      <button
        type="button"
        onClick={() => {
          if (isRevealed) {
            setRevealedFields((prev) => { const next = new Set(prev); next.delete(field); return next })
          } else {
            setDecryptField(field)
            setCode('')
            setCodeError(false)
          }
        }}
        className="inline-flex items-center gap-2 group/field"
      >
        <span className={`font-mono text-sm transition-colors ${isRevealed ? 'text-army-dark' : 'text-army-dark/50 group-hover/field:text-army-dark'}`}>
          {isRevealed ? value : maskSensitive(value)}
        </span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid group-hover/field:text-army-dark transition-colors" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-army-gold/60 group-hover/field:text-army-gold transition-colors" />
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
    { label: 'NIN', value: renderSensitiveField('nin', user.nin) },
    { label: 'BVN', value: renderSensitiveField('bvn', user.bvn) },
    { label: 'Full Name', value: user.name },
    { label: 'Army Number', value: <span className="font-mono">{user.armyNumber}</span> },
    { label: 'Salary Account No.', value: renderSensitiveField('salaryAccountNo', user.salaryAccountNo) },
    { label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
    { label: 'Date of Enlistment', value: formatDate(user.dateOfEnlistment) },
    { label: 'State of Origin', value: user.stateOfOrigin },
    { label: 'Phone', value: user.phone },
    { label: 'Unit', value: user.unit },
    { label: 'Division', value: user.division },
    { label: 'Corps', value: user.corps },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Hero — identity + service overview */}
      <div className="bg-army-dark rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-army-gold/6 rounded-full blur-[80px]" />

        <div className="relative z-10 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-army-mid to-army rounded-xl flex items-center justify-center text-white text-base font-bold ring-1 ring-white/10">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {user.name}
              </h1>
              <p className="text-xs text-white/30 mt-0.5">
                {user.rank} · {user.status === 'awol' ? 'AWOL' : 'Active Duty'} · {serviceYears}y {serviceMonths}m service
              </p>
            </div>
          </div>
        </div>

        {/* Service detail chips */}
        <div className="relative z-10 border-t border-white/8 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Rank / Grade', value: `${user.rank} – ${user.gradeLevel}` },
            { label: 'Trade / Step', value: `${user.trade} – A${user.step}` },
            { label: 'Corps', value: user.corps },
            { label: 'Status', value: user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-0.5">{label}</p>
              <p className="text-[13px] text-white/80 font-semibold truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center">
              <Shield className="w-4 h-4 text-army-gold" />
            </div>
            <h2 className="text-sm font-bold text-army-dark">Personal Information</h2>
          </div>
          <span className="text-[11px] text-gray-300 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Click to reveal sensitive fields
          </span>
        </div>

        <div className="px-3 pb-1">
          {personalRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 px-2 rounded-lg ${i < personalRows.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-army-dark font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <Link
            to="/complaints/new"
            className="inline-flex items-center gap-2 text-xs text-army font-medium hover:text-army-gold transition-colors"
          >
            <PenLine className="w-3 h-3" />
            To correct any personal information, raise a complaint ticket
          </Link>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center">
            <svg width="14" height="17" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L24 4V12C24 20 18 26 12 28C6 26 0 20 0 12V4L12 0Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" className="text-army" />
              <path d="M12 7L13.76 11.24L18.4 11.76L15 14.84L15.92 19.4L12 17.2L8.08 19.4L9 14.84L5.6 11.76L10.24 11.24L12 7Z" fill="currentColor" className="text-army" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-army-dark">Service Details</h2>
        </div>

        <div className="px-3 pb-3">
          {[
            { label: 'Rank', value: user.rank },
            { label: 'Grade Level', value: user.gradeLevel },
            { label: 'Step', value: `A${user.step}` },
            { label: 'Trade', value: user.trade },
            {
              label: 'Status',
              value: null,
              badge: true,
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 px-2 rounded-lg ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{row.label}</span>
              {row.badge ? (
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.status === 'active' ? 'bg-green-50 text-green-700' :
                  user.status === 'awol' ? 'bg-red-50 text-red-700' :
                  user.status === 'retired' ? 'bg-gray-100 text-gray-600' :
                  'bg-orange-50 text-orange-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    user.status === 'active' ? 'bg-green-500' :
                    user.status === 'awol' ? 'bg-red-500' :
                    user.status === 'retired' ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`} />
                  {user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              ) : (
                <span className="text-sm text-army-dark font-semibold">{row.value}</span>
              )}
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
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army transition-all"
              autoFocus
            />
            {codeError && (
              <p className="text-xs text-red-600 mt-2 text-center font-medium">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDecryptSubmit} className="bg-army-dark text-white hover:bg-army transition-colors">
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
