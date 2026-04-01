import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetail,
})

function AdminUserDetail() {
  const { userId } = Route.useParams()
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-gray-400">User detail for {userId} — coming soon.</p>
    </div>
  )
}
