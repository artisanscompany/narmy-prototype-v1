import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-army-dark">Admin Dashboard</h1>
      <p className="text-gray-500 mt-2">Admin dashboard content will be built in Task 12.</p>
    </div>
  )
}
