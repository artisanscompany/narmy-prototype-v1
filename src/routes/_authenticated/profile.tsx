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
import { Lock, Eye, PenLine, Shield, Fingerprint, Briefcase, MapPin, Phone, Calendar, Hash, Building2, Users, Award, ChevronRight } from 'lucide-react'

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

  function renderSensitiveValue(field: SensitiveField, value: string) {
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
        className="inline-flex items-center gap-2 group/field rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-army-gold/5 transition-colors"
      >
        <span className={`font-mono text-sm transition-colors ${isRevealed ? 'text-army-dark' : 'text-gray-400'}`}>
          {isRevealed ? value : maskSensitive(value)}
        </span>
        {isRevealed ? (
          <Eye className="w-3.5 h-3.5 text-army-mid opacity-50 group-hover/field:opacity-100 transition-opacity" />
        ) : (
          <Lock className="w-3 h-3 text-army-gold/50 group-hover/field:text-army-gold transition-colors" />
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

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">{user.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="font-mono">{user.armyNumber}</span>
            <span className="text-gray-300 mx-1.5">·</span>
            {user.rank}
            <span className="text-gray-300 mx-1.5">·</span>
            {user.division}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
          user.status === 'active' ? 'bg-green-50 text-green-700' :
          user.status === 'awol' ? 'bg-red-50 text-red-700' :
          user.status === 'retired' ? 'bg-gray-100 text-gray-600' :
          'bg-orange-50 text-orange-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            user.status === 'active' ? 'bg-green-500' :
            user.status === 'awol' ? 'bg-red-500' :
            user.status === 'retired' ? 'bg-gray-400' :
            'bg-orange-500'
          }`} />
          {user.status === 'awol' ? 'AWOL' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </div>

      {/* Service summary strip */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-3">
          {[
            { label: 'Rank', value: user.rank },
            { label: 'Grade / Step', value: `${user.gradeLevel} – A${user.step}` },
            { label: 'Trade', value: user.trade },
            { label: 'Corps', value: user.corps },
            { label: 'Service', value: `${serviceYears}y ${serviceMonths}m` },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
              <p className="text-sm text-army-dark font-semibold truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitive Identifiers */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-army-gold/8 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-army-gold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-army-dark">Sensitive Identifiers</h3>
              <p className="text-[11px] text-gray-400">Click any field to verify and reveal</p>
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          {([
            { label: 'National Identification Number (NIN)', field: 'nin' as SensitiveField, value: user.nin },
            { label: 'Bank Verification Number (BVN)', field: 'bvn' as SensitiveField, value: user.bvn },
            { label: 'Salary Account Number', field: 'salaryAccountNo' as SensitiveField, value: user.salaryAccountNo },
          ]).map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 px-2 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-xs font-medium text-gray-400">{row.label}</span>
              {renderSensitiveValue(row.field, row.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information — 2-column grid */}
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
              { icon: Users, label: 'Full Name', value: user.name },
              { icon: Hash, label: 'Army Number', value: user.armyNumber, mono: true },
              { icon: Calendar, label: 'Date of Birth', value: formatDate(user.dateOfBirth) },
              { icon: Calendar, label: 'Date of Enlistment', value: formatDate(user.dateOfEnlistment) },
              { icon: MapPin, label: 'State of Origin', value: user.stateOfOrigin },
              { icon: Phone, label: 'Phone', value: user.phone },
            ]).map((row) => (
              <div key={row.label} className="flex items-start gap-3 py-2">
                <row.icon className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{row.label}</p>
                  <p className={`text-sm text-army-dark font-semibold truncate ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 px-5 py-3">
          <Link
            to="/complaints/new"
            className="inline-flex items-center gap-2 text-xs text-army font-medium hover:text-army-gold transition-colors group"
          >
            <PenLine className="w-3 h-3" />
            To correct any personal information, raise a complaint ticket
            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-army-gold transition-colors" />
          </Link>
        </div>
      </div>

      {/* Unit & Assignment */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3">
          <div className="w-8 h-8 rounded-lg bg-army/8 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-army" />
          </div>
          <h3 className="text-sm font-bold text-army-dark">Unit & Assignment</h3>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {([
              { icon: Briefcase, label: 'Unit', value: user.unit },
              { icon: Building2, label: 'Division', value: user.division },
              { icon: Award, label: 'Corps', value: user.corps },
              { icon: Shield, label: 'Trade', value: user.trade },
            ]).map((row) => (
              <div key={row.label} className="flex items-start gap-3 py-2">
                <row.icon className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{row.label}</p>
                  <p className="text-sm text-army-dark font-semibold truncate">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
