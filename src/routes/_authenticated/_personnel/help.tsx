import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '#/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '#/components/ui/accordion'
import { Phone, MessageCircle, Mail } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/_personnel/help')({
  component: HelpPage,
})

const faqs = [
  { q: 'How do I download my payslip?', a: 'Go to Pay & Documents from the sidebar. Each month has a download button. Click it to generate and download your payslip as a PDF.' },
  { q: 'What should I do if my pay is short?', a: 'If you notice a discrepancy in your pay, go to Complaints and raise a new complaint under "Pay & Allowances" → "Short Payment / Missing Allowance". Include the month affected and details of the missing amount.' },
  { q: 'How long does a complaint take to resolve?', a: 'Most complaints have a 14-day SLA. Critical and status-related complaints are prioritized and may be resolved faster. You can track progress on your complaint detail page.' },
  { q: 'Who can I contact for urgent issues?', a: 'For urgent matters, use the WhatsApp or phone channels below. For non-urgent issues, email is preferred.' },
  { q: 'How do I dispute an incorrect AWOL status?', a: 'File a complaint under "Status Issues" → "AWOL Dispute" with supporting documentation (leave approval, medical records, etc.). Critical status issues are auto-escalated.' },
  { q: 'Can I update my personal information?', a: 'Personal information updates must go through your Division Admin. File a complaint under "Service Records" with the details that need correction.' },
]

const channels = [
  { icon: Phone, label: 'Help Desk', description: '24/7 phone support for urgent issues', action: '0800-ARMY-HELP', actionLabel: 'Call Now' },
  { icon: MessageCircle, label: 'WhatsApp', description: 'Quick support via WhatsApp', action: 'https://wa.me/2348001234567', actionLabel: 'Chat Now' },
  { icon: Mail, label: 'Email', description: 'For detailed inquiries and documentation', action: 'mailto:support@narmy.mil.ng', actionLabel: 'Send Email' },
]

function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-army-dark">Help & Support</h1>
        <p className="text-gray-500 text-sm mt-1">Find answers or contact support</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {channels.map((ch) => (
          <Card key={ch.label}>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-army/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ch.icon className="w-5 h-5 text-army" />
              </div>
              <h3 className="font-semibold text-army-dark text-sm">{ch.label}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">{ch.description}</p>
              <a
                href={ch.action.startsWith('http') || ch.action.startsWith('mailto') ? ch.action : `tel:${ch.action}`}
                className="inline-block px-4 py-2 bg-army-dark text-white text-xs font-semibold rounded-lg hover:bg-army transition-colors"
              >
                {ch.actionLabel}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-bold text-army-dark mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-army-dark">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
