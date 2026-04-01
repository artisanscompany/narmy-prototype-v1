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
  Check, Square, ArrowUpRight, CheckCircle2,
} from 'lucide-react'
import type { CourseContent, ContentType } from '#/types/elearning'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/$courseId')({
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

function CourseDetail() {
  const { departmentId, courseId } = Route.useParams()
  const { user } = useAuth()
  const { toggleContentCompletion, toggleBookmark, getProgressForUser } = useData()
  const [activeTab, setActiveTab] = useState<ContentType | null>(null)

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  const course = COURSES.find((c) => c.id === courseId && c.departmentId === departmentId)

  if (!department || !course) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm text-gray-400 mb-3">Course not found</p>
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

  // Group contents by type
  const contentByType = course.contents.reduce<Record<ContentType, CourseContent[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<ContentType, CourseContent[]>)

  const availableTabs = (['curriculum', 'lecture_notes', 'training_material'] as ContentType[]).filter(
    (type) => contentByType[type]?.length > 0,
  )

  const currentTab = activeTab ?? availableTabs[0] ?? 'curriculum'

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Back */}
      <Link
        to="/e-learning/$departmentId"
        params={{ departmentId }}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-army transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {department.name}
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4 mb-3">
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
        <p className="text-sm text-gray-500 mb-4">{course.description}</p>

        {/* Objectives */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objectives</p>
          <ul className="space-y-1.5">
            {course.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <Check className="w-3 h-3 text-army mt-0.5 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Assessment */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assessment</p>
          <p className="text-xs text-gray-400">{course.assessmentCriteria}</p>
        </div>
      </div>

      {/* Content Section */}
      {courseAccessible ? (
        <>
          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-army-dark">{completedCount} of {totalContent}</span>
                {isComplete && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Complete
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{Math.round((completedCount / Math.max(totalContent, 1)) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-army rounded-full transition-all duration-300" style={{ width: `${(completedCount / Math.max(totalContent, 1)) * 100}%` }} />
            </div>
          </div>

          {/* Course completion congratulations */}
          {isComplete && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3.5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Course Complete</p>
                <p className="text-xs text-green-600">You have completed all {totalContent} materials in this course.</p>
              </div>
            </div>
          )}

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

          {/* Content items */}
          <div className="space-y-2">
            {(contentByType[currentTab] ?? []).map((item) => {
              const itemAccessible = checkAccess(user.rank, item.clearanceLevel)
              const isCompleted = completedIds.has(item.id)
              const Icon = formatIcons[item.format] ?? FileText

              if (!itemAccessible) {
                return (
                  <ContentLock key={item.id} requiredLevel={item.clearanceLevel} compact>
                    <div className="bg-white rounded-xl border border-gray-100 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400 truncate">{item.title}</p>
                      </div>
                    </div>
                  </ContentLock>
                )
              }

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 px-5 py-3.5 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-army" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-army-dark truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.uploadedBy} · {item.uploadDate} · {item.fileSize}
                        {item.clearanceLevel !== 'all_ranks' && <> · <ClearanceBadge level={item.clearanceLevel} /></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleContentCompletion(user.id, course.id, item.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-army" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                      <Link
                        to="/e-learning/$departmentId/$courseId/$contentId"
                        params={{ departmentId, courseId, contentId: item.id }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-army-gold bg-army-gold/8 rounded-lg hover:bg-army-gold/15 transition-colors"
                      >
                        Read <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Locked Course */
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
