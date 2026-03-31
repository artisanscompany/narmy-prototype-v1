import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { useData } from '#/contexts/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { pdf } from '@react-pdf/renderer'
import { PayslipPDF } from '#/lib/pdf/payslip-template'
import { TaxCertPDF } from '#/lib/pdf/tax-cert-template'
import { Download, FileText, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { Payslip } from '#/types/payslip'

export const Route = createFileRoute('/_authenticated/_personnel/pay')({
  component: PayDocumentsPage,
})

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function PayDocumentsPage() {
  const { user } = useAuth()
  const { getPayslipsForUser } = useData()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!user) return null

  const payslips = getPayslipsForUser(user.id).sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))

  const downloadPayslip = async (payslip: Payslip) => {
    const blob = await pdf(<PayslipPDF payslip={payslip} user={user} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Payslip-${payslip.year}-${String(payslip.month).padStart(2, '0')}-${user.armyNumber.replace(/\//g, '')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadTaxCert = async () => {
    const blob = await pdf(<TaxCertPDF user={user} taxYear={2025} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TaxCert-${user.armyNumber.replace(/\//g, '')}-2025.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-army-dark">Pay & Documents</h1>
          <p className="text-gray-500 text-sm mt-1">View payslips and download certificates</p>
        </div>
        <Button variant="outline" onClick={downloadTaxCert}>
          <FileText className="w-4 h-4 mr-2" />
          Tax Exemption Certificate (2025)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payslip History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {payslips.map((p) => (
              <div key={p.id}>
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-army-dark">
                      {monthNames[p.month]} {p.year}
                    </div>
                    {p.status === 'short-paid' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Short-paid
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-400">Gross</div>
                      <div className="text-sm font-mono text-gray-600">₦{p.grossPay.toLocaleString()}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-400">Deductions</div>
                      <div className="text-sm font-mono text-red-500">-₦{p.totalDeductions.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Net Pay</div>
                      <div className="text-sm font-mono font-bold text-army-dark">₦{p.netPay.toLocaleString()}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); downloadPayslip(p) }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="px-6 pb-4 bg-gray-50 space-y-2">
                    {p.components.map((c) => (
                      <div key={c.label} className="flex justify-between text-sm">
                        <span className={c.type === 'deduction' ? 'text-red-600' : 'text-gray-600'}>{c.label}</span>
                        <span className={`font-mono font-semibold ${c.type === 'deduction' ? 'text-red-600' : 'text-army-dark'}`}>
                          {c.type === 'deduction' ? '-' : ''}₦{c.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {p.discrepancyNote && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        ⚠ {p.discrepancyNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
