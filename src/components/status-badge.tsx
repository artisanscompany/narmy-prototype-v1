import { Badge } from '#/components/ui/badge'
import type { ComplaintStatus } from '#/types/complaint'

const statusConfig: Record<ComplaintStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  'under-review': { label: 'Under Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'needs-more-info': { label: 'Needs More Info', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  escalated: { label: 'Escalated', className: 'bg-red-50 text-red-700 border-red-200' },
  resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={`text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </Badge>
  )
}
