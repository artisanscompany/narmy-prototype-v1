import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { StatusBadge } from '#/components/status-badge'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/')({
  component: ComplaintsListPage,
})

const filterOptions: { label: string; value: ComplaintStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'submitted' },
  { label: 'Under Review', value: 'under-review' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Resolved', value: 'resolved' },
]

function ComplaintsListPage() {
  const { user } = useAuth()
  const { getComplaintsForUser } = useData()
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all')

  if (!user) return null

  const complaints = getComplaintsForUser(user.id)
  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">My Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">{complaints.length} total complaints</p>
        </div>
        <Button asChild className="bg-army-dark hover:bg-army">
          <Link to="/complaints/new">
            <Plus className="w-4 h-4 mr-2" />
            Raise Complaint
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === opt.value ? 'bg-army-dark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No complaints found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to="/complaints/$complaintId"
                  params={{ complaintId: c.id }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-sm font-semibold text-army-dark">{c.subcategory}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.category} · Filed {new Date(c.filedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <span className="text-xs text-gray-400">→</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
