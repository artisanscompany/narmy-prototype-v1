import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { KPICard } from '#/components/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  KPI_DATA, DIVISION_1_KPI, CATEGORY_CHART_DATA, MONTHLY_TREND_DATA,
  STATUS_DISTRIBUTION_DATA, DIVISION_COMPARISON_DATA, SLA_COMPLIANCE_DATA,
} from '#/data/analytics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: AdminDashboard,
})

const ACCENT_COLORS = ['#C8A84B', '#1B5E35', '#22c55e', '#C8A84B']

function AdminDashboard() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState('30d')

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'
  const kpis = isSuperAdmin ? KPI_DATA : DIVISION_1_KPI

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">
            {isSuperAdmin ? 'System Overview' : `${user.division} Overview`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ticket analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'All'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRange === range ? 'bg-army-dark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} data={kpi} accentColor={ACCENT_COLORS[i]} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CATEGORY_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B5E35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={STATUS_DISTRIBUTION_DATA} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="status" label={({ status, count }: { status: string; count: number }) => `${status}: ${count}`} labelLine={{ stroke: '#999' }} >
                  {STATUS_DISTRIBUTION_DATA.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {isSuperAdmin ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Tickets by Division</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">SLA Compliance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SLA_COMPLIANCE_DATA.filter((d) => d.division === user.division).map((d) => (
                  <div key={d.division}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Compliance Rate</span>
                      <span className="font-bold text-army-dark">{d.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-army h-3 rounded-full" style={{ width: `${d.complianceRate}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Within SLA: {d.withinSLA}</span>
                      <span>Breached: {d.breached}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
