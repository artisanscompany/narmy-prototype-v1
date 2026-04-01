import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { useState, useMemo } from 'react'
import { Search, ChevronRight, X } from 'lucide-react'
import type { UserRole } from '#/types/user'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsers,
})

const ROLE_LABELS: Record<UserRole, string> = {
  personnel: 'Personnel',
  divisionAdmin: 'Division Admin',
  superAdmin: 'Super Admin',
}

const ALL_ROLES: UserRole[] = ['personnel', 'divisionAdmin', 'superAdmin']

function AdminUsers() {
  const { user } = useAuth()
  const { users } = useData()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'

  const scopedUsers = useMemo(() => {
    if (isSuperAdmin) return users
    return users.filter((u) => u.division === user.division)
  }, [users, isSuperAdmin, user.division])

  const filtered = useMemo(() => {
    let list = scopedUsers

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.armyNumber.toLowerCase().includes(q) ||
          u.rank.toLowerCase().includes(q) ||
          u.division.toLowerCase().includes(q),
      )
    }

    return list
  }, [scopedUsers, roleFilter, search])

  const roleCounts = useMemo(() => {
    return ALL_ROLES.reduce<Record<UserRole, number>>(
      (acc, role) => {
        acc[role] = scopedUsers.filter((u) => u.role === role).length
        return acc
      },
      { personnel: 0, divisionAdmin: 0, superAdmin: 0 },
    )
  }, [scopedUsers])

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-army-dark">User Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} users</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          placeholder="Search by name, army number, rank..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Filter Pills */}
      <div className="flex gap-1.5 flex-wrap mt-2">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-army-dark text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({scopedUsers.length})
        </button>
        {ALL_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              roleFilter === role
                ? 'bg-army-dark text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {ROLE_LABELS[role]} ({roleCounts[role]})
          </button>
        ))}
      </div>

      {/* User Cards */}
      <div className="space-y-2 mt-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No users match your filters.</p>
          </div>
        ) : (
          filtered.map((u) => {
            const statusClasses =
              u.status === 'active'
                ? 'bg-green-50 text-green-700'
                : u.status === 'awol'
                  ? 'bg-red-50 text-red-700'
                  : u.status === 'retired'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-orange-50 text-orange-700'

            return (
              <Link
                key={u.id}
                to="/admin/users/$userId"
                params={{ userId: u.id }}
                className="block bg-white rounded-xl border border-gray-100 px-5 py-3.5 hover:border-army-gold/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-army-dark">{u.name}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono">{u.armyNumber}</span> · {u.rank} · {u.corps}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClasses}`}>
                      {u.status === 'awol'
                        ? 'AWOL'
                        : u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                    {isSuperAdmin && (
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {u.division}
                      </span>
                    )}
                    {isSuperAdmin && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[u.role]}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-army-gold transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
