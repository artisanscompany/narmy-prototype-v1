import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  CATEGORY_CHART_DATA, MONTHLY_TREND_DATA, STATUS_DISTRIBUTION_DATA,
  DIVISION_COMPARISON_DATA, SLA_COMPLIANCE_DATA,
} from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'

export const Route = createFileRoute('/_authenticated/admin/analytics')({
  component: AdminAnalytics,
})

function AdminAnalytics() {
  const { user } = useAuth()

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-army-dark">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Detailed ticket analytics and trend data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={CATEGORY_CHART_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B5E35" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Filing vs Resolution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={MONTHLY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tickets" stroke="#C8A84B" fill="#C8A84B" fillOpacity={0.15} strokeWidth={2} name="Filed" />
                <Area type="monotone" dataKey="resolved" stroke="#1B5E35" fill="#1B5E35" fillOpacity={0.15} strokeWidth={2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={STATUS_DISTRIBUTION_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="count" nameKey="status" label={({ status, count }: { status: string; count: number }) => `${status}: ${count}`} labelLine={{ stroke: '#999' }}>
                  {STATUS_DISTRIBUTION_DATA.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Trend (Line)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MONTHLY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tickets" stroke="#C8A84B" strokeWidth={2} dot={{ r: 4 }} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#1B5E35" strokeWidth={2} dot={{ r: 4 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tickets by Division (Stacked)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DIVISION_COMPARISON_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                  <XAxis dataKey="division" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open" stackId="a" fill="#C8A84B" name="Open" />
                  <Bar dataKey="resolved" stackId="a" fill="#1B5E35" name="Resolved" />
                  <Bar dataKey="escalated" stackId="a" fill="#ef4444" name="Escalated" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SLA Compliance by Division</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SLA_COMPLIANCE_DATA.map((d) => (
                  <div key={d.division}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{d.division}</span>
                      <span className="font-bold text-army-dark">{d.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${d.complianceRate >= 95 ? 'bg-green-500' : d.complianceRate >= 90 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${d.complianceRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>Within SLA: {d.withinSLA}</span>
                      <span>Breached: {d.breached}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
