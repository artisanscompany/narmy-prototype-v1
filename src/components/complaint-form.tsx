import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { COMPLAINT_CATEGORIES } from '#/data/categories'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Textarea } from '#/components/ui/textarea'
import type { Complaint } from '#/types/complaint'

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
        <div className="flex items-center gap-3 mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-army text-white' : 'bg-gray-100 text-gray-400'}`}>
                {s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-army' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <CardTitle className="text-base">
          {step === 1 && 'Select Category'}
          {step === 2 && 'Select Subcategory'}
          {step === 3 && 'Describe Your Issue'}
          {step === 4 && 'Review & Submit'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-2">
            {COMPLAINT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoryId(cat.id); setStep(2) }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${categoryId === cat.id ? 'border-army bg-army/5' : 'border-gray-200 hover:border-army-mid hover:bg-gray-50'}`}
              >
                <span className="text-sm font-medium text-army-dark">{cat.label}</span>
              </button>
            ))}
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
              📎 File attachment will be available in the production version.
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={() => setStep(4)} disabled={!description.trim()} className="bg-army-dark hover:bg-army">Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
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
