'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TenantPayments() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pagamenti</h1>
        <p className="text-muted-foreground">Consulta saldo e scadenze</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Saldo Attuale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1FA9A0] mb-2">€1,250.00</div>
            <p className="text-sm text-muted-foreground">Credito residuo</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Prossima Scadenza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">15 Feb 2024</div>
            <p className="text-sm text-muted-foreground">€250.00</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Pagamenti Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">€3,000</div>
            <p className="text-sm text-muted-foreground">Anno 2024</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Storico Pagamenti</CardTitle>
          <CardDescription>Elenco pagamenti e scadenze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { period: 'Gennaio 2024', amount: '€250', due: '15 Gen 2024', status: 'pagato', paid: '10 Gen 2024' },
              { period: 'Febbraio 2024', amount: '€250', due: '15 Feb 2024', status: 'in_attesa', paid: '-' },
              { period: 'Marzo 2024', amount: '€250', due: '15 Mar 2024', status: 'da_pagare', paid: '-' },
            ].map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                <div>
                  <h4 className="font-medium">{payment.period}</h4>
                  <p className="text-sm text-muted-foreground">Scadenza: {payment.due} {payment.status === 'pagato' && `• Pagato: ${payment.paid}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{payment.amount}</span>
                  <Badge className={
                    payment.status === 'pagato' ? 'bg-green-500/20 text-green-400' :
                    payment.status === 'in_attesa' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }>
                    {payment.status === 'pagato' ? 'Pagato' : payment.status === 'in_attesa' ? 'In Attesa' : 'Da Pagare'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
