'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SupplierWorkOrders() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ordini di Lavoro</h1>
        <p className="text-muted-foreground">Gestisci ordini approvati</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'WO-001', title: 'Pulizia scale', building: 'Via Roma 10', approved: '12 Gen 2024', status: 'in_lavoro', amount: '€450' },
          { id: 'WO-002', title: 'Manutenzione caldaia', building: 'Via Verdi 5', approved: '8 Gen 2024', status: 'completato', amount: '€850' },
          { id: 'WO-003', title: 'Sostituzione lampadine', building: 'Via Milano 3', approved: '5 Gen 2024', status: 'in_lavoro', amount: '€120' },
          { id: 'WO-004', title: 'Riparazione cancello', building: 'Via Napoli 7', approved: '3 Gen 2024', status: 'completato', amount: '€300' },
        ].map((order, idx) => (
          <Card key={idx} className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#1FA9A0]" />
                {order.id}
              </CardTitle>
              <CardDescription>{order.title} • {order.building}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approvato:</span>
                  <span className="text-sm font-medium">{order.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Importo:</span>
                  <span className="text-sm font-semibold">{order.amount}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <Badge className={
                    order.status === 'completato' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }>
                    {order.status === 'completato' ? 'Completato' : 'In Lavoro'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
