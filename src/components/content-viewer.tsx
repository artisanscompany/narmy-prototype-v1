import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '#/components/ui/sheet'
import { ContentLock } from '#/components/content-lock'
import { ClearanceBadge } from '#/components/clearance-badge'
import { FileText, FileSpreadsheet, Presentation, Video, Download, Check, Square } from 'lucide-react'
import type { CourseContent } from '#/types/elearning'

const formatIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileSpreadsheet,
  ppt: Presentation,
  video: Video,
}

const formatLabels: Record<string, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  ppt: 'Presentation',
  video: 'Video',
}

interface ContentViewerProps {
  content: CourseContent | null
  isOpen: boolean
  onClose: () => void
  canAccess: boolean
  isCompleted: boolean
  onToggleComplete: () => void
}

export function ContentViewer({ content, isOpen, onClose, canAccess, isCompleted, onToggleComplete }: ContentViewerProps) {
  if (!content) return null

  const Icon = formatIcons[content.format] ?? FileText

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-army-dark/5 flex items-center justify-center">
              <Icon className="w-4 h-4 text-army" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium">{formatLabels[content.format]}</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">{content.fileSize}</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">{content.pageCount} pages</span>
            </div>
          </div>
          <SheetTitle className="text-base font-bold text-army-dark">{content.title}</SheetTitle>
          <SheetDescription className="text-xs text-gray-400">
            {content.description}
          </SheetDescription>
          <div className="flex items-center gap-2 mt-2">
            <ClearanceBadge level={content.clearanceLevel} />
            <span className="text-[11px] text-gray-300">Uploaded by {content.uploadedBy} · {content.uploadDate}</span>
          </div>
        </SheetHeader>

        <div className="flex-1 p-4">
          {canAccess ? (
            <div className="bg-gray-50 rounded-lg p-5 min-h-[300px]">
              <div className="prose prose-sm max-w-none">
                {content.summary.split('\n').map((line, i) => {
                  if (line.trim() === '') return <div key={i} className="h-3" />
                  if (/^\d+\./.test(line.trim()) || /^[A-Z][A-Z\s&:—-]+$/.test(line.trim())) {
                    return <p key={i} className="text-sm font-bold text-army-dark mt-3 mb-1">{line}</p>
                  }
                  if (line.trim().startsWith('-') || line.trim().startsWith('[ ]') || line.trim().startsWith('[')) {
                    return <p key={i} className="text-xs text-gray-500 pl-4 py-0.5">{line}</p>
                  }
                  return <p key={i} className="text-xs text-gray-600 leading-relaxed">{line}</p>
                })}
              </div>
            </div>
          ) : (
            <ContentLock requiredLevel={content.clearanceLevel}>
              <div className="bg-gray-50 rounded-lg p-5 min-h-[300px]">
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
              </div>
            </ContentLock>
          )}
        </div>

        <SheetFooter className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between w-full">
            {canAccess && (
              <button
                onClick={onToggleComplete}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-army transition-colors"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-army" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {isCompleted ? 'Completed' : 'Mark as complete'}
              </button>
            )}
            <button
              onClick={() => {
                if (canAccess) {
                  toast.success('Download started', { description: `${content.title} (${content.fileSize})` })
                }
              }}
              disabled={!canAccess}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                canAccess
                  ? 'bg-army-dark text-white hover:bg-army'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
