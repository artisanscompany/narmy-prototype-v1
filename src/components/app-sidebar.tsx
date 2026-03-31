import { Link, useMatchRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
} from '#/components/ui/sidebar'
import { LayoutDashboard, Wallet, MessageCircle, HelpCircle, Ticket, BarChart3, Users, Shield, LogOut } from 'lucide-react'

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
      <SidebarHeader className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-army-gold/15 border border-army-gold/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#C8A84B" stroke="#C8A84B" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.2em] text-white">NARMY</div>
            <div className="text-[10px] tracking-wider text-white/40 uppercase">
              {user.role === 'personnel' ? 'Personnel Portal' : 'Admin Console'}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] text-army-gold/60 px-3 mb-2">
            {sectionLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = matchRoute({ to: item.to, fuzzy: true })
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={!!isActive} className={isActive ? 'bg-white/[0.12] text-white font-semibold border-l-2 border-army-gold' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}>
                      <Link to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150">
                        <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-army-gold' : ''}`} />
                        <span className="text-[13px]">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.08] px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-army-mid to-army rounded-lg flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user.name}</div>
            <div className="text-white/35 text-[10px] truncate">{user.division}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white/40 hover:text-red-300 text-xs w-full px-2 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
