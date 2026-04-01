import type { ClearanceLevel } from '#/types/elearning'
import { getClearanceLabel } from '#/lib/clearance'

const config: Record<ClearanceLevel, { bg: string; text: string; dot: string }> = {
  all_ranks: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  nco_above: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  officer_above: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  senior_officer: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

export function ClearanceBadge({ level }: { level: ClearanceLevel }) {
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {getClearanceLabel(level)}
    </span>
  )
}
