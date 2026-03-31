import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { differenceInDays } from 'date-fns'
import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/admin/tickets/')({
  component: AdminTickets,
})

type SortField = 'filedDate' | 'priority' | 'status' | 'category'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const STATUS_OPTIONS: ComplaintStatus[] = ['submitted', 'under-review', 'needs-more-info', 'escalated', 'resolved', 'closed']

function AdminTickets() {
  const { user } = useAuth()
  const { complaints, getComplaintsForDivision } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('filedDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const allTickets = useMemo(() => {
    if (!user) return []
    return user.role === 'superAdmin' ? complaints : getComplaintsForDivision(user.division)
  }, [user, complaints, getComplaintsForDivision])

  const filtered = useMemo(() => {
    let list = allTickets

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.userArmyNumber.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.subcategory.toLowerCase().includes(q),
      )
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'filedDate':
          cmp = new Date(a.filedDate).getTime() - new Date(b.filedDate).getTime()
          break
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'category':
          cmp = a.category.localeCompare(b.category)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [allTickets, statusFilter, search, sortField, sortDir])

  if (!user) return null

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-300" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">Ticket Management</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} tickets found</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, name, army number, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tickets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Filer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort('category')}>
                    <span className="flex items-center gap-1">Category <SortIcon field="category" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort('priority')}>
                    <span className="flex items-center gap-1">Priority <SortIcon field="priority" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort('filedDate')}>
                    <span className="flex items-center gap-1">Filed <SortIcon field="filedDate" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">SLA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => {
                  const daysLeft = differenceInDays(new Date(ticket.slaDeadline), new Date())
                  const slaBreach = daysLeft < 0
                  const slaWarning = daysLeft >= 0 && daysLeft <= 2

                  return (
                    <tr key={ticket.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to="/admin/tickets/$ticketId"
                          params={{ ticketId: ticket.id }}
                          className="text-army-dark font-medium hover:underline"
                        >
                          {ticket.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{ticket.userName}</div>
                        <div className="text-xs text-gray-400">{ticket.userArmyNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{ticket.category}</div>
                        <div className="text-xs text-gray-400">{ticket.subcategory}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(ticket.filedDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${slaBreach ? 'text-red-600' : slaWarning ? 'text-amber-600' : 'text-green-600'}`}>
                          {(slaBreach || slaWarning) && <AlertTriangle className="w-3 h-3" />}
                          {slaBreach ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No tickets match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
