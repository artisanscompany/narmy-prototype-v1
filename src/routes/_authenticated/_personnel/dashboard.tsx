import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { StatusBadge } from '#/components/status-badge'
import { AWOLBanner } from '#/components/awol-banner'
import { FileText, PenLine, Wallet, Shield, Star, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/_personnel/dashboard')({
  component: PersonnelDashboard,
})

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function PersonnelDashboard() {
  const { user } = useAuth()
  const { getComplaintsForUser, getPayslipsForUser } = useData()

  if (!user) return null

  const complaints = getComplaintsForUser(user.id)
  const payslips = getPayslipsForUser(user.id)
  const openComplaints = complaints.filter((c) => !['resolved', 'closed'].includes(c.status))
  const latestPayslip = payslips.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))[0]
  const latestComplaint = complaints[0]

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthNamesShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const enlistDate = new Date(user.dateOfEnlistment)
  const now = new Date()
  const totalMonths = (now.getFullYear() - enlistDate.getFullYear()) * 12 + (now.getMonth() - enlistDate.getMonth())
  const serviceYears = Math.floor(totalMonths / 12)
  const serviceMonths = totalMonths % 12

  return (
    <div className="max-w-5xl mx-auto">
      {user.status === 'awol' && <AWOLBanner />}

      {/* Hero Greeting */}
      <div className="bg-gradient-to-br from-army-dark to-army rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-army-gold/5 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}, {user.rank} {user.name.split(' ').pop()}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Your {monthNames[new Date().getMonth() + 1]} {new Date().getFullYear()} service summary
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:text-white">
              <Link to="/pay">
                <FileText className="w-4 h-4 mr-2" />
                View Payslips
              </Link>
            </Button>
            <Button asChild className="bg-army-gold hover:bg-army-gold-light text-army-dark font-semibold">
              <Link to="/complaints/new">
                <PenLine className="w-4 h-4 mr-2" />
                Raise Complaint
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden bg-army-gold/[0.02]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army-gold to-army-gold/50" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-army-gold" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Pay — {latestPayslip ? `${monthNamesShort[latestPayslip.month]} ${latestPayslip.year}` : ''}</span>
            </div>
            <div className="text-2xl font-extrabold text-army-dark font-mono">
              ₦{latestPayslip?.netPay.toLocaleString() ?? '—'}
            </div>
            {latestPayslip?.status === 'paid' && (
              <div className="text-xs text-green-600 mt-1 font-medium">✓ Paid {latestPayslip.paidDate?.slice(8, 10)} {latestPayslip ? monthNamesShort[latestPayslip.month] : ''}</div>
            )}
            {latestPayslip?.status === 'short-paid' && (
              <div className="text-xs text-amber-600 mt-1 font-medium">⚠ Short-paid — discrepancy detected</div>
            )}
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden ${user.status === 'awol' ? 'bg-red-50/30' : 'bg-green-50/30'}`}>
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${user.status === 'awol' ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-green-500 to-green-400'}`} />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Status</span>
            </div>
            <div className={`text-xl font-bold ${user.status === 'awol' ? 'text-red-600' : 'text-army-dark'}`}>
              {user.status === 'awol' ? 'AWOL' : 'Active Duty'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Enlisted {new Date(user.dateOfEnlistment).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-army/[0.02]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army to-army-mid" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-army" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank & Grade</span>
            </div>
            <div className="text-xl font-bold text-army-dark">{user.rank}</div>
            <div className="text-xs text-gray-400 mt-1">{user.gradeLevel} · Step {user.step}</div>
            <div className="mt-1"><span className="text-[10px] font-medium text-army bg-army/10 px-1.5 py-0.5 rounded">{user.corps}</span></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-amber-50/30">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-amber-300" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Open Complaints</span>
            </div>
            <div className="text-2xl font-extrabold text-army-dark">{openComplaints.length}</div>
            {latestComplaint && !['resolved', 'closed'].includes(latestComplaint.status) && (
              <div className="text-xs text-amber-600 mt-1 font-medium">
                {openComplaints.length} {latestComplaint.status === 'under-review' ? 'under review' : latestComplaint.status === 'escalated' ? 'escalated' : 'pending'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two column: Pay + Details/Complaint */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pay Breakdown — {latestPayslip ? `${monthNames[latestPayslip.month]} ${latestPayslip.year}` : ''}</CardTitle>
            <Link to="/pay" className="text-xs text-army-gold font-semibold hover:underline">All payslips →</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestPayslip?.components.map((comp) => (
              <div key={comp.label} className="flex justify-between items-center px-3 py-2.5 bg-gray-50 rounded-lg">
                <span className={`text-sm ${comp.type === 'deduction' ? 'text-red-600' : 'text-gray-700'}`}>{comp.label}</span>
                <span className={`text-sm font-bold font-mono ${comp.type === 'deduction' ? 'text-red-600' : 'text-army-dark'}`}>
                  {comp.type === 'deduction' ? '-' : ''}₦{comp.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center px-3 py-3 bg-army-dark rounded-lg mt-2">
              <span className="text-base font-semibold text-white">Net Pay</span>
              <span className="text-xl font-extrabold text-army-gold font-mono">₦{latestPayslip?.netPay.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-gray-100">
              {[
                ['Army Number', user.armyNumber],
                ['Division', user.division],
                ['Trade', user.trade],
                ['Years of Service', `${serviceYears} yrs ${serviceMonths} mos`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-semibold text-army-dark font-mono">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {latestComplaint && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Latest Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-3 rounded-lg border ${latestComplaint.status === 'resolved' || latestComplaint.status === 'closed' ? 'bg-green-50 border-green-200' : latestComplaint.status === 'escalated' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <StatusBadge status={latestComplaint.status} />
                    <span className="text-[10px] text-gray-400 font-mono">{latestComplaint.id}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-2">{latestComplaint.subcategory}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Filed {new Date(latestComplaint.filedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {latestComplaint.category}
                  </p>
                </div>
                <div className="text-right mt-3">
                  <Link to="/complaints" className="text-xs text-army-gold font-semibold hover:underline">All complaints →</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
