import { createFileRoute } from '@tanstack/react-router'
import { ComplaintForm } from '#/components/complaint-form'

export const Route = createFileRoute('/_authenticated/_personnel/complaints/new')({
  component: NewComplaintPage,
})

function NewComplaintPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-army-dark">Raise a Complaint</h1>
        <p className="text-gray-500 text-sm mt-1">Follow the steps below to submit your complaint</p>
      </div>
      <ComplaintForm />
    </div>
  )
}
