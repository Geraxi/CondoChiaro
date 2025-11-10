'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const SafeStats = dynamic(() => import('@/components/ui/safe-stats').then(mod => ({ default: mod.SafeStats })))
import { Receipt, CheckCircle, Clock, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DemoSupplierInvoices() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Fatture - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle fatture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Totale Fatturato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1FA9A0]">€12,500</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>In Attesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">€3,250</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Pagate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">€9,250</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Fatture Recenti</CardTitle>
            <CardDescription>Storico fatture emesse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { invoice: 'FAT-2024-001', amount: 1250, date: '10 Feb 2024', status: 'paid', building: 'Residenza Milano Centro' },
                { invoice: 'FAT-2024-002', amount: 850, date: '15 Feb 2024', status: 'pending', building: 'Palazzo Roma Nord' },
                { invoice: 'FAT-2024-003', amount: 1150, date: '20 Feb 2024', status: 'pending', building: 'Residenza Milano Centro' },
              ].map((invoice, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <Receipt className="h-5 w-5 text-[#1FA9A0]" />
                    <div>
                      <p className="font-medium text-white">{invoice.invoice}</p>
                      <p className="text-sm text-gray-400">{invoice.building}</p>
                      <p className="text-xs text-gray-500">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white"><SafeStats value={invoice.amount} prefix="€" /></span>
                    {invoice.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

