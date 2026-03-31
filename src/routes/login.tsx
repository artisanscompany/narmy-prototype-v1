import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [armyNumber, setArmyNumber] = useState('')
  const [salaryAccount, setSalaryAccount] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Small delay for perceived quality
    setTimeout(() => {
      const user = login(armyNumber, salaryAccount)
      if (!user) {
        setError('Invalid credentials. Please check your Army Number and Salary Account Number.')
        setIsLoading(false)
        return
      }
      if (user.role === 'personnel') {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/admin/dashboard' })
      }
    }, 400)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-army-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A84B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-army-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-army-mid/10 rounded-full blur-[100px]" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-army-gold via-army-gold/60 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/10 backdrop-blur-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#C8A84B"/>
              </svg>
            </div>
            <div>
              <span className="text-army-gold text-xs font-bold tracking-[4px] uppercase">Nigerian Army</span>
            </div>
          </div>
          <h1 className="text-white text-5xl font-light leading-[1.15] mb-5 tracking-tight">
            Personnel<br />
            <span className="font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Self-Service Portal</span>
          </h1>
          <p className="text-white/40 text-base max-w-md leading-relaxed">
            Secure access to your service records, pay information, and support resources. One platform for all personnel needs.
          </p>
        </div>

        <div className="relative z-10 border-t border-army-gold/10 pt-8 flex gap-10">
          <div>
            <div className="text-army-gold text-3xl font-bold tracking-tight">250K+</div>
            <div className="text-white/30 text-[11px] uppercase tracking-wider mt-1.5">Personnel Served</div>
          </div>
          <div>
            <div className="text-army-gold text-3xl font-bold tracking-tight">8</div>
            <div className="text-white/30 text-[11px] uppercase tracking-wider mt-1.5">Divisions</div>
          </div>
          <div>
            <div className="text-army-gold text-3xl font-bold tracking-tight">99.9%</div>
            <div className="text-white/30 text-[11px] uppercase tracking-wider mt-1.5">Uptime SLA</div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 lg:px-16 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-army-gold via-army to-army-dark" />

        <div className="max-w-sm mx-auto w-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 border-2 border-army-gold/40 rounded-xl flex items-center justify-center bg-army-gold/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#C8A84B"/>
              </svg>
            </div>
            <span className="text-army-dark font-bold text-sm tracking-[3px] uppercase">NARMY</span>
          </div>

          <div className="mb-8">
            <h2 className="text-army-dark text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm">Sign in with your service credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-army-dark/70 mb-2 uppercase tracking-wider">Army Number</label>
              <input
                type="text"
                value={armyNumber}
                onChange={(e) => setArmyNumber(e.target.value)}
                placeholder="e.g. NA/23/01234"
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50/50 font-mono text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-army-dark/70 mb-2 uppercase tracking-wider">Salary Account Number</label>
              <input
                type="password"
                value={salaryAccount}
                onChange={(e) => setSalaryAccount(e.target.value)}
                placeholder="e.g. SAL-001-2024"
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50/50 font-mono text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army/40 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-army-dark text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-army transition-all shadow-lg shadow-army-dark/20 disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-300 text-[11px] uppercase tracking-wider">
              Prototype v1.0 — For review purposes only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
