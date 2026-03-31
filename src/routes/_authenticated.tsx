import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '#/components/ui/sidebar'
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
          <header className="flex h-12 shrink-0 items-center border-b border-gray-100 bg-white px-6">
            <SidebarTrigger className="-ml-2" />
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-army-cream/50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
