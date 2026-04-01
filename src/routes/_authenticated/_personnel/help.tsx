import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Wallet,
  FileText,
  Shield,
  MapPin,
  Clock,
  UserCheck,
  Search,
  PenLine,
  X,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/_authenticated/_personnel/help')({
  component: HelpPage,
})

interface FAQItem {
  q: string
  a: string
  links?: { label: string; to: string }[]
}

interface FAQSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  faqs: FAQItem[]
}

const faqSections: FAQSection[] = [
  {
    id: 'pay',
    title: 'Pay & Allowances',
    icon: Wallet,
    faqs: [
      { q: 'How do I download my payslip?', a: 'Navigate to Pay & Documents from the sidebar. Each month shows your payslip with a download button to generate a PDF copy for your records. You will need your verification PIN to download.', links: [{ label: 'Go to Pay & Documents', to: '/pay' }] },
      { q: 'What should I do if my pay is short?', a: 'Raise a complaint under "Pay & Allowances" then "Short Payment / Missing Allowance". Include the affected month, expected amount, and actual amount received. Short-pay complaints are automatically flagged for priority review.', links: [{ label: 'Raise a complaint', to: '/complaints/new' }] },
      { q: 'Why are my allowances different this month?', a: 'Allowances may change due to posting changes, rank promotions, or policy updates. Compare your current payslip components with previous months in Pay & Documents. If the change seems incorrect, file a complaint.' },
      { q: 'When is salary typically paid?', a: 'Salary payments are processed on the 25th of each month. If the 25th falls on a weekend or holiday, payment is processed on the preceding working day. Allow 1-2 business days for bank processing.' },
      { q: 'How do I report a duplicate deduction?', a: 'File a complaint under "Pay & Allowances" then "Incorrect Deduction". Provide the deduction name, amount, and the months affected. Attach screenshots of your payslip if possible.', links: [{ label: 'Raise a complaint', to: '/complaints/new' }] },
    ],
  },
  {
    id: 'records',
    title: 'Service Records',
    icon: FileText,
    faqs: [
      { q: 'Can I update my personal information?', a: 'Personal information updates (name corrections, next-of-kin, bank details) must be submitted through your Division Admin. File a complaint under "Service Records" with the details that need correction and supporting documents.', links: [{ label: 'View your profile', to: '/profile' }] },
      { q: 'How do I get a copy of my service record?', a: 'Service record requests should be made through your unit\'s personnel office. For urgent requests, file a complaint under "Service Records" and specify the documents needed.' },
      { q: 'How do I update my bank account details?', a: 'Bank account changes require verification. Submit a request through "Service Records" with your new bank details, a voided cheque or bank letter, and valid ID. Changes take 1-2 pay cycles to reflect.' },
    ],
  },
  {
    id: 'status',
    title: 'Status & AWOL',
    icon: Shield,
    faqs: [
      { q: 'How do I dispute an incorrect AWOL status?', a: 'File a complaint under "Status Issues" then "AWOL Dispute" immediately. Attach supporting documentation such as leave approval letters, medical certificates, or posting orders. AWOL disputes are auto-escalated to Critical priority with a 7-day SLA.', links: [{ label: 'Raise AWOL dispute', to: '/complaints/new' }] },
      { q: 'What happens when I am marked AWOL?', a: 'AWOL status restricts portal access to complaints only. Your pay may be withheld until the status is resolved. File a dispute immediately if this status is incorrect — the system will auto-escalate your complaint.' },
      { q: 'How long does an AWOL dispute take to resolve?', a: 'Critical status issues have a 7-day SLA. However, resolution depends on verification of your documentation. Ensure all supporting documents are attached when filing to avoid delays.' },
    ],
  },
  {
    id: 'postings',
    title: 'Postings & Transfers',
    icon: MapPin,
    faqs: [
      { q: 'How do I request a transfer?', a: 'Transfer requests are handled through your commanding officer and Division HQ. This portal does not process transfer requests directly, but you can file a complaint if a transfer-related allowance (relocation, disturbance) was not paid.' },
      { q: 'My relocation allowance was not paid after posting', a: 'File a complaint under "Postings & Transfers" then "Relocation Allowance Not Paid". Include your posting order reference, effective date, and the allowance amount you are entitled to.', links: [{ label: 'Raise a complaint', to: '/complaints/new' }] },
      { q: 'How do I report an issue with my posting order?', a: 'Posting order discrepancies should be raised under "Postings & Transfers". Provide the order reference number, the incorrect information, and what the correct information should be.' },
    ],
  },
  {
    id: 'complaints',
    title: 'Complaints & Resolution',
    icon: Clock,
    faqs: [
      { q: 'How long does a complaint take to resolve?', a: 'Standard complaints have a 14-day SLA. Critical complaints (AWOL disputes, status issues) have a 7-day SLA. You can track your complaint status and timeline on the complaint detail page.', links: [{ label: 'View your complaints', to: '/complaints' }] },
      { q: 'What do the complaint statuses mean?', a: 'Submitted: received and queued. In Review: assigned to a handler. Action Required: the handler needs additional details from you. Escalated: elevated to senior staff. Resolved: issue addressed. Closed: case finalized.' },
      { q: 'Can I add more information to an existing complaint?', a: 'Yes. Open your complaint and use the "Add Response" section at the bottom of the activity timeline. You can type a message and attach supporting documents. This is especially important if your complaint shows "Action Required".', links: [{ label: 'View your complaints', to: '/complaints' }] },
      { q: 'What if my complaint is not resolved within the SLA?', a: 'Overdue complaints are automatically escalated. You will see a red "Overdue" indicator on your complaint. If you feel your complaint is not receiving attention, contact the Help Desk by phone.' },
      { q: 'Can I withdraw a complaint?', a: 'Complaints cannot be withdrawn once submitted, but they can be resolved and closed. Contact the Help Desk if you need to close a complaint that is no longer relevant.' },
    ],
  },
  {
    id: 'account',
    title: 'Account & Access',
    icon: UserCheck,
    faqs: [
      { q: 'I cannot log in to the portal', a: 'Ensure you are using your correct Army Number and Salary Account Number. If you still cannot access the portal, contact the Help Desk — your account may need to be activated or reset.' },
      { q: 'Who can access my information on this portal?', a: 'Only you can see your full pay and complaint details. Sensitive data (NIN, BVN) is encrypted and requires PIN verification to view. Division Admins can view complaints assigned to their division. All access is logged.', links: [{ label: 'View your profile', to: '/profile' }] },
      { q: 'How do I report a security concern?', a: 'If you suspect unauthorized access to your account or notice unfamiliar activity, contact the Help Desk immediately by phone at 0800-ARMY-HELP. Do not share your login credentials with anyone.' },
    ],
  },
]

