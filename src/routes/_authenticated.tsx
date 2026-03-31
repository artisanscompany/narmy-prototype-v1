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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-army-sand bg-white px-6">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-army-dark">{user.rank} {user.name.split(' ').pop()}</div>
              <div className="text-[10px] text-gray-400">{user.division}</div>
            </div>
            <div className="w-8 h-8 bg-army rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
