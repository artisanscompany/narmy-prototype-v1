import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { StatusBadge } from '#/components/status-badge'
import { TimelineView } from '#/components/timeline-view'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { differenceInDays, format } from 'date-fns'
import { useState } from 'react'
import { ArrowLeft, AlertTriangle, Send } from 'lucide-react'
import type { ComplaintStatus } from '#/types/complaint'

export const Route = createFileRoute('/_authenticated/admin/tickets/$ticketId')({
  component: AdminTicketDetail,
})

const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  submitted: ['under-review', 'needs-more-info', 'escalated'],
  'under-review': ['needs-more-info', 'escalated', 'resolved'],
  'needs-more-info': ['under-review', 'escalated'],
  escalated: ['under-review', 'resolved'],
  resolved: ['closed'],
  closed: [],
}

function AdminTicketDetail() {
  const { ticketId } = Route.useParams()
  const { user } = useAuth()
  const { complaints, updateComplaintStatus, addNote } = useData()
  const [noteText, setNoteText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('')

  const ticket = complaints.find((c) => c.id === ticketId)

  if (!user) return null

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Ticket not found</h2>
        <p className="text-gray-500 mb-4">The ticket "{ticketId}" does not exist.</p>
        <Link to="/admin/tickets" className="text-army-dark font-medium hover:underline">
          Back to tickets
        </Link>
      </div>
    )
  }

  const daysLeft = differenceInDays(new Date(ticket.slaDeadline), new Date())
  const slaBreach = daysLeft < 0
  const availableStatuses = STATUS_TRANSITIONS[ticket.status] ?? []

  function handleStatusChange() {
    if (!selectedStatus || !user) return
    updateComplaintStatus(ticket.id, selectedStatus, user.name, noteText || `Status changed to ${selectedStatus}`)
    setSelectedStatus('')
    setNoteText('')
  }

  function handleAddNote() {
    if (!noteText.trim() || !user) return
    addNote(ticket.id, noteText, user.name)
    setNoteText('')
  }

  function handleEscalate() {
    if (!user) return
    updateComplaintStatus(ticket.id, 'escalated', user.name, noteText || 'Ticket escalated by admin')
    setNoteText('')
  }

  const sortedTimeline = [...ticket.timeline].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-army-dark mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-army-dark">{ticket.id}</h1>
            <StatusBadge status={ticket.status} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
              ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {ticket.priority}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{ticket.category} &mdash; {ticket.subcategory}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${slaBreach ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-green-600'}`}>
          {slaBreach && <AlertTriangle className="w-4 h-4" />}
          SLA: {slaBreach ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <TimelineView events={sortedTimeline} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Admin Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Add Note / Comment</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Type your note here..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-army/30 resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-army-dark text-white hover:bg-army-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Add Note
                  </button>

                  {availableStatuses.length > 0 && (
                    <>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="">Change status...</option>
                        {availableStatuses.map((s) => (
                          <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleStatusChange}
                        disabled={!selectedStatus}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-army text-white hover:bg-army/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Update Status
                      </button>
                    </>
                  )}

                  {ticket.status !== 'escalated' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <button
                      onClick={handleEscalate}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Filer Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Name</dt>
                  <dd className="font-medium text-gray-900">{ticket.userName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Army Number</dt>
                  <dd className="font-medium text-gray-900">{ticket.userArmyNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Division</dt>
                  <dd className="font-medium text-gray-900">{ticket.userDivision}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ticket Info</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Filed Date</dt>
                  <dd className="font-medium text-gray-900">{format(new Date(ticket.filedDate), 'd MMM yyyy')}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Last Updated</dt>
                  <dd className="font-medium text-gray-900">{format(new Date(ticket.lastUpdated), 'd MMM yyyy HH:mm')}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">SLA Deadline</dt>
                  <dd className={`font-medium ${slaBreach ? 'text-red-600' : 'text-gray-900'}`}>
                    {format(new Date(ticket.slaDeadline), 'd MMM yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Category</dt>
                  <dd className="font-medium text-gray-900">{ticket.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs uppercase tracking-wide">Subcategory</dt>
                  <dd className="font-medium text-gray-900">{ticket.subcategory}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
