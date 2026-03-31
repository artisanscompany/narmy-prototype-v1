import { createFileRoute, Link } from '@tanstack/react-router'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { StatusBadge } from '#/components/status-badge'
import { TimelineView } from '#/components/timeline-view'
import { Button } from '#/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/$complaintId')({
  component: ComplaintDetailPage,
})

function ComplaintDetailPage() {
  const { complaintId } = Route.useParams()
  const { complaints } = useData()
  const complaint = complaints.find((c) => c.id === complaintId)

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">Complaint not found.</p>
        <Button variant="ghost" asChild className="mt-4"><Link to="/complaints">← Back to complaints</Link></Button>
      </div>
    )
  }

  const daysOpen = differenceInDays(new Date(), new Date(complaint.filedDate))
  const slaRemaining = differenceInDays(new Date(complaint.slaDeadline), new Date())
  const slaBreached = slaRemaining < 0

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/complaints"><ArrowLeft className="w-4 h-4 mr-2" />Back to complaints</Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-army-dark">{complaint.id}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="text-gray-500 text-sm">{complaint.category} → {complaint.subcategory}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{daysOpen} days open</span>
          </div>
          <div className={`px-2.5 py-1 rounded-md font-semibold ${slaBreached ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {slaBreached ? `SLA breached by ${Math.abs(slaRemaining)}d` : `${slaRemaining}d until SLA`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            <TimelineView events={complaint.timeline} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-gray-400 text-xs block">Filed</span><span className="font-semibold">{format(new Date(complaint.filedDate), 'd MMM yyyy')}</span></div>
              <div><span className="text-gray-400 text-xs block">Priority</span><span className={`font-semibold capitalize ${complaint.priority === 'critical' ? 'text-red-600' : complaint.priority === 'high' ? 'text-amber-600' : 'text-gray-700'}`}>{complaint.priority}</span></div>
              <div><span className="text-gray-400 text-xs block">SLA Deadline</span><span className="font-semibold">{format(new Date(complaint.slaDeadline), 'd MMM yyyy')}</span></div>
              <div><span className="text-gray-400 text-xs block">Last Updated</span><span className="font-semibold">{format(new Date(complaint.lastUpdated), 'd MMM yyyy HH:mm')}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
