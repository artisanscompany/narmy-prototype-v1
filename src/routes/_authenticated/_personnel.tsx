import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_personnel')({
  component: PersonnelLayout,
})

function PersonnelLayout() {
  return <Outlet />
}
