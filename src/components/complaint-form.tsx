import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { COMPLAINT_CATEGORIES } from '#/data/categories'
import { Textarea } from '#/components/ui/textarea'
import { Wallet, FileText, MapPin, Shield, HelpCircle, ChevronRight, Check, ArrowLeft, Paperclip, X, FileImage, File } from 'lucide-react'
import type { Complaint, Attachment } from '#/types/complaint'

const categoryMeta: Record<string, { icon: typeof Wallet; helper: string }> = {
  'pay-allowances': { icon: Wallet, helper: 'Salary discrepancies, missing allowances, overpayments' },
  'service-records': { icon: FileText, helper: 'Incorrect records, documentation requests' },
  'postings-transfers': { icon: MapPin, helper: 'Transfer orders, posting disputes' },
  'status-issues': { icon: Shield, helper: 'AWOL disputes, service status corrections' },
  'other': { icon: HelpCircle, helper: 'General inquiries and other concerns' },
}

const steps = ['Category', 'Type', 'Details', 'Review']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ComplaintForm() {
  const { user } = useAuth()
  const { addComplaint } = useData()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)

  if (!user) return null

  const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === categoryId)

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = () => {
    const ticketNum = String(Math.floor(Math.random() * 9000) + 1000)
    const now = new Date().toISOString()
    const complaint: Complaint = {
      id: `TKT-2026-${ticketNum}`,
      userId: user.id,
      userName: user.name,
      userArmyNumber: user.armyNumber,
      userDivision: user.division,
      category: selectedCategory?.label ?? '',
      subcategory: selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.label ?? '',
      description,
      status: 'submitted',
      priority: 'medium',
      filedDate: now,
      lastUpdated: now,
      slaDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: now,
          type: 'submission',
          description: `Complaint submitted via Personnel Portal.${attachments.length > 0 ? ` ${attachments.length} file${attachments.length > 1 ? 's' : ''} attached.` : ''}`,
          actor: user.name,
        },
      ],
      attachments: attachments.length > 0 ? attachments.map(a => ({ ...a, source: 'submission' as const, uploadedAt: now })) : undefined,
    }
    addComplaint(complaint)
    navigate({ to: '/complaints/$complaintId', params: { complaintId: complaint.id } })
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((label, i) => {
          const s = i + 1
          const isActive = step === s
          const isDone = step > s
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone ? 'bg-army text-white' : isActive ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-army-dark' : isDone ? 'text-army' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {s < 4 && <div className={`flex-1 h-px mx-3 ${isDone ? 'bg-army' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold text-army-dark mb-1">What is this about?</h2>
          <p className="text-sm text-gray-500 mb-5">Select the category that best describes your issue</p>
          <div className="space-y-2">
            {COMPLAINT_CATEGORIES.map((cat) => {
              const meta = categoryMeta[cat.id]
              const Icon = meta?.icon ?? HelpCircle
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setStep(2) }}
                  className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:border-army-gold/30 hover:shadow-sm transition-all flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-army/5 transition-colors">
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-army transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-army-dark block">{cat.label}</span>
                    {meta?.helper && <span className="text-xs text-gray-500 block mt-0.5">{meta.helper}</span>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Subcategory */}
      {step === 2 && selectedCategory && (
        <div>
          <h2 className="text-lg font-bold text-army-dark mb-1">What specifically?</h2>
          <p className="text-sm text-gray-500 mb-5">{selectedCategory.label} — select the issue type</p>
          <div className="space-y-2 mb-4">
            {selectedCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSubcategoryId(sub.id); setStep(3) }}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:border-army-gold/30 hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-medium text-army-dark">{sub.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors shrink-0" />
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      )}

      {/* Step 3: Description + Attachments */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-bold text-army-dark mb-1">Describe the issue</h2>
          <p className="text-sm text-gray-500 mb-5">Include dates, reference numbers, and any supporting details</p>

          <Textarea
            placeholder="e.g. My February 2026 payslip is missing the Special Forces Allowance (₦42,000). This has been paid consistently since June 2023..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="resize-none rounded-xl border-gray-200 focus:ring-army/15 focus:border-army/30 mb-4"
          />

          {/* File Upload */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>

            {/* Uploaded files */}
            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5">
                    {isImage(att.type) ? (
                      <img src={att.dataUrl} alt={att.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-army-dark truncate">{att.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                    </div>
                    <button onClick={() => removeAttachment(att.id)} className="text-gray-500 hover:text-red-500 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center transition-all group ${
                isDragging ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army/30 hover:bg-army/2'
              }`}
            >
              <Paperclip className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isDragging ? 'text-army' : 'text-gray-300 group-hover:text-army'}`} />
              <p className={`text-sm transition-colors ${isDragging ? 'text-army-dark' : 'text-gray-500 group-hover:text-army-dark'}`}>
                {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">PDF or images, max 5MB each</p>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!description.trim()}
              className="px-5 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-bold text-army-dark mb-1">Review & Submit</h2>
          <p className="text-sm text-gray-500 mb-5">Confirm the details below before submitting</p>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 mb-5">
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Category</span>
              <span className="text-sm font-semibold text-army-dark">{selectedCategory?.label}</span>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Issue</span>
              <span className="text-sm font-semibold text-army-dark">{selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.label}</span>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Priority</span>
              <span className="text-sm font-semibold text-gray-600">Medium (auto-assigned)</span>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">SLA</span>
              <span className="text-sm font-semibold text-gray-600">14 days</span>
            </div>
            <div className="px-5 py-3.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Description</span>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
            {attachments.length > 0 && (
              <div className="px-5 py-3.5">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-2">Attachments ({attachments.length})</span>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                      {isImage(att.type) ? (
                        <FileImage className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <File className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className="text-xs text-army-dark font-medium">{att.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(att.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-army transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors"
            >
              Submit Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
