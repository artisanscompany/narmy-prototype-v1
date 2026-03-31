import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { useState, useMemo } from 'react'
import { Search, Shield, ShieldCheck, User as UserIcon } from 'lucide-react'
import type { UserRole } from '#/types/user'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsers,
})

const ROLE_LABELS: Record<UserRole, string> = {
  personnel: 'Personnel',
  divisionAdmin: 'Division Admin',
  superAdmin: 'Super Admin',
}

const ROLE_ICONS: Record<UserRole, typeof UserIcon> = {
  personnel: UserIcon,
  divisionAdmin: Shield,
  superAdmin: ShieldCheck,
}

const ALL_ROLES: UserRole[] = ['personnel', 'divisionAdmin', 'superAdmin']

function AdminUsers() {
  const { user } = useAuth()
  const { users, updateUserRole } = useData()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  const filtered = useMemo(() => {
    let list = users

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.armyNumber.toLowerCase().includes(q) ||
          u.division.toLowerCase().includes(q) ||
          u.rank.toLowerCase().includes(q),
      )
    }

    return list
  }, [users, roleFilter, search])

  if (!user) return null

  const isSuperAdmin = user.role === 'superAdmin'

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} users</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, army number, division, rank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Users</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Army Number</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rank</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Division</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const RoleIcon = ROLE_ICONS[u.role]
                  return (
                    <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.corps}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.armyNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{u.rank}</td>
                      <td className="px-4 py-3 text-gray-600">{u.division}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' :
                          u.status === 'awol' ? 'bg-red-100 text-red-700' :
                          u.status === 'retired' ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isSuperAdmin && u.id !== user.id ? (
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
                          >
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                            <RoleIcon className="w-3.5 h-3.5" />
                            {ROLE_LABELS[u.role]}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
