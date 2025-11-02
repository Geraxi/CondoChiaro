'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminPayments() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pagamenti</h1>
        <p className="text-muted-foreground">Monitora quote e stato pagamenti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Totale Incassato', value: '€58,000', icon: Wallet, color: 'text-green-400' },
          { label: 'In Attesa', value: '€12,500', icon: Clock, color: 'text-yellow-400' },
          { label: 'Pagati', value: '45', icon: CheckCircle, color: 'text-[#1FA9A0]' },
          { label: 'In Ritardo', value: '3', icon: XCircle, color: 'text-red-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Elenco Pagamenti</CardTitle>
          <CardDescription>Gestione quote condominiali</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { unit: 'Appartamento 1A', owner: 'Mario Rossi', amount: '€250', due: '15 Feb 2024', status: 'pagato' },
              { unit: 'Appartamento 2B', owner: 'Luisa Bianchi', amount: '€250', due: '15 Feb 2024', status: 'in_attesa' },
              { unit: 'Appartamento 3C', owner: 'Giuseppe Verdi', amount: '€250', due: '15 Feb 2024', status: 'in_ritardo' },
            ].map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                <div className="flex-1">
                  <h4 className="font-medium">{payment.unit} - {payment.owner}</h4>
                  <p className="text-sm text-muted-foreground">Scadenza: {payment.due}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{payment.amount}</span>
                  <Badge className={
                    payment.status === 'pagato' ? 'bg-green-500/20 text-green-400' :
                    payment.status === 'in_attesa' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {payment.status === 'pagato' ? 'Pagato' : payment.status === 'in_attesa' ? 'In Attesa' : 'In Ritardo'}
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
