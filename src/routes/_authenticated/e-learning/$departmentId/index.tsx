import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess } from '#/lib/clearance'
import { CourseCard } from '#/components/course-card'
import {
  GraduationCap, ChevronRight, Calculator, Monitor, Shield, ClipboardList,
  FolderArchive, Laptop, Plus,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/')({
  component: DepartmentCourses,
})

const iconMap: Record<string, typeof Calculator> = {
  Calculator, Monitor, Shield, ClipboardList, FolderArchive, Laptop,
}

function DepartmentCourses() {
  const { departmentId } = Route.useParams()
  const { user, hasRole } = useAuth()
  const { toggleBookmark, getProgressForUser } = useData()

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  if (!department) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-sm text-gray-400">Department not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold mt-2 inline-block">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const courses = COURSES.filter((c) => c.departmentId === departmentId)
  const userProgress = getProgressForUser(user.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')
  const DeptIcon = iconMap[department.icon] ?? GraduationCap

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link to="/e-learning" className="hover:text-army transition-colors">E-Learning</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-army-dark font-medium">{department.name}</span>
      </div>

      {/* Department Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-army-dark/5 flex items-center justify-center shrink-0">
            <DeptIcon className="w-5 h-5 text-army" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-army-dark">{department.name}</h1>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                department.category === 'core' ? 'text-army-dark bg-army-dark/5' : 'text-gray-500 bg-gray-50'
              }`}>
                {department.category === 'core' ? 'Core Academic' : 'Supporting'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{department.description}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => toast('Course creation coming in Phase 2')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-army/20 rounded-lg hover:bg-army/5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        )}
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {courses.map((course) => {
          const accessible = canAccess(user.rank, course.clearanceLevel)
          const progress = userProgress.find((p) => p.courseId === course.id)
          return (
            <CourseCard
              key={course.id}
              course={course}
              departmentName={department.name}
              canAccess={accessible}
              progress={progress}
              onToggleBookmark={() => toggleBookmark(user.id, course.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
