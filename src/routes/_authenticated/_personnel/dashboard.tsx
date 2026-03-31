import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { StatusBadge } from '#/components/status-badge'
import { AWOLBanner } from '#/components/awol-banner'
import { FileText, Zap, Wallet, Shield, Star, AlertCircle } from 'lucide-react'

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

  return (
    <div className="max-w-6xl mx-auto">
      {user.status === 'awol' && <AWOLBanner />}

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">
            {getGreeting()}, {user.rank} {user.name.split(' ').pop()}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your service overview for {monthNames[new Date().getMonth() + 1]} {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/pay">
              <FileText className="w-4 h-4 mr-2" />
              Download Payslip
            </Link>
          </Button>
          <Button asChild className="bg-army-dark hover:bg-army">
            <Link to="/complaints/new">
              <Zap className="w-4 h-4 mr-2" />
              Raise Complaint
            </Link>
          </Button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army-gold to-army-gold/50" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-army-gold" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Pay — {latestPayslip ? monthNames[latestPayslip.month] : ''}</span>
            </div>
            <div className="text-2xl font-extrabold text-army-dark font-mono">
              ₦{latestPayslip?.netPay.toLocaleString() ?? '—'}
            </div>
            {latestPayslip?.status === 'paid' && (
              <div className="text-xs text-green-600 mt-1 font-medium">✓ Paid on {latestPayslip.paidDate?.slice(8, 10)}th</div>
            )}
            {latestPayslip?.status === 'short-paid' && (
              <div className="text-xs text-amber-600 mt-1 font-medium">⚠ Short-paid — discrepancy detected</div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${user.status === 'awol' ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-green-500 to-green-400'}`} />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Status</span>
            </div>
            <div className={`text-xl font-bold ${user.status === 'awol' ? 'text-red-600' : 'text-army-dark'}`}>
              {user.status === 'awol' ? 'AWOL' : 'Active Duty'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Since {new Date(user.dateOfEnlistment).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army to-army-mid" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-army" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank & Grade</span>
            </div>
            <div className="text-xl font-bold text-army-dark">{user.rank}</div>
            <div className="text-xs text-gray-400 mt-1">{user.gradeLevel}, Step {user.step} · {user.corps}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-amber-300" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Open Complaints</span>
            </div>
            <div className="text-2xl font-extrabold text-army-dark">{openComplaints.length}</div>
            {latestComplaint && !['resolved', 'closed'].includes(latestComplaint.status) && (
              <div className="text-xs text-amber-600 mt-1 font-medium">
                ⏳ {latestComplaint.status === 'under-review' ? 'Under Review' : latestComplaint.status === 'escalated' ? 'Escalated' : 'Pending'}
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
            <Link to="/pay" className="text-xs text-army-gold font-semibold hover:underline">View all payslips →</Link>
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
              <span className="text-sm font-semibold text-white">Net Pay</span>
              <span className="text-lg font-extrabold text-army-gold font-mono">₦{latestPayslip?.netPay.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Army Number', user.armyNumber],
                ['Division', user.division],
                ['Trade', user.trade],
                ['Years of Service', `${Math.floor((Date.now() - new Date(user.dateOfEnlistment).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
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
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
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
                  <Link to="/complaints" className="text-xs text-army-gold font-semibold hover:underline">View all complaints →</Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
