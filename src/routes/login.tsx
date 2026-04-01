import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const DEMO_ACCOUNTS = [
  {
    rank: 'Capt.',
    name: 'Adeyemi',
    role: 'Personnel',
    armyNumber: 'NA/23/01234',
    salary: 'SAL-001-2024',
    color: 'army',
    status: 'Active',
  },
  {
    rank: 'Sgt.',
    name: 'Yusuf',
    role: 'Personnel',
    armyNumber: 'NA/18/03456',
    salary: 'SAL-004-2024',
    color: 'army',
    status: 'Active',
  },
  {
    rank: 'LCpl.',
    name: 'Obi',
    role: 'Personnel',
    armyNumber: 'NA/21/07890',
    salary: 'SAL-005-2024',
    color: 'army',
    status: 'Active',
  },
  {
    rank: 'SSgt.',
    name: 'Danladi',
    role: 'Personnel',
    armyNumber: 'NA/14/02345',
    salary: 'SAL-006-2024',
    color: 'army',
    status: 'Suspended',
  },
  {
    rank: 'Lt.',
    name: 'Kalu',
    role: 'Personnel',
    armyNumber: 'NA/22/06789',
    salary: 'SAL-007-2024',
    color: 'army',
    status: 'Active',
  },
  {
    rank: 'Pte.',
    name: 'Okoro',
    role: 'Personnel',
    armyNumber: 'NA/24/08901',
    salary: 'SAL-008-2024',
    color: 'army',
    status: 'Active',
  },
  {
    rank: 'Maj.',
    name: 'Okonkwo',
    role: 'Div Admin',
    armyNumber: 'DA/10/00456',
    salary: 'SAL-101-2024',
    color: 'gold',
    status: 'Active',
  },
  {
    rank: 'Col.',
    name: 'Nwachukwu',
    role: 'Super Admin',
    armyNumber: 'SA/05/00123',
    salary: 'SAL-201-2024',
    color: 'dark',
    status: 'Active',
  },
] as const

