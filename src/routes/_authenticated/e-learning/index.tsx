import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import {
  GraduationCap, Search, X, Calculator, Monitor, Shield, ClipboardList,
  FolderArchive, Laptop, ChevronRight, ArrowUpRight,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/e-learning/')({
  component: ELearningCatalog,
})

const iconMap: Record<string, typeof Calculator> = {
  Calculator, Monitor, Shield, ClipboardList, FolderArchive, Laptop,
}

function ELearningCatalog() {
  const { user } = useAuth()
  const { getProgressForUser } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'your-trade'>('all')

  if (!user) return null

  const userProgress = getProgressForUser(user.id)
  const relevantDepts = DEPARTMENTS.filter((d) => d.trades.includes(user.trade))

  const query = searchQuery.trim().toLowerCase()
  const isSearching = query.length > 0

  const visibleDepts = filter === 'your-trade' ? relevantDepts : DEPARTMENTS
  const filteredDepts = isSearching
    ? visibleDepts.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        COURSES.some(c => c.departmentId === d.id && (
          c.title.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query)
        ))
      )
    : visibleDepts

  // Recently accessed course
  const lastAccessed = userProgress
    .filter(p => p.lastAccessedDate && p.completedContentIds.length > 0)
    .sort((a, b) => b.lastAccessedDate.localeCompare(a.lastAccessedDate))
    .slice(0, 1)
    .map(p => {
      const course = COURSES.find(c => c.id === p.courseId)
      if (!course) return null
      const dept = DEPARTMENTS.find(d => d.id === course.departmentId)
      return { course, dept, progress: p }
    })
    .filter(Boolean)[0]

  const yourCourseCount = COURSES.filter(c => relevantDepts.some(d => d.id === c.departmentId)).length
  const totalCompleted = userProgress.reduce((sum, p) => sum + p.completedContentIds.length, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-army-dark">E-Learning</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {yourCourseCount} courses for {user.trade} · {totalCompleted} materials completed
        </p>
      </div>

      {/* Continue learning */}
      {lastAccessed && (() => {
        const pct = Math.round((lastAccessed.progress.completedContentIds.length / Math.max(lastAccessed.course.contents.length, 1)) * 100)
        return (
          <Link
            to="/e-learning/$departmentId/$courseId"
            params={{ departmentId: lastAccessed.course.departmentId, courseId: lastAccessed.course.id }}
            className="block bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-army-gold/20 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-1">Continue learning</p>
                <p className="text-sm font-semibold text-army-dark group-hover:text-army transition-colors truncate">{lastAccessed.course.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{lastAccessed.dept?.name} · {lastAccessed.progress.completedContentIds.length}/{lastAccessed.course.contents.length} materials</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-army rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-500 w-8 text-right">{pct}%</span>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
              </div>
            </div>
          </Link>
        )
      })()}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search departments or courses..."
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        />
        {isSearching && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          All ({DEPARTMENTS.length})
        </button>
        <button
          onClick={() => setFilter('your-trade')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'your-trade' ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          Your trade ({relevantDepts.length})
        </button>
      </div>

      {/* Department list */}
      {filteredDepts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">{isSearching ? `No results for "${searchQuery}"` : 'No departments match this filter'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filteredDepts.map((dept, i) => {
            const DeptIcon = iconMap[dept.icon] ?? GraduationCap
            const isRelevant = relevantDepts.some((d) => d.id === dept.id)
            const deptCourses = COURSES.filter(c => c.departmentId === dept.id)
            const accessibleCount = deptCourses.filter(c => canAccess(user.rank, c.clearanceLevel)).length

            return (
              <Link key={dept.id} to="/e-learning/$departmentId" params={{ departmentId: dept.id }}>
                <div className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group ${i < filteredDepts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-9 h-9 rounded-lg bg-army-dark/5 flex items-center justify-center shrink-0">
                    <DeptIcon className="w-4 h-4 text-army" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-army-dark group-hover:text-army transition-colors truncate">{dept.name}</h3>
                      {isRelevant && (
                        <span className="text-[10px] font-semibold text-army bg-army/10 px-1.5 py-0.5 rounded-full shrink-0">Your trade</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dept.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">{accessibleCount}/{deptCourses.length}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
