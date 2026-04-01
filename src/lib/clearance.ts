import type { ClearanceLevel } from '#/types/elearning'

const RANK_ORDER: string[] = [
  'Private',
  'Lance Corporal',
  'Corporal',
  'Sergeant',
  'Staff Sergeant',
  'Warrant Officer',
  '2nd Lieutenant',
  'Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
  'Brigadier General',
  'Major General',
]

const CLEARANCE_MIN_RANK: Record<ClearanceLevel, string> = {
  all_ranks: 'Private',
  nco_above: 'Corporal',
  officer_above: '2nd Lieutenant',
  senior_officer: 'Major',
}

function getRankIndex(rank: string): number {
  const idx = RANK_ORDER.indexOf(rank)
  return idx === -1 ? 0 : idx
}

export function getUserClearanceLevel(rank: string): ClearanceLevel {
  const idx = getRankIndex(rank)
  if (idx >= getRankIndex('Major')) return 'senior_officer'
  if (idx >= getRankIndex('2nd Lieutenant')) return 'officer_above'
  if (idx >= getRankIndex('Corporal')) return 'nco_above'
  return 'all_ranks'
}

export function canAccess(userRank: string, required: ClearanceLevel): boolean {
  const userIdx = getRankIndex(userRank)
  const requiredIdx = getRankIndex(CLEARANCE_MIN_RANK[required])
  return userIdx >= requiredIdx
}

export function getClearanceLabel(level: ClearanceLevel): string {
  switch (level) {
    case 'all_ranks': return 'All Ranks'
    case 'nco_above': return 'NCO & Above'
    case 'officer_above': return 'Officers Only'
    case 'senior_officer': return 'Senior Officers'
  }
}