const ROLE_STYLES = {
  army: {
    badge: 'bg-army/10 text-army border-army/20',
    ring: 'ring-army/20',
    initials: 'bg-army/10 text-army',
  },
  gold: {
    badge: 'bg-army-gold/10 text-army-gold-light border-army-gold/20',
    ring: 'ring-army-gold/20',
    initials: 'bg-army-gold/10 text-army-gold',
  },
  dark: {
    badge: 'bg-army-dark/10 text-army-dark border-army-dark/20',
    ring: 'ring-army-dark/20',
    initials: 'bg-army-dark/10 text-army-dark',
  },
} as const

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel — commanding presence */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[44%] bg-army-dark flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Layered background texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A84B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-army-gold/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-army-mid/[0.08] rounded-full blur-[120px]" />

        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army-gold via-army-gold/50 to-transparent" />
        {/* Left gold accent line */}
        <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gradient-to-b from-army-gold via-army-gold/20 to-transparent" />

        <div className="relative z-10">
          {/* Logo + title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08] backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(200,168,75,0.1)]">
              <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-9 h-9 drop-shadow-[0_0_6px_rgba(200,168,75,0.25)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-army-gold text-sm font-bold tracking-[0.35em] uppercase">Nigerian Army</span>
              <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase mt-0.5">Personnel Services</span>
            </div>
          </div>
        </div>

        {/* Center content — vertically centered */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-8">
          <div className="mb-10">
            <div className="text-army-gold/60 text-[11px] font-semibold uppercase tracking-[0.3em] mb-5">
              Welcome to
            </div>
            <h1 className="text-white text-[2.75rem] xl:text-[3.25rem] leading-[1.15] mb-3 tracking-tight">
              <span className="font-light">Personnel</span><br />
              <span className="font-bold">Self-Service Portal</span>
            </h1>
            <div className="w-12 h-[2px] bg-army-gold/50 my-6" />
            <p className="text-white/40 text-[15px] max-w-md leading-[1.75]">
              Access your pay records, download service documents, and submit complaints — all from one secure platform built for the Nigerian Army.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 max-w-sm">
            {[
              { icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z', label: 'Pay slips & salary records' },
              { icon: 'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5', label: 'NASFA e-learning courses' },
              { icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155', label: 'Complaint filing & SLA tracking' },
              { icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', label: 'Profile & service documents' },
              { icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z', label: 'Help centre & FAQs' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-army-gold/[0.08] border border-army-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-army-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <span className="text-white/50 text-[13px]">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom institutional branding */}
        <div className="relative z-10 border-t border-white/[0.06] pt-6 flex items-end justify-between">
          <div>
            <div className="text-white/40 text-[11px] font-semibold uppercase tracking-[0.2em]">
              Directorate of Army Personnel Services
            </div>
            <div className="text-white/20 text-[10px] uppercase tracking-[0.15em] mt-1.5">
              Federal Republic of Nigeria
            </div>
          </div>
          <div className="border border-army-gold/15 rounded px-2.5 py-1">
            <span className="text-army-gold/50 text-[9px] font-bold uppercase tracking-[0.2em]">
              Official Use Only
            </span>
          </div>
        </div>
      </div>

      {/* Right login panel — refined and spacious */}
      <div className="w-full lg:w-[52%] xl:w-[56%] bg-[#FAFAF8] flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-10 relative">
        {/* Subtle gradient overlay on right panel */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-army-cream/30 pointer-events-none" />
        {/* Top accent — connecting to left panel */}
        <div className="absolute top-0 left-0 right-0 h-[3px] lg:h-0 bg-gradient-to-r from-army-gold via-army to-army-dark" />

        <div className="max-w-md mx-auto w-full relative z-10">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 border-2 border-army-gold/30 rounded-xl flex items-center justify-center bg-army-gold/[0.08]">
              <img src="/nigerian-army-logo.svg" alt="Nigerian Army Crest" className="w-7 h-7 drop-shadow-[0_0_3px_rgba(200,168,75,0.3)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-army-dark font-bold text-sm tracking-[0.2em] uppercase">NARMY</span>
              <span className="text-army-dark/30 text-[9px] tracking-[0.15em] uppercase">Personnel Portal</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-army-dark text-[1.85rem] mb-2 font-bold tracking-tight">
              Secure Access
            </h2>
            <p className="text-army-dark/40 text-sm">
              Sign in with your Army Number and Salary Account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Army Number
              </label>
              <input
                type="text"
                value={armyNumber}
                onChange={(e) => setArmyNumber(e.target.value)}
                placeholder="e.g. NA/23/01234"
                autoComplete="username"
                className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-army-dark/50 mb-2 uppercase tracking-[0.15em]">
                Salary Account Number
              </label>
              <input
                type="password"
                value={salaryAccount}
                onChange={(e) => setSalaryAccount(e.target.value)}
                placeholder="e.g. SAL-001-2024"
                autoComplete="current-password"
                className="w-full border border-army-sand rounded-lg px-4 py-3.5 bg-white/70 font-mono text-sm placeholder:text-army-dark/20 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-red-700 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-army-dark text-white py-4 rounded-lg font-semibold text-sm hover:bg-army-dark/90 transition-all shadow-lg shadow-army-dark/20 active:scale-[0.99] relative overflow-hidden group"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-army to-army-dark opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-army-sand/80" />
            <span className="text-[10px] font-semibold text-army-dark/25 uppercase tracking-[0.2em]">Demo Accounts</span>
            <div className="flex-1 h-px bg-army-sand/80" />
          </div>

          {/* Demo accounts — elevated cards */}
          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((account) => {
              const styles = ROLE_STYLES[account.color]
              return (
                <button
                  key={account.armyNumber}
                  type="button"
                  onClick={() => fillDemo(account.armyNumber, account.salary)}
                  className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white border border-army-sand/60 hover:border-army-sand hover:shadow-md hover:shadow-army-dark/[0.03] transition-all group cursor-pointer`}
                >
                  {/* Avatar initials */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${styles.initials}`}>
                    {account.name[0]}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-army-dark group-hover:text-army-dark/90">
                        {account.rank} {account.name}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${styles.badge}`}>
                        {account.role}
                      </span>
                      {account.status === 'Suspended' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200">
                          Suspended
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-army-dark/30">{account.armyNumber}</span>
                  </div>
                  {/* Arrow */}
                  <svg className="w-4 h-4 text-army-dark/15 group-hover:text-army-dark/40 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-army-sand/50 flex items-center justify-between">
            <p className="text-army-dark/20 text-[10px] uppercase tracking-[0.15em] font-medium">
              Prototype v1.0
            </p>
            <div className="flex items-center gap-1.5 text-army-dark/15">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-[10px] tracking-wider uppercase">Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
