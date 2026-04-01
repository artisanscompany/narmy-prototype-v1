import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import { CourseCard } from '#/components/course-card'
import {
  GraduationCap, Search, X, Calculator, Monitor, Shield, ClipboardList,
  FolderArchive, Laptop, ChevronRight, Settings,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/e-learning/')({
  component: ELearningCatalog,
})

const iconMap: Record<string, typeof Calculator> = {
  Calculator, Monitor, Shield, ClipboardList, FolderArchive, Laptop,
}

function ELearningCatalog() {
  const { user, hasRole } = useAuth()
  const { toggleBookmark, getProgressForUser } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  if (!user) return null

  const userProgress = getProgressForUser(user.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')

  // Trade-scoped departments
  const relevantDepts = DEPARTMENTS.filter((d) => d.trades.includes(user.trade))
  const relevantCourseIds = new Set(
    COURSES.filter((c) => relevantDepts.some((d) => d.id === c.departmentId)).map((c) => c.id),
  )
  const yourCourses = COURSES.filter((c) => relevantCourseIds.has(c.id))

  // Bookmarked courses
  const bookmarkedIds = new Set(userProgress.filter((p) => p.bookmarked).map((p) => p.courseId))
  const bookmarkedCourses = COURSES.filter((c) => bookmarkedIds.has(c.id))

  // Search
  const query = searchQuery.trim().toLowerCase()
  const isSearching = query.length > 0

  const searchResults = isSearching
    ? COURSES.filter((c) => {
        const dept = DEPARTMENTS.find((d) => d.id === c.departmentId)
        return (
          c.title.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          dept?.name.toLowerCase().includes(query) ||
          c.contents.some((ct) => ct.title.toLowerCase().includes(query))
        )
      })
    : []

  // Group search results by department
  const groupedResults = searchResults.reduce<Record<string, typeof searchResults>>((acc, course) => {
    const deptId = course.departmentId
    if (!acc[deptId]) acc[deptId] = []
    acc[deptId].push(course)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin banner */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-army-gold/10 border border-army-gold/20 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-xs text-army-dark font-medium">
            Administrator View — You can manage content and restrictions
          </p>
          <button
            onClick={() => toast('Content management coming in Phase 2')}
            className="text-xs font-semibold text-army-gold hover:text-army-dark transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" /> Manage Content
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-army-dark flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-army-gold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-army-dark">NASFA E-Learning Centre</h1>
            <p className="text-xs text-gray-400">Nigerian Army School of Finance & Administration — Training & Development Platform</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search departments, courses, or materials..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-army-gold/50 focus:ring-2 focus:ring-army-gold/10 transition-all"
        />
        {isSearching && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isSearching ? (
        /* Search Results */
        <div>
          <p className="text-xs text-gray-400 mb-4">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
              <p className="text-sm text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-xs text-gray-300 mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResults).map(([deptId, courses]) => {
                const dept = DEPARTMENTS.find((d) => d.id === deptId)
                if (!dept) return null
                return (
                  <div key={deptId}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{dept.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {courses.map((course) => {
                        const accessible = canAccess(user.rank, course.clearanceLevel)
                        const progress = userProgress.find((p) => p.courseId === course.id)
                        return (
                          <CourseCard
                            key={course.id}
                            course={course}
                            departmentName={dept.name}
                            canAccess={accessible}
                            progress={progress}
                            onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                            showDepartment
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Normal View */
        <>
          {/* Your Courses */}
          {yourCourses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-army-dark mb-3">Your Courses</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {yourCourses.map((course) => {
                  const accessible = canAccess(user.rank, course.clearanceLevel)
                  const progress = userProgress.find((p) => p.courseId === course.id)
                  const dept = DEPARTMENTS.find((d) => d.id === course.departmentId)
                  return (
                    <div key={course.id} className="min-w-[260px] max-w-[280px] shrink-0">
                      <CourseCard
                        course={course}
                        departmentName={dept?.name ?? ''}
                        canAccess={accessible}
                        progress={progress}
                        onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                        showDepartment
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bookmarked */}
          {bookmarkedCourses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-army-dark mb-3">Bookmarked</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkedCourses.map((course) => {
                  const accessible = canAccess(user.rank, course.clearanceLevel)
                  const progress = userProgress.find((p) => p.courseId === course.id)
                  const dept = DEPARTMENTS.find((d) => d.id === course.departmentId)
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      departmentName={dept?.name ?? ''}
                      canAccess={accessible}
                      progress={progress}
                      onToggleBookmark={() => toggleBookmark(user.id, course.id)}
                      showDepartment
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* All Departments */}
          <div>
            <h2 className="text-sm font-bold text-army-dark mb-3">All Departments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEPARTMENTS.map((dept) => {
                const DeptIcon = iconMap[dept.icon] ?? GraduationCap
                const isRelevant = relevantDepts.some((d) => d.id === dept.id)
                return (
                  <Link
                    key={dept.id}
                    to="/e-learning/$departmentId"
                    params={{ departmentId: dept.id }}
                  >
                    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-army-gold/30 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-army-dark/5 flex items-center justify-center">
                          <DeptIcon className="w-4.5 h-4.5 text-army" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isRelevant && (
                            <span className="text-[10px] font-semibold text-army bg-army/10 px-1.5 py-0.5 rounded-full">Your trade</span>
                          )}
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            dept.category === 'core' ? 'text-army-dark bg-army-dark/5' : 'text-gray-500 bg-gray-50'
                          }`}>
                            {dept.category === 'core' ? 'Core' : 'Supporting'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-army-dark group-hover:text-army transition-colors mb-1">{dept.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{dept.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-300">{dept.courseCount} courses</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-army-gold transition-colors" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
