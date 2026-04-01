import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { pdf } from '@react-pdf/renderer'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { DEPARTMENTS, COURSES } from '#/data/elearning'
import { canAccess as checkAccess } from '#/lib/clearance'
import { ClearanceBadge } from '#/components/clearance-badge'
import { ContentLock } from '#/components/content-lock'
import { ContentPDF } from '#/lib/pdf/content-template'
import {
  ChevronRight, FileText, FileSpreadsheet, Presentation, Video,
  Download, Check, Square, ChevronLeft, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/e-learning/$departmentId/$courseId/$contentId')({
  component: ContentViewPage,
})

const formatIcons: Record<string, typeof FileText> = {
  pdf: FileText, doc: FileSpreadsheet, ppt: Presentation, video: Video,
}

const formatLabels: Record<string, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  ppt: 'Presentation',
  video: 'Video',
}

const typeLabels: Record<string, string> = {
  curriculum: 'Curriculum',
  lecture_notes: 'Lecture Notes',
  training_material: 'Training Material',
}

function ContentViewPage() {
  const { departmentId, courseId, contentId } = Route.useParams()
  const { user } = useAuth()
  const { toggleContentCompletion, getProgressForUser } = useData()
  const [downloading, setDownloading] = useState(false)

  if (!user) return null

  const department = DEPARTMENTS.find((d) => d.id === departmentId)
  const course = COURSES.find((c) => c.id === courseId && c.departmentId === departmentId)
  const content = course?.contents.find((c) => c.id === contentId)

  if (!department || !course || !content) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-sm text-gray-500">Content not found</p>
        <Link to="/e-learning" className="text-sm text-army font-semibold hover:text-army-gold mt-2 inline-block">
          Back to E-Learning
        </Link>
      </div>
    )
  }

  const userProgress = getProgressForUser(user.id)
  const courseProgress = userProgress.find((p) => p.courseId === course.id)
  const completedIds = new Set(courseProgress?.completedContentIds ?? [])
  const isCompleted = completedIds.has(content.id)
  const itemAccessible = checkAccess(user.rank, content.clearanceLevel)
  const Icon = formatIcons[content.format] ?? FileText

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await pdf(<ContentPDF content={content} course={course} user={user} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${course.code}-${content.id}-${user.armyNumber.replace(/\//g, '')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded', { description: `Watermarked for ${user.rank} ${user.name}` })
    } catch {
      toast.error('Download failed', { description: 'Please try again' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 flex-wrap">
        <Link to="/e-learning" className="hover:text-army transition-colors">E-Learning</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/e-learning/$departmentId" params={{ departmentId }} className="hover:text-army transition-colors">{department.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/e-learning/$departmentId/$courseId" params={{ departmentId, courseId }} className="hover:text-army transition-colors">{course.code}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-army-dark font-medium truncate max-w-[200px]">{content.title}</span>
      </div>

      {/* Back link */}
      <Link
        to="/e-learning/$departmentId/$courseId"
        params={{ departmentId, courseId }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-army hover:text-army-gold transition-colors mb-4"
      >
        <ChevronLeft className="w-3 h-3" /> Back to {course.code}
      </Link>

      {/* Content header card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-army-dark/5 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-army" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{typeLabels[content.type]}</span>
                <span className="text-[11px] text-gray-200">·</span>
                <span className="text-[11px] text-gray-500">{formatLabels[content.format]}</span>
                <span className="text-[11px] text-gray-200">·</span>
                <span className="text-[11px] text-gray-500">{content.fileSize}</span>
                <span className="text-[11px] text-gray-200">·</span>
                <span className="text-[11px] text-gray-500">{content.pageCount} pages</span>
              </div>
              <h1 className="text-lg font-bold text-army-dark mb-1">{content.title}</h1>
              <p className="text-xs text-gray-500">{content.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <ClearanceBadge level={content.clearanceLevel} />
                <span className="text-[11px] text-gray-300">Uploaded by {content.uploadedBy} · {content.uploadDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        {itemAccessible && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => toggleContentCompletion(user.id, course.id, content.id)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-army transition-colors"
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-army" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {isCompleted ? 'Completed' : 'Mark as complete'}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-army-dark text-white hover:bg-army transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Content body */}
      {itemAccessible ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8">
          {/* Content classification banner */}
          {content.clearanceLevel !== 'all_ranks' && (
            <div className="flex items-center justify-center mb-6">
              <div className="px-4 py-1.5 border border-red-200 rounded-md bg-red-50">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  {content.clearanceLevel === 'senior_officer' ? 'Restricted' :
                   content.clearanceLevel === 'officer_above' ? 'Restricted — Officers Only' :
                   'Restricted — NCO and Above'}
                </p>
              </div>
            </div>
          )}

          {/* Rendered content */}
          <div className="max-w-none">
            {content.summary.split('\n').map((line, i) => {
              const trimmed = line.trim()
              if (trimmed === '') return <div key={i} className="h-4" />

              // Major headings (all caps)
              if (/^[A-Z][A-Z\s&:—\-()]+$/.test(trimmed)) {
                return (
                  <h2 key={i} className="text-base font-bold text-army-dark mt-6 mb-3 pb-2 border-b border-gray-100">
                    {trimmed}
                  </h2>
                )
              }

              // Numbered headings (e.g., "1. INTRODUCTION", "1.1 Overview")
              if (/^\d+\./.test(trimmed)) {
                const isSubsection = /^\d+\.\d+/.test(trimmed)
                if (isSubsection) {
                  return (
                    <h4 key={i} className="text-sm font-semibold text-army-dark mt-4 mb-2">
                      {trimmed}
                    </h4>
                  )
                }
                return (
                  <h3 key={i} className="text-sm font-bold text-army-dark mt-5 mb-2">
                    {trimmed}
                  </h3>
                )
              }

              // List items
              if (trimmed.startsWith('-')) {
                return (
                  <div key={i} className="flex items-start gap-2 pl-4 py-0.5">
                    <span className="text-army mt-1.5 text-xs">-</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{trimmed.slice(1).trim()}</p>
                  </div>
                )
              }

              // Checkbox items
              if (trimmed.startsWith('[ ]') || trimmed.startsWith('[')) {
                return (
                  <div key={i} className="flex items-start gap-2 pl-4 py-0.5">
                    <span className="text-gray-500 text-xs mt-0.5">☐</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{trimmed.replace(/^\[[ x]?\]\s*/, '')}</p>
                  </div>
                )
              }

              // Week headers (e.g., "Week 1-2: ...")
              if (/^Week\s+\d/i.test(trimmed)) {
                return (
                  <div key={i} className="flex items-start gap-3 py-2 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-army-gold mt-2 shrink-0" />
                    <p className="text-sm text-army-dark font-medium">{trimmed}</p>
                  </div>
                )
              }

              // Step items
              if (/^Step\s+\d/i.test(trimmed)) {
                return (
                  <div key={i} className="flex items-start gap-3 py-1.5 pl-2">
                    <div className="w-5 h-5 rounded-full bg-army-dark/5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-army">{trimmed.match(/\d+/)?.[0]}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{trimmed.replace(/^Step\s+\d+:\s*/i, '')}</p>
                  </div>
                )
              }

              // Regular paragraph
              return (
                <p key={i} className="text-sm text-gray-600 leading-relaxed mb-2">
                  {trimmed}
                </p>
              )
            })}
          </div>

          {/* Watermark notice */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-300">
              NASFA E-Learning Platform · {course.code}: {course.title}
            </p>
            <p className="text-[11px] text-gray-300">
              Downloaded PDFs are watermarked with your identity
            </p>
          </div>
        </div>
      ) : (
        <ContentLock requiredLevel={content.clearanceLevel}>
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="space-y-4">
              {[95, 72, 88, 60, 82, 45, 90, 68, 75, 55, 85, 62].map((w, i) => (
                <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </ContentLock>
      )}
    </div>
  )
}
