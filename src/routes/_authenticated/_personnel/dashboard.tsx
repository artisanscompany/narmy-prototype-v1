import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { StatusBadge } from '#/components/status-badge'
import { AWOLBanner } from '#/components/awol-banner'
import { FileText, PenLine, Wallet, Shield, Star, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto">
      {user.status === 'awol' && <AWOLBanner />}

      {/* Hero Greeting */}
      <div className="bg-gradient-to-r from-army-dark via-army-dark to-army rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5l5 15h16l-13 9 5 16-13-10-13 10 5-16-13-9h16z\' fill=\'%23C8A84B\' fill-opacity=\'1\'/%3E%3C/svg%3E")' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-army-gold/8 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-army-gold/70 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Personnel Dashboard</p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {getGreeting()}, {user.rank} {user.name.split(' ').pop()}
              </h1>
              <p className="text-white/40 text-sm mt-2">
                {monthNames[new Date().getMonth() + 1]} {new Date().getFullYear()} service summary
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/pay"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                View Payslips
              </Link>
              <Link
                to="/complaints/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-all shadow-lg shadow-army-gold/20"
              >
                <PenLine className="w-4 h-4" />
                Raise Complaint
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status cards — 2x2 grid that works at all widths */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet className="w-3.5 h-3.5 text-army-gold" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Pay</span>
            </div>
            <div className="text-xl font-extrabold text-army-dark font-mono leading-tight">
              ₦{latestPayslip?.netPay.toLocaleString() ?? '—'}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {latestPayslip ? `${monthNamesShort[latestPayslip.month]} ${latestPayslip.year}` : ''}
            </div>
            {latestPayslip?.status === 'paid' && (
              <div className="text-[11px] text-green-600 mt-0.5 font-semibold">Paid {latestPayslip.paidDate?.slice(8, 10)} {monthNamesShort[latestPayslip.month]}</div>
            )}
            {latestPayslip?.status === 'short-paid' && (
              <div className="text-[11px] text-amber-600 mt-0.5 font-semibold">Short-paid</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className={`w-3.5 h-3.5 ${user.status === 'awol' ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <div className={`text-lg font-bold leading-tight ${user.status === 'awol' ? 'text-red-600' : 'text-army-dark'}`}>
              {user.status === 'awol' ? 'AWOL' : 'Active Duty'}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Enlisted {new Date(user.dateOfEnlistment).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Star className="w-3.5 h-3.5 text-army" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rank</span>
            </div>
            <div className="text-lg font-bold text-army-dark leading-tight">{user.rank}</div>
            <div className="text-[11px] text-gray-400 mt-1">{user.gradeLevel} · Step {user.step}</div>
            <span className="inline-block mt-1 text-[10px] font-semibold text-army bg-army/8 px-2 py-0.5 rounded-full">{user.corps}</span>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className={`w-3.5 h-3.5 ${openComplaints.length > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Complaints</span>
            </div>
            <div className="text-xl font-extrabold text-army-dark leading-tight">{openComplaints.length}</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {openComplaints.length === 0 ? 'No open complaints' : `${openComplaints.length} open`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column: Pay + Details/Complaint */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-army-dark">Pay Breakdown — {latestPayslip ? `${monthNames[latestPayslip.month]} ${latestPayslip.year}` : ''}</CardTitle>
            <Link to="/pay" className="inline-flex items-center gap-1 text-xs text-army-gold font-semibold hover:underline">
              All payslips <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {latestPayslip?.components.filter(c => c.type !== 'deduction').map((comp) => (
              <div key={comp.label} className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-600">{comp.label}</span>
                <span className="text-sm font-bold font-mono text-army-dark">₦{comp.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-200 my-1" />
            {latestPayslip?.components.filter(c => c.type === 'deduction').map((comp) => (
              <div key={comp.label} className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-red-50/50 transition-colors">
                <span className="text-sm text-red-500">{comp.label}</span>
                <span className="text-sm font-bold font-mono text-red-500">-₦{comp.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3.5 bg-army-dark rounded-xl mt-2">
              <span className="text-sm font-semibold text-white/80">Net Pay</span>
              <span className="text-xl font-extrabold text-army-gold font-mono">₦{latestPayslip?.netPay.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-army-dark">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-gray-100">
              {[
                ['Army Number', user.armyNumber],
                ['Division', user.division],
                ['Trade', user.trade],
                ['Service', `${serviceYears} yrs ${serviceMonths} mos`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold text-army-dark font-mono">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {latestComplaint && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-army-dark">Latest Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to="/complaints/$complaintId"
                  params={{ complaintId: latestComplaint.id }}
                  className="block p-4 rounded-xl border border-gray-100 hover:border-army-gold/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <StatusBadge status={latestComplaint.status} />
                    <span className="text-[10px] text-gray-300 font-mono">{latestComplaint.id}</span>
                  </div>
                  <p className="text-sm font-bold text-army-dark mt-2 group-hover:text-army">{latestComplaint.subcategory}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Filed {new Date(latestComplaint.filedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {latestComplaint.category}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-army-gold text-xs font-semibold">
                    View details <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
                <div className="text-right mt-3">
                  <Link to="/complaints" className="inline-flex items-center gap-1 text-xs text-army-gold font-semibold hover:underline">
                    All complaints <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
