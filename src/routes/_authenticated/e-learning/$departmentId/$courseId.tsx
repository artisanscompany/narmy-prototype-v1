import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess as checkAccess } from '#/lib/clearance'
import { ClearanceBadge } from '#/components/clearance-badge'
import { ContentLock } from '#/components/content-lock'
import { ContentViewer } from '#/components/content-viewer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import {
  ChevronRight, Star, FileText, FileSpreadsheet, Presentation, Video,
  Check, Square, Eye, Upload, Pencil, ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
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
  const { user, hasRole } = useAuth()
  const { toggleContentCompletion, toggleBookmark, getProgressForUser } = useData()
  const [viewerContent, setViewerContent] = useState<CourseContent | null>(null)

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  const course = COURSES.find((c) => c.id === courseId && c.departmentId === departmentId)

  if (!department || !course) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-sm text-gray-400">Course not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold mt-2 inline-block">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const userProgress = getProgressForUser(user.id)
  const courseProgress = userProgress.find((p) => p.courseId === course.id)
  const isAdmin = hasRole('divisionAdmin', 'superAdmin')
  const isSuperAdmin = hasRole('superAdmin')
  const courseAccessible = checkAccess(user.rank, course.clearanceLevel)
  const isBookmarked = courseProgress?.bookmarked ?? false
  const completedIds = new Set(courseProgress?.completedContentIds ?? [])
  const totalContent = course.contents.length
  const completedCount = course.contents.filter((c) => completedIds.has(c.id)).length

  // Group contents by type
  const contentByType = course.contents.reduce<Record<ContentType, CourseContent[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<ContentType, CourseContent[]>)

  const availableTabs = (['curriculum', 'lecture_notes', 'training_material'] as ContentType[]).filter(
    (type) => contentByType[type]?.length > 0,
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
        <Link to="/e-learning" className="hover:text-army transition-colors">E-Learning</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/e-learning/$departmentId" params={{ departmentId }} className="hover:text-army transition-colors">{department.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-army-dark font-medium">{course.code}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-gray-300">{course.code}</span>
              <ClearanceBadge level={course.clearanceLevel} />
            </div>
            <h1 className="text-xl font-bold text-army-dark">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleBookmark(user.id, course.id)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-army-gold text-army-gold' : 'text-gray-300'}`} />
            </button>
            {isAdmin && (
              <button
                onClick={() => toast('Course editing coming in Phase 2')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-army/20 rounded-lg hover:bg-army/5 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit Course
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => toast('Restriction management coming in Phase 2')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <ShieldAlert className="w-3 h-3" /> Manage Restrictions
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{course.description}</p>

        {/* Objectives */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-army-dark uppercase tracking-wider mb-2">Objectives</h3>
          <ul className="space-y-1">
            {course.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-army mt-0.5">-</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Assessment */}
        <div>
          <h3 className="text-xs font-semibold text-army-dark uppercase tracking-wider mb-1">Assessment</h3>
          <p className="text-xs text-gray-400">{course.assessmentCriteria}</p>
        </div>
      </div>

      {/* Content Section */}
      {courseAccessible ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-army-dark">{completedCount} of {totalContent} completed</span>
              {completedCount === totalContent && totalContent > 0 && (
                <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Complete</span>
              )}
            </div>
            <span className="text-xs text-gray-300">{Math.round((completedCount / Math.max(totalContent, 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-army rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / Math.max(totalContent, 1)) * 100}%` }}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue={availableTabs[0] ?? 'curriculum'}>
            <TabsList variant="line" className="mb-4">
              {availableTabs.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {tabLabels[type]} ({contentByType[type].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {availableTabs.map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-2">
                  {isAdmin && (
                    <button
                      onClick={() => toast('Upload functionality coming in Phase 2')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-army border border-dashed border-army/20 rounded-lg hover:bg-army/5 transition-colors w-full justify-center mb-2"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload {tabLabels[type]}
                    </button>
                  )}
                  {contentByType[type].map((item) => {
                    const itemAccessible = checkAccess(user.rank, item.clearanceLevel)
                    const isCompleted = completedIds.has(item.id)
                    const Icon = formatIcons[item.format] ?? FileText

                    if (!itemAccessible) {
                      return (
                        <ContentLock key={item.id} requiredLevel={item.clearanceLevel} compact>
                          <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-gray-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-400 truncate">{item.title}</p>
                                <p className="text-xs text-gray-300">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </ContentLock>
                      )
                    }

                    return (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-army" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-army-dark truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-300">{item.uploadedBy}</span>
                              <span className="text-[11px] text-gray-200">·</span>
                              <span className="text-[11px] text-gray-300">{item.uploadDate}</span>
                              <span className="text-[11px] text-gray-200">·</span>
                              <span className="text-[11px] text-gray-300">{item.fileSize}</span>
                              {item.clearanceLevel !== 'all_ranks' && (
                                <>
                                  <span className="text-[11px] text-gray-200">·</span>
                                  <ClearanceBadge level={item.clearanceLevel} />
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleContentCompletion(user.id, course.id, item.id)}
                              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 text-army" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => setViewerContent(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-army bg-army/5 rounded-lg hover:bg-army/10 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        /* Locked Course Content */
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

      {/* Content Viewer */}
      <ContentViewer
        content={viewerContent}
        isOpen={viewerContent !== null}
        onClose={() => setViewerContent(null)}
        canAccess={viewerContent ? checkAccess(user.rank, viewerContent.clearanceLevel) : false}
        isCompleted={viewerContent ? completedIds.has(viewerContent.id) : false}
        onToggleComplete={() => {
          if (viewerContent) toggleContentCompletion(user.id, course.id, viewerContent.id)
        }}
      />
    </div>
  )
}
