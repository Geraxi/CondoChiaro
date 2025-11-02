'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SupplierPayments() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pagamenti</h1>
        <p className="text-muted-foreground">Ricevi pagamenti e monitora scadenze</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Totale Incassato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">€8,900</div>
            <p className="text-sm text-muted-foreground">Questo mese</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">In Attesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400 mb-2">€450</div>
            <p className="text-sm text-muted-foreground">2 fatture</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Media Mensile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1FA9A0] mb-2">€2,970</div>
            <p className="text-sm text-muted-foreground">Ultimi 3 mesi</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Storico Pagamenti</CardTitle>
          <CardDescription>Elenco pagamenti ricevuti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { invoice: 'INV-001', amount: '€850', date: '20 Gen 2024', status: 'pagato' },
              { invoice: 'INV-003', amount: '€1,200', date: '12 Gen 2024', status: 'pagato' },
              { invoice: 'INV-002', amount: '€450', date: '15 Gen 2024', status: 'in_attesa' },
            ].map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                <div>
                  <h4 className="font-medium">{payment.invoice}</h4>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{payment.amount}</span>
                  <Badge className={
                    payment.status === 'pagato' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }>
                    {payment.status === 'pagato' ? 'Pagato' : 'In Attesa'}
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
