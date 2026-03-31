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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = login(armyNumber, salaryAccount)
    if (!user) {
      setError('Invalid credentials. Please check your Army Number and Salary Account Number.')
      return
    }
    if (user.role === 'personnel') {
      navigate({ to: '/dashboard' })
    } else {
      navigate({ to: '/admin/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-army-dark flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 border-2 border-army-gold/40 rounded-xl flex items-center justify-center bg-army-gold/10">
              <span className="text-army-gold text-xl font-extrabold">★</span>
            </div>
            <span className="text-army-gold text-xs font-bold tracking-[3px] uppercase">Nigerian Army</span>
          </div>
          <h1 className="text-white text-4xl font-light leading-tight mb-4">
            Personnel<br />
            <span className="font-bold">Self-Service Portal</span>
          </h1>
          <p className="text-white/45 text-base max-w-sm">
            Secure access to your service records, pay information, and support resources.
          </p>
        </div>
        <div className="relative z-10 border-t border-army-gold/12 pt-6 flex gap-8">
          <div>
            <div className="text-army-gold text-2xl font-bold">250K+</div>
            <div className="text-white/35 text-xs uppercase tracking-wider mt-1">Personnel Served</div>
          </div>
          <div>
            <div className="text-army-gold text-2xl font-bold">8</div>
            <div className="text-white/35 text-xs uppercase tracking-wider mt-1">Divisions</div>
          </div>
          <div>
            <div className="text-army-gold text-2xl font-bold">99.9%</div>
            <div className="text-white/35 text-xs uppercase tracking-wider mt-1">Uptime SLA</div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-[45%] bg-[#FAFAF8] flex flex-col justify-center px-8 lg:px-11 relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army-gold to-army" />
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 border-2 border-army-gold/40 rounded-lg flex items-center justify-center">
              <span className="text-army-gold font-extrabold">★</span>
            </div>
            <span className="text-army-dark font-bold text-sm tracking-wider uppercase">NARMY</span>
          </div>

          <h2 className="text-army-dark text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in with your service credentials</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Army Number</label>
              <input
                type="text"
                value={armyNumber}
                onChange={(e) => setArmyNumber(e.target.value)}
                placeholder="e.g. NA/23/01234"
                autoComplete="username"
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-4 py-3 bg-white font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-army/30 focus:border-army transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Salary Account Number</label>
              <input
                type="password"
                value={salaryAccount}
                onChange={(e) => setSalaryAccount(e.target.value)}
                placeholder="e.g. SAL-001-2024"
                autoComplete="current-password"
                className="w-full border-[1.5px] border-gray-200 rounded-lg px-4 py-3 bg-white font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-army/30 focus:border-army transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-army-dark text-white py-3 rounded-lg font-semibold text-sm hover:bg-army transition-colors shadow-md"
            >
              Sign In →
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            Prototype v1.0 — For review purposes only
          </p>
        </div>
      </div>
    </div>
  )
}
