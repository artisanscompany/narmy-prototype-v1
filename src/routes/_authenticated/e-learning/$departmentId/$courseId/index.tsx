import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess as checkAccess } from '#/lib/clearance'
import { ClearanceBadge } from '#/components/clearance-badge'
import { ContentLock } from '#/components/content-lock'
import {
  ArrowLeft, Star, FileText, FileSpreadsheet, Presentation, Video,
  Check, Square, ArrowUpRight, CheckCircle2, ChevronDown, Lock,
} from 'lucide-react'
import type { CourseContent, ContentType } from '#/types/elearning'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/$courseId/')({
  component: CourseDetail,
})

const formatIcons: Record<string, typeof FileText> = {
  pdf: FileText, doc: FileSpreadsheet, ppt: Presentation, video: Video,
}

const tabLabels: Record<ContentType, string> = {
  curriculum: 'Curriculum',
  lecture_notes: 'Lecture Notes',
  training_material: 'Training Materials',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CourseDetail() {
  const { departmentId, courseId } = Route.useParams()
  const { user } = useAuth()
  const { toggleContentCompletion, toggleBookmark, getProgressForUser } = useData()
  const [activeTab, setActiveTab] = useState<ContentType | null>(null)
  const [showObjectives, setShowObjectives] = useState(false)

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  const course = COURSES.find((c) => c.id === courseId && c.departmentId === departmentId)

  if (!department || !course) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm text-gray-500 mb-3">Course not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold transition-colors">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const userProgress = getProgressForUser(user.id)
  const courseProgress = userProgress.find((p) => p.courseId === course.id)
  const courseAccessible = checkAccess(user.rank, course.clearanceLevel)
  const isBookmarked = courseProgress?.bookmarked ?? false
  const completedIds = new Set(courseProgress?.completedContentIds ?? [])
  const totalContent = course.contents.length
  const completedCount = course.contents.filter((c) => completedIds.has(c.id)).length
  const isComplete = completedCount === totalContent && totalContent > 0
  const pct = Math.round((completedCount / Math.max(totalContent, 1)) * 100)

  const contentByType = course.contents.reduce<Record<ContentType, CourseContent[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<ContentType, CourseContent[]>)

  const availableTabs = (['curriculum', 'lecture_notes', 'training_material'] as ContentType[]).filter(
    (type) => contentByType[type]?.length > 0,
  )

  const currentTab = activeTab ?? availableTabs[0] ?? 'curriculum'
  const currentItems = contentByType[currentTab] ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <Link
        to="/e-learning/$departmentId"
        params={{ departmentId }}
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {department.name}
      </Link>

      {/* Course Header — compact */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-300">{course.code}</span>
            <ClearanceBadge level={course.clearanceLevel} />
          </div>
          <button
            onClick={() => toggleBookmark(user.id, course.id)}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300'}`} />
          </button>
        </div>
        <h1 className="text-lg font-bold text-army-dark mb-1">{course.title}</h1>
        <p className="text-sm text-gray-500 mb-3">{course.description}</p>

        {/* Collapsible objectives */}
        <button
          onClick={() => setShowObjectives(!showObjectives)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${showObjectives ? 'rotate-180' : ''}`} />
          {course.objectives.length} objectives · {course.assessmentCriteria.split(',').length} assessments
        </button>
        {showObjectives && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Objectives</p>
            <ul className="space-y-1.5 mb-3">
              {course.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check className="w-3 h-3 text-army mt-0.5 shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assessment</p>
            <p className="text-xs text-gray-500">{course.assessmentCriteria}</p>
          </div>
        )}
      </div>

      {/* Content Section */}
      {courseAccessible ? (
        <>
          {/* Progress — combined with completion state */}
          <div className={`rounded-xl border px-5 py-3.5 ${isComplete ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isComplete && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                <span className={`text-sm font-semibold ${isComplete ? 'text-green-800' : 'text-army-dark'}`}>
                  {isComplete ? 'Course Complete' : `${completedCount} of ${totalContent} completed`}
                </span>
              </div>
              <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-army'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Tab pills */}
          {availableTabs.length > 1 && (
            <div className="flex gap-1.5">
              {availableTabs.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentTab === type ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tabLabels[type]} ({contentByType[type]?.length ?? 0})
                </button>
              ))}
            </div>
          )}

          {/* Content items — single container */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {currentItems.map((item, i) => {
              const itemAccessible = checkAccess(user.rank, item.clearanceLevel)
              const isCompleted = completedIds.has(item.id)
              const Icon = formatIcons[item.format] ?? FileText

              if (!itemAccessible) {
                return (
                  <div key={item.id} className={`flex items-center gap-4 px-5 py-4 opacity-40 ${i < currentItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate">{item.title}</p>
                      <p className="text-xs text-gray-300 mt-0.5">Requires {item.clearanceLevel === 'officer_above' ? 'Officers Only' : 'Senior Officers'} clearance</p>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.id}
                  to="/e-learning/$departmentId/$courseId/$contentId"
                  params={{ departmentId, courseId, contentId: item.id }}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group ${i < currentItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-army" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-army-dark group-hover:text-army truncate transition-colors">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.uploadedBy} · {formatDate(item.uploadDate)} · {item.fileSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleContentCompletion(user.id, course.id, item.id) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-army" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-gray-200 group-hover:text-army-gold transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : (
        <ContentLock requiredLevel={course.clearanceLevel}>
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                    <div className="h-2 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentLock>
      )}
    </div>
  )
}
