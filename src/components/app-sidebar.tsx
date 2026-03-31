import { Link, useMatchRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
} from '#/components/ui/sidebar'
import { LayoutDashboard, Wallet, MessageCircle, HelpCircle, Ticket, BarChart3, Users, Shield, LogOut, Star } from 'lucide-react'

const personnelItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Pay & Documents', to: '/pay', icon: Wallet },
  { label: 'Complaints', to: '/complaints', icon: MessageCircle },
  { label: 'Help & Support', to: '/help', icon: HelpCircle },
]

const adminItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Ticket Management', to: '/admin/tickets', icon: Ticket },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'RBAC Matrix', to: '/admin/rbac', icon: Shield },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const matchRoute = useMatchRoute()

  if (!user) return null

  const items = user.role === 'personnel' ? personnelItems : adminItems
  const sectionLabel = user.role === 'personnel' ? 'Personnel' : 'Administration'

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-[1.5px] border-army-gold/40 rounded-lg flex items-center justify-center bg-army-gold/10">
            <Star className="w-4 h-4 text-army-gold fill-army-gold" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wider">NARMY</div>
            <div className="text-white/40 text-[10px] tracking-wider uppercase">Personnel Portal</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-widest">
            {sectionLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = matchRoute({ to: item.to, fuzzy: true })
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={!!isActive}>
                      <Link to={item.to}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-army rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user.name}</div>
            <div className="text-white/40 text-[10px] truncate">{user.division}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
