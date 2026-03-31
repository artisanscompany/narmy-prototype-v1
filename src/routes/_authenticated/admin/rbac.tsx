import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Check, X } from 'lucide-react'
import type { UserRole } from '#/types/user'

export const Route = createFileRoute('/_authenticated/admin/rbac')({
  component: AdminRBAC,
})

interface Permission {
  action: string
  description: string
  roles: UserRole[]
}

const PERMISSIONS: Permission[] = [
  { action: 'View Own Tickets', description: 'View complaints filed by the user', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'File Ticket', description: 'Submit a new complaint or grievance', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'View Own Payslips', description: 'Access personal payslip records', roles: ['personnel', 'divisionAdmin', 'superAdmin'] },
  { action: 'View Division Tickets', description: 'View all tickets in own division', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Update Ticket Status', description: 'Change status of tickets in scope', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Add Notes to Tickets', description: 'Add admin notes to tickets', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'Escalate Tickets', description: 'Escalate tickets to higher authority', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'View Division Analytics', description: 'Access analytics for own division', roles: ['divisionAdmin', 'superAdmin'] },
  { action: 'View All Tickets', description: 'View tickets across all divisions', roles: ['superAdmin'] },
  { action: 'View System Analytics', description: 'Access system-wide analytics', roles: ['superAdmin'] },
  { action: 'Manage Users', description: 'View and manage user accounts', roles: ['superAdmin'] },
  { action: 'Change User Roles', description: 'Assign or change user roles', roles: ['superAdmin'] },
  { action: 'View RBAC Matrix', description: 'View role-based access control settings', roles: ['divisionAdmin', 'superAdmin'] },
]

const ROLE_LABELS: Record<UserRole, string> = {
  personnel: 'Personnel',
  divisionAdmin: 'Division Admin',
  superAdmin: 'Super Admin',
}

const ALL_ROLES: UserRole[] = ['personnel', 'divisionAdmin', 'superAdmin']

function AdminRBAC() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-army-dark">Role-Based Access Control</h1>
        <p className="text-gray-500 text-sm mt-1">Permission matrix for all system roles</p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Role Descriptions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-army-dark text-sm mb-1">Personnel</h3>
              <p className="text-xs text-gray-500">Regular army personnel who can file complaints, view their own tickets and payslips.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-semibold text-army-dark text-sm mb-1">Division Admin</h3>
              <p className="text-xs text-gray-500">Division-level administrators who manage tickets, view analytics, and escalate issues within their division.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-army-dark text-sm mb-1">Super Admin</h3>
              <p className="text-xs text-gray-500">System-wide administrators with full access to all divisions, user management, and system analytics.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Permission Matrix</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Permission</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[100px]">Description</th>
                  {ALL_ROLES.map((role) => (
                    <th key={role} className="text-center px-4 py-3 font-semibold text-gray-600">{ROLE_LABELS[role]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.action} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{perm.action}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{perm.description}</td>
                    {ALL_ROLES.map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        {perm.roles.includes(role) ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
