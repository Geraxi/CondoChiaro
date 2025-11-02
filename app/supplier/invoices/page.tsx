'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SupplierInvoices() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Fatture</h1>
          <p className="text-muted-foreground">Invia fatture e monitora pagamenti</p>
        </div>
        <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Fattura
        </Button>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Fatture e Preventivi</CardTitle>
          <CardDescription>Gestione fatture e stato pagamenti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'INV-001', title: 'Manutenzione caldaia', amount: '€850', date: '15 Gen 2024', status: 'pagato', paid: '20 Gen 2024' },
              { id: 'INV-002', title: 'Pulizia scale', amount: '€450', date: '10 Gen 2024', status: 'in_attesa', paid: '-' },
              { id: 'INV-003', title: 'Riparazione ascensore', amount: '€1,200', date: '8 Gen 2024', status: 'pagato', paid: '12 Gen 2024' },
            ].map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                <div className="flex items-center gap-4 flex-1">
                  <Receipt className="h-8 w-8 text-[#1FA9A0]" />
                  <div>
                    <h4 className="font-medium">{invoice.id} - {invoice.title}</h4>
                    <p className="text-sm text-muted-foreground">Data: {invoice.date} {invoice.status === 'pagato' && `• Pagato: ${invoice.paid}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{invoice.amount}</span>
                  <Badge className={
                    invoice.status === 'pagato' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }>
                    {invoice.status === 'pagato' ? 'Pagato' : 'In Attesa'}
                  </Badge>
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
  )
}
