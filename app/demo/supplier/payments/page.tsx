'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const SafeStats = dynamic(() => import('@/components/ui/safe-stats').then(mod => ({ default: mod.SafeStats })))
import { Wallet, CheckCircle, TrendingUp } from 'lucide-react'

export default function DemoSupplierPayments() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Pagamenti - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei pagamenti ricevuti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Totale Ricevuto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1FA9A0]">€9,250</div>
              <p className="text-sm text-gray-400 mt-2">Questo mese</p>
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
              <CardDescription>Crescita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">+15%</div>
              <p className="text-sm text-gray-400 mt-2">vs mese scorso</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Pagamenti Recenti</CardTitle>
            <CardDescription>Ultimi pagamenti ricevuti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { invoice: 'FAT-2024-001', amount: 1250, date: '10 Feb 2024', status: 'paid' },
                { invoice: 'FAT-2024-004', amount: 950, date: '8 Feb 2024', status: 'paid' },
                { invoice: 'FAT-2024-005', amount: 1200, date: '5 Feb 2024', status: 'paid' },
              ].map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{payment.invoice}</p>
                    <p className="text-sm text-gray-400">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white"><SafeStats value={payment.amount} prefix="€" /></span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
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

