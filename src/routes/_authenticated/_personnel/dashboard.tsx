import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_personnel/dashboard')({
  component: PersonnelDashboard,
})

function PersonnelDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-army-dark">Personnel Dashboard</h1>
      <p className="text-gray-500 mt-2">Dashboard content will be built in Task 8.</p>
    </div>
  )
}
