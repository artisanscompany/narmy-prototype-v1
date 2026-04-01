import { Link } from '@tanstack/react-router'
import { Lock, Star, ChevronRight } from 'lucide-react'
import type { Course, CourseProgress } from '#/types/elearning'
import { ClearanceBadge } from '#/components/clearance-badge'

interface CourseCardProps {
  course: Course
  departmentName: string
  canAccess: boolean
  progress?: CourseProgress
  onToggleBookmark?: () => void
  showDepartment?: boolean
}

export function CourseCard({ course, departmentName, canAccess, progress, onToggleBookmark, showDepartment = false }: CourseCardProps) {
  const totalContent = course.contents.length
  const completedCount = progress?.completedContentIds.length ?? 0
  const progressPct = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0
  const isBookmarked = progress?.bookmarked ?? false

  const card = (
    <div className={`bg-white rounded-xl border border-gray-100 transition-all ${canAccess ? 'hover:border-army-gold/30 hover:shadow-sm group' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-300">{course.code}</span>
            <ClearanceBadge level={course.clearanceLevel} />
          </div>
          <div className="flex items-center gap-1.5">
            {!canAccess && <Lock className="w-3.5 h-3.5 text-gray-300" />}
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark() }}
                className="p-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300 hover:text-gray-400'}`} />
              </button>
            )}
          </div>
        </div>
        <h3 className={`text-sm font-bold mb-1 ${canAccess ? 'text-army-dark group-hover:text-army' : 'text-gray-400'} transition-colors`}>
          {course.title}
        </h3>
        {showDepartment && (
          <p className="text-[11px] text-gray-300 mb-1.5">{departmentName}</p>
        )}
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-300">{totalContent} materials</span>
          {canAccess && completedCount > 0 && (
            <span className="text-[11px] font-semibold text-army">{progressPct}% complete</span>
          )}
        </div>

        {canAccess && completedCount > 0 && (
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-army rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {canAccess && (
        <div className="border-t border-gray-50 px-5 py-2 flex items-center justify-end">
          <span className="flex items-center gap-1 text-army-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View course <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  )

  if (!canAccess) return card

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={'/e-learning/$departmentId/$courseId' as any} params={{ departmentId: course.departmentId, courseId: course.id } as any}>
      {card}
    </Link>
  )
}
