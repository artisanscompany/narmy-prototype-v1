import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const DEMO_ACCOUNTS = [
  { label: 'Capt. Adeyemi (Personnel)', armyNumber: 'NA/23/01234', salary: 'SAL-001-2024' },
  { label: 'Maj. Okonkwo (Div Admin)', armyNumber: 'DA/10/00456', salary: 'SAL-101-2024' },
  { label: 'Col. Nwachukwu (Super Admin)', armyNumber: 'SA/05/00123', salary: 'SAL-201-2024' },
]

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

  const fillDemo = (armyNum: string, salary: string) => {
    setArmyNumber(armyNum)
    setSalaryAccount(salary)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-army-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A84B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-army-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-army-mid/10 rounded-full blur-[100px]" />

        {/* Top accent line — 2px */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-army-gold via-army-gold/60 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            {/* Shield with star */}
            <div className="w-12 h-12 border-2 border-army-gold/30 rounded-lg flex items-center justify-center bg-army-gold/10 backdrop-blur-sm">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                <path d="M12 0L24 4V12C24 20 18 26 12 28C6 26 0 20 0 12V4L12 0Z" fill="#C8A84B" fillOpacity="0.2" stroke="#C8A84B" strokeWidth="1.5"/>
                <path d="M12 7L13.76 11.24L18.4 11.76L15 14.84L15.92 19.4L12 17.2L8.08 19.4L9 14.84L5.6 11.76L10.24 11.24L12 7Z" fill="#C8A84B"/>
              </svg>
            </div>
            <div>
              <span className="text-army-gold text-base font-extrabold tracking-[5px] uppercase">Nigerian Army</span>
            </div>
          </div>

          <div className="mb-20">
            <h1 className="text-white text-5xl font-light leading-[1.15] mb-5 tracking-tight">
              Personnel<br />
              <span className="font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Self-Service Portal</span>
            </h1>
            <p className="text-white/40 text-base max-w-md leading-relaxed">
              Pay records, service documents, and complaint resolution — in one secure platform.
            </p>
          </div>
        </div>

        {/* Bottom institutional branding */}
        <div className="relative z-10 border-t border-army-gold/10 pt-8 space-y-3">
          <div className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em]">
            Directorate of Army Personnel Services
          </div>
          <div className="text-white/30 text-[11px] uppercase tracking-wider">
            Federal Republic of Nigeria
          </div>
          <div className="mt-4 inline-block border border-army-gold/20 rounded px-3 py-1.5">
            <span className="text-army-gold/70 text-[10px] font-bold uppercase tracking-[0.25em]">
              Official — For Authorised Personnel Only
            </span>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-[45%] bg-[#FAFAF7] flex flex-col justify-center px-8 lg:px-16 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-army-gold via-army to-army-dark" />

        <div className="max-w-sm mx-auto w-full">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 border-2 border-army-gold/40 rounded-lg flex items-center justify-center bg-army-gold/10">
              <svg width="20" height="24" viewBox="0 0 24 28" fill="none">
                <path d="M12 0L24 4V12C24 20 18 26 12 28C6 26 0 20 0 12V4L12 0Z" fill="#C8A84B" fillOpacity="0.2" stroke="#C8A84B" strokeWidth="1.5"/>
                <path d="M12 7L13.76 11.24L18.4 11.76L15 14.84L15.92 19.4L12 17.2L8.08 19.4L9 14.84L5.6 11.76L10.24 11.24L12 7Z" fill="#C8A84B"/>
              </svg>
            </div>
            <span className="text-army-dark font-bold text-sm tracking-[3px] uppercase">NARMY</span>
          </div>

          <div className="mb-8">
            <h2 className="text-army-dark text-2xl font-bold mb-2">Secure Access</h2>
            <p className="text-gray-400 text-sm">Authenticate with your Army Number and Salary Account</p>
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
                className="w-full border border-gray-200 rounded-lg px-4 py-3.5 bg-gray-50/50 font-mono text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army/40 focus:bg-white transition-all"
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
                className="w-full border border-gray-200 rounded-lg px-4 py-3.5 bg-gray-50/50 font-mono text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-army/20 focus:border-army/40 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-army-dark text-white py-4 rounded-lg font-semibold text-sm hover:bg-army transition-all shadow-lg shadow-army-dark/25 active:scale-[0.99]"
            >
              Sign In
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 border-l-4 border-army-gold bg-white rounded-r-lg p-4">
            <div className="text-[10px] font-semibold text-army-dark/50 uppercase tracking-wider mb-3">Demo Accounts — Click to autofill</div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.armyNumber}
                  type="button"
                  onClick={() => fillDemo(account.armyNumber, account.salary)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md hover:bg-army-cream/60 transition-colors group"
                >
                  <span className="text-xs font-medium text-army-dark/70 group-hover:text-army-dark">{account.label}</span>
                  <span className="text-[10px] font-mono text-gray-400">{account.armyNumber}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-300 text-[11px] uppercase tracking-wider">
              Prototype v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
