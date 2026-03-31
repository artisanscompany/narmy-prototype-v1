import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { COMPLAINT_CATEGORIES } from '#/data/categories'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Textarea } from '#/components/ui/textarea'
import { Wallet, FileText, MapPin, Shield, HelpCircle } from 'lucide-react'
import type { Complaint } from '#/types/complaint'

const categoryMeta: Record<string, { icon: typeof Wallet; helper: string }> = {
  'pay-allowances': { icon: Wallet, helper: 'Salary discrepancies, missing allowances, overpayments' },
  'service-records': { icon: FileText, helper: 'Incorrect records, documentation requests' },
  'postings-transfers': { icon: MapPin, helper: 'Transfer orders, posting disputes' },
  'status-issues': { icon: Shield, helper: 'AWOL disputes, service status corrections' },
  'other': { icon: HelpCircle, helper: 'General inquiries and other concerns' },
}

const stepLabels = ['Category', 'Type', 'Details', 'Review']

export function ComplaintForm() {
  const { user } = useAuth()
  const { addComplaint } = useData()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [description, setDescription] = useState('')

  if (!user) return null

  const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === categoryId)

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
          description: 'Complaint submitted via Personnel Portal.',
          actor: user.name,
        },
      ],
    }
    addComplaint(complaint)
    navigate({ to: '/complaints/$complaintId', params: { complaintId: complaint.id } })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-army text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {s}
                </div>
                <span className={`text-[10px] mt-1 ${step >= s ? 'text-army font-semibold' : 'text-gray-400'}`}>{stepLabels[s - 1]}</span>
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 mx-2 mt-[-12px] ${step > s ? 'bg-army' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <CardTitle className="text-base">
          {step === 1 && 'What is this about?'}
          {step === 2 && 'What specifically?'}
          {step === 3 && 'Provide Details'}
          {step === 4 && 'Confirm & Submit'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-2">
            {COMPLAINT_CATEGORIES.map((cat) => {
              const meta = categoryMeta[cat.id]
              const Icon = meta?.icon ?? HelpCircle
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setStep(2) }}
                  className={`w-full text-left px-4 py-4 rounded-lg border transition-colors flex items-start gap-3 ${categoryId === cat.id ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army-mid hover:bg-gray-50'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-army/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-army" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-army-dark block">{cat.label}</span>
                    {meta?.helper && <span className="text-xs text-gray-400 mt-0.5 block">{meta.helper}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {step === 2 && selectedCategory && (
          <div className="space-y-2">
            {selectedCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSubcategoryId(sub.id); setStep(3) }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${subcategoryId === sub.id ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army-mid hover:bg-gray-50'}`}
              >
                <span className="text-sm font-medium text-army-dark">{sub.label}</span>
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mt-2">← Back</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your issue in detail. Include dates, reference numbers, and any supporting information."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
              Attachments will be supported in the full release.
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={() => setStep(4)} disabled={!description.trim()} className="bg-army-dark hover:bg-army">Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-t-2 border-b-2 border-dashed border-gray-300">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-semibold text-army-dark">{selectedCategory?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subcategory</span>
                <span className="font-semibold text-army-dark">{selectedCategory?.subcategories.find((s) => s.id === subcategoryId)?.label}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 block mb-1">Description</span>
                <p className="text-army-dark">{description}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>← Back</Button>
              <Button onClick={handleSubmit} className="bg-army-dark hover:bg-army">Submit Complaint</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
