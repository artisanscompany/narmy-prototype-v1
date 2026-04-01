import { createFileRoute, Outlet, useNavigate, useMatchRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/_personnel')({
  component: PersonnelLayout,
})

function PersonnelLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()

  useEffect(() => {
    if (!user) return

    // Redirect non-personnel users to admin dashboard
    if (user.role !== 'personnel') {
      navigate({ to: '/admin/dashboard' })
      return
    }

    // AWOL users can only access complaints
    if (user.status === 'awol') {
      const isComplaintsRoute = matchRoute({ to: '/complaints', fuzzy: true })
      if (!isComplaintsRoute) {
        navigate({ to: '/complaints' })
      }
    }
  }, [user, navigate, matchRoute])

  return <Outlet />
}
