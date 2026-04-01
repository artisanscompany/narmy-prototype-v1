import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import { ClearanceBadge } from '#/components/clearance-badge'
import { ArrowLeft, Search, X, Lock, ChevronRight, Star } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/')({
  component: DepartmentCourses,
})

function DepartmentCourses() {
  const { departmentId } = Route.useParams()
  const { user } = useAuth()
  const { toggleBookmark, getProgressForUser } = useData()
  const [search, setSearch] = useState('')

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  if (!department) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm text-gray-500 mb-3">Department not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const courses = COURSES.filter((c) => c.departmentId === departmentId)
  const userProgress = getProgressForUser(user.id)
  const accessibleCount = courses.filter(c => canAccess(user.rank, c.clearanceLevel)).length

  const filtered = search.trim()
    ? courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : courses

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <Link to="/e-learning" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        All departments
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-army-dark">{department.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{accessibleCount} of {courses.length} courses accessible · {department.category === 'core' ? 'Core Academic' : 'Supporting'}</p>
        <p className="text-xs text-gray-500 mt-1">{department.description}</p>
      </div>

      {/* Search */}
      {courses.length > 3 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Course List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No courses match "{search}"</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filtered.map((course, i) => {
            const accessible = canAccess(user.rank, course.clearanceLevel)
            const progress = userProgress.find((p) => p.courseId === course.id)
            const completedCount = progress?.completedContentIds.length ?? 0
            const totalContent = course.contents.length
            const pct = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0
            const isBookmarked = progress?.bookmarked ?? false
            const isComplete = completedCount === totalContent && totalContent > 0

            const row = (
              <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${accessible ? 'hover:bg-gray-50 group' : ''} ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className={`flex-1 min-w-0 ${!accessible ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono text-gray-300">{course.code}</span>
                    <ClearanceBadge level={course.clearanceLevel} />
                    {!accessible && <Lock className="w-3 h-3 text-gray-500" />}
                  </div>
                  <p className={`text-sm font-semibold truncate ${accessible ? 'text-army-dark group-hover:text-army transition-colors' : 'text-gray-500'}`}>
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalContent} materials{completedCount > 0 ? ` · ${completedCount} completed` : ''}
                    {!accessible && ' · Restricted'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {accessible && completedCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-army'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-medium w-8 text-right ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>{pct}%</span>
                    </div>
                  )}
                  {accessible && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(user.id, course.id) }}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300'}`} />
                    </button>
                  )}
                  {accessible && (
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
                  )}
                </div>
              </div>
            )

            if (!accessible) return <div key={course.id}>{row}</div>

            return (
              <Link key={course.id} to="/e-learning/$departmentId/$courseId" params={{ departmentId, courseId: course.id }}>
                {row}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
