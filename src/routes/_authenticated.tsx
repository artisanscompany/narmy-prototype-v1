import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset } from '#/components/ui/sidebar'
import { AppSidebar } from '#/components/app-sidebar'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <meta httpEquiv="refresh" content="0;url=/login" />
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 bg-army-cream/50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
