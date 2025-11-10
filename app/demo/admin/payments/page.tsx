'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function DemoAdminPayments() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Pagamenti - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo della gestione pagamenti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Totale Incassato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1FA9A0]">€19,250</div>
              <p className="text-sm text-gray-400 mt-2">Questo mese</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>In Attesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">€3,250</div>
              <p className="text-sm text-gray-400 mt-2">12 pagamenti</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Tasso di Incasso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">98%</div>
              <p className="text-sm text-gray-400 mt-2">Entro la scadenza</p>
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
                { tenant: 'Mario Rossi', amount: 250, date: '10 Feb 2024', status: 'paid' },
                { tenant: 'Luisa Bianchi', amount: 250, date: '9 Feb 2024', status: 'paid' },
                { tenant: 'Giuseppe Verdi', amount: 250, date: '8 Feb 2024', status: 'pending' },
              ].map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{payment.tenant}</p>
                    <p className="text-sm text-gray-400">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">€{payment.amount}</span>
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
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



