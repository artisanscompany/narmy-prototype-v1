import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { maskSensitive } from '#/lib/utils'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Lock, Eye } from 'lucide-react'

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

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  awol: 'bg-red-50 text-red-700 border-red-200',
  retired: 'bg-gray-50 text-gray-500 border-gray-200',
  suspended: 'bg-orange-50 text-orange-700 border-orange-200',
}

function ProfilePage() {
  const { user } = useAuth()
  const [revealedFields, setRevealedFields] = useState<Set<SensitiveField>>(new Set())
  const [decryptField, setDecryptField] = useState<SensitiveField | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)

  if (!user) return null

  function handleDecryptSubmit() {
    if (code === '0000') {
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
          if (!isRevealed) {
            setDecryptField(field)
            setCode('')
            setCodeError(false)
          }
        }}
        className={`inline-flex items-center gap-2 font-mono text-sm ${isRevealed ? 'text-army-dark' : 'text-army-dark/60 hover:text-army-dark cursor-pointer'}`}
      >
        <span>{isRevealed ? value : maskSensitive(value)}</span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-army-gold" />
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
    { label: 'National Identification Number (NIN)', value: renderSensitiveField('nin', user.nin) },
    { label: 'BVN', value: renderSensitiveField('bvn', user.bvn) },
    { label: 'Full Name', value: user.name },
    { label: 'Army Number', value: user.armyNumber },
    { label: 'Salary Account Number', value: renderSensitiveField('salaryAccountNo', user.salaryAccountNo) },
    { label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
    { label: 'Date of Enlistment', value: formatDate(user.dateOfEnlistment) },
    { label: 'State of Origin', value: user.stateOfOrigin },
    { label: 'Phone', value: user.phone },
    { label: 'Unit', value: user.unit },
    { label: 'Division', value: user.division },
    { label: 'Corps', value: user.corps },
  ]

  const serviceRows: { label: string; value: React.ReactNode }[] = [
    { label: 'Rank', value: user.rank },
    { label: 'Grade Level', value: user.gradeLevel },
    { label: 'Step', value: `A${user.step}` },
    { label: 'Trade', value: user.trade },
    {
      label: 'Status',
      value: (
        <Badge variant="outline" className={`text-[11px] font-semibold capitalize ${statusStyles[user.status] || ''}`}>
          {user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-army-dark">My Profile</h1>
        <p className="text-sm text-army-dark/50 mt-1">View your personal information and service details</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-army-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-army-sand bg-army-cream/50">
          <h2 className="text-sm font-bold text-army-dark uppercase tracking-wider">Personal Information</h2>
        </div>
        <div className="divide-y divide-army-sand/60">
          {personalRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-xs font-medium text-army-dark/50 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-army-dark font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3.5 border-t border-army-sand bg-army-cream/30">
          <p className="text-xs text-army-dark/40 italic">
            To correct any personal information, please raise a complaint ticket.
          </p>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-xl border border-army-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-army-sand bg-army-cream/50">
          <h2 className="text-sm font-bold text-army-dark uppercase tracking-wider">Service Details</h2>
        </div>
        <div className="divide-y divide-army-sand/60">
          {serviceRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-xs font-medium text-army-dark/50 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-army-dark font-medium text-right">{row.value}</span>
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
              className="w-full px-3 py-2 rounded-lg border border-army-sand bg-white text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-army-gold/40 focus:border-army-gold"
              autoFocus
            />
            {codeError && (
              <p className="text-xs text-red-600 mt-2 text-center">Invalid verification code</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDecryptSubmit} className="bg-army text-white hover:bg-army-mid">
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
