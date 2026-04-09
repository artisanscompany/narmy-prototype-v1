import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { DEMO_USERS } from '#/data/users'
import { loadFromStorage, saveToStorage } from '#/lib/localStorage'
import type { User, UserRole } from '#/types/user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (armyNumber: string, salaryAccountNo: string) => User | null
  logout: () => void
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadFromStorage<User | null>('auth_user', null))

  const login = useCallback((armyNumber: string, salaryAccountNo: string): User | null => {
    const found = DEMO_USERS.find(
      (u) => u.armyNumber === armyNumber && u.salaryAccountNo === salaryAccountNo,
    )
    if (!found) return null
    setUser(found)
    saveToStorage('auth_user', found)
    return found
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    // Only clear auth key — preserve data (complaints, payslips, users)
    try { localStorage.removeItem('narmy_auth_user') } catch { /* ignore */ }
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
