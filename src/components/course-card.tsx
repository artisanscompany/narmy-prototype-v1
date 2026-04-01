import { Link } from '@tanstack/react-router'
import { Lock, Star, ArrowUpRight } from 'lucide-react'
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
  const isComplete = completedCount === totalContent && totalContent > 0

  const card = (
    <div className={`bg-white rounded-xl border border-gray-100 transition-all ${canAccess ? 'hover:border-army-gold/20 hover:shadow-sm group' : 'opacity-60'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-300">{course.code}</span>
            <ClearanceBadge level={course.clearanceLevel} />
          </div>
          <div className="flex items-center gap-1">
            {!canAccess && <Lock className="w-3.5 h-3.5 text-gray-300" />}
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBookmark() }}
                className="p-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300 hover:text-gray-500'}`} />
              </button>
            )}
          </div>
        </div>

        <h3 className={`text-sm font-semibold mb-0.5 ${canAccess ? 'text-army-dark group-hover:text-army' : 'text-gray-500'} transition-colors`}>
          {course.title}
        </h3>
        {showDepartment && (
          <p className="text-[11px] text-gray-300 mb-1">{departmentName}</p>
        )}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-300">{totalContent} materials</span>
          {canAccess && completedCount > 0 && (
            <span className={`text-[11px] font-semibold ${isComplete ? 'text-green-600' : 'text-army'}`}>
              {isComplete ? 'Complete' : `${progressPct}%`}
            </span>
          )}
          {canAccess && completedCount === 0 && (
            <span className="flex items-center gap-1 text-[11px] text-army-gold font-medium">
              View <ArrowUpRight className="w-3 h-3" />
            </span>
          )}
        </div>

        {canAccess && completedCount > 0 && (
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-army'}`} style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>
    </div>
  )

  if (!canAccess) return card

  return (
    <Link to="/e-learning/$departmentId/$courseId" params={{ departmentId: course.departmentId, courseId: course.id }}>
      {card}
    </Link>
  )
}