const totalArticles = faqSections.reduce((sum, s) => sum + s.faqs.length, 0)

function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filteredSections = search.trim()
    ? faqSections
        .map((section) => ({
          ...section,
          faqs: section.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(search.toLowerCase()) ||
              faq.a.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((section) => section.faqs.length > 0)
    : activeSection
      ? faqSections.filter((s) => s.id === activeSection)
      : faqSections

  const totalResults = filteredSections.reduce((sum, s) => sum + s.faqs.length, 0)

  const scrollToSection = (id: string) => {
    const newActive = activeSection === id ? null : id
    setActiveSection(newActive)
    setSearch('')
    if (newActive) {
      setTimeout(() => sectionRefs.current[newActive]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-army-dark">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-0.5">{totalArticles} articles · {faqSections.length} categories</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          aria-label="Search" placeholder="Search for help — e.g. 'short pay', 'AWOL', 'transfer'"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveSection(null) }}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        />
        {search ? (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => { setActiveSection(null); setSearch('') }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeSection && !search ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({totalArticles})
        </button>
        {faqSections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeSection === s.id ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s.title} ({s.faqs.length})
          </button>
        ))}
      </div>

      {/* Search result count */}
      {search && (
        <p className="text-xs text-gray-500">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* FAQ Sections */}
      {filteredSections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500 mb-1">No results for "{search}"</p>
          <p className="text-xs text-gray-500">Try different keywords or raise a ticket below</p>
        </div>
      ) : (
        filteredSections.map((section) => (
          <div
            key={section.id}
            ref={(el) => { sectionRefs.current[section.id] = el }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5">
              <section.icon className="w-4 h-4 text-army" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{section.title}</h2>
              <span className="text-xs text-gray-300">({section.faqs.length})</span>
            </div>

            {/* Questions */}
            <div className="px-5 pb-3">
              {section.faqs.map((faq, i) => {
                const qId = `${section.id}-${i}`
                const isOpen = expandedQ === qId
                return (
                  <div key={i} className={`${i < section.faqs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <button
                      onClick={() => setExpandedQ(isOpen ? null : qId)}
                      className="w-full flex items-center justify-between py-3 text-left group"
                    >
                      <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-army' : 'text-army-dark group-hover:text-army'}`}>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-180 text-army' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pb-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        {faq.links && faq.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {faq.links.map((link) => (
                              <Link
                                key={link.to}
                                to={link.to}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-army hover:text-army-gold transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Raise Ticket CTA — fallback after self-service */}
      <div className="bg-army-dark rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Still need help?</h3>
            <p className="text-xs text-white/40">Raise a complaint ticket and our team will respond within 14 days</p>
          </div>
          <Link
            to="/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors self-start whitespace-nowrap shrink-0"
          >
            <PenLine className="w-4 h-4" />
            Raise a Ticket
          </Link>
        </div>
      </div>
    </div>
  )
}
