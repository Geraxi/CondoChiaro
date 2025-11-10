'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle, Clock } from 'lucide-react'

export default function DemoTenantPayments() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Pagamenti - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dello stato dei pagamenti</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Saldo Attuale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#1FA9A0] mb-2">€1,250.00</div>
            <p className="text-gray-400">Prossima scadenza: 15 Feb 2024</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Storico Pagamenti</CardTitle>
            <CardDescription>Ultimi pagamenti effettuati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { description: 'Quota condominiale Gennaio', amount: 250, date: '10 Gen 2024', status: 'paid' },
                { description: 'Fondo manutenzione', amount: 150, date: '5 Dic 2023', status: 'paid' },
                { description: 'Quota condominiale Febbraio', amount: 250, date: '15 Feb 2024', status: 'pending' },
              ].map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{payment.description}</p>
                    <p className="text-sm text-gray-400">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">€{payment.amount}</span>
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
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



